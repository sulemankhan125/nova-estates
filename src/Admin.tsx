
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from './utils/supabase'
import './Admin.css'

type Property = {
  id: string
  title: string
  description: string
  property_type: string
  listing_type: string
  price: string | number
  location: string
  bedrooms: number
  bathrooms: number
  area: number | string | null
  images: string[] | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

type Filter = 'pending' | 'approved' | 'rejected'

export default function Admin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [filter, setFilter] = useState<Filter>('pending')

  const checkAdmin = async () => {
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      setLoggedIn(false)
      setLoading(false)
      return
    }

    const { data, error: adminError } =
      await supabase.rpc('is_admin')

    if (adminError || data !== true) {
      setError('You do not have admin access.')
      setLoggedIn(false)
      setLoading(false)
      return
    }

    setLoggedIn(true)
    await loadProperties()
  }

  const loadProperties = async () => {
    const { data, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setProperties((data || []) as Property[])
    }

    setLoading(false)
  }

  useEffect(() => {
    checkAdmin()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkAdmin()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError('')

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (loginError) {
      setError(loginError.message)
      setBusy(false)
      return
    }

    await checkAdmin()
    setBusy(false)
  }

  const updateStatus = async (
    id: string,
    status: 'approved' | 'rejected',
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${status} this property?`,
    )

    if (!confirmed) return

    setBusy(true)
    setError('')

    const { error: updateError } = await supabase
      .from('properties')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      await loadProperties()
    }

    setBusy(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setLoggedIn(false)
    setProperties([])
  }

  const filtered = properties.filter(
    (property) => property.status === filter,
  )

  if (loading) {
    return <div className="admin-loading">Loading Admin Dashboard...</div>
  }

  if (!loggedIn) {
    return (
      <div className="admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <div className="admin-logo">N</div>
          <span className="admin-eyebrow">NOVA ESTATES</span>
          <h1>Admin Login</h1>
          <p>Sign in with your authorized administrator account.</p>

          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          {error && <div className="admin-error">{error}</div>}

          <button type="submit" disabled={busy}>
            {busy ? 'Checking...' : 'Sign In'}
          </button>

          <a href="/">← Back to Website</a>
        </form>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <span className="admin-eyebrow">NOVA ESTATES</span>
          <h1>Admin Dashboard</h1>
          <p>Manage and review property submissions.</p>
        </div>
        <div className="admin-header-actions">
          <a href="/">View Website ↗</a>
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <main className="admin-content">
        <div className="admin-stats">
          {(['pending', 'approved', 'rejected'] as Filter[]).map((status) => (
            <button
              key={status}
              className={`admin-stat ${filter === status ? 'selected' : ''}`}
              onClick={() => setFilter(status)}
            >
              <span>{status.toUpperCase()}</span>
              <strong>
                {properties.filter((p) => p.status === status).length}
              </strong>
            </button>
          ))}
        </div>

        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">PROPERTY MANAGEMENT</span>
            <h2>{filter.charAt(0).toUpperCase() + filter.slice(1)} Properties</h2>
          </div>
          <button className="admin-refresh" onClick={loadProperties}>
            ↻ Refresh
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <h3>No {filter} properties</h3>
            <p>There are currently no properties in this category.</p>
          </div>
        ) : (
          <div className="admin-property-list">
            {filtered.map((property) => (
              <article className="admin-property-card" key={property.id}>
                <div className="admin-property-images">
                  {property.images?.length ? (
                    property.images.map((image, index) => (
                      <a
                        href={image}
                        target="_blank"
                        rel="noreferrer"
                        key={`${image}-${index}`}
                      >
                        <img src={image} alt={property.title} />
                      </a>
                    ))
                  ) : (
                    <div className="admin-no-image">No photos</div>
                  )}
                </div>

                <div className="admin-property-info">
                  <span className={`admin-status ${property.status}`}>
                    {property.status}
                  </span>
                  <h3>{property.title}</h3>
                  <p className="admin-location">⌖ {property.location}</p>
                  <strong className="admin-price">
                    PKR {Number(property.price).toLocaleString('en-PK')}
                  </strong>

                  <p>{property.description}</p>

                  <div className="admin-details">
                    <span>{property.property_type}</span>
                    <span>{property.listing_type}</span>
                    <span>{property.bedrooms} Bedrooms</span>
                    <span>{property.bathrooms} Bathrooms</span>
                    <span>{property.area ?? 'Not specified'} Area</span>
                  </div>

                  <small>
                    Submitted: {new Date(property.created_at).toLocaleString()}
                  </small>

                  {property.status === 'pending' && (
                    <div className="admin-actions">
                      <button
                        className="approve-btn"
                        disabled={busy}
                        onClick={() => updateStatus(property.id, 'approved')}
                      >
                        ✓ Approve
                      </button>
                      <button
                        className="reject-btn"
                        disabled={busy}
                        onClick={() => updateStatus(property.id, 'rejected')}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

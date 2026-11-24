
import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './utils/supabase'
import './UserDashboard.css'

type Property = {
  id: string | number
  title: string
  description: string | null
  property_type: string
  listing_type: string
  price: number
  location: string
  bedrooms: number | null
  bathrooms: number | null
  area: number | string | null
  images: string[] | null
  status: string
  created_at: string
}

type Filter = 'all' | 'pending' | 'approved' | 'rejected'

const formatPrice = (price: number) =>
  `PKR ${Number(price || 0).toLocaleString('en-PK')}`

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1)

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | number | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState<Property | null>(null)

  const loadProperties = useCallback(async (userId: string) => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setProperties([])
    } else {
      setProperties((data || []) as Property[])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setUser(data.user)
      if (data.user) loadProperties(data.user.id)
      else setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)

      if (session?.user) {
        loadProperties(session.user.id)
      } else {
        setProperties([])
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [loadProperties])

  const deleteProperty = async (property: Property) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.title}"? This cannot be undone.`
    )
    if (!confirmed || !user) return

    setDeleting(property.id)
    setError('')
    setNotice('')

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', property.id)
      .eq('owner_id', user.id)

    if (error) {
      setError(error.message)
    } else {
      setProperties(current => current.filter(item => item.id !== property.id))
      setNotice('Your property has been deleted successfully.')
      if (selected?.id === property.id) setSelected(null)
    }

    setDeleting(null)
  }

  const filtered = properties.filter(property =>
    filter === 'all' || property.status === filter
  )

  const counts = {
    all: properties.length,
    pending: properties.filter(p => p.status === 'pending').length,
    approved: properties.filter(p => p.status === 'approved').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
  }

  if (!user && !loading) {
    return (
      <div className="ud-page">
        <div className="ud-login-message">
          <span className="ud-brand">NOVA <small>ESTATES</small></span>
          <h1>Login required</h1>
          <p>Please log in to your Nova Estates account to view your dashboard.</p>
          <a className="ud-primary-btn" href="/">Go to website and log in</a>
        </div>
      </div>
    )
  }

  return (
    <div className="ud-page">
      <header className="ud-header">
        <a href="/" className="ud-brand">NOVA <small>ESTATES</small></a>
        <div className="ud-header-actions">
          <span className="ud-user-email">{user?.email}</span>
          <a href="/" className="ud-outline-btn">View Website ↗</a>
          <button
            className="ud-outline-btn"
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.href = '/'
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="ud-container">
        <div className="ud-welcome">
          <div>
            <span className="ud-eyebrow">YOUR ACCOUNT</span>
            <h1>My Dashboard</h1>
            <p>Manage your property listings and track their review status.</p>
          </div>
          <a href="/?list=1" className="ud-primary-btn">+ List New Property</a>
        </div>

        <section className="ud-stats">
          <div className="ud-stat">
            <span>Total Listings</span>
            <strong>{counts.all}</strong>
          </div>
          <div className="ud-stat">
            <span>Pending Review</span>
            <strong>{counts.pending}</strong>
          </div>
          <div className="ud-stat">
            <span>Approved</span>
            <strong>{counts.approved}</strong>
          </div>
          <div className="ud-stat">
            <span>Rejected</span>
            <strong>{counts.rejected}</strong>
          </div>
        </section>

        <section className="ud-listings">
          <div className="ud-listings-heading">
            <div>
              <span className="ud-eyebrow">PROPERTY MANAGEMENT</span>
              <h2>My Properties</h2>
            </div>
            <span className="ud-total">{filtered.length} listing(s)</span>
          </div>

          <div className="ud-filters">
            {(['all', 'pending', 'approved', 'rejected'] as Filter[]).map(item => (
              <button
                key={item}
                className={filter === item ? 'active' : ''}
                onClick={() => setFilter(item)}
              >
                {item === 'all' ? 'All Properties' : statusLabel(item)}
                <span>{counts[item]}</span>
              </button>
            ))}
          </div>

          {error && <div className="ud-alert ud-error">{error}</div>}
          {notice && <div className="ud-alert ud-success">{notice}</div>}

          {loading ? (
            <div className="ud-empty">Loading your properties...</div>
          ) : filtered.length === 0 ? (
            <div className="ud-empty">
              <div className="ud-empty-icon">⌂</div>
              <h3>No properties found</h3>
              <p>
                {filter === 'all'
                  ? 'You have not submitted any properties yet.'
                  : `You do not have any ${filter} properties.`}
              </p>
              <a href="/?list=1" className="ud-primary-btn">Submit Your First Property</a>
            </div>
          ) : (
            <div className="ud-property-list">
              {filtered.map(property => (
                <article className="ud-property" key={property.id}>
                  <div className="ud-property-image">
                    {property.images?.[0] ? (
                      <img src={property.images[0]} alt={property.title} />
                    ) : (
                      <span>⌂</span>
                    )}
                  </div>

                  <div className="ud-property-info">
                    <div className="ud-property-top">
                      <span className={`ud-status ${property.status}`}>
                        {statusLabel(property.status)}
                      </span>
                      <span className="ud-date">
                        {new Date(property.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3>{property.title}</h3>
                    <p className="ud-location">⌖ {property.location}</p>
                    <strong className="ud-price">{formatPrice(Number(property.price))}</strong>
                    <div className="ud-meta">
                      <span>{property.property_type}</span>
                      <span>{property.listing_type === 'buy' ? 'For Sale' : 'For Rent'}</span>
                      {property.area && <span>{property.area} sq ft</span>}
                    </div>
                  </div>

                  <div className="ud-property-actions">
                    <button className="ud-view-btn" onClick={() => setSelected(property)}>
                      View Details
                    </button>
                    <button
                      className="ud-delete-btn"
                      disabled={deleting === property.id}
                      onClick={() => deleteProperty(property)}
                    >
                      {deleting === property.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {selected && (
        <div className="ud-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="ud-modal" onClick={event => event.stopPropagation()}>
            <button className="ud-modal-close" onClick={() => setSelected(null)}>×</button>
            {selected.images?.length ? (
              <div className="ud-modal-gallery">
                {selected.images.map((url, index) => (
                  <img key={`${url}-${index}`} src={url} alt={`${selected.title} ${index + 1}`} />
                ))}
              </div>
            ) : null}
            <span className={`ud-status ${selected.status}`}>
              {statusLabel(selected.status)}
            </span>
            <h2>{selected.title}</h2>
            <h3>{formatPrice(Number(selected.price))}</h3>
            <p>⌖ {selected.location}</p>
            <p>{selected.description || 'No description provided.'}</p>
            <div className="ud-modal-details">
              <span>Type: {selected.property_type}</span>
              <span>Purpose: {selected.listing_type === 'buy' ? 'For Sale' : 'For Rent'}</span>
              <span>Bedrooms: {selected.bedrooms ?? 0}</span>
              <span>Bathrooms: {selected.bathrooms ?? 0}</span>
              <span>Area: {selected.area ?? 'Not specified'}</span>
            </div>
            <button className="ud-delete-btn" onClick={() => deleteProperty(selected)}>
              Delete This Property
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

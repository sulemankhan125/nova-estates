
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Property = {
  id: number
  title: string
  location: string
  city: string
  type: string
  purpose: 'Buy' | 'Rent'
  price: number
  beds: number
  baths: number
  area: string
  image: string
  featured?: boolean
}

const properties: Property[] = [
  {
    id: 1,
    title: 'Contemporary Family Villa',
    location: 'Jinnahabad, Abbottabad',
    city: 'Abbottabad',
    type: 'House',
    purpose: 'Buy',
    price: 28500000,
    beds: 5,
    baths: 4,
    area: '10 Marla',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1000',
    featured: true,
  },
  {
    id: 2,
    title: 'Modern Luxury Residence',
    location: 'Islamabad, Pakistan',
    city: 'Islamabad',
    type: 'House',
    purpose: 'Buy',
    price: 45000000,
    beds: 6,
    baths: 5,
    area: '1 Kanal',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1000',
    featured: true,
  },
  {
    id: 3,
    title: 'Elegant City Apartment',
    location: 'F-11, Islamabad',
    city: 'Islamabad',
    type: 'Apartment',
    purpose: 'Rent',
    price: 95000,
    beds: 3,
    baths: 2,
    area: '1,400 Sq Ft',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000',
  },
  {
    id: 4,
    title: 'Premium Residential Plot',
    location: 'Habibullah Colony, Abbottabad',
    city: 'Abbottabad',
    type: 'Plot',
    purpose: 'Buy',
    price: 12000000,
    beds: 0,
    baths: 0,
    area: '5 Marla',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000',
  },
  {
    id: 5,
    title: 'Spacious Family Home',
    location: 'Lahore, Pakistan',
    city: 'Lahore',
    type: 'House',
    purpose: 'Buy',
    price: 35000000,
    beds: 5,
    baths: 4,
    area: '10 Marla',
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1000',
  },
  {
    id: 6,
    title: 'Premium Business Office',
    location: 'Blue Area, Islamabad',
    city: 'Islamabad',
    type: 'Commercial',
    purpose: 'Rent',
    price: 180000,
    beds: 0,
    baths: 1,
    area: '1,000 Sq Ft',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1000',
  },
]

const formatPrice = (price: number) => {
  if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(2)} Crore`
  if (price >= 100000) return `PKR ${(price / 100000).toFixed(0)} Lac`
  return `PKR ${price.toLocaleString('en-PK')}`
}

function App() {
  const [purpose, setPurpose] = useState<'Buy' | 'Rent'>('Buy')
  const [city, setCity] = useState('All Cities')
  const [propertyType, setPropertyType] = useState('All Types')
  const [keyword, setKeyword] = useState('')
  const [maxPrice, setMaxPrice] = useState('Any Price')
  const [favorites, setFavorites] = useState<number[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [formStatus, setFormStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchesPurpose = property.purpose === purpose
      const matchesCity = city === 'All Cities' || property.city === city
      const matchesType = propertyType === 'All Types' || property.type === propertyType
      const searchText = `${property.title} ${property.location} ${property.city}`.toLowerCase()
      const matchesKeyword = searchText.includes(keyword.toLowerCase())

      const matchesPrice =
        maxPrice === 'Any Price' ||
        (maxPrice === 'Under 1 Crore' && property.price < 10000000) ||
        (maxPrice === '1 - 3 Crore' && property.price >= 10000000 && property.price <= 30000000) ||
        (maxPrice === 'Above 3 Crore' && property.price > 30000000)

      return matchesPurpose && matchesCity && matchesType && matchesKeyword && matchesPrice
    })
  }, [purpose, city, propertyType, keyword, maxPrice])

  const toggleFavorite = (id: number) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const handleContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormStatus('')

    const form = event.currentTarget
    const formData = new FormData(form)

    formData.append('access_key', 'c38f2f4e-4fa7-4bda-94a8-ab4bc2e8023d')
    formData.append('subject', 'New Enquiry - Nova Estates')

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setFormStatus('Your enquiry has been sent successfully!')
        form.reset()
      } else {
        setFormStatus('Unable to send your enquiry. Please try again.')
      }
    } catch {
      setFormStatus('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="website">
      <div className="topbar">
        <div className="container topbar-inner">
          <span>Discover properties. Find your place.</span>
          <div>
            <a href="mailto:info@novaestates.com">info@novaestates.com</a>
            <span className="top-divider">|</span>
            <span>Pakistan</span>
          </div>
        </div>
      </div>

      <header className="navbar">
        <div className="container nav-inner">
          <a href="#home" className="brand">
            <span className="brand-mark">N</span>
            <span>
              <strong>NOVA</strong>
              <small>ESTATES</small>
            </span>
          </a>

          <button
            className="menu-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>

          <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
            <a href="#home" onClick={() => setMobileMenu(false)}>Home</a>
            <a href="#properties" onClick={() => setMobileMenu(false)}>Properties</a>
            <a href="#projects" onClick={() => setMobileMenu(false)}>Projects</a>
            <a href="#locations" onClick={() => setMobileMenu(false)}>Locations</a>
            <a href="#about" onClick={() => setMobileMenu(false)}>About Us</a>
          </nav>

          <a href="#contact" className="nav-contact">Contact Us <span>↗</span></a>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-overlay" />
          <div className="container hero-content">
            <div className="hero-label"><span /> REAL ESTATE, REIMAGINED</div>
            <h1>Find a place<br />to <em>belong.</em></h1>
            <p>
              Discover exceptional properties, explore promising locations,
              and make your next move with confidence.
            </p>
            <div className="hero-actions">
              <a href="#properties" className="btn-primary">Explore Properties <span>↗</span></a>
              <a href="#about" className="hero-secondary">Discover Nova Estates <span>→</span></a>
            </div>
          </div>
          <div className="hero-bottom">
            <div className="container hero-bottom-inner">
              <span>01 / DISCOVER YOUR NEXT ADDRESS</span>
              <span>SCROLL TO EXPLORE ↓</span>
            </div>
          </div>
        </section>

        <section className="search-section">
          <div className="container">
            <div className="search-heading">
              <div>
                <span className="eyebrow">PROPERTY SEARCH</span>
                <h2>What are you looking for?</h2>
              </div>
              <p>Find the right property for your next chapter.</p>
            </div>

            <div className="search-box">
              <div className="search-tabs">
                <button className={purpose === 'Buy' ? 'active' : ''} onClick={() => setPurpose('Buy')}>Buy Property</button>
                <button className={purpose === 'Rent' ? 'active' : ''} onClick={() => setPurpose('Rent')}>Rent Property</button>
              </div>

              <div className="search-fields">
                <label>
                  <span>LOCATION</span>
                  <select value={city} onChange={(e) => setCity(e.target.value)}>
                    <option>All Cities</option>
                    <option>Abbottabad</option>
                    <option>Islamabad</option>
                    <option>Lahore</option>
                    <option>Karachi</option>
                  </select>
                </label>

                <label>
                  <span>PROPERTY TYPE</span>
                  <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                    <option>All Types</option>
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Plot</option>
                    <option>Commercial</option>
                  </select>
                </label>

                <label>
                  <span>PRICE RANGE</span>
                  <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
                    <option>Any Price</option>
                    <option>Under 1 Crore</option>
                    <option>1 - 3 Crore</option>
                    <option>Above 3 Crore</option>
                  </select>
                </label>

                <label>
                  <span>KEYWORD</span>
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Area, project, keyword..."
                  />
                </label>

                <button className="search-button" onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })}>
                  Search <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="properties-section section-pad" id="properties">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">CURATED PROPERTY COLLECTION</span>
                <h2>Spaces worth <em>discovering.</em></h2>
                <p>Explore properties selected to match different lifestyles and ambitions.</p>
              </div>
              <a href="#contact" className="text-link">List your property <span>↗</span></a>
            </div>

            <div className="property-toolbar">
              <span>{filteredProperties.length} properties found</span>
              <span>{purpose === 'Buy' ? 'Properties for sale' : 'Properties for rent'}</span>
            </div>

            {filteredProperties.length > 0 ? (
              <div className="property-grid">
                {filteredProperties.map((property) => (
                  <article className="property-card" key={property.id}>
                    <div className="property-image-wrap" onClick={() => setSelectedProperty(property)}>
                      <img src={property.image} alt={property.title} />
                      <span className="property-tag">{property.purpose === 'Buy' ? 'FOR SALE' : 'FOR RENT'}</span>
                      <button
                        className={favorites.includes(property.id) ? 'favorite active' : 'favorite'}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(property.id)
                        }}
                        aria-label="Save property"
                      >
                        {favorites.includes(property.id) ? '♥' : '♡'}
                      </button>
                    </div>
                    <div className="property-info">
                      <span className="property-location">⌖ {property.location}</span>
                      <h3>{property.title}</h3>
                      <div className="property-price">{formatPrice(property.price)}</div>
                      <div className="property-meta">
                        {property.beds > 0 && <span>▦ {property.beds} Beds</span>}
                        {property.baths > 0 && <span>◈ {property.baths} Baths</span>}
                        <span>⌗ {property.area}</span>
                      </div>
                      <button className="property-details" onClick={() => setSelectedProperty(property)}>
                        View Property Details <span>↗</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No matching properties found.</h3>
                <p>Try changing your search filters.</p>
                <button onClick={() => {
                  setCity('All Cities')
                  setPropertyType('All Types')
                  setKeyword('')
                  setMaxPrice('Any Price')
                }}>Clear Filters</button>
              </div>
            )}

            <p className="demo-note">Note: Property listings and prices shown are illustrative sample data for demonstration purposes.</p>
          </div>
        </section>

        <section className="project-section" id="projects">
          <div className="container project-layout">
            <div className="project-image">
              <img src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200" alt="Modern architectural development" />
              <div className="project-image-caption">DESIGNED FOR MODERN LIVING</div>
            </div>
            <div className="project-content">
              <span className="eyebrow">FEATURED DEVELOPMENT</span>
              <h2>More than a property.<br />A <em>better perspective.</em></h2>
              <p>
                Explore thoughtfully planned developments and investment
                opportunities. Discover spaces where architecture, location,
                and everyday convenience come together.
              </p>
              <div className="project-features">
                <div><span>01</span><strong>Prime Locations</strong><small>Explore promising neighbourhoods.</small></div>
                <div><span>02</span><strong>Modern Architecture</strong><small>Spaces designed around modern living.</small></div>
                <div><span>03</span><strong>Investment Potential</strong><small>Make informed property decisions.</small></div>
              </div>
              <a href="#contact" className="btn-dark">Discuss an Opportunity <span>↗</span></a>
            </div>
          </div>
        </section>

        <section className="locations-section section-pad" id="locations">
          <div className="container">
            <div className="section-heading">
              <div>
                <span className="eyebrow">EXPLORE BY LOCATION</span>
                <h2>Find your place in <em>Pakistan.</em></h2>
                <p>Discover opportunities across some of Pakistan's key property markets.</p>
              </div>
            </div>

            <div className="location-grid">
              <button className="location-card location-large" onClick={() => {
                setCity('Abbottabad')
                setPurpose('Buy')
                document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })
              }}>
                <img src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=900" alt="Abbottabad landscape" />
                <span className="location-overlay" />
                <span className="location-text"><small>EXPLORE</small><strong>Abbottabad</strong><span>Discover properties ↗</span></span>
              </button>
              <button className="location-card" onClick={() => {
                setCity('Islamabad')
                document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })
              }}>
                <img src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=900" alt="Islamabad architecture" />
                <span className="location-overlay" />
                <span className="location-text"><small>EXPLORE</small><strong>Islamabad</strong><span>Discover properties ↗</span></span>
              </button>
              <button className="location-card" onClick={() => {
                setCity('Lahore')
                document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })
              }}>
                <img src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=900" alt="Lahore city" />
                <span className="location-overlay" />
                <span className="location-text"><small>EXPLORE</small><strong>Lahore</strong><span>Discover properties ↗</span></span>
              </button>
            </div>
          </div>
        </section>

        <section className="about-section section-pad" id="about">
          <div className="container about-layout">
            <div>
              <span className="eyebrow">ABOUT NOVA ESTATES</span>
              <h2>Property decisions,<br /><em>made clearer.</em></h2>
            </div>
            <div className="about-copy">
              <p>
                At Nova Estates, we believe finding a property should be a
                confident and informed experience. Our platform brings
                property discovery, location exploration, and enquiries
                together in one place.
              </p>
              <p>
                Whether you are searching for a family home, a rental space,
                or a new investment opportunity, we aim to make your journey
                simpler.
              </p>
              <a href="#contact" className="text-link">Get in touch <span>↗</span></a>
            </div>
          </div>
          <div className="container about-stats">
            <div><strong>01</strong><span>Property discovery</span></div>
            <div><strong>02</strong><span>Location exploration</span></div>
            <div><strong>03</strong><span>Personalised enquiries</span></div>
            <div><strong>04</strong><span>Investment guidance</span></div>
          </div>
        </section>

        <section className="contact-section section-pad" id="contact">
          <div className="container contact-layout">
            <div className="contact-copy">
              <span className="eyebrow">LET'S START A CONVERSATION</span>
              <h2>Your next move<br />starts <em>here.</em></h2>
              <p>Tell us what you are looking for. Our team will get in touch to help you explore your options.</p>
              <div className="contact-detail">
                <small>EMAIL</small>
                <a href="mailto:info@novaestates.com">info@novaestates.com</a>
              </div>
              <div className="contact-detail">
                <small>LOCATION</small>
                <span>Pakistan</span>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleContact}>
              <h3>Send an enquiry</h3>
              <p>Share a few details and we will get back to you.</p>
              <input type="checkbox" name="botcheck" className="hidden-field" tabIndex={-1} autoComplete="off" />
              <div className="form-row">
                <label>Your Name<input type="text" name="name" placeholder="Enter your name" required /></label>
                <label>Email Address<input type="email" name="email" placeholder="Enter your email" required /></label>
              </div>
              <label>Phone Number<input type="tel" name="phone" placeholder="Your contact number" /></label>
              <label>I'm interested in
                <select name="interest" defaultValue="Buying a property">
                  <option>Buying a property</option>
                  <option>Renting a property</option>
                  <option>Selling a property</option>
                  <option>Investment opportunity</option>
                  <option>Other enquiry</option>
                </select>
              </label>
              <label>Message<textarea name="message" rows={4} placeholder="Tell us what you are looking for..." required /></label>
              <button type="submit" className="form-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Enquiry'} <span>↗</span>
              </button>
              {formStatus && <p className="form-status">{formStatus}</p>}
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-main">
          <a href="#home" className="brand footer-brand">
            <span className="brand-mark">N</span>
            <span><strong>NOVA</strong><small>ESTATES</small></span>
          </a>
          <p>Find a place to belong.<br />Discover your next address with Nova Estates.</p>
          <div className="footer-links">
            <a href="#properties">Properties</a>
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Nova Estates. All rights reserved.</span>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>

      {selectedProperty && (
        <div className="modal-backdrop" onClick={() => setSelectedProperty(null)}>
          <div className="property-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProperty(null)}>×</button>
            <img src={selectedProperty.image} alt={selectedProperty.title} />
            <div className="modal-content">
              <span className="eyebrow">{selectedProperty.purpose === 'Buy' ? 'PROPERTY FOR SALE' : 'PROPERTY FOR RENT'}</span>
              <h2>{selectedProperty.title}</h2>
              <p>{selectedProperty.location}</p>
              <h3>{formatPrice(selectedProperty.price)}</h3>
              <div className="property-meta modal-meta">
                {selectedProperty.beds > 0 && <span>{selectedProperty.beds} Bedrooms</span>}
                {selectedProperty.baths > 0 && <span>{selectedProperty.baths} Bathrooms</span>}
                <span>{selectedProperty.area}</span>
              </div>
              <p className="demo-note">This is an illustrative sample listing. Contact Nova Estates for property information.</p>
              <a className="btn-dark" href="#contact" onClick={() => setSelectedProperty(null)}>Enquire About This Property ↗</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

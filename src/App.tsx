import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductModal } from './components/ProductModal';
import { ShopGrid } from './components/ShopGrid';
import productsData from './data/products.json';
import { initShopify } from './lib/ShopifyManager';

interface Product {
  id: string;
  variantId?: string;
  title: string;
  price: number;
  originalPrice: string;
  description: string;
  image: string;
  link: string;
  category: string;
  rating: number;
  inStock: boolean;
  isFeatured?: boolean;
  platform?: string;
  science?: {
    activeIngredients: string[];
    phRange: string;
    target: string;
  };
}

function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Shop Tab State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    initShopify();
  }, []);

  // Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState<boolean>(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubmitted(false), 5000);
    }
  };

  // Filter products for the Shop tab
  const filteredProducts = (productsData as Product[]).filter((product) => {
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      product.category === categoryFilter ||
      (categoryFilter === 'Shopify' && product.platform === 'Shopify') ||
      (categoryFilter === 'Etsy' && product.platform === 'Etsy');

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="gradient-bg-hero">
      
      {/* Dynamic Glass Navigation */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Landmark */}
      <main style={{ flexGrow: 1, paddingTop: '72px' }}>
        
        {/* ================= HOME TAB ================= */}
        {currentTab === 'home' && (
          <div>
            {/* Hero Section */}
            <section style={{ 
              paddingTop: '2rem', 
              paddingBottom: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Glow */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '80%',
                height: '150%',
                background: 'radial-gradient(ellipse at center, rgba(39, 74, 56, 0.15) 0%, transparent 70%)',
                zIndex: 0,
                pointerEvents: 'none'
              }} />

              <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <span className="science-badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>🌿 Thoughtfully Cultivated, Cleanly Formulated</span>
                
                <h1 style={{ 
                  margin: '0 0 1rem 0', 
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  lineHeight: 1.1 
                }}>
                  Rare Plants &<br />
                  <span className="gradient-text" style={{ fontStyle: 'italic' }}>Clean Science</span>
                </h1>
                
                <p style={{ 
                  fontSize: '1.15rem', 
                  lineHeight: 1.5, 
                  margin: '0 0 2rem 0',
                  color: 'var(--text-secondary)'
                }}>
                  Propagators of rare tropical botanical specimens and synthesizers of gentle, supportive skin serums.
                </p>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    onClick={() => {
                      document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.8rem 2rem', fontSize: '1.05rem' }}
                  >
                    Shop Collection
                  </button>
                  <button 
                    onClick={() => setCurrentTab('science')}
                    className="btn btn-secondary"
                    style={{ padding: '0.8rem 2rem', fontSize: '1.05rem' }}
                  >
                    Our Formula
                  </button>
                </div>
              </div>
            </section>

            {/* Shop Section (CX-First) */}
            <ShopGrid 
              filteredProducts={filteredProducts}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSelectedProduct={setSelectedProduct}
            />

            {/* Petioles & Peptides Narrative */}
            <section className="section-pad">
              <div className="container">
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }} className="narrative-container">
                  <span className="science-badge" style={{ marginBottom: '1rem' }}>A Natural Connection</span>
                  <h2 style={{ marginBottom: '1.5rem' }}>Petioles & Peptides</h2>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                    In nature, the <strong>petiole</strong> is the stalk connecting a leaf to its stem, carrying nutrients that help the plant flourish. Similarly, <strong>peptides</strong> are small chains of amino acids that support the skin's natural renewal and elasticity. 
                  </p>
                  <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    At Petiole & Bloom, we enjoy bringing these two aspects of growth together—caring for rare, beautiful plants and formulating gentle, nourishing skin and scalp products.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg width="40" height="2" viewBox="0 0 40 2" fill="none">
                      <line x1="0" y1="1" x2="40" y2="1" stroke="var(--brand-secondary)" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </section>

            {/* Science Highlight Deck */}
            <section className="section-pad">
              <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                  <span className="science-badge">Cultivation & Formulation Standards</span>
                  <h2 style={{ marginTop: '0.5rem' }}>Carefully Grown, Thoughtfully Made</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }} className="highlight-grid">
                  
                  {/* Card 1 */}
                  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--border-primary)',
                      color: 'var(--brand-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      ✨
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1.25rem', fontWeight: 700 }}>Copper Peptide Skin Support</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                      Copper peptides are widely loved for supporting the skin's natural renewal process, helping to improve texture, soothe irritation, and maintain a healthy, youthful glow.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--border-primary)',
                      color: 'var(--brand-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      🌿
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1.25rem', fontWeight: 700 }}>Established Botanical Roots</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                      We take great care to ensure our plants are well-established with healthy root systems before they ship, helping them transition smoothly and thrive in their new home.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--border-primary)',
                      color: 'var(--brand-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem'
                    }}>
                      🌸
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1.25rem', fontWeight: 700 }}>Scalp & Hair Revitalization</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                      Infused with botanical extracts like rosemary and saw palmetto, our tonic gently nourishes the scalp and roots, promoting thicker, fuller-looking hair.
                    </p>
                  </div>

                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= SCIENCE TAB ================= */}
        {currentTab === 'science' && (
          <section className="section-pad">
            <div className="container" style={{ maxWidth: '900px' }}>
              
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                <span className="science-badge">Caring for Your Skin, Hair, & Plants</span>
                <h1 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Ingredients & Care Guidance</h1>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  At Petiole & Bloom, we believe in transparent ingredients and healthy cultivation. Here is a brief look at the principles behind our offerings.
                </p>
              </div>

              {/* Science Breakdown 1: GHK-Cu */}
              <article className="glass-panel" style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Thoughtful Formulation</span>
                <h2>Understanding Copper Peptides</h2>
                
                <p style={{ margin: 0 }}>
                  <strong>GHK-Cu (Copper Tripeptide-1)</strong> is a naturally occurring peptide complex discovered in 1973. It is highly regarded in skin and hair care for its ability to support skin health, calm irritation, and encourage a healthy scalp environment.
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.5rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem'
                }} className="science-grid">
                  <div>
                    <h4 style={{ color: 'var(--brand-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Skin Barrier Support</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                      Helps support skin hydration, elasticity, and overall structural resilience, letting the skin recover smoothly and maintain a healthy, balanced state.
                    </p>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--brand-secondary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>Gentle Rejuvenation</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>
                      Encourages natural cellular renewal, helping to smooth the appearance of fine lines and maintain an even, bright complexion.
                    </p>
                  </div>
                </div>
              </article>

              {/* Science Breakdown 2: Scalp Follicle Stimulation */}
              <article className="glass-panel" style={{ marginBottom: '4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Scalp Revitalization</span>
                <h2>Nourishing Scalp &amp; Hair Care</h2>
                
                <p style={{ margin: 0 }}>
                  A healthy scalp is the foundation for thick, full hair. Our Scalp &amp; Hair Tonic is designed to support healthy growth using a blend of clean, plant-based active ingredients:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--brand-secondary)' }}>01.</div>
                    <div>
                      <strong>Botanical Extracts (Saw Palmetto &amp; Rosemary):</strong> Saw palmetto and rosemary extracts help soothe the scalp, protect dormant roots, and support natural hair density.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--brand-secondary)' }}>02.</div>
                    <div>
                      <strong>Nourishing Peptides:</strong> Copper peptides support healthy hair follicles, promoting stronger roots and extending the natural growth phase of the hair.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--brand-secondary)' }}>03.</div>
                    <div>
                      <strong>Scalp Vitality (Caffeine):</strong> Energizes and refreshes the scalp, supporting local circulation to carry vital nutrients directly to dormant follicles.
                    </div>
                  </div>
                </div>
              </article>

              {/* Science Breakdown 3: Botanical Soil Media */}
              <article className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Nursery Care</span>
                <h2>Organic Nursery Cultivation</h2>
                
                <p style={{ margin: 0 }}>
                  Many mass-produced plants are shipped as delicate, fresh laboratory plugs with very little root support, which can lead to high shock rates. At Petiole &amp; Bloom, we do things differently:
                </p>

                <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <li>
                    <strong>Acclimated Roots:</strong> We grow our plants in our local nursery, allowing them to establish strong, active root systems before they ever ship to you.
                  </li>
                  <li>
                    <strong>Healthy Soil Blends:</strong> We use an organic soil mix enriched with slow-release nutrients and calcium to promote long-term vitality.
                  </li>
                  <li>
                    <strong>Root Support:</strong> Dusted with beneficial organic endomycorrhizae to expand root access, helping your plant absorb nutrients and thrive immediately upon arrival.
                  </li>
                </ul>
              </article>

            </div>
          </section>
        )}

        {/* ================= ABOUT TAB ================= */}
        {currentTab === 'about' && (
          <section className="section-pad">
            <div className="container" style={{ maxWidth: '800px' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <span className="science-badge">Our Origins</span>
                <h1 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Our Story</h1>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                  Petiole & Bloom is born from a dual passion: cultivating rare, botanical specimens and formulating gentle, science-backed personal care.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <p>
                  Our journey began in a modest greenhouse, propagating hard-to-source tropical cultivars like variegated banana plants and vanilla orchids. Propagating rare tropicals taught us to respect biology—especially the role of the <strong>petiole</strong>, the stalk that connects a leaf to its stem and delivers essential nutrients to keep the plant healthy.
                </p>
                
                <div style={{
                  padding: '2rem',
                  borderLeft: '4px solid var(--brand-secondary)',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                  fontStyle: 'italic',
                  lineHeight: 1.6
                }}>
                  "The same gentle, biology-focused care we apply to plant roots applies to skin and scalp care. Healthy growth relies on the right supportive environment."
                </div>

                <p>
                  This simple philosophy is the heart of Petiole & Bloom. Today, we nurture rare plants in our acclimated nursery and formulate gentle copper peptide serums, ensuring every product is thoughtful, supportive, and designed to help you thrive.
                </p>

                <h3 style={{ marginTop: '1rem' }}>Our Core Principles:</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }} className="science-grid">
                  <div>
                    <strong>Transparent Care</strong>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
                      We share all our ingredients and formulations openly. No hype, no fillers—just clean, supportive care.
                    </p>
                  </div>
                  <div>
                    <strong>Acclimated Botanicals</strong>
                    <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
                      We carefully nurture every plant in healthy, active soil before it leaves, so it arrives strong and ready to grow.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ================= CONTACT TAB ================= */}
        {currentTab === 'contact' && (
          <section className="section-pad">
            <div className="container" style={{ maxWidth: '800px' }}>
              
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <span className="science-badge">Inquiries & Support</span>
                <h1 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Contact Us</h1>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.5 }}>
                  Have questions about our copper peptide formulas, plant care guidance, or order status? We are always here to help.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                gap: '3rem'
              }} className="hero-grid">
                
                {/* Contact Form */}
                <div className="glass-panel">
                  {contactSubmitted ? (
                    <div style={{ textAlign: 'center', paddingBlock: '3rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
                      <h3>Message Received</h3>
                      <p style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>We will review your inquiry and get back to you within 24 hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Full Name</label>
                        <input 
                          type="text" 
                          required 
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-primary)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-primary)'
                          }} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Email Address</label>
                        <input 
                          type="email" 
                          required 
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-primary)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-primary)'
                          }} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Subject</label>
                        <select 
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-primary)',
                            backgroundColor: 'var(--bg-app)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <option>General Inquiry</option>
                          <option>Copper Peptide Skincare Help</option>
                          <option>Scalp &amp; Hair Tonic Help</option>
                          <option>Tropical Plant Care Guidance</option>
                          <option>Etsy Order Status Inquiry</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Your Message</label>
                        <textarea 
                          rows={5} 
                          required 
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-primary)',
                            backgroundColor: 'transparent',
                            color: 'var(--text-primary)',
                            resize: 'vertical'
                          }} 
                        />
                      </div>
                      
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                        Send Message
                      </button>
                    </form>
                  )}
                </div>

                {/* Side info panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem' }}>Nursery &amp; Lab Location</h4>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                      Based in the USA.<br />
                      Propagating botanicals and formulating gentle personal care locally.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem' }}>Plant Care Support</h4>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                      Every plant order includes lifetime consultation support. Reach out with plant photos and we'll gladly advise on soil, hydration, and light!
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

      </main>

      {/* Immersive Details Dialog Drawer */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      {/* ================= FOOTER ================= */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-primary)',
        paddingBlock: '4rem 2rem'
      }}>
        <div className="container">
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr 1fr',
            gap: '3rem',
            marginBottom: '3rem'
          }} className="hero-grid">
            
            {/* Brand column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: '1.25rem',
                color: 'var(--brand-primary)',
                letterSpacing: '0.05em'
              }}>
                PETIOLE & BLOOM
              </div>
              <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                A modern botanical nursery and nourishing personal care apothecary. Nurturing healthy plants and formulating supportive personal care products to help you grow.
              </p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Navigation
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <li><button onClick={() => { setCurrentTab('home'); window.scrollTo(0,0); }} style={{ color: 'var(--text-secondary)' }}>Home</button></li>
                <li><button onClick={() => { setCurrentTab('shop'); window.scrollTo(0,0); }} style={{ color: 'var(--text-secondary)' }}>Shop Catalog</button></li>
                <li><button onClick={() => { setCurrentTab('science'); window.scrollTo(0,0); }} style={{ color: 'var(--text-secondary)' }}>Science &amp; Care</button></li>
                <li><button onClick={() => { setCurrentTab('about'); window.scrollTo(0,0); }} style={{ color: 'var(--text-secondary)' }}>Our Story</button></li>
              </ul>
            </div>

            {/* Newsletter sign-up */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Join the Nursery
              </h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                Subscribe for plant care tips, new botanical arrivals, and skin &amp; hair care updates.
              </p>
              
              {newsletterSubmitted ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--brand-primary)', fontWeight: 600 }}>✓ Subscribed successfully!</div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="email" 
                    placeholder="Enter email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem', minBlockSize: '36px', fontSize: '0.85rem' }}>
                    Join
                  </button>
                </form>
              )}
            </div>

          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-primary)',
            paddingTop: '2rem',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)'
          }} className="footer-bottom">
            <span>© {new Date().getFullYear()} Petiole &amp; Bloom LLC. All rights reserved.</span>
            
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="https://petioleandbloomllc.etsy.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                Etsy Store
              </a>
              <span>USDA Nursery Registered</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Global CSS Responsive Helpers */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          .science-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 500px) {
          .footer-bottom {
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: flex-start !important;
          }
        }
      `}</style>

    </div>
  );
}

export default App;

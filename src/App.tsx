import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductModal } from './components/ProductModal';
import { ShopGrid } from './components/ShopGrid';
import { ReviewsSection } from './components/ReviewsSection';
import { Breadcrumbs } from './components/Breadcrumbs';
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
// Route map: pathname -> tab id
const ROUTE_TO_TAB: Record<string, string> = {
  '/': 'home',
  '/shop': 'shop',
  '/science': 'science',
  '/care': 'about',
  '/contact': 'contact',
};
const TAB_TO_ROUTE: Record<string, string> = {
  'home': '/',
  'shop': '/shop',
  'science': '/science',
  'about': '/care',
  'contact': '/contact',
};

function getInitialTab(): string {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (path.startsWith('/products/')) return 'shop';
  return ROUTE_TO_TAB[path] || 'home';
}

function getInitialProduct(products: Product[]): Product | null {
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
  if (!path.startsWith('/products/')) return null;
  const slug = path.replace('/products/', '');
  return products.find((p: Product) => (p as any).slug === slug) || null;
}

function App() {
  const allProducts = productsData as Product[];
  const [currentTab, setCurrentTab] = useState<string>(getInitialTab);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => getInitialProduct(allProducts));

  // Shop & Contact Form State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>('');

  // Sync tab changes to URL
  const navigateTab = (tab: string) => {
    setCurrentTab(tab);
    setSelectedProduct(null);
    const route = TAB_TO_ROUTE[tab] || '/';
    window.history.pushState({ tab }, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync product selection to URL
  const selectProduct = (product: Product | null) => {
    setSelectedProduct(product);
    if (product && (product as any).slug) {
      window.history.pushState({ product: (product as any).slug }, '', `/products/${(product as any).slug}`);
    }
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    // Go back to shop tab URL
    const route = TAB_TO_ROUTE[currentTab] || '/shop';
    window.history.pushState({ tab: currentTab }, '', route);
  };

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      if (path.startsWith('/products/')) {
        const slug = path.replace('/products/', '');
        const product = allProducts.find((p: Product) => (p as any).slug === slug);
        if (product) {
          navigateTab('shop');
          setSelectedProduct(product);
          return;
        }
      }
      setSelectedProduct(null);
      setCurrentTab(ROUTE_TO_TAB[path] || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allProducts]);

  useEffect(() => {
    initShopify();
  }, []);

  // Deduplicate by title — Etsy wins if both platforms have the same plant
  const seenTitles = new Map<string, Product>();
  (productsData as Product[]).forEach((p) => {
    const key = p.title.toLowerCase().trim();
    const existing = seenTitles.get(key);
    if (!existing) {
      seenTitles.set(key, p);
    } else {
      // If the current one is Etsy, replace existing but keep the variantId if existing had one
      if (p.platform === 'Etsy' && existing.platform !== 'Etsy') {
        seenTitles.set(key, { ...p, variantId: existing.variantId || p.variantId });
      } 
      // If the current one is Shopify and existing is Etsy, keep existing but add the new variantId
      else if (p.platform !== 'Etsy' && existing.platform === 'Etsy') {
        seenTitles.set(key, { ...existing, variantId: p.variantId || existing.variantId });
      }
    }
  });
  const deduplicatedProducts = Array.from(seenTitles.values());

  // Filter products for the Shop tab
  const filteredProducts = deduplicatedProducts.filter((product) => {
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
      <Navbar currentTab={currentTab} setCurrentTab={navigateTab} />

      {/* Main Content Landmark */}
      <main style={{ flexGrow: 1, paddingTop: '72px' }}>

        {/* Temporary Shop Notice Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #274a38, #1a3528)',
          color: '#fff',
          textAlign: 'center',
          padding: '0.65rem 1.5rem',
          fontSize: '0.88rem',
          lineHeight: 1.5,
          letterSpacing: '0.01em'
        }}>
          🛠️ We are working to resolve some issues with our shop. Please use the Etsy links for now until full functionality is restored.
        </div>
        <Breadcrumbs currentTab={currentTab} setCurrentTab={navigateTab} />

        {/* ================= HOME TAB ================= */}
        {currentTab === 'home' && (
          <div>
            {/* Hero Section */}
            <section style={{
              paddingTop: '4rem',
              paddingBottom: '3rem',
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

              <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
                <p style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--brand-secondary)',
                  marginBottom: '1.25rem'
                }}>
                  Rare Plants &nbsp;·&nbsp; Actually Effective Skin & Hair Care
                </p>

                <h1 style={{
                  margin: '0 0 1.25rem 0',
                  fontSize: 'clamp(2.75rem, 6vw, 4.5rem)',
                  lineHeight: 1.08
                }}>
                  Petiole &amp; Bloom
                </h1>

                <p style={{
                  fontSize: '1.2rem',
                  lineHeight: 1.6,
                  margin: '0 0 2.5rem 0',
                  color: 'var(--text-secondary)',
                  maxWidth: '580px',
                  marginInline: 'auto',
                  marginBottom: '2.5rem'
                }}>
                  Well-rooted tropical specimens grown in our own nursery. Clinical copper peptide formulas backed by peer-reviewed research.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigateTab('shop')}
                    className="btn btn-primary"
                    style={{ padding: '0.85rem 2.25rem', fontSize: '1rem' }}
                  >
                    Browse the Shop
                  </button>
                  <button
                    onClick={() => navigateTab('science')}
                    className="btn btn-secondary"
                    style={{ padding: '0.85rem 2.25rem', fontSize: '1rem' }}
                  >
                    The Science
                  </button>
                </div>
              </div>
            </section>

            {/* Trust / Highlights Strip */}
            <section style={{ borderTop: '1px solid var(--border-primary)', borderBottom: '1px solid var(--border-primary)', paddingBlock: '2rem' }}>
              <div className="container">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '2rem',
                  textAlign: 'center'
                }}>
                  {[
                    { icon: '🌿', title: 'Nursery-Grown', desc: 'Every plant is acclimated in our own nursery before it ships.' },
                    { icon: '🧬', title: 'GHK-Cu at Clinical Dose', desc: 'Copper peptide concentrations based on published dermatology research.' },
                    { icon: '📦', title: 'Live Arrival Guarantee', desc: 'Heat packs included in cold weather. Dead on arrival = replacement or refund.' },
                    { icon: '🔬', title: 'Transparent Formulas', desc: 'Full ingredient disclosure. No proprietary blend smokescreens.' },
                  ].map((item) => (
                    <div key={item.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                      <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-body)' }}>{item.title}</strong>
                      <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Two-Column Feature: Plants */}
            <section className="section-pad">
              <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
                  <div>
                    <span className="science-badge" style={{ marginBottom: '1rem' }}>Botanical Nursery</span>
                    <h2 style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>Plants That Are Ready to Grow</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                      Most online nurseries ship fresh tissue-culture plugs with almost no root mass—they look great in photos but go into shock the moment they leave the lab. We take a different approach. Every specimen in our catalog has been growing in our nursery long enough to develop a real, established root system. That means less acclimation stress for you and a much higher rate of success.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      We specialize in tropical cultivars: variegated bananas, rare aroids, vanilla orchids, passion fruit vines, and more. All grown in a custom organic soil mix inoculated with endomycorrhizae.
                    </p>
                  </div>
                  <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { label: 'Endomycorrhizae Inoculated', detail: 'Expanded root surface area from day one.' },
                      { label: 'Organic Slow-Release Nutrients', detail: 'Calcium-enriched soil for strong cell walls.' },
                      { label: 'Cold-Weather Heat Packs', detail: 'Included automatically when temps drop below 40°F.' },
                      { label: 'USDA Nursery Registered', detail: 'Compliant with interstate plant shipping regulations.' },
                    ].map((f) => (
                      <div key={f.label} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1 }}>✓</span>
                        <div>
                          <strong style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}>{f.label}</strong>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Two-Column Feature: Serums */}
            <section className="section-pad" style={{ backgroundColor: 'var(--bg-surface)' }}>
              <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }} className="hero-grid">
                  <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-secondary)' }}>Key Actives</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.6rem' }}>
                        {['GHK-Cu Copper Peptide', 'Silk Peptides', 'Niacinamide', 'Licorice Extract', 'Saw Palmetto', 'Rosemary Extract', 'Caffeine'].map((ing) => (
                          <span key={ing} className="ingredient-tag">{ing}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      All formulas are pH-optimized, fragrance-free, and produced in small batches for consistency.
                    </div>
                  </div>
                  <div>
                    <span className="science-badge" style={{ marginBottom: '1rem' }}>Skin & Hair Care</span>
                    <h2 style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>Actually Effective.<br />Not Just Aesthetic.</h2>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                      GHK-Cu (copper tripeptide-1) is one of the most studied peptides in dermatology. At the right concentration, it activates collagen and elastin synthesis, supports matrix metalloproteinase activity for matrix remodeling, and strengthens the skin barrier through ceramide production. We don't use it as a marketing term—we use it at concentrations that actually do something.
                    </p>
                    <button onClick={() => navigateTab('science')} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                      See the full ingredient breakdown →
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Instagram CTA */}
            <section className="section-pad" style={{ textAlign: 'center' }}>
              <div className="container" style={{ maxWidth: '540px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '50px',
                  background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  @petioleandbloomllc
                </div>
                <h2 style={{ marginBottom: '0.75rem' }}>Follow Along</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  New arrivals, plant care clips, and behind-the-scenes from the nursery and lab.
                </p>
                <a href="https://instagram.com/petioleandbloomllc" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Follow on Instagram
                </a>
              </div>
            </section>

            {/* Customer Reviews Section */}
            <ReviewsSection />
          </div>
        )}

        {/* ================= SHOP TAB ================= */}
        {currentTab === 'shop' && (
          <div>
            <ShopGrid
              filteredProducts={filteredProducts}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setSelectedProduct={selectProduct}
            />
            <ReviewsSection />
          </div>
        )}

        {/* ================= SCIENCE TAB ================= */}
        {currentTab === 'science' && (
          <section className="section-pad">
            <div className="container" style={{ maxWidth: '900px' }}>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <span className="science-badge">Formulation Transparency</span>
                <h1 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Actually Effective Skin &amp; Hair Care</h1>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-secondary)', maxWidth: '680px', marginInline: 'auto' }}>
                  Every active in our formulas is there for a documented reason. Here is what each ingredient does and why the concentration matters.
                </p>
              </div>

              {/* GHK-Cu Copper Peptide Article */}
              <article className="glass-panel" style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Key Active — Skin &amp; Scalp</span>
                  <a href="https://pubmed.ncbi.nlm.nih.gov/29986520/" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', textDecoration: 'underline' }}>PubMed reference →</a>
                </div>
                <h2>GHK-Cu (Copper Tripeptide-1)</h2>
                <p style={{ margin: 0, lineHeight: 1.7 }}>
                  GHK-Cu is a naturally occurring copper complex first isolated in human plasma in 1973. At clinical concentrations it has been shown to upregulate collagen and elastin synthesis, stimulate glycosaminoglycan production for plumping hydration, and activate matrix metalloproteinases (MMPs) for remodeling damaged extracellular matrix. It also promotes hair follicle cycling and extends the anagen (growth) phase.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Collagen Synthesis', icon: '⬆️', detail: 'Upregulates Col1A1 and Col3A1 genes for firmer skin' },
                    { label: 'Elastin Production', icon: '⬆️', detail: 'Restores skin snap and resilience' },
                    { label: 'Matrix Repair', icon: '🔧', detail: 'Activates MMPs to clear damaged tissue and rebuild' },
                    { label: 'Barrier Repair', icon: '🛡️', detail: 'Stimulates ceramide synthesis to strengthen skin barrier' },
                    { label: 'Follicle Stimulation', icon: '🌱', detail: 'Extends anagen phase; studied for hair density' },
                    { label: 'Anti-Inflammatory', icon: '🔵', detail: 'Downregulates IL-6 and TNF-α signaling pathways' },
                  ].map((b) => (
                    <div key={b.label} style={{ padding: '1rem', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{b.icon}</span>
                      <strong style={{ fontSize: '0.9rem', fontFamily: 'var(--font-body)' }}>{b.label}</strong>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{b.detail}</p>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-primary)', paddingTop: '1rem' }}>
                  ⚠️ <strong>Layering note:</strong> Do not combine directly with L-Ascorbic Acid (Vitamin C) or AHAs in the same step — they can degrade the copper complex. Use Vitamin C in the morning and GHK-Cu formulas at night.
                </div>
              </article>

              {/* Silk Peptides & Niacinamide Article */}
              <article className="glass-panel" style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Supporting Actives</span>
                <h2>Silk Peptides &amp; Niacinamide</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="science-grid">
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>Silk Peptides (Sericin / Fibroin hydrolysates)</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.7, margin: 0, color: 'var(--text-secondary)' }}>
                      Derived from Bombyx mori silk protein, these low-molecular-weight hydrolysates penetrate the upper epidermis and hair cuticle. They form a lightweight film that reduces moisture loss, increases tensile strength of hair strands, and deliver serine, glycine, and alanine—amino acids that directly contribute to keratin production.
                    </p>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', marginBottom: '0.75rem', color: 'var(--brand-secondary)' }}>Niacinamide (Vitamin B3)</h3>
                    <p style={{ fontSize: '0.95rem', lineHeight: 1.7, margin: 0, color: 'var(--text-secondary)' }}>
                      At 4–5% concentrations, niacinamide demonstrably reduces hyperpigmentation by inhibiting melanosome transfer from melanocytes to keratinocytes. It also increases ceramide and free fatty acid levels in the stratum corneum, directly strengthening the barrier. Additionally, it calms redness through its anti-inflammatory activity on sebocytes.
                    </p>
                  </div>
                </div>
              </article>

              {/* Licorice Extract & Scalp Actives */}
              <article className="glass-panel" style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Tone &amp; Scalp</span>
                <h2>Licorice Extract, Rosemary &amp; Saw Palmetto</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {[
                    {
                      num: '01', name: 'Licorice Root Extract (Glycyrrhiza Glabra)',
                      text: 'Contains glabridin, a potent inhibitor of tyrosinase—the enzyme responsible for melanin production. It is one of the few plant-derived skin brighteners with solid clinical backing for reducing post-inflammatory hyperpigmentation without the irritation of hydroquinone.'
                    },
                    {
                      num: '02', name: 'Rosemary Leaf Extract',
                      text: 'Contains carnosic acid and rosmarinic acid, which inhibit 5-alpha reductase and improve scalp microcirculation. A 2015 randomized controlled trial found rosemary oil as effective as 2% minoxidil for promoting hair growth after 6 months, with less scalp itch reported.'
                    },
                    {
                      num: '03', name: 'Saw Palmetto (Serenoa Repens)',
                      text: 'A well-documented 5-alpha reductase inhibitor that reduces DHT conversion at the follicle level. Oral supplementation has been studied in multiple trials; topical application at the scalp is an active area of research for androgenetic alopecia support.'
                    },
                    {
                      num: '04', name: 'Caffeine',
                      text: 'Stimulates local blood flow and may directly stimulate hair follicle cells in vitro by counteracting testosterone-induced growth suppression. Used as a circulation-supporting adjunct in the Scalp & Hair Tonic.'
                    },
                  ].map((item) => (
                    <div key={item.num} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 700, color: 'var(--brand-secondary)', fontSize: '1.1rem', minWidth: '2rem' }}>{item.num}.</div>
                      <div>
                        <strong style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', display: 'block', marginBottom: '0.35rem' }}>{item.name}</strong>
                        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              {/* Clinical Research Links */}
              <article className="glass-panel" style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Peer-Reviewed Research</span>
                <h2>Clinical Studies &amp; References</h2>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { href: 'https://pubmed.ncbi.nlm.nih.gov/29986520/', label: 'Regenerative and Protective Actions of the GHK-Cu Peptide — Pickart et al. (2018)' },
                    { href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6073405/', label: 'GHK Peptide as a Natural Modulator of Multiple Cellular Pathways — NCBI (2018)' },
                    { href: 'https://pubmed.ncbi.nlm.nih.gov/17709082/', label: 'Copper Peptides and Hair Growth — PubMed (2007)' },
                    { href: 'https://pubmed.ncbi.nlm.nih.gov/25573272/', label: 'Rosemary Oil vs. Minoxidil 2% for Hair Thickness — Randomized Trial (2015)' },
                    { href: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4158561/', label: 'Niacinamide: A B Vitamin That Improves Aging Facial Skin Appearance — NCBI' },
                  ].map((s) => (
                    <li key={s.href} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--brand-primary)', fontWeight: 700, marginTop: '0.1rem' }}>→</span>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'underline', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </article>

              {/* FAQ */}
              <article className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Customer Care &amp; Routine Guide</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clear Guidance · Verified Research</span>
                </div>
                <h2>Frequently Asked Skincare Questions</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                  {[
                    {
                      q: 'What will GHK-Cu Copper Peptide actually do for my skin?',
                      a: 'Defy is formulated to help your skin look noticeably smoother, firmer, and more refined. It improves elasticity ("bounce"), softens the look of fine lines, and calms redness without feeling heavy or greasy.',
                      science: 'Science Note: GHK-Cu (Glycyl-L-Histidyl-L-Lysine Copper) signals fibroblasts to synthesize fresh collagen I & III and elastin, while regulating MMP enzymes to repair damaged extracellular matrix. (Pickart L. et al., Biomed Res Int 2018; PubMed: 29986520).'
                    },
                    {
                      q: 'How soon will I see results, and what does the serum feel like?',
                      a: 'Your skin will feel softer and more hydrated within the first week. For visible improvements in fine lines, firmness, and pore texture, most customers notice clearer changes around weeks 4 to 8 of nightly use. The serum is a lightweight, water-based gel that absorbs completely in seconds with zero stickiness.',
                      science: 'Pro Tip: Take a clear photo before starting and compare at 30 and 60 days in the same lighting!'
                    },
                    {
                      q: 'How do I layer Defy Copper Peptide Serum in my daily routine?',
                      a: 'Cleanse your face → apply 2 to 4 drops of Defy to slightly damp skin → let it settle for 30 seconds → follow with your favorite simple moisturizer. In the morning, always finish with sunscreen.',
                      science: 'Layering Rule: Avoid mixing copper peptides directly in the same step as acidic L-Ascorbic Acid (pure Vitamin C) or strong AHA/BHA chemical exfoliants, as low pH can destabilize copper bonds. Use Vitamin C in the morning and Defy at night!'
                    },
                    {
                      q: 'Can I use Defy with Retinol or Niacinamide?',
                      a: 'Yes! Defy already includes 4–5% Niacinamide, which works synergistically with copper peptides to strengthen your moisture barrier and balance skin tone. If you use Retinol, we recommend applying Retinol on alternate nights or using Defy on your non-retinol evenings.',
                      science: 'Science Note: Niacinamide inhibits melanosome transfer to reduce hyperpigmentation while boosting ceramide synthesis. (NCBI PMC4158561).'
                    },
                    {
                      q: 'What do Silk Peptides and Licorice Root Extract do?',
                      a: 'Silk Peptides provide a silky, protective moisture seal using amino acids (serine, glycine, alanine) that match your skin’s natural moisturizing factors. Licorice Root Extract (Glabridin) gently brightens dark spots and evens skin tone without harsh bleaching chemicals.',
                      science: 'Science Note: Glabridin is a clinically verified, non-cytotoxic tyrosinase inhibitor that calms post-inflammatory hyperpigmentation.'
                    },
                    {
                      q: 'How does your Scalp & Hair Tonic support fuller-looking hair?',
                      a: 'Our tonic targets scalp health right at the roots. Saw Palmetto and Rosemary Leaf Extract help protect dormant roots and calm scalp tightness, while Caffeine boosts microcirculation so nutrients reach hair follicles.',
                      science: 'Science Note: A 2015 randomized clinical trial demonstrated topical rosemary extract yielded hair density increases clinically equivalent to 2% minoxidil over 6 months with superior scalp comfort. (PubMed: 25573272).'
                    },
                    {
                      q: 'Will this clog my pores or trigger sensitivity?',
                      a: 'No. Defy is 100% fragrance-free, dye-free, oil-free, and formulated at a skin-friendly pH (5.5–6.5). It is non-comedogenic and suitable for sensitive skin types. If you have known copper sensitivities, patch test on your inner forearm for 24 hours first.'
                    },
                  ].map((faq, i, arr) => (
                    <div key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-primary)' : 'none', paddingBottom: i < arr.length - 1 ? '1.5rem' : 0 }}>
                      <strong style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', display: 'block', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{faq.q}</strong>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{faq.a}</p>
                      {faq.science && (
                        <div style={{ fontSize: '0.83rem', color: 'var(--brand-primary)', fontStyle: 'italic', backgroundColor: 'oklch(from var(--brand-primary) l c h / 0.06)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--brand-primary)' }}>
                          {faq.science}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </article>

            </div>
          </section>
        )}

        {/* ================= PLANT CARE GUIDE TAB ================= */}
        {currentTab === 'about' && (
          <section className="section-pad">
            <div className="container" style={{ maxWidth: '800px' }}>

              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <span className="science-badge">Care & Cultivation</span>
                <h1 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Plants & Botanicals</h1>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  Your new plant just traveled across the country in a box — a little drama is expected. Here is what to do from unboxing to thriving.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                <article className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Step 1</span>
                  <h2>Unboxing Day</h2>
                  <p>Open the box in a warm, well-lit room. Carefully remove all packing material and check the roots — they should feel firm and slightly moist, not mushy. A few yellow or droopy leaves after transit are completely normal and not a sign of a problem.</p>
                  <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <li>Do not repot immediately—let the plant rest for at least a week first.</li>
                    <li>If leaves are wilted, place the pot in a humid spot (a bathroom counter works well) for 24–48 hours.</li>
                    <li>Check for any roots that may have dried out in transit. A light misting of the root zone can help rehydrate them.</li>
                  </ul>
                </article>

                <article className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Step 2</span>
                  <h2>Acclimation (The First 2–4 Weeks)</h2>
                  <p>This is the most critical period. Your plant is adjusting from our nursery environment to yours. Resist the urge to move it around or fertilize it heavily during this time.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="science-grid">
                    {[
                      { title: 'Light', detail: 'Bright, indirect light is ideal for most tropicals. Avoid harsh direct afternoon sun during acclimation. East or west-facing windows work well.' },
                      { title: 'Temperature', detail: 'Keep above 60°F (15°C) at minimum. Most tropicals prefer 65–85°F. Avoid cold drafts from AC vents or exterior doors.' },
                      { title: 'Humidity', detail: 'Aim for 50–70% if possible. A pebble tray with water or a small humidifier nearby helps. Grouping plants together naturally raises local humidity.' },
                      { title: 'Fertilizer', detail: 'Hold off for the first 4 weeks. The soil we use already has slow-release nutrients built in. Adding more too early can stress the roots.' },
                    ].map((item) => (
                      <div key={item.title}>
                        <strong style={{ color: 'var(--brand-primary)', display: 'block', marginBottom: '0.4rem', fontFamily: 'var(--font-body)' }}>{item.title}</strong>
                        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Step 3</span>
                  <h2>Watering</h2>
                  <p>Overwatering is the number-one cause of tropical plant death. The goal is moist but never waterlogged soil. Here is a simple approach:</p>
                  <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <li>Stick your finger about 1–2 inches into the soil. If it feels dry at that depth, it is time to water.</li>
                    <li>Water thoroughly—until it drains from the bottom. Do not let the pot sit in standing water.</li>
                    <li>Most tropicals in our soil mix need watering every 5–10 days depending on your indoor conditions and season.</li>
                    <li>Use room-temperature water. Cold tap water can shock tropical root systems.</li>
                    <li>If you notice yellowing leaves with soggy soil, pull back on frequency. If leaves are crispy and the soil is bone dry, increase frequency.</li>
                  </ol>
                </article>

                <article className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Step 4</span>
                  <h2>When to Repot</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Wait at least 4–6 weeks before repotting. Signs your plant is ready: roots circling the bottom, roots growing out of drainage holes, or the plant becoming top-heavy. When you do repot, choose a pot only 1–2 inches larger in diameter. Too large of a pot leads to waterlogged soil and root rot.</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Use a well-draining mix appropriate for your specific plant type. We are happy to recommend one—just reach out through the Contact page with the plant name.</p>
                </article>

                {/* Nursery Cultivation FAQ */}
                <article className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <span className="science-badge" style={{ alignSelf: 'flex-start' }}>Nursery Biology FAQ</span>
                  <h2>Nursery &amp; Root Cultivation Questions</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {[
                      {
                        q: 'Why do Petiole & Bloom plants ship in 3" pots rather than starter plugs?',
                        a: 'Mass-market tissue culture plugs often suffer up to 40% loss from transplant shock. We grow every specimen in our nursery until it develops an active, established root system in an organic soil mix before shipping, dramatically improving acclimation success.'
                      },
                      {
                        q: 'What is the role of mycorrhizal fungi in your nursery soil?',
                        a: 'During transplanting, we inoculate root zones with beneficial endomycorrhizal fungi (Glomus species). Fungal hyphae colonize root cortical cells and extend outward, expanding effective root absorptive surface area up to 1,000-fold for phosphorus and micronutrient uptake.'
                      },
                      {
                        q: 'How does the Live Arrival Guarantee work?',
                        a: 'We keep an eye on the weather at your destination. If temperatures are low enough to risk cold damage, we will include a heat pack with orders of two or more plants at no extra charge. If your plant arrives damaged due to carrier delays, send us photos within 24 hours and we will replace it or issue a full refund.'
                      }
                    ].map((faq, i, arr) => (
                      <div key={i} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-primary)' : 'none', paddingBottom: i < arr.length - 1 ? '1.5rem' : 0 }}>
                        <strong style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', display: 'block', marginBottom: '0.5rem' }}>{faq.q}</strong>
                        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, oklch(from var(--brand-primary) l c h / 0.08), oklch(from var(--brand-secondary) l c h / 0.08))' }}>
                  <h3 style={{ marginBottom: '0.75rem' }}>Still Have Questions?</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    Every plant order comes with free care consultation. Send us a photo of your plant and a description of what you are seeing and we will help you diagnose it.
                  </p>
                  <button onClick={() => navigateTab('contact')} className="btn btn-primary">
                    Get Plant Care Help
                  </button>
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
                <span className="science-badge">Inquiries &amp; Support</span>
                <h1 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Contact Us</h1>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                  Questions about your order, plant care, or our formulas? We respond within one business day.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                gap: '3rem'
              }} className="hero-grid">

                {/* Contact Form */}
                <div className="glass-panel">
                  {formSubmitted ? (
                    <div style={{ padding: '2rem 1rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'oklch(from var(--brand-primary) l c h / 0.15)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
                        ✓
                      </div>
                      <h3 style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '1.25rem' }}>Message Sent!</h3>
                      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontSize: '0.95rem' }}>
                        Thank you{formName ? `, ${formName}` : ''}! Your message has been sent directly to our inbox. We will respond within one business day.
                      </p>
                      <button onClick={() => setFormSubmitted(false)} className="btn btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form 
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        
                        // Honeypot check: If botcheck is filled, drop submission silently
                        if (formData.get('botcheck')) {
                          setFormSubmitted(true);
                          return;
                        }

                        formData.append("access_key", "532bece1-a369-4c98-9557-046e7b58a1cb");
                        
                        const nameVal = (formData.get('name') as string) || '';
                        setFormName(nameVal);

                        try {
                          const res = await fetch("https://api.web3forms.com/submit", {
                            method: "POST",
                            body: formData
                          });
                          const result = await res.json();
                          if (result.success) {
                            setFormSubmitted(true);
                          } else {
                            alert("Submission note: " + (result.message || "Could not submit form."));
                            setFormSubmitted(true);
                          }
                        } catch (err) {
                          setFormSubmitted(true);
                        }
                      }} 
                      style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}
                    >
                      {/* Anti-Spam Honeypot Field */}
                      <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Full Name</label>
                        <input
                          type="text"
                          name="name"
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
                          name="email"
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
                          name="subject"
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
                          <option>Skin Care Help</option>
                          <option>Scalp &amp; Hair Tonic Help</option>
                          <option>Plant Care Question</option>
                          <option>Order Status</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Your Message</label>
                        <textarea
                          name="message"
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
                    <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem' }}>Based in the USA</h4>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                      We ship domestically only. All plants and formulas are grown and produced locally.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem' }}>Free Plant Care Consultation</h4>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                      Every plant order includes lifetime care support. Send us a photo of your plant anytime and we will help troubleshoot.
                    </p>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h4 style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.95rem' }}>Follow Us</h4>
                    <a
                      href="https://instagram.com/petioleandbloomllc"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', borderRadius: '50px',
                        background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                        color: 'white', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', width: 'fit-content'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                      @petioleandbloomllc
                    </a>
                  </div>
                </div>

              </div>

            </div>
          </section>
        )}

      </main>

      {/* Immersive Details Dialog Drawer */}
      <ProductModal product={selectedProduct} onClose={closeProduct} />

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
              }}>
                Petiole &amp; Bloom
              </div>
              <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                Rare tropical nursery specimens and clinical copper peptide formulas. Grown and made in the USA.
              </p>
              <a
                href="https://instagram.com/petioleandbloomllc"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.4rem 1rem', borderRadius: '50px', width: 'fit-content',
                  background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                  color: 'white', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none'
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                Follow @petioleandbloomllc
              </a>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Navigation
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
                <li><button onClick={() => { navigateTab('home'); window.scrollTo(0,0); }} style={{ color: 'var(--text-secondary)' }}>Home</button></li>
                <li><button onClick={() => { navigateTab('shop'); window.scrollTo(0,0); }} style={{ color: 'var(--text-secondary)' }}>Shop Catalog</button></li>
                <li><button onClick={() => { navigateTab('about'); window.scrollTo(0,0); }} style={{ color: 'var(--text-secondary)' }}>Plants &amp; Botanicals</button></li>
                <li><button onClick={() => { navigateTab('science'); window.scrollTo(0,0); }} style={{ color: 'var(--text-secondary)' }}>Peptides &amp; Bio-Actives</button></li>
                <li><button onClick={() => { navigateTab('contact'); window.scrollTo(0,0); }} style={{ color: 'var(--text-secondary)' }}>Contact Us</button></li>
                <li><a href="https://petioleandbloomllc.etsy.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }}>Etsy Store ↗</a></li>
              </ul>
            </div>

            {/* Newsletter sign-up */}
            <div>
              <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Join the Nursery
              </h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                New arrivals, plant care tips, and skincare updates. No spam, ever.
              </p>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formEl = e.currentTarget;
                  const formData = new FormData(formEl);

                  // Honeypot anti-spam check
                  if (formData.get('botcheck')) {
                    alert('Thank you for subscribing to Petiole & Bloom nursery updates!');
                    formEl.reset();
                    return;
                  }

                  formData.append("access_key", "532bece1-a369-4c98-9557-046e7b58a1cb");
                  formData.append("subject", "New Newsletter Subscription — Petiole & Bloom");
                  
                  try {
                    await fetch("https://api.web3forms.com/submit", {
                      method: "POST",
                      body: formData
                    });
                  } catch (err) {}

                  alert('Thank you for subscribing to Petiole & Bloom nursery updates!');
                  formEl.reset();
                }} 
                style={{ display: 'flex', gap: '0.5rem' }}
              >
                {/* Anti-Spam Honeypot Field */}
                <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
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

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
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

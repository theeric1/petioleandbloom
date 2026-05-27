import React from 'react';
import { ProductCard } from './ProductCard';

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
}

interface ShopGridProps {
  filteredProducts: Product[];
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (product: Product | null) => void;
}

export const ShopGrid: React.FC<ShopGridProps> = ({
  filteredProducts,
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  setSelectedProduct
}) => {
  return (
    <section id="shop-section" className="section-pad">
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>Store Catalog</h2>
          <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            Synchronized straight from our active nursery. Explore our well-rooted tropical specimens and gentle peptide serums. 
          </p>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel filter-bar" style={{
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3.5rem',
          borderRadius: 'var(--radius-md)'
        }}>
          
          {/* Category Selector Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }} className="hide-scrollbar">
            {[
              { id: 'all', label: 'All Catalog' },
              { id: 'Serums', label: 'Nourishing Serums' },
              { id: 'Plants', label: 'Plants & Botanicals' },
              { id: 'Shopify', label: 'Shopify Direct' },
              { id: 'Etsy', label: 'Etsy Listings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className="btn"
                style={{
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.9rem',
                  backgroundColor: categoryFilter === tab.id ? 'var(--brand-primary)' : 'transparent',
                  color: categoryFilter === tab.id ? 'white' : 'var(--text-secondary)',
                  minBlockSize: '36px',
                  border: categoryFilter === tab.id ? '1px solid transparent' : '1px solid var(--border-primary)',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar Input */}
          <div style={{ position: 'relative', width: '300px', flexGrow: 1, maxWidth: '400px' }} className="search-wrapper">
            <input 
              type="text" 
              placeholder="Search catalog..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-primary)',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

        </div>

        {/* Products Catalog Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid-products">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onSelect={(p) => setSelectedProduct(p)} 
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ textAlign: 'center', paddingBlock: '5rem' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No items found matching your filter selection.</p>
            <button 
              onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }} 
              className="btn btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

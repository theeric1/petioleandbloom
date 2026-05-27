import React from 'react';
import { addProductToCart } from '../lib/ShopifyManager';

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

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  return (
    <article className="product-card" style={{ height: '100%' }}>
      {/* Product Image Wrapper */}
      <div style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }} onClick={() => onSelect(product)}>
        {/* Featured Tag */}
        {product.isFeatured && (
          <span className="science-badge" style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 2,
            backgroundColor: 'var(--brand-secondary)',
            color: 'oklch(0.98 0 0)',
            borderColor: 'transparent'
          }}>
            Signature
          </span>
        )}
        
        {/* Category Tag */}
        <span className="science-badge" style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 2,
          backgroundColor: 'var(--bg-surface)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)'
        }}>
          {product.category}
        </span>

        <img 
          src={product.image} 
          alt={product.title} 
          loading="lazy"
          className="product-card-image"
          onError={(e) => {
            // Fallback for missing images
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600';
          }}
        />
      </div>

      {/* Product Information */}
      <div style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: '0.8rem'
      }}>
        {/* Rating and Price Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem'
        }}>
          {/* Star rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--brand-secondary)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.rating.toFixed(1)}</span>
          </div>
          
          {/* Price */}
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--brand-primary)'
          }}>
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Product Title */}
        <h3 
          onClick={() => onSelect(product)}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '1.1rem',
            letterSpacing: '0.01em',
            lineHeight: 1.4,
            cursor: 'pointer',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.8rem',
            color: 'var(--text-primary)',
            transition: 'color var(--transition-smooth)'
          }}
          className="product-title"
        >
          {product.title}
        </h3>

        {/* Shortened Description */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          margin: 0
        }}>
          {product.description}
        </p>

        {/* Actions Row */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.75rem',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button 
            onClick={() => onSelect(product)}
            className="btn btn-secondary"
            style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            Details
          </button>
          
          {product.platform === 'Shopify' && product.variantId ? (
            <button 
              onClick={() => addProductToCart(product.variantId!)}
              className="btn btn-copper"
              style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              Buy on Shopify
            </button>
          ) : (
            <a 
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-copper"
              style={{ 
                flex: 1, 
                padding: '0.5rem 1rem', 
                fontSize: '0.9rem',
                textAlign: 'center',
                textDecoration: 'none'
              }}
            >
              Buy on Etsy
            </a>
          )}
        </div>
      </div>

      <style>{`
        .product-title:hover {
          color: var(--brand-secondary) !important;
        }
      `}</style>
    </article>
  );
};

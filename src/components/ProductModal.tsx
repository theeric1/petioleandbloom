import React, { useEffect, useRef } from 'react';

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

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [product, onClose]);

  if (!product) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div 
        ref={modalContentRef}
        className="modal-container"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Close product details"
          className="modal-close-btn"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 20,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            lineHeight: 1,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease'
          }}
        >
          &times;
        </button>

        {/* Modal Grid Container */}
        <div 
          className="modal-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1fr) 1.25fr',
            overflowY: 'auto',
            maxHeight: '90vh'
          }}
        >
          {/* Left: Product Image */}
          <div 
            className="modal-image-container"
            style={{
              position: 'relative',
              backgroundColor: 'var(--bg-app)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              borderRight: '1px solid var(--border-primary)'
            }}
          >
            <img 
              src={product.image} 
              alt={product.title} 
              width="600"
              height="600"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                maxHeight: '480px'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600';
              }}
            />
          </div>

          {/* Right: Product Details & Info */}
          <div 
            className="modal-details"
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              overflowY: 'auto'
            }}
          >
            {/* Category and Rating */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '2rem' }}>
              <span className="science-badge">{product.category}</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--brand-secondary)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{product.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Product Title */}
            <h2 
              id="modal-product-title"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.45rem',
                fontWeight: 700,
                lineHeight: 1.3,
                margin: 0,
                color: 'var(--text-primary)'
              }}
            >
              {product.title}
            </h2>

            {/* Price and Stock */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <span style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--brand-primary)'
              }}>
                ${product.price.toFixed(2)}
              </span>
              <span style={{
                fontSize: '0.88rem',
                color: 'oklch(0.55 0.12 145)',
                fontWeight: 600
              }}>
                ✓ In Stock & Ready to Ship
              </span>
            </div>

            {/* Product Description */}
            <div 
              className="modal-desc"
              style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
                maxHeight: '260px',
                overflowY: 'auto',
                paddingRight: '0.5rem',
                borderTop: '1px solid var(--border-primary)',
                borderBottom: '1px solid var(--border-primary)',
                paddingBlock: '1rem'
              }}
            >
              {product.description}
            </div>

            {/* Scientific Ingredients & Target Panel (For Peptide Serums) */}
            {product.science && (
              <div 
                className="glass-panel" 
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)'
                }}
              >
                <h4 style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontWeight: 700, 
                  fontSize: '0.82rem', 
                  color: 'var(--brand-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  margin: 0
                }}>
                  🧬 Laboratory Formulation Specifications
                </h4>
                
                <div style={{ fontSize: '0.84rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Key Bio-Actives:</strong> {product.science.activeIngredients.join(', ')}</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Physiological pH:</strong> {product.science.phRange}</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Target:</strong> {product.science.target}</div>
                </div>
              </div>
            )}

            {/* Buy / Checkout Action */}
            <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
              <a 
                href={product.link || 'https://petioleandbloomllc.etsy.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-copper"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                  textDecoration: 'none',
                  paddingBlock: '0.9rem',
                  fontSize: '1.05rem',
                  fontWeight: 600
                }}
              >
                Buy on Etsy
              </a>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(12px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .modal-close-btn:hover {
          background-color: var(--brand-secondary) !important;
          color: white !important;
          border-color: var(--brand-secondary) !important;
          transform: rotate(90deg);
        }
        @media (max-width: 700px) {
          .modal-grid {
            grid-template-columns: 1fr !important;
          }
          .modal-image-container {
            min-height: 200px !important;
            max-height: 240px !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border-primary) !important;
          }
          .modal-details {
            padding: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

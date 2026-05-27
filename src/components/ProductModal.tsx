import React, { useEffect, useRef } from 'react';

interface Product {
  id: string;
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (product) {
      // Prevent double show errors
      if (!dialog.open) {
        dialog.showModal();
        document.body.style.overflow = 'hidden'; // Lock background scrolling
      }
    } else {
      if (dialog.open) {
        dialog.close();
        document.body.style.overflow = 'auto'; // Unlock background scrolling
      }
    }
  }, [product]);

  // Handle clicking outside the dialog box to close it
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );

    if (!isInDialog) {
      onClose();
    }
  };

  const handleCloseTransition = () => {
    onClose();
  };

  if (!product) return null;

  return (
    <dialog 
      ref={dialogRef}
      onClick={handleDialogClick}
      onClose={handleCloseTransition}
      className="product-dialog"
    >
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Close details"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          className="close-btn"
        >
          &times;
        </button>

        {/* Modal Grid Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1.1fr) 1.2fr',
          minHeight: '400px',
          overflowY: 'auto'
        }} className="modal-grid">
          
          {/* Left: Product Image */}
          <div style={{
            position: 'relative',
            backgroundColor: 'light-dark(oklch(0.96 0.005 85), oklch(0.1 0.01 240))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }} className="modal-image-container">
            <img 
              src={product.image} 
              alt={product.title} 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                maxHeight: '450px'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600';
              }}
            />
          </div>

          {/* Right: Product Details & Info */}
          <div style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem'
          }} className="modal-details">
            
            {/* Category and Rating */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="science-badge">{product.category}</span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--brand-secondary)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{product.rating.toFixed(1)}</span>
              </div>
            </div>

            {/* Product Title */}
            <h2 style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.5rem',
              fontWeight: 700,
              lineHeight: 1.3,
              margin: 0
            }}>
              {product.title}
            </h2>

            {/* Price and Stock */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '1rem'
            }}>
              <span style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: 'var(--brand-primary)'
              }}>
                ${product.price.toFixed(2)}
              </span>
              <span style={{
                fontSize: '0.9rem',
                color: 'oklch(0.55 0.12 145)',
                fontWeight: 600
              }}>
                ✓ In Stock & Ready to Ship
              </span>
            </div>

            {/* Product Description */}
            <div style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              maxHeight: '250px',
              overflowY: 'auto',
              paddingRight: '0.5rem',
              borderBottom: '1px solid var(--border-primary)',
              paddingBottom: '1rem'
            }} className="modal-desc">
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
                  gap: '0.6rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'light-dark(oklch(0.95 0.005 85 / 0.8), oklch(0.08 0.005 240 / 0.8))'
                }}
              >
                <h4 style={{ 
                  fontFamily: 'var(--font-body)', 
                  fontWeight: 700, 
                  fontSize: '0.85rem', 
                  color: 'var(--brand-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  🧬 Laboratory Formulation Specifications
                </h4>
                
                <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>Key Bio-Actives:</strong> {product.science.activeIngredients.join(', ')}</div>
                  <div><strong>Physiological pH:</strong> {product.science.phRange}</div>
                  <div><strong>Indications/Target:</strong> {product.science.target}</div>
                </div>
              </div>
            )}

            {/* Buy / Checkout Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
              <a 
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-copper"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  textDecoration: 'none',
                  paddingBlock: '1rem',
                  fontSize: '1.05rem',
                  fontWeight: 600
                }}
              >
                {product.platform === 'Shopify' ? 'Buy on Shopify' : 'Buy on Etsy (via Share & Save)'}
              </a>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        .close-btn:hover {
          background-color: var(--brand-secondary) !important;
          color: white !important;
          transform: rotate(90deg);
        }
        @media (max-width: 650px) {
          .modal-grid {
            grid-template-columns: 1fr !important;
          }
          .modal-image-container {
            max-height: 250px !important;
          }
        }
      `}</style>
    </dialog>
  );
};

import React from 'react';
import reviewsData from '../data/reviews.json';

interface Review {
  reviewer: string;
  date_reviewed: string;
  star_rating: number;
  message: string;
  order_id: number;
}

export const ReviewsSection: React.FC = () => {
  const reviews = reviewsData as Review[];

  return (
    <section className="section-pad" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="science-badge" style={{ marginBottom: '0.75rem' }}>Verified Customer Feedback</span>
          <h2 style={{ marginTop: '0.5rem', marginBottom: '0.75rem' }}>Loved by Growers &amp; Skincare Enthusiasts</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>★ ★ ★ ★ ★</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>5.0 Rating</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>(65+ Verified Orders)</span>
          </div>
        </div>

        {/* Reviews Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {reviews.map((r, index) => (
            <div 
              key={index}
              className="glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)'
              }}
            >
              {/* Stars & Verified Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#f59e0b', fontSize: '0.9rem', letterSpacing: '2px' }}>
                  {'★'.repeat(r.star_rating)}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600, backgroundColor: 'oklch(from var(--brand-primary) l c h / 0.1)', padding: '0.2rem 0.5rem', borderRadius: '50px' }}>
                  ✓ Verified Purchase
                </span>
              </div>

              {/* Review Message */}
              <p style={{
                fontSize: '0.92rem',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
                margin: 0,
                flexGrow: 1,
                fontStyle: 'italic'
              }}>
                "{r.message}"
              </p>

              {/* Reviewer Details */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-primary)',
                paddingTop: '0.75rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>{r.reviewer}</strong>
                <span>{r.date_reviewed}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

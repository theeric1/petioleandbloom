import React from 'react';

interface BreadcrumbsProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  productTitle?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentTab, setCurrentTab, productTitle }) => {
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'shop': return 'Shop Catalog';
      case 'science': return 'Science & Bio-Actives';
      case 'about': return 'Plant Care Guide';
      case 'contact': return 'Contact Us';
      default: return 'Home';
    }
  };

  return (
    <nav 
      aria-label="Breadcrumb navigation"
      style={{
        paddingBlock: '0.75rem 1.5rem',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setCurrentTab('home')}
          style={{ 
            color: currentTab === 'home' && !productTitle ? 'var(--brand-primary)' : 'var(--text-secondary)',
            fontWeight: currentTab === 'home' && !productTitle ? 600 : 400,
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: 0
          }}
        >
          Home
        </button>

        {currentTab !== 'home' && (
          <>
            <span style={{ opacity: 0.5 }}>/</span>
            <button 
              onClick={() => setCurrentTab(currentTab)}
              style={{ 
                color: !productTitle ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontWeight: !productTitle ? 600 : 400,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0
              }}
            >
              {getTabLabel(currentTab)}
            </button>
          </>
        )}

        {productTitle && (
          <>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'var(--brand-primary)', fontWeight: 600, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {productTitle}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};

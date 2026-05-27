import React, { useState, useEffect } from 'react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('petiole-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('petiole-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop Catalog' },
    { id: 'science', label: 'Science & Bio-Actives' },
    { id: 'about', label: 'Our Story' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (tabId: string) => {
    const updateState = () => {
      setCurrentTab(tabId);
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!document.startViewTransition) {
      updateState();
    } else {
      document.startViewTransition(() => {
        updateState();
      });
    }
  };

  return (
    <nav className="navbar" style={{
      boxShadow: isScrolled ? 'var(--shadow-md)' : 'none',
      borderBottom: isScrolled ? '1px solid var(--border-primary)' : '1px solid transparent',
      transition: 'all 0.3s ease'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBlock: '1rem',
        position: 'relative'
      }}>
        {/* Brand Logo & Name */}
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '1.4rem',
            letterSpacing: '0.05em',
            color: 'var(--brand-primary)'
          }}
        >
          {/* Custom Botanical-Chemical Icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-secondary)' }}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            <circle cx="12" cy="12" r="3" fill="var(--brand-primary)" />
          </svg>
          <span className="gradient-text">Petiole & Bloom</span>
        </a>

        {/* Desktop Nav Links */}
        <ul style={{
          display: 'flex',
          listStyle: 'none',
          gap: '2rem',
          alignItems: 'center',
          margin: 0,
          padding: 0
        }} className="desktop-nav">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    position: 'relative',
                    padding: '0.5rem 0.2rem',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.02em',
                    fontSize: '0.95rem',
                    transition: 'color 0.25s ease'
                  }}
                  className="nav-btn"
                >
                  {item.label}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: 'var(--brand-secondary)',
                      borderRadius: '2px',
                      animation: 'fadeIn 0.3s ease'
                    }} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Theme & Social Icons Container */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto', marginRight: '1rem' }} className="nav-actions">
           {/* Instagram Icon */}
           <a href="https://instagram.com/petioleandbloomllc" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)' }} aria-label="Instagram">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
           </a>

           {/* Theme Toggle */}
           <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ color: 'var(--text-secondary)', padding: '5px' }} aria-label="Toggle Theme">
             {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
             ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
             )}
           </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          className="mobile-toggle"
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '5px',
            zIndex: 110
          }}
        >
          <span style={{
            width: '24px',
            height: '2px',
            backgroundColor: 'var(--brand-primary)',
            transition: 'all 0.3s ease',
            transform: isMobileMenuOpen ? 'rotate(45deg) translate(5px, 6px)' : 'none'
          }} />
          <span style={{
            width: '24px',
            height: '2px',
            backgroundColor: 'var(--brand-primary)',
            transition: 'all 0.3s ease',
            opacity: isMobileMenuOpen ? 0 : 1
          }} />
          <span style={{
            width: '24px',
            height: '2px',
            backgroundColor: 'var(--brand-primary)',
            transition: 'all 0.3s ease',
            transform: isMobileMenuOpen ? 'rotate(-45deg) translate(5px, -6px)' : 'none'
          }} />
        </button>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div 
            style={{
              position: 'fixed',
              top: '72px',
              left: 0,
              width: '100%',
              backgroundColor: 'var(--bg-app)',
              borderBottom: '1px solid var(--border-primary)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              zIndex: 99,
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideDown 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  textAlign: 'left',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: currentTab === item.id ? 'oklch(from var(--brand-primary) l c h / 0.08)' : 'transparent',
                  color: currentTab === item.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: currentTab === item.id ? 600 : 400,
                  width: '100%',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Embedded Responsive Nav Styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scaleX(0.3); }
          to { opacity: 1; transform: scaleX(1); }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </nav>
  );
};

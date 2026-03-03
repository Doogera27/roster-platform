import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { clsx } from 'clsx';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { NavDropdown } from './NavDropdown';

const CLIENT_LINKS = [
  { label: 'Overview', to: '/for-clients', description: 'Platform overview for teams' },
  { label: 'Features', to: '/for-clients/features', description: 'AI PM, Brand Vault & more' },
  { label: 'Pricing', to: '/for-clients/pricing', description: 'Plans from $99/mo' },
];

const CREATIVE_LINKS = [
  { label: 'Overview', to: '/for-creatives', description: 'How Roster works for you' },
  { label: 'Features', to: '/for-creatives/features', description: 'Portfolio, matching & payments' },
  { label: 'Pricing', to: '/for-creatives/pricing', description: 'Membership from $29/mo' },
];

export function MarketingNav() {
  const scrollY = useScrollPosition();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolled = scrollY > 50;

  const isActive = (path: string) => location.pathname === path;
  const isInSection = (prefix: string) => location.pathname.startsWith(prefix);

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[rgba(13,27,42,0.85)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.06)]'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between" style={{ height: '72px' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-[22px] font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>
            ROSTER
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavDropdown label="For Clients" items={CLIENT_LINKS} />
          <NavDropdown label="For Creatives" items={CREATIVE_LINKS} />
          <Link
            to="/pricing"
            className={clsx(
              'text-sm font-medium transition-colors duration-200',
              isActive('/pricing') ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-white',
            )}
          >
            Pricing
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="text-[14px] font-medium text-[var(--color-text-muted)] hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/for-clients" className="btn-primary text-[13px] px-5 py-2.5">
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span className={clsx('w-5 h-0.5 bg-white transition-transform duration-200', mobileOpen && 'translate-y-2 rotate-45')} />
          <span className={clsx('w-5 h-0.5 bg-white transition-opacity duration-200', mobileOpen && 'opacity-0')} />
          <span className={clsx('w-5 h-0.5 bg-white transition-transform duration-200', mobileOpen && '-translate-y-2 -rotate-45')} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--color-navy-mid)] border-t border-[var(--color-border)] px-6 py-6 space-y-5">
          {/* For Clients section */}
          <div>
            <div className="text-label text-[var(--color-gold)] mb-2">For Clients</div>
            <div className="space-y-2 pl-2">
              {CLIENT_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'block text-[15px] font-medium',
                    isActive(link.to) ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-white',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* For Creatives section */}
          <div>
            <div className="text-label text-[var(--color-teal)] mb-2">For Creatives</div>
            <div className="space-y-2 pl-2">
              {CREATIVE_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'block text-[15px] font-medium',
                    isActive(link.to) ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-white',
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Pricing & CTAs */}
          <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="block text-[15px] font-medium text-[var(--color-text-secondary)] hover:text-white">
              Pricing
            </Link>
            <Link to="/login" onClick={() => setMobileOpen(false)} className="block text-[15px] font-medium text-[var(--color-text-secondary)]">
              Sign In
            </Link>
            <Link to="/for-clients" onClick={() => setMobileOpen(false)} className="btn-primary block text-center text-[14px] py-3">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

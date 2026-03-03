import { Link } from 'react-router-dom';

const footerLinks = {
  'For Teams': [
    { label: 'Overview', to: '/for-clients' },
    { label: 'Features', to: '/for-clients/features' },
    { label: 'Pricing', to: '/for-clients/pricing' },
  ],
  'For Creatives': [
    { label: 'Overview', to: '/for-creatives' },
    { label: 'Features', to: '/for-creatives/features' },
    { label: 'Pricing', to: '/for-creatives/pricing' },
  ],
  Product: [
    { label: 'All Features', to: '/features' },
    { label: 'All Pricing', to: '/pricing' },
  ],
  Company: [
    { label: 'About', to: '#' },
    { label: 'Blog', to: '#' },
    { label: 'Contact', to: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-[var(--color-navy)] border-t border-[rgba(255,255,255,0.06)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          {/* Logo & tagline */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-[20px] font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                ROSTER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
            </Link>
            <p className="text-sm text-[var(--color-text-faint)] leading-relaxed max-w-[240px]">
              The creative operations platform for modern marketing teams and creative professionals.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-label text-[var(--color-text-muted)] mb-4">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-[var(--color-text-faint)] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-faint)]">
            &copy; {new Date().getFullYear()} Roster. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-faint)] hover:text-white transition-colors" aria-label="Twitter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-faint)] hover:text-white transition-colors" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

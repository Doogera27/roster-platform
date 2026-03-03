import { Outlet } from 'react-router-dom';
import { MarketingNav } from './MarketingNav';
import { MarketingFooter } from './MarketingFooter';

export function MarketingLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-navy)]">
      {/* Skip navigation for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-gold)] focus:text-[var(--color-navy)] focus:rounded-[var(--radius-md)] focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      <MarketingNav />
      <main id="main-content" aria-label="Page content">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}

import { Link } from 'react-router-dom';

interface MembershipCardProps {
  isAnnual: boolean;
}

export function MembershipCard({ isAnnual }: MembershipCardProps) {
  const price = isAnnual ? '$199' : '$29';
  const period = isAnnual ? '/year' : '/mo';
  const monthlyEquivalent = isAnnual ? '$16.58/mo equivalent' : '$348/yr if paid monthly';

  return (
    <div className="relative rounded-[var(--radius-lg)] p-8 bg-[var(--color-navy-mid)] border-2 border-[rgba(46,196,182,0.3)] shadow-[0_0_40px_rgba(46,196,182,0.08)] max-w-md mx-auto">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="text-[10px] font-bold tracking-wider uppercase bg-[var(--color-teal)] text-[var(--color-navy)] px-3 py-1 rounded-full">
          CREATIVE MEMBERSHIP
        </span>
      </div>

      <div className="text-center mb-6 mt-2">
        <h3 className="text-heading text-xl text-white mb-1">Active Membership</h3>
        <p className="text-sm text-[var(--color-text-faint)]">Everything you need to grow your creative career</p>
      </div>

      <div className="text-center mb-6">
        <span className="text-4xl font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
          {price}
        </span>
        <span className="text-sm text-[var(--color-text-faint)] ml-1">{period}</span>
        <div className="text-[11px] text-[var(--color-text-faint)] mt-1">{monthlyEquivalent}</div>
      </div>

      <div className="border-t border-[rgba(46,196,182,0.15)] mb-6" />

      <ul className="space-y-3 mb-8">
        {[
          'Professional portfolio page',
          'AI-powered client matching',
          'Phase-based project management',
          'Real-time messaging',
          'Automated invoicing & payments',
          'Keep 100% of your project fees',
          'Ratings and review system',
          'Priority in search results',
        ].map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg className="w-4 h-4 text-[var(--color-teal)] mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 8 7 12 13 4" />
            </svg>
            <span className="text-sm text-[var(--color-text-secondary)]">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/login"
        className="block text-center py-3 rounded-[var(--radius-md)] text-[14px] font-semibold transition-all duration-200 bg-[var(--color-teal)] text-[var(--color-navy)] hover:bg-[var(--color-teal-light)]"
      >
        Join as a Creative
      </Link>

      <div className="mt-4 text-center">
        <p className="text-[11px] text-[var(--color-text-faint)]">
          Free dormant tier after 90 days of inactivity
        </p>
      </div>
    </div>
  );
}

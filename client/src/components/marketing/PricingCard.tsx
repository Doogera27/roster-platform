import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  subtitle: string;
  features: string[];
  ctaLabel: string;
  ctaLink: string;
  highlighted?: boolean;
}

export function PricingCard({ tier, price, period = '/mo', subtitle, features, ctaLabel, ctaLink, highlighted = false }: PricingCardProps) {
  return (
    <div
      className={clsx(
        'relative rounded-[var(--radius-lg)] p-8 flex flex-col',
        highlighted
          ? 'bg-[var(--color-navy-mid)] border-2 border-[rgba(201,168,76,0.3)] shadow-[0_0_40px_rgba(201,168,76,0.08)]'
          : 'bg-[var(--color-navy-mid)] border border-[var(--color-border)]',
      )}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="badge-accent text-[10px] px-3 py-1">MOST POPULAR</span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-heading text-xl text-white mb-1">{tier}</h3>
        <p className="text-sm text-[var(--color-text-faint)]">{subtitle}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>{price}</span>
        {period && <span className="text-sm text-[var(--color-text-faint)] ml-1">{period}</span>}
      </div>

      <div className="divider-gold mb-6" />

      <ul className="space-y-3 flex-1 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <svg className="w-4 h-4 text-[var(--color-teal)] mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 8 7 12 13 4" />
            </svg>
            <span className="text-sm text-[var(--color-text-secondary)]">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        to={ctaLink}
        className={clsx(
          'block text-center py-3 rounded-[var(--radius-md)] text-[14px] font-semibold transition-all duration-200',
          highlighted
            ? 'btn-primary'
            : 'btn-secondary',
        )}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

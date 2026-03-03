import { clsx } from 'clsx';

interface AnnualToggleProps {
  isAnnual: boolean;
  onChange: (isAnnual: boolean) => void;
}

export function AnnualToggle({ isAnnual, onChange }: AnnualToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className={clsx('text-sm font-medium transition-colors', !isAnnual ? 'text-white' : 'text-[var(--color-text-faint)]')}>
        Monthly
      </span>
      <button
        onClick={() => onChange(!isAnnual)}
        className="relative w-12 h-6 rounded-full transition-colors"
        style={{
          background: isAnnual ? 'var(--color-teal)' : 'rgba(255,255,255,0.15)',
        }}
        aria-label={isAnnual ? 'Switch to monthly billing' : 'Switch to annual billing'}
      >
        <span
          className={clsx(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200',
            isAnnual ? 'translate-x-6' : 'translate-x-0.5',
          )}
        />
      </button>
      <span className={clsx('text-sm font-medium transition-colors', isAnnual ? 'text-white' : 'text-[var(--color-text-faint)]')}>
        Annual
      </span>
      {isAnnual && (
        <span className="text-[11px] font-semibold text-[var(--color-teal)] bg-[rgba(46,196,182,0.1)] px-2 py-0.5 rounded-full">
          Save 43%
        </span>
      )}
    </div>
  );
}

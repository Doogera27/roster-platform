const TRUST_SIGNALS = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M7 10l2 2 4-4" />
      </svg>
    ),
    text: '14-Day Free Trial',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2L4 6v5c0 4 2.5 6.5 6 8 3.5-1.5 6-4 6-8V6l-6-4z" />
      </svg>
    ),
    text: '256-bit Encryption',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7" />
        <path d="M10 7v3l2 2" />
      </svg>
    ),
    text: 'Cancel Anytime',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 10c0 3.87-3.13 7-7 7s-7-3.13-7-7 3.13-7 7-7" />
        <path d="M10 6v4l2.5 1.5" />
        <path d="M14 3l3 3-3 3" />
      </svg>
    ),
    text: 'No Credit Card Required',
  },
];

export function SocialProofBanner() {
  return (
    <div className="border-y border-[var(--color-border)] bg-[rgba(255,255,255,0.01)]">
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
        {TRUST_SIGNALS.map((signal, i) => (
          <div key={i} className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <span className="text-[var(--color-teal)]">{signal.icon}</span>
            <span className="text-sm font-medium">{signal.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

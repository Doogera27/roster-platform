import { clsx } from 'clsx';

interface TierFeature {
  category: string;
  features: {
    name: string;
    starter: boolean | string;
    growth: boolean | string;
    enterprise: boolean | string;
  }[];
}

const TIER_FEATURES: TierFeature[] = [
  {
    category: 'Core Platform',
    features: [
      { name: 'Talent Discovery & Search', starter: true, growth: true, enterprise: true },
      { name: 'AI Project Manager', starter: true, growth: true, enterprise: true },
      { name: 'Brand Vault Storage', starter: '5 GB', growth: '50 GB', enterprise: 'Unlimited' },
      { name: 'Real-time Messaging', starter: true, growth: true, enterprise: true },
      { name: 'User Seats', starter: '1', growth: '5', enterprise: 'Unlimited' },
    ],
  },
  {
    category: 'Project Management',
    features: [
      { name: 'Active Projects', starter: '3', growth: '15', enterprise: 'Unlimited' },
      { name: 'Phase-Based Workflows', starter: true, growth: true, enterprise: true },
      { name: 'Project Templates', starter: false, growth: true, enterprise: true },
      { name: 'Custom Milestones', starter: false, growth: true, enterprise: true },
      { name: 'Portfolio Dashboard', starter: false, growth: true, enterprise: true },
    ],
  },
  {
    category: 'AI & Automation',
    features: [
      { name: 'AI Risk Detection', starter: true, growth: true, enterprise: true },
      { name: 'AI Status Reports', starter: 'Basic', growth: 'Advanced', enterprise: 'Advanced' },
      { name: 'AI Budget Analysis', starter: false, growth: true, enterprise: true },
      { name: 'AI Recommendations', starter: false, growth: true, enterprise: true },
      { name: 'Critical Alert System', starter: true, growth: true, enterprise: true },
    ],
  },
  {
    category: 'Financial',
    features: [
      { name: 'Project Fee', starter: '15%', growth: '12%', enterprise: '8–10%' },
      { name: 'Budget Tracking', starter: true, growth: true, enterprise: true },
      { name: 'Variance Alerts', starter: false, growth: true, enterprise: true },
      { name: 'Invoice Management', starter: true, growth: true, enterprise: true },
      { name: 'Custom Payment Terms', starter: false, growth: false, enterprise: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Email Support', starter: true, growth: true, enterprise: true },
      { name: 'Priority Support', starter: false, growth: true, enterprise: true },
      { name: 'Dedicated Account Manager', starter: false, growth: false, enterprise: true },
      { name: 'Custom Onboarding', starter: false, growth: false, enterprise: true },
      { name: 'SLA Guarantees', starter: false, growth: false, enterprise: true },
    ],
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <svg className="w-5 h-5 text-[var(--color-teal)]" viewBox="0 0 20 20" fill="currentColor" aria-label="Included">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <span className="text-[var(--color-text-faint)]">—</span>
    );
  }
  return <span className="text-sm text-[var(--color-text-secondary)]">{value}</span>;
}

export function TierComparisonMatrix() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-[var(--color-border-mid)]">
            <th className="text-left py-4 px-4 text-sm font-medium text-[var(--color-text-muted)] w-[40%]">Feature</th>
            <th className="text-center py-4 px-4 text-sm font-medium text-[var(--color-text-muted)] w-[20%]">
              <div>Starter</div>
              <div className="text-[var(--color-text-faint)] font-normal text-xs">$99/mo</div>
            </th>
            <th className="text-center py-4 px-4 text-sm font-medium text-[var(--color-gold)] w-[20%] border-x border-[var(--color-gold-border)]">
              <div>Growth</div>
              <div className="text-[var(--color-gold)] font-normal text-xs opacity-70">$299/mo</div>
            </th>
            <th className="text-center py-4 px-4 text-sm font-medium text-[var(--color-text-muted)] w-[20%]">
              <div>Enterprise</div>
              <div className="text-[var(--color-text-faint)] font-normal text-xs">$799+/mo</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {TIER_FEATURES.map((category) => (
            <>
              <tr key={`cat-${category.category}`}>
                <td colSpan={4} className="py-3 px-4">
                  <span className="text-label text-[var(--color-gold)]">{category.category}</span>
                </td>
              </tr>
              {category.features.map((feature, i) => (
                <tr
                  key={`${category.category}-${i}`}
                  className={clsx(
                    'border-b border-[var(--color-border)]',
                    'hover:bg-[rgba(255,255,255,0.02)] transition-colors',
                  )}
                >
                  <td className="py-3 px-4 text-sm text-white">{feature.name}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center"><CellValue value={feature.starter} /></div>
                  </td>
                  <td className="py-3 px-4 text-center border-x border-[var(--color-gold-border)] bg-[var(--color-gold-dim)]">
                    <div className="flex justify-center"><CellValue value={feature.growth} /></div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center"><CellValue value={feature.enterprise} /></div>
                  </td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

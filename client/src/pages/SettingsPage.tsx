/**
 * SettingsPage — Organization settings, subscription management, billing.
 * Spec System 12: Subscription tiers (Starter, Growth, Enterprise).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { clsx } from 'clsx';

const tierConfig: Record<string, { label: string; price: string; features: string[]; color: string }> = {
  STARTER: {
    label: 'Starter',
    price: '$99/mo',
    features: ['Up to 3 active projects', '5 roster members', 'Basic Brand Vault (500MB)', 'Email support'],
    color: 'var(--color-text-secondary)',
  },
  GROWTH: {
    label: 'Growth',
    price: '$299/mo',
    features: ['Up to 15 active projects', 'Unlimited roster members', 'Brand Vault (5GB)', 'AI brief analysis', 'Priority support'],
    color: 'var(--color-gold)',
  },
  ENTERPRISE: {
    label: 'Enterprise',
    price: 'Custom',
    features: ['Unlimited projects', 'Unlimited everything', 'Brand Vault (50GB)', 'AI copilot features', 'Dedicated PM', 'SLA & SOW'],
    color: 'var(--color-teal)',
  },
};

export function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then(r => r.data.data),
  });

  const org = meData?.organization;
  const currentTier = org?.subscription_tier || 'STARTER';
  const userRole = meData?.role;

  // Only show billing to CLIENT users
  if (userRole !== 'CLIENT') {
    return (
      <div>
        <h1 className="text-display text-4xl text-white mb-2">
          <em>Settings</em>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">Account settings and preferences.</p>

        <div className="card-flat p-6">
          <h3 className="text-label mb-3">Profile</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-text-faint)] w-20">Name</span>
              <span className="text-sm text-white">{meData?.first_name} {meData?.last_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-text-faint)] w-20">Email</span>
              <span className="text-sm text-white">{meData?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--color-text-faint)] w-20">Role</span>
              <span className="badge badge-neutral">{meData?.role}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-display text-4xl text-white mb-2">
        <em>Settings</em>
      </h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">Manage your organization, subscription, and billing.</p>

      {/* Organization Info */}
      <section className="mb-8">
        <h2 className="text-label mb-3">Organization</h2>
        <div className="card-flat p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-[var(--color-text-faint)]">Company</span>
              <p className="text-sm text-white font-medium">{org?.name || 'Not set'}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--color-text-faint)]">Domain</span>
              <p className="text-sm text-white">{org?.domain || 'Not set'}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--color-text-faint)]">Industry</span>
              <p className="text-sm text-white">{org?.industry || 'Not set'}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--color-text-faint)]">Plan</span>
              <p className="text-sm font-medium" style={{ color: tierConfig[currentTier]?.color }}>
                {tierConfig[currentTier]?.label || currentTier}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Tiers */}
      <section className="mb-8">
        <h2 className="text-label mb-3">Subscription Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(tierConfig).map(([tier, config]) => {
            const isCurrent = tier === currentTier;
            return (
              <div
                key={tier}
                className={clsx(
                  'rounded-xl border p-6 transition-all',
                  isCurrent
                    ? 'bg-[var(--color-gold-dim)] border-[var(--color-gold-border)]'
                    : 'bg-[var(--color-navy-mid)] border-[var(--color-border)] hover:border-[var(--color-border-mid)]',
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">{config.label}</h3>
                  {isCurrent && <span className="badge badge-info text-[10px]">Current</span>}
                </div>
                <p className="text-display text-2xl mb-4" style={{ color: config.color }}>
                  {config.price}
                </p>
                <ul className="space-y-2 mb-6">
                  {config.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-muted)]">
                      <svg className="mt-0.5 shrink-0" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={isCurrent ? 'var(--color-gold)' : 'var(--color-text-faint)'} strokeWidth="1.5" strokeLinecap="round">
                        <path d="M2 6l3 3L10 3" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {!isCurrent && (
                  <button className="btn-secondary w-full text-xs">
                    {tier === 'ENTERPRISE' ? 'Contact Sales' : 'Upgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Billing stub */}
      <section>
        <h2 className="text-label mb-3">Billing</h2>
        <div className="card-flat p-6 text-center">
          <svg className="mx-auto mb-3" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="26" height="18" rx="3" />
            <path d="M3 13h26" />
            <path d="M7 19h6" />
          </svg>
          <p className="text-sm text-[var(--color-text-muted)] mb-1">Billing integration coming soon</p>
          <p className="text-xs text-[var(--color-text-faint)]">Stripe Connect for payment processing, invoicing, and automatic billing.</p>
        </div>
      </section>
    </div>
  );
}

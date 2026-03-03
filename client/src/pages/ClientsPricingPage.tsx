import { Link } from 'react-router-dom';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { SectionHeading } from '../components/marketing/SectionHeading';
import { PricingCard } from '../components/marketing/PricingCard';
import { TierComparisonMatrix } from '../components/marketing/TierComparisonMatrix';
import { FAQ } from '../components/marketing/FAQ';
import { SocialProofBanner } from '../components/marketing/SocialProofBanner';
import { SEOHead } from '../components/seo/SEOHead';
import { clientFAQs } from '../data/clientFAQs';
import { buildProductSchema, buildFAQSchema, buildBreadcrumbSchema } from '../utils/structuredData';

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useRevealOnScroll(0.12);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

const CLIENT_PLANS = [
  {
    tier: 'Starter',
    price: '$99',
    subtitle: 'For small teams getting started with creative operations',
    features: [
      '1 user seat',
      'Up to 3 active projects',
      'AI Project Manager',
      'Talent discovery & search',
      'Brand Vault (5 GB)',
      'Real-time messaging',
      '15% project fee',
      'Email support',
    ],
    ctaLabel: 'Start Free Trial',
    ctaLink: '/login',
    highlighted: false,
  },
  {
    tier: 'Growth',
    price: '$299',
    subtitle: 'For growing teams that need more power and capacity',
    features: [
      '5 user seats',
      'Up to 15 active projects',
      'Advanced AI reports & recommendations',
      'Project templates & custom milestones',
      'Brand Vault (50 GB)',
      'Portfolio dashboard',
      '12% project fee',
      'Priority support',
    ],
    ctaLabel: 'Start Free Trial',
    ctaLink: '/login',
    highlighted: true,
  },
  {
    tier: 'Enterprise',
    price: '$799+',
    subtitle: 'For large teams and agencies with custom needs',
    features: [
      'Unlimited user seats',
      'Unlimited active projects',
      'Full AI suite with budget analysis',
      'Custom payment terms',
      'Brand Vault (Unlimited)',
      'Dedicated account manager',
      '8\u201310% project fee',
      'SLA guarantees',
    ],
    ctaLabel: 'Contact Sales',
    ctaLink: '/login',
    highlighted: false,
  },
];

export function ClientsPricingPage() {
  return (
    <div className="overflow-hidden">
      <SEOHead
        title="Pricing for Teams \u2014 Plans from $99/mo | Roster"
        description="Simple, transparent pricing for creative operations. Starter ($99/mo), Growth ($299/mo), and Enterprise plans. 14-day free trial, no credit card required."
        canonical="https://www.rosterplatform.com/for-clients/pricing"
        structuredData={[
          buildProductSchema(
            'Roster Starter Plan',
            'Creative operations platform for small teams. AI Project Manager, talent discovery, and Brand Vault.',
            99,
            'USD',
            'month',
          ),
          buildFAQSchema(clientFAQs),
          buildBreadcrumbSchema([
            { name: 'Home', url: 'https://www.rosterplatform.com/' },
            { name: 'For Clients', url: 'https://www.rosterplatform.com/for-clients' },
            { name: 'Pricing', url: 'https://www.rosterplatform.com/for-clients/pricing' },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6" aria-label="Pricing hero">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold-border)] bg-[var(--color-gold-dim)] mb-6">
            <span className="text-mono text-[11px] text-[var(--color-gold)] tracking-wider">PRICING FOR TEAMS</span>
          </div>
          <h1 className="text-display text-4xl md:text-5xl text-white mb-6">
            Simple Pricing. <em className="text-[var(--color-gold)]">Massive Savings.</em>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
            Every plan includes AI project management, talent discovery, and Brand Vault storage.
            Start with a 14-day free trial &mdash; no credit card required.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <Reveal>
        <section className="pb-20 px-6" aria-label="Pricing plans">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {CLIENT_PLANS.map((plan) => (
              <PricingCard key={plan.tier} {...plan} />
            ))}
          </div>
        </section>
      </Reveal>

      {/* Project fee explainer */}
      <Reveal>
        <section className="py-16 md:py-20 border-y border-[rgba(255,255,255,0.04)]" aria-label="Project fee explanation">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-heading text-xl text-white mb-3">How the Project Fee Works</h2>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">
              The project fee is a percentage of the total project value charged on top of the creative's rate.
              It covers platform access, AI project management, payment processing, Brand Vault storage, and support.
              There are no hidden fees.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Starter', fee: '15%', savings: 'Save 10% vs agency' },
                { label: 'Growth', fee: '12%', savings: 'Save 13% vs agency' },
                { label: 'Enterprise', fee: '8\u201310%', savings: 'Save 15%+ vs agency' },
              ].map((item) => (
                <div key={item.label} className="card p-4 text-center">
                  <div className="text-label text-[var(--color-text-faint)] mb-1">{item.label}</div>
                  <div className="text-2xl font-semibold text-[var(--color-gold)]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {item.fee}
                  </div>
                  <div className="text-[11px] text-[var(--color-teal)] mt-1">{item.savings}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Feature comparison matrix */}
      <Reveal>
        <section className="py-20 md:py-28" aria-label="Feature comparison">
          <div className="max-w-5xl mx-auto px-6">
            <SectionHeading
              title="Compare Plans in Detail"
              subtitle="See every feature across all three plans."
            />
            <div className="card overflow-hidden">
              <TierComparisonMatrix />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Trust badges */}
      <div className="py-12 border-y border-[rgba(255,255,255,0.04)]">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8">
          {[
            { icon: '\u2713', text: '14-Day Free Trial' },
            { icon: '\u2713', text: 'No Credit Card Required' },
            { icon: '\u2713', text: 'Cancel Anytime' },
            { icon: '\u2713', text: '256-bit Encryption' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span className="text-[var(--color-teal)]">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <Reveal>
        <section className="py-20 md:py-28" aria-label="Frequently asked questions">
          <div className="max-w-3xl mx-auto px-6">
            <SectionHeading title="Frequently Asked Questions" />
            <FAQ items={clientFAQs} />
          </div>
        </section>
      </Reveal>

      {/* CTA */}
      <section className="py-24 md:py-32 border-t border-[rgba(255,255,255,0.04)]" aria-label="Get started">
        <div className="relative max-w-3xl mx-auto text-center px-6">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
          </div>
          <div className="relative">
            <h2 className="text-display text-3xl md:text-4xl text-white mb-4">
              Start Saving on Creative Operations Today
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg mb-8 max-w-xl mx-auto">
              Join teams that are saving 30\u201350% on creative work while shipping faster with AI project management.
            </p>
            <Link to="/login" className="btn-primary text-[15px] px-8 py-3.5">
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

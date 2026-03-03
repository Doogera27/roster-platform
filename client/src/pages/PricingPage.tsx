import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { SectionHeading } from '../components/marketing/SectionHeading';
import { PricingCard } from '../components/marketing/PricingCard';
import { FAQ } from '../components/marketing/FAQ';
import { CTASection } from '../components/marketing/CTASection';
import { AnnualToggle } from '../components/marketing/AnnualToggle';
import { SEOHead } from '../components/seo/SEOHead';
import { clientFAQs } from '../data/clientFAQs';
import { creativeFAQs } from '../data/creativeFAQs';
import { buildFAQSchema, buildBreadcrumbSchema } from '../utils/structuredData';

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useRevealOnScroll(0.12);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
}

const tiers = [
  {
    tier: 'Starter',
    price: '$99',
    subtitle: 'For small teams getting started',
    features: [
      '1 user seat',
      'Up to 3 active projects',
      'AI Project Manager',
      'Brand Vault (5 GB)',
      '15% project fee',
      'Email support',
    ],
    ctaLabel: 'Start Free Trial',
    ctaLink: '/login',
  },
  {
    tier: 'Growth',
    price: '$299',
    subtitle: 'For growing marketing teams',
    features: [
      '5 user seats',
      'Up to 15 active projects',
      'Advanced AI reports',
      'Brand Vault (50 GB)',
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
    subtitle: 'For large teams and agencies',
    features: [
      'Unlimited seats & projects',
      'Full AI suite',
      'Custom payment terms',
      'Unlimited storage',
      '8\u201310% project fee',
      'Dedicated account manager',
    ],
    ctaLabel: 'Contact Sales',
    ctaLink: '/login',
  },
];

const combinedFAQs = [
  ...clientFAQs.slice(0, 5),
  ...creativeFAQs.slice(0, 3),
];

export function PricingPage() {
  const [activeTab, setActiveTab] = useState<'teams' | 'creatives'>('teams');
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="overflow-hidden pt-24">
      <SEOHead
        title="Pricing \u2014 Plans for Teams & Creatives | Roster"
        description="Simple, transparent pricing for creative operations. Team plans from $99/mo with AI project management. Creative membership from $29/mo."
        canonical="https://www.rosterplatform.com/pricing"
        structuredData={[
          buildFAQSchema(combinedFAQs),
          buildBreadcrumbSchema([
            { name: 'Home', url: 'https://www.rosterplatform.com/' },
            { name: 'Pricing', url: 'https://www.rosterplatform.com/pricing' },
          ]),
        ]}
      />

      {/* Header */}
      <section className="py-16 md:py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-display text-4xl md:text-5xl text-white mb-4">
            Simple, Transparent <em className="text-[var(--color-gold)]">Pricing</em>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-xl mx-auto mb-8">
            Plans that scale with your creative operations. No hidden fees.
          </p>

          {/* Audience tabs */}
          <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--color-border)] p-1 bg-[rgba(255,255,255,0.02)]">
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-6 py-2.5 rounded-[calc(var(--radius-md)-4px)] text-sm font-medium transition-all ${
                activeTab === 'teams'
                  ? 'bg-[var(--color-gold-dim)] text-[var(--color-gold)] border border-[var(--color-gold-border)]'
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              For Teams
            </button>
            <button
              onClick={() => setActiveTab('creatives')}
              className={`px-6 py-2.5 rounded-[calc(var(--radius-md)-4px)] text-sm font-medium transition-all ${
                activeTab === 'creatives'
                  ? 'bg-[rgba(46,196,182,0.08)] text-[var(--color-teal)] border border-[var(--color-teal-border)]'
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`}
            >
              For Creatives
            </button>
          </div>
        </div>
      </section>

      {/* Teams pricing */}
      {activeTab === 'teams' && (
        <>
          <Reveal>
            <section className="px-6 pb-12">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {tiers.map((t) => (
                  <PricingCard key={t.tier} {...t} />
                ))}
              </div>
            </section>
          </Reveal>
          <div className="text-center pb-20">
            <Link to="/for-clients/pricing" className="text-sm font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] transition-colors">
              See full pricing details for teams &rarr;
            </Link>
          </div>
        </>
      )}

      {/* Creatives pricing */}
      {activeTab === 'creatives' && (
        <>
          <Reveal>
            <section className="px-6 pb-8">
              <div className="max-w-md mx-auto">
                <AnnualToggle isAnnual={isAnnual} onChange={setIsAnnual} />
              </div>
            </section>
          </Reveal>
          <Reveal>
            <section className="px-6 pb-12">
              <div className="max-w-md mx-auto">
                <div className="relative rounded-[var(--radius-lg)] p-8 bg-[var(--color-navy-mid)] border-2 border-[rgba(46,196,182,0.3)] text-center">
                  <div className="mb-6">
                    <h3 className="text-heading text-xl text-white mb-1">Active Membership</h3>
                    <p className="text-sm text-[var(--color-text-faint)]">Everything you need to grow your creative career</p>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                      {isAnnual ? '$199' : '$29'}
                    </span>
                    <span className="text-sm text-[var(--color-text-faint)] ml-1">{isAnnual ? '/year' : '/mo'}</span>
                  </div>
                  <ul className="space-y-3 text-left mb-8">
                    {[
                      'Professional portfolio page',
                      'AI-powered client matching',
                      'Project management tools',
                      'Automated invoicing & payments',
                      'Keep 100% of your project fees',
                      'Free dormant tier after 90 days',
                    ].map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-[var(--color-teal)] mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 8 7 12 13 4" />
                        </svg>
                        <span className="text-sm text-[var(--color-text-secondary)]">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/login"
                    className="block text-center py-3 rounded-[var(--radius-md)] text-[14px] font-semibold bg-[var(--color-teal)] text-[var(--color-navy)] hover:bg-[var(--color-teal-light)] transition-all"
                  >
                    Join as a Creative
                  </Link>
                </div>
              </div>
            </section>
          </Reveal>
          <div className="text-center pb-20">
            <Link to="/for-creatives/pricing" className="text-sm font-medium text-[var(--color-teal)] hover:text-[var(--color-teal-light)] transition-colors">
              See full membership details &rarr;
            </Link>
          </div>
        </>
      )}

      {/* FAQ */}
      <Reveal>
        <section className="py-20 md:py-24 px-6 border-t border-[rgba(255,255,255,0.04)]">
          <div className="max-w-3xl mx-auto">
            <SectionHeading title="Frequently Asked Questions" />
            <FAQ items={combinedFAQs} />
          </div>
        </section>
      </Reveal>

      {/* CTA */}
      <CTASection
        heading="Ready to Get Started?"
        subtitle="Start your 14-day free trial. No credit card required."
        ctaLabel="Start Free Trial"
        ctaLink="/login"
      />
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { SectionHeading } from '../components/marketing/SectionHeading';
import { MembershipCard } from '../components/marketing/MembershipCard';
import { AnnualToggle } from '../components/marketing/AnnualToggle';
import { FAQ } from '../components/marketing/FAQ';
import { SEOHead } from '../components/seo/SEOHead';
import { creativeFAQs } from '../data/creativeFAQs';
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

export function CreativesPricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="overflow-hidden">
      <SEOHead
        title="Creative Membership \u2014 $29/mo | Roster"
        description="Professional portfolio, AI matching, project management, and automated payments. $29/mo or $199/year. Free dormant tier after 90 days inactive."
        canonical="https://www.rosterplatform.com/for-creatives/pricing"
        structuredData={[
          buildProductSchema(
            'Roster Creative Membership',
            'Professional portfolio, AI matching, project management, and automated payments for creative professionals.',
            29,
            'USD',
            'month',
          ),
          buildFAQSchema(creativeFAQs),
          buildBreadcrumbSchema([
            { name: 'Home', url: 'https://www.rosterplatform.com/' },
            { name: 'For Creatives', url: 'https://www.rosterplatform.com/for-creatives' },
            { name: 'Pricing', url: 'https://www.rosterplatform.com/for-creatives/pricing' },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6" aria-label="Pricing hero">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-teal-border)] bg-[rgba(46,196,182,0.06)] mb-6">
            <span className="text-mono text-[11px] text-[var(--color-teal)] tracking-wider">CREATIVE MEMBERSHIP</span>
          </div>
          <h1 className="text-display text-4xl md:text-5xl text-white mb-6">
            One Membership. <em className="text-[var(--color-teal)]">Zero Project Fees.</em>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto mb-8">
            Keep 100% of what clients pay you. Your only cost is a simple membership
            that gives you access to the entire platform.
          </p>
          <AnnualToggle isAnnual={isAnnual} onChange={setIsAnnual} />
        </div>
      </section>

      {/* Membership card */}
      <Reveal>
        <section className="pb-20 px-6" aria-label="Membership plan">
          <MembershipCard isAnnual={isAnnual} />
        </section>
      </Reveal>

      {/* What's included breakdown */}
      <Reveal>
        <section className="py-16 md:py-20 border-y border-[rgba(255,255,255,0.04)]" aria-label="What's included">
          <div className="max-w-4xl mx-auto px-6">
            <SectionHeading title="Everything Included in Your Membership" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Get Discovered',
                  items: ['Professional portfolio page', 'AI-powered client matching', 'Priority in search results', 'Ratings and review system'],
                },
                {
                  title: 'Manage Projects',
                  items: ['Phase-based project workflows', 'AI Project Manager', 'Real-time messaging', 'File sharing and version tracking'],
                },
                {
                  title: 'Get Paid',
                  items: ['Automated invoicing', 'Secure payment processing', 'Regular payment schedule', 'Full financial transparency'],
                },
                {
                  title: 'Grow Your Career',
                  items: ['Build your reputation with reviews', 'Track project history', 'Expand your client network', 'Access to premium brands'],
                },
              ].map((group) => (
                <div key={group.title} className="card p-6">
                  <h3 className="text-heading text-lg text-white mb-4">{group.title}</h3>
                  <ul className="space-y-2.5">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-[var(--color-teal)] mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 8 7 12 13 4" />
                        </svg>
                        <span className="text-sm text-[var(--color-text-secondary)]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Dormant tier explainer */}
      <Reveal>
        <section className="py-16 md:py-20" aria-label="Dormant tier">
          <div className="max-w-3xl mx-auto px-6">
            <div className="card p-8 text-center">
              <h3 className="text-heading text-xl text-white mb-3">Free Dormant Tier</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-lg mx-auto">
                If you go 90+ days without an active project, your account automatically switches to a free dormant tier.
                Your profile remains in our system but is hidden from search results. When you're ready to take on new
                work, simply reactivate your membership &mdash; no penalty, no setup fees.
              </p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* FAQ */}
      <Reveal>
        <section className="py-20 md:py-28 border-t border-[rgba(255,255,255,0.04)]" aria-label="Frequently asked questions">
          <div className="max-w-3xl mx-auto px-6">
            <SectionHeading title="Frequently Asked Questions" />
            <FAQ items={creativeFAQs} />
          </div>
        </section>
      </Reveal>

      {/* CTA */}
      <section className="py-24 md:py-32 border-t border-[rgba(255,255,255,0.04)]" aria-label="Get started">
        <div className="relative max-w-3xl mx-auto text-center px-6">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(46,196,182,0.06) 0%, transparent 70%)' }} />
          </div>
          <div className="relative">
            <h2 className="text-display text-3xl md:text-4xl text-white mb-4">
              Start Getting Discovered Today
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg mb-8 max-w-xl mx-auto">
              Join 500+ vetted creatives already working with top brands on Roster.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-[15px] px-8 py-3.5 font-semibold rounded-[var(--radius-md)] bg-[var(--color-teal)] text-[var(--color-navy)] hover:bg-[var(--color-teal-light)] transition-all"
            >
              Join as a Creative
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

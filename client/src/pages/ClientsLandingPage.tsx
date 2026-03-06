import { Link } from 'react-router-dom';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { SectionHeading } from '../components/marketing/SectionHeading';
import { ComparisonTable } from '../components/marketing/ComparisonTable';
import { TeamCostComparison } from '../components/marketing/TeamCostComparison';
import { SocialProofBanner } from '../components/marketing/SocialProofBanner';
import { VideoPlaceholder } from '../components/marketing/VideoPlaceholder';
import { SEOHead } from '../components/seo/SEOHead';
import { buildProductSchema, buildHowToSchema, buildBreadcrumbSchema } from '../utils/structuredData';

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

const PAIN_POINTS = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Agency Markups Drain Your Budget',
    desc: 'Traditional agencies charge 20\u201325% markups on creative work, plus layers of project management overhead. Your budget pays for their margins, not better creative.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Managing Freelancers Is a Full-Time Job',
    desc: 'Sourcing talent, negotiating rates, chasing deadlines, and handling invoices across multiple freelancers eats 40+ hours a month \u2014 time your team should spend on strategy.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: 'Projects Slip Without Visibility',
    desc: "Spreadsheets and email threads don't flag risks early enough. By the time you notice a deadline slipping or budget overrunning, it's too late to course-correct.",
  },
];

const SOLUTIONS = [
  {
    title: 'Direct Access to Vetted Talent',
    desc: 'Skip the agency. Roster gives you a curated marketplace of pre-vetted creative professionals with transparent rates. Project fees of just 8\u201315% replace 25% agency markups.',
  },
  {
    title: 'AI Project Manager Handles Operations',
    desc: 'Automated scheduling, risk detection, and status reports. Your AI PM monitors every project 24/7, catching timeline slips and budget issues before they become problems.',
  },
  {
    title: 'One Platform for Everything',
    desc: 'Talent discovery, project management, messaging, file storage, and payments \u2014 all in one place. No more juggling six different tools and losing context between them.',
  },
];

const COMPARISON_ROWS = [
  { feature: 'Cost overhead', traditional: '20\u201325% markup' as string | boolean, roster: '8\u201315% project fee' as string | boolean },
  { feature: 'Talent vetting', traditional: false as string | boolean, roster: true as string | boolean },
  { feature: 'AI Project Manager', traditional: false as string | boolean, roster: true as string | boolean },
  { feature: 'Automated risk detection', traditional: false as string | boolean, roster: true as string | boolean },
  { feature: 'Centralized asset storage', traditional: false as string | boolean, roster: true as string | boolean },
  { feature: 'Transparent pricing', traditional: false as string | boolean, roster: true as string | boolean },
  { feature: 'Real-time project tracking', traditional: false as string | boolean, roster: true as string | boolean },
  { feature: 'Integrated messaging', traditional: false as string | boolean, roster: true as string | boolean },
  { feature: 'Budget variance alerts', traditional: false as string | boolean, roster: true as string | boolean },
  { feature: 'Time to find talent', traditional: '2\u20134 weeks' as string | boolean, roster: 'Same day' as string | boolean },
];

export function ClientsLandingPage() {
  return (
    <div className="overflow-hidden">
      <SEOHead
        title="Hire Creative Talent \u2014 Roster"
        description="Stop overpaying agencies. Roster connects you with vetted creative talent and manages projects with AI. Save 30-50% on creative operations."
        canonical="https://www.rosterplatform.com/for-clients"
        structuredData={[
          buildProductSchema(
            'Roster for Teams',
            'Creative operations platform with AI project management, talent discovery, and brand asset management.',
            99,
            'USD',
            'month',
          ),
          buildHowToSchema('How to hire creative talent on Roster', [
            { name: 'Build Your Roster', text: 'Discover and save top creative talent matched to your brand, budget, and project needs.' },
            { name: 'Brief Your Project', text: 'Define scope, deliverables, and timeline. AI handles scheduling and milestones.' },
            { name: 'Ship Great Work', text: 'Review deliverables, approve, and launch. All assets live in your Brand Vault.' },
          ]),
          buildBreadcrumbSchema([
            { name: 'Home', url: 'https://www.rosterplatform.com/' },
            { name: 'For Clients', url: 'https://www.rosterplatform.com/for-clients' },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6" aria-label="Hero">
        <div className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full pointer-events-none animate-float" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto pt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold-border)] bg-[var(--color-gold-dim)] mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] pulse-gold" />
              <span className="text-mono text-[11px] text-[var(--color-gold)] tracking-wider">FOR TEAMS & AGENCIES</span>
            </div>

            <h1 className="text-display text-4xl md:text-5xl text-white mb-6 leading-tight">
              Stop Overpaying for Creative.{' '}
              <em className="text-[var(--color-gold)]">Start Shipping Faster.</em>
            </h1>
            <p className="text-[var(--color-text-muted)] text-lg leading-relaxed mb-8 max-w-lg">
              Roster replaces expensive agencies and chaotic freelancer management with a single AI-powered platform.
              Discover vetted talent, manage projects, and ship work &mdash; for a fraction of the cost.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/for-clients/pricing" className="btn-primary text-[15px] px-8 py-3.5">
                Start 14-Day Free Trial
              </Link>
              <Link
                to="/for-clients/features"
                className="text-[15px] font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] transition-colors"
              >
                See all features &rarr;
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <VideoPlaceholder />
          </div>
        </div>
      </section>

      {/* The Problem */}
      <Reveal>
        <section className="py-20 md:py-28 border-t border-[rgba(255,255,255,0.04)]" aria-label="The problem">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeading
              title="Creative Operations Shouldn't Be This Hard"
              subtitle="Most teams are stuck choosing between expensive agencies, chaotic freelancer management, or doing it all in-house."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PAIN_POINTS.map((item, i) => (
                <div key={i} className="rounded-[var(--radius-lg)] border border-[rgba(220,38,38,0.15)] bg-[rgba(220,38,38,0.04)] p-6">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(220,38,38,0.1)] flex items-center justify-center text-red-400 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-heading text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* The Solution */}
      <Reveal>
        <section className="py-20 md:py-28" aria-label="The solution">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeading
              title="Roster Solves Every Pain Point"
              subtitle="One platform that replaces your agency, your project manager spreadsheet, and your freelancer rolodex."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SOLUTIONS.map((item, i) => (
                <div key={i} className="card p-6">
                  <div className="text-mono text-[var(--color-teal)] text-sm font-bold mb-3">0{i + 1}</div>
                  <h3 className="text-heading text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Team Cost Comparison */}
      <Reveal>
        <section className="py-20 md:py-28 border-y border-[rgba(255,255,255,0.04)]" aria-label="Team cost comparison" id="calculator">
          <div className="max-w-4xl mx-auto px-6">
            <SectionHeading
              title="Build Your Dream Team \u2014 See What It Really Costs"
              subtitle="Select the creative roles you need, configure hours and headcount, and compare real market rates."
            />
            <TeamCostComparison />
          </div>
        </section>
      </Reveal>

      {/* Comparison Table */}
      <Reveal>
        <section className="py-20 md:py-28" aria-label="Comparison">
          <div className="max-w-4xl mx-auto px-6">
            <SectionHeading
              title="Roster vs. the Traditional Approach"
              subtitle="See how Roster stacks up against agencies and managing freelancers on your own."
            />
            <div className="card overflow-hidden">
              <ComparisonTable
                rows={COMPARISON_ROWS}
                traditionalLabel="Traditional"
                rosterLabel="Roster"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Trust signals */}
      <SocialProofBanner />

      {/* CTA */}
      <section className="py-24 md:py-32" aria-label="Get started">
        <div className="relative max-w-3xl mx-auto text-center px-6">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
          </div>
          <div className="relative">
            <h2 className="text-display text-3xl md:text-4xl text-white mb-4">
              Ready to Transform Your Creative Operations?
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg mb-8 max-w-xl mx-auto">
              Start your 14-day free trial today. No credit card required. See why teams are switching to Roster.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/for-clients/pricing" className="btn-primary text-[15px] px-8 py-3.5">
                Start Free Trial
              </Link>
              <Link
                to="/for-clients/pricing"
                className="text-[15px] font-medium text-[var(--color-text-muted)] hover:text-white transition-colors"
              >
                View pricing &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

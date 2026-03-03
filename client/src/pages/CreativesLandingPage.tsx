import { Link } from 'react-router-dom';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { SectionHeading } from '../components/marketing/SectionHeading';
import { MetricCounter } from '../components/marketing/MetricCounter';
import { EarningsCalculator } from '../components/marketing/EarningsCalculator';
import { SocialProofBanner } from '../components/marketing/SocialProofBanner';
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

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Create Your Profile',
    desc: 'Showcase your portfolio, set your rates, and define your specialties. We verify every creative for quality and reliability before your profile goes live.',
  },
  {
    step: '02',
    title: 'Get Discovered',
    desc: 'Brands and agencies search for talent like you. AI matching connects you to projects that fit your skills, style, and availability.',
  },
  {
    step: '03',
    title: 'Ship Great Work',
    desc: 'Manage deliverables with phase-based workflows. The AI Project Manager keeps everything organized, on track, and documented.',
  },
  {
    step: '04',
    title: 'Get Paid',
    desc: 'Transparent invoicing and payment processing. No chasing checks or wondering when payment will arrive. You keep 100% of your project fees.',
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    title: 'Professional Portfolio',
    desc: 'A beautiful, dedicated portfolio page that showcases your best work to every brand searching on Roster.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    title: 'AI-Powered Matching',
    desc: 'Get connected to the right projects automatically. Our AI matches your skills, style, and availability with client needs.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
        <circle cx="9" cy="15" r="1" /><circle cx="15" cy="15" r="1" />
      </svg>
    ),
    title: 'AI Project Management',
    desc: 'Automated timelines, milestone tracking, and status reports keep your projects organized without the admin overhead.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Automated Payments',
    desc: 'Invoicing and payment processing handled by the platform. Get paid on time, every time, with full financial transparency.',
  },
];

export function CreativesLandingPage() {
  return (
    <div className="overflow-hidden">
      <SEOHead
        title="For Creatives \u2014 Get Discovered by Top Brands | Roster"
        description="Join 500+ vetted creatives on Roster. Build your portfolio, get matched with brand projects, manage work with AI, and get paid on time."
        canonical="https://www.rosterplatform.com/for-creatives"
        structuredData={[
          buildProductSchema(
            'Roster Creative Membership',
            'Professional portfolio, AI matching, project management, and automated payments for creative professionals.',
            29,
            'USD',
            'month',
          ),
          buildHowToSchema('How to get started as a creative on Roster', [
            { name: 'Create Your Profile', text: 'Showcase your portfolio, set your rates, and define your specialties.' },
            { name: 'Get Discovered', text: 'Brands search for talent like you. AI matching connects you to the right projects.' },
            { name: 'Ship Great Work', text: 'Manage deliverables with phase-based workflows and AI project management.' },
            { name: 'Get Paid', text: 'Transparent invoicing and payment processing. Keep 100% of your project fees.' },
          ]),
          buildBreadcrumbSchema([
            { name: 'Home', url: 'https://www.rosterplatform.com/' },
            { name: 'For Creatives', url: 'https://www.rosterplatform.com/for-creatives' },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6" aria-label="Hero">
        <div className="absolute bottom-20 right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none animate-float" style={{ background: 'radial-gradient(circle, rgba(46,196,182,0.06) 0%, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto text-center pt-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-teal-border)] bg-[rgba(46,196,182,0.06)] mb-6">
            <span className="w-2 h-2 rounded-full bg-[var(--color-teal)]" />
            <span className="text-mono text-[11px] text-[var(--color-teal)] tracking-wider">FOR CREATIVE PROFESSIONALS</span>
          </div>

          <h1 className="text-display text-4xl md:text-5xl lg:text-[3.5rem] text-white mb-6 leading-tight">
            Your Talent. Better Opportunities.{' '}
            <em className="text-[var(--color-teal)]">Zero Admin.</em>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Get discovered by top brands, manage projects with AI, and get paid on time &mdash;
            all on one platform. You focus on the creative work.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 text-[15px] px-8 py-3.5 font-semibold rounded-[var(--radius-md)] bg-[var(--color-teal)] text-[var(--color-navy)] hover:bg-[var(--color-teal-light)] transition-all"
            >
              Join as a Creative
            </Link>
            <Link
              to="/for-creatives/features"
              className="text-[15px] font-medium text-[var(--color-teal)] hover:text-[var(--color-teal-light)] transition-colors"
            >
              See all features &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <Reveal>
        <section className="py-16 md:py-20 border-y border-[rgba(255,255,255,0.04)]" aria-label="Platform statistics">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <MetricCounter target={500} suffix="+" label="Vetted Creatives" />
            <MetricCounter target={2000} suffix="+" label="Projects Delivered" />
            <MetricCounter target={98} suffix="%" label="On-Time Delivery" />
            <MetricCounter target={100} suffix="%" label="You Keep Your Fees" />
          </div>
        </section>
      </Reveal>

      {/* How It Works */}
      <Reveal>
        <section className="py-20 md:py-28" aria-label="How it works">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeading
              title="How Roster Works for Creatives"
              subtitle="From profile to payment, in four simple steps."
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="card-flat p-6 hover:border-[var(--color-teal-border)] transition-colors">
                  <span className="text-mono text-[var(--color-teal)] text-sm font-bold mb-3 block">{item.step}</span>
                  <h3 className="text-heading text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Feature highlights */}
      <Reveal>
        <section className="py-20 md:py-28 border-y border-[rgba(255,255,255,0.04)]" aria-label="Feature highlights">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeading
              title="Everything You Need to Succeed"
              subtitle="Tools built specifically for creative professionals."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURES.map((feature, i) => (
                <div key={i} className="card p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(46,196,182,0.1)] flex items-center justify-center text-[var(--color-teal)] shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-heading text-[17px] text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Earnings Calculator */}
      <Reveal>
        <section className="py-20 md:py-28" aria-label="Earnings calculator" id="calculator">
          <div className="max-w-3xl mx-auto px-6">
            <SectionHeading
              title="Estimate Your Earnings"
              subtitle="See what you could earn on Roster. You keep 100% of your project fees."
            />
            <EarningsCalculator />
          </div>
        </section>
      </Reveal>

      {/* Social proof */}
      <SocialProofBanner />

      {/* CTA */}
      <section className="py-24 md:py-32" aria-label="Get started">
        <div className="relative max-w-3xl mx-auto text-center px-6">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(46,196,182,0.06) 0%, transparent 70%)' }} />
          </div>
          <div className="relative">
            <h2 className="text-display text-3xl md:text-4xl text-white mb-4">
              Your Talent Deserves a Better Platform
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg mb-8 max-w-xl mx-auto">
              Join 500+ vetted creatives who are getting discovered by top brands and getting paid on time.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-[15px] px-8 py-3.5 font-semibold rounded-[var(--radius-md)] bg-[var(--color-teal)] text-[var(--color-navy)] hover:bg-[var(--color-teal-light)] transition-all"
              >
                Join as a Creative
              </Link>
              <Link
                to="/for-creatives/pricing"
                className="text-[15px] font-medium text-[var(--color-text-muted)] hover:text-white transition-colors"
              >
                View membership &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

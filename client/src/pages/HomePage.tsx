import { Link } from 'react-router-dom';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { SectionHeading } from '../components/marketing/SectionHeading';
import { MetricCounter } from '../components/marketing/MetricCounter';
import { FeatureCard } from '../components/marketing/FeatureCard';
import { TestimonialCarousel } from '../components/marketing/TestimonialCarousel';
import { SocialProofBanner } from '../components/marketing/SocialProofBanner';
import { SEOHead } from '../components/seo/SEOHead';
import { buildOrganizationSchema, buildWebSiteSchema, buildHowToSchema } from '../utils/structuredData';
import { testimonials } from '../data/testimonials';

/* ─── Reveal wrapper ─── */
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

/* ─── Feature icons (inline SVG) ─── */
const icons = {
  aiPM: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
      <circle cx="9" cy="15" r="1" /><circle cx="15" cy="15" r="1" />
    </svg>
  ),
  vault: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M12 6v4" />
    </svg>
  ),
  talent: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  roster: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  ),
  messages: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  budget: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
};

export function HomePage() {
  return (
    <div className="overflow-hidden">
      <SEOHead
        title="Roster — The Creative Operations Platform"
        description="Connect with vetted creative talent and manage projects with AI. The platform for marketing teams and creative professionals."
        canonical="https://www.rosterplatform.com/"
        structuredData={[
          buildOrganizationSchema(),
          buildWebSiteSchema(),
          buildHowToSchema('How to use Roster', [
            { name: 'Build Your Roster', text: 'Discover and save top creative talent matched to your brand, budget, and project needs.' },
            { name: 'Brief Your Project', text: 'Define scope, deliverables, and timeline. AI handles scheduling and milestones.' },
            { name: 'Ship Great Work', text: 'Review deliverables, approve, and launch. All assets live in your Brand Vault.' },
          ]),
        ]}
      />

      {/* ─── Hero ─── */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6" aria-label="Hero">
        {/* Ambient glows */}
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none animate-float" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-20 left-[5%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(46,196,182,0.04) 0%, transparent 70%)' }} />

        <div className="relative max-w-4xl mx-auto text-center pt-24">
          {/* AI badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold-border)] bg-[var(--color-gold-dim)] mb-8">
            <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] pulse-gold" />
            <span className="text-mono text-[11px] text-[var(--color-gold)] tracking-wider">AI-POWERED PLATFORM</span>
          </div>

          <h1 className="text-display text-4xl md:text-5xl lg:text-[3.5rem] text-white mb-6 leading-tight">
            The Platform Where Great Brands Meet{' '}
            <em className="text-[var(--color-gold)]">Great Creatives</em>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Discover exceptional creative talent. Manage projects with AI.
            Ship work that builds brands — all on one platform.
          </p>

          {/* Dual-audience CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/for-clients" className="btn-primary text-[15px] px-8 py-3.5">
              I'm Hiring Creative Talent
            </Link>
            <Link
              to="/for-creatives"
              className="inline-flex items-center justify-center gap-2 text-[15px] px-8 py-3.5 font-semibold rounded-[var(--radius-md)] border border-[var(--color-teal-border)] text-[var(--color-teal)] hover:bg-[var(--color-teal-dim)] transition-all"
            >
              I'm a Creative Professional
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Animated Stats ─── */}
      <Reveal>
        <section className="py-16 md:py-20 border-y border-[rgba(255,255,255,0.04)]" aria-label="Platform statistics">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <MetricCounter target={500} suffix="+" label="Vetted Creatives" />
            <MetricCounter target={2000} suffix="+" label="Projects Delivered" />
            <MetricCounter target={10} prefix="$" suffix="M+" label="Creative Work Managed" />
            <MetricCounter target={98} suffix="%" label="On-Time Delivery" />
          </div>
        </section>
      </Reveal>

      {/* ─── How It Works — For Clients ─── */}
      <Reveal>
        <section className="py-20 md:py-28" aria-label="How it works for clients">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeading
              title="How Roster Works for Teams"
              subtitle="From talent discovery to final delivery, in three simple steps."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  step: '01',
                  title: 'Build Your Roster',
                  desc: 'Discover and save top creative talent matched to your brand, budget, and project needs. Search by discipline, availability, and past work.',
                },
                {
                  step: '02',
                  title: 'Brief Your Project',
                  desc: 'Define scope, deliverables, and timeline. Our AI Project Manager handles scheduling, milestone tracking, and intelligent reminders.',
                },
                {
                  step: '03',
                  title: 'Ship Great Work',
                  desc: 'Review deliverables, provide feedback, approve and launch. Every asset, version, and approval lives in your Brand Vault.',
                },
              ].map((item) => (
                <div key={item.step} className="card p-6">
                  <span className="text-mono text-[var(--color-gold)] text-sm font-bold mb-3 block">{item.step}</span>
                  <h3 className="text-heading text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/for-clients" className="text-sm font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] transition-colors">
                Learn more about Roster for teams &rarr;
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─── How It Works — For Creatives ─── */}
      <Reveal>
        <section className="py-20 md:py-28 border-y border-[rgba(255,255,255,0.04)]" aria-label="How it works for creatives">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeading
              title="How Roster Works for Creatives"
              subtitle="Get discovered by top brands, manage projects, and get paid — all in one place."
            />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  step: '01',
                  title: 'Create Your Profile',
                  desc: 'Showcase your portfolio, set your rates, and define your specialties. We verify every creative for quality.',
                },
                {
                  step: '02',
                  title: 'Get Discovered',
                  desc: 'Brands and agencies search for talent like you. AI matching connects you to the right projects.',
                },
                {
                  step: '03',
                  title: 'Ship Great Work',
                  desc: 'Manage deliverables with phase-based workflows. The AI PM keeps everything organized and on track.',
                },
                {
                  step: '04',
                  title: 'Get Paid',
                  desc: 'Transparent invoicing and payment processing. No chasing checks or wondering when you\'ll get paid.',
                },
              ].map((item) => (
                <div key={item.step} className="card-flat p-6 hover:border-[var(--color-teal-border)] transition-colors">
                  <span className="text-mono text-[var(--color-teal)] text-sm font-bold mb-3 block">{item.step}</span>
                  <h3 className="text-heading text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/for-creatives" className="text-sm font-medium text-[var(--color-teal)] hover:text-[var(--color-teal-light)] transition-colors">
                Learn more about Roster for creatives &rarr;
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─── Features Grid ─── */}
      <Reveal>
        <section className="py-20 md:py-28" aria-label="Key features">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeading
              title="Everything You Need to Ship Creative Work"
              subtitle="A complete platform for managing talent, projects, and brand assets."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={icons.aiPM}
                title="AI Project Manager"
                description="Automated timelines, risk detection, budget analysis, and intelligent status reports. Your AI-powered operations layer."
                link="/for-clients/features"
              />
              <FeatureCard
                icon={icons.vault}
                title="Brand Vault"
                description="Centralized asset library with version control, brand guidelines, and approval workflows. Everything in one place."
                link="/for-clients/features"
              />
              <FeatureCard
                icon={icons.talent}
                title="Talent Discovery"
                description="Search and filter vetted creative professionals by skill, industry, rate, and availability. View portfolios and ratings."
                link="/for-clients/features"
              />
              <FeatureCard
                icon={icons.roster}
                title="Roster Management"
                description="Organize talent into project-specific rosters. Save your favorite creatives. Build the perfect team for every brief."
                link="/for-clients/features"
              />
              <FeatureCard
                icon={icons.messages}
                title="Real-time Messaging"
                description="Project-scoped channels with file sharing and threaded conversations. Keep all communication in context."
                link="/features"
              />
              <FeatureCard
                icon={icons.budget}
                title="Budget Tracking"
                description="Set project budgets, track spend by phase, and get variance alerts. Never lose control of project finances."
                link="/for-clients/features"
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* ─── Testimonial Carousel ─── */}
      <Reveal>
        <section className="py-20 md:py-28 border-y border-[rgba(255,255,255,0.04)]" aria-label="Testimonials">
          <div className="max-w-4xl mx-auto px-6">
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      </Reveal>

      {/* ─── Trust Signals ─── */}
      <SocialProofBanner />

      {/* ─── Dual CTA ─── */}
      <section className="py-24 md:py-32" aria-label="Get started">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Teams */}
            <div className="card p-8 md:p-10 text-center">
              <div className="text-label text-[var(--color-gold)] mb-4">FOR TEAMS</div>
              <h2 className="text-heading text-2xl text-white mb-3">Ready to Transform Your Creative Operations?</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-sm mx-auto">
                Start your 14-day free trial. No credit card required. Ship better creative, faster.
              </p>
              <Link to="/for-clients" className="btn-primary text-[14px] px-6 py-3">
                Get Started Free
              </Link>
            </div>

            {/* For Creatives */}
            <div className="card-flat p-8 md:p-10 text-center border-[var(--color-teal-border)] hover:bg-[var(--color-teal-dim)] transition-colors">
              <div className="text-label text-[var(--color-teal)] mb-4">FOR CREATIVES</div>
              <h2 className="text-heading text-2xl text-white mb-3">Your Talent Deserves a Better Platform</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-sm mx-auto">
                Get discovered by top brands. Manage projects with AI. Get paid on time, every time.
              </p>
              <Link
                to="/for-creatives"
                className="inline-flex items-center justify-center gap-2 text-[14px] px-6 py-3 font-semibold rounded-[var(--radius-md)] border border-[var(--color-teal-border)] text-[var(--color-teal)] hover:bg-[rgba(46,196,182,0.15)] transition-all"
              >
                Join as a Creative
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

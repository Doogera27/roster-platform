import { Link } from 'react-router-dom';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { SectionHeading } from '../components/marketing/SectionHeading';
import { SocialProofBanner } from '../components/marketing/SocialProofBanner';
import { SEOHead } from '../components/seo/SEOHead';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/structuredData';

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

interface FeatureSectionProps {
  question: string;
  title: string;
  description: string;
  bullets: string[];
  icon: React.ReactNode;
  reverse?: boolean;
}

function FeatureSection({ question, title, description, bullets, icon, reverse }: FeatureSectionProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
      <div className={reverse ? 'lg:order-2' : ''}>
        <div className="text-label text-[var(--color-gold)] mb-3">{question}</div>
        <h3 className="text-heading text-2xl text-white mb-4">{title}</h3>
        <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">{description}</p>
        <ul className="space-y-3">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <svg className="w-4 h-4 text-[var(--color-teal)] mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 8 7 12 13 4" />
              </svg>
              <span className="text-sm text-[var(--color-text-secondary)]">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`${reverse ? 'lg:order-1' : ''}`}>
        <div className="card p-8 flex items-center justify-center min-h-[280px]">
          <div className="w-20 h-20 rounded-2xl bg-[var(--color-gold-dim)] border border-[var(--color-gold-border)] flex items-center justify-center text-[var(--color-gold)]">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES: FeatureSectionProps[] = [
  {
    question: 'How does the AI Project Manager work?',
    title: 'AI Project Manager',
    description: 'Your always-on operations layer. The AI PM monitors every project in your portfolio automatically, using real project data to give you actionable intelligence \u2014 not generic templates.',
    bullets: [
      'Automated timeline management and milestone tracking',
      'Risk detection: timeline slips, budget overruns, scope creep',
      'AI-generated status reports with executive summaries',
      'Phase-level recommendations and next-step suggestions',
      'Critical alerts sent when immediate action is needed',
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
        <circle cx="9" cy="15" r="1" /><circle cx="15" cy="15" r="1" />
      </svg>
    ),
  },
  {
    question: 'What is the Brand Vault?',
    title: 'Brand Vault',
    description: 'Your centralized hub for every creative asset. Brand Vault keeps all files, brand guidelines, and approved deliverables organized with version control and approval workflows.',
    bullets: [
      'Centralized asset library with folder organization',
      'Version control \u2014 track every revision',
      'Brand guidelines and style references in one place',
      'Approval workflows tied to project phases',
      '5 GB to unlimited storage depending on plan',
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M12 6v4" />
      </svg>
    ),
    reverse: true,
  },
  {
    question: 'How do I find the right creative talent?',
    title: 'Talent Discovery',
    description: 'Search and filter a marketplace of pre-vetted creative professionals. Every creative on Roster has been reviewed for quality, reliability, and professionalism.',
    bullets: [
      'Search by discipline, industry, rate, and availability',
      'View portfolios, ratings, and past project history',
      'Multi-step vetting: portfolio review, skill verification, work evaluation',
      'Save favorites to reusable rosters',
      'AI matching to connect you with the best fit for your project',
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    question: 'How does Roster Management work?',
    title: 'Roster Management',
    description: 'Organize your creative talent into project-specific rosters. Build the perfect team for every brief and maintain long-term relationships with your favorite creatives.',
    bullets: [
      'Create and name custom rosters for different project types',
      'Save preferred creatives for quick access',
      'Track working history and past project performance',
      'Invite specific creatives to new projects',
      'Works for both one-off projects and ongoing retainers',
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
    reverse: true,
  },
  {
    question: 'How does budget tracking work?',
    title: 'Budget Tracking',
    description: 'Set project budgets, track spend by phase, and get variance alerts. Never lose control of project finances with real-time financial visibility across your portfolio.',
    bullets: [
      'Set budgets at project and phase level',
      'Track actual spend vs. planned budget in real time',
      'Variance alerts when costs exceed thresholds',
      'AI budget analysis identifies potential overruns early',
      'Full invoice management and payment processing',
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    question: 'How does real-time messaging work?',
    title: 'Real-time Messaging',
    description: 'Keep all communication in context with project-scoped channels. File sharing, threaded conversations, and direct messages \u2014 all tied to the projects they belong to.',
    bullets: [
      'Project-scoped channels keep conversations organized',
      'Threaded replies for focused discussions',
      'File sharing with drag-and-drop',
      'Direct messages for 1:1 communication',
      'Full message history searchable by project',
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    reverse: true,
  },
];

export function ClientsFeaturesPage() {
  return (
    <div className="overflow-hidden">
      <SEOHead
        title="Features for Teams \u2014 AI Project Management & More | Roster"
        description="AI project manager, brand vault, talent discovery, budget tracking, and real-time messaging. Everything your marketing team needs to manage creative operations."
        canonical="https://www.rosterplatform.com/for-clients/features"
        structuredData={[
          buildSoftwareApplicationSchema(),
          buildBreadcrumbSchema([
            { name: 'Home', url: 'https://www.rosterplatform.com/' },
            { name: 'For Clients', url: 'https://www.rosterplatform.com/for-clients' },
            { name: 'Features', url: 'https://www.rosterplatform.com/for-clients/features' },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6" aria-label="Features hero">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-gold-border)] bg-[var(--color-gold-dim)] mb-6">
            <span className="text-mono text-[11px] text-[var(--color-gold)] tracking-wider">FEATURES FOR TEAMS</span>
          </div>
          <h1 className="text-display text-4xl md:text-5xl text-white mb-6">
            Everything You Need to{' '}
            <em className="text-[var(--color-gold)]">Ship Creative Work</em>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
            A complete creative operations platform: AI project management, talent discovery, brand asset storage,
            budget tracking, and real-time messaging &mdash; all in one place.
          </p>
        </div>
      </section>

      {/* Feature sections */}
      {FEATURES.map((feature, i) => (
        <Reveal key={i}>
          <section
            className={`py-20 md:py-28 ${i % 2 === 0 ? 'border-t border-[rgba(255,255,255,0.04)]' : ''}`}
            aria-label={feature.title}
          >
            <div className="max-w-6xl mx-auto px-6">
              <FeatureSection {...feature} />
            </div>
          </section>
        </Reveal>
      ))}

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
              See These Features in Action
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg mb-8 max-w-xl mx-auto">
              Start your 14-day free trial and experience every feature with your actual workflow.
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

import { Link } from 'react-router-dom';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
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
        <div className="text-label text-[var(--color-teal)] mb-3">{question}</div>
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
          <div className="w-20 h-20 rounded-2xl bg-[rgba(46,196,182,0.1)] border border-[var(--color-teal-border)] flex items-center justify-center text-[var(--color-teal)]">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES: FeatureSectionProps[] = [
  {
    question: 'How do I showcase my work?',
    title: 'Professional Portfolio',
    description: 'Your dedicated portfolio page on Roster showcases your best work to every brand searching for talent. It\u2019s your storefront \u2014 designed to get you hired.',
    bullets: [
      'Upload and organize your best work samples',
      'Set your rates, specialties, and availability',
      'Display your skills, industry experience, and past projects',
      'Clients see your portfolio when browsing and searching',
      'Ratings and reviews build your reputation over time',
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    question: 'How does AI matching work?',
    title: 'AI-Powered Client Matching',
    description: 'Stop waiting for opportunities to find you. Roster\u2019s AI matching connects your skills and availability with the right projects automatically.',
    bullets: [
      'AI analyzes your portfolio, skills, and work history',
      'Get matched with projects that fit your strengths',
      'Clients see you when searching for your specialties',
      'Matching improves as you complete more projects',
      'Priority placement in search results with active membership',
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    reverse: true,
  },
  {
    question: 'How are projects managed?',
    title: 'Phase-Based Project Workflow',
    description: 'Every project on Roster follows a structured phase-based workflow that keeps work organized, expectations clear, and deliverables tracked.',
    bullets: [
      'Clear project phases with defined deliverables',
      'AI Project Manager tracks timelines and milestones',
      'Built-in review and revision cycles',
      'All files and versions tracked in one place',
      'Clients approve work at each phase before moving forward',
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
        <circle cx="9" cy="15" r="1" /><circle cx="15" cy="15" r="1" />
      </svg>
    ),
  },
  {
    question: 'How do I communicate with clients?',
    title: 'Real-time Messaging',
    description: 'Keep all project communication in one place with project-scoped channels, threaded conversations, and file sharing.',
    bullets: [
      'Project-scoped channels keep conversations organized',
      'Threaded replies for focused discussions',
      'Drag-and-drop file sharing',
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
  {
    question: 'How do I get paid?',
    title: 'Automated Invoicing & Payments',
    description: 'No more chasing invoices or wondering when payment will arrive. Roster handles all financial processing so you can focus on the creative work.',
    bullets: [
      'Automated invoice generation for every project',
      'Secure payment processing through the platform',
      'Regular payment schedule \u2014 no waiting or chasing',
      'Full financial dashboard with earnings history',
      'You keep 100% of your project fees',
    ],
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export function CreativesFeaturesPage() {
  return (
    <div className="overflow-hidden">
      <SEOHead
        title="Features for Creatives \u2014 Portfolio & Payments | Roster"
        description="Build your portfolio, get discovered by brands, manage projects with AI, and get paid on time. Everything creative professionals need in one platform."
        canonical="https://www.rosterplatform.com/for-creatives/features"
        structuredData={[
          buildSoftwareApplicationSchema(),
          buildBreadcrumbSchema([
            { name: 'Home', url: 'https://www.rosterplatform.com/' },
            { name: 'For Creatives', url: 'https://www.rosterplatform.com/for-creatives' },
            { name: 'Features', url: 'https://www.rosterplatform.com/for-creatives/features' },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-6" aria-label="Features hero">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-teal-border)] bg-[rgba(46,196,182,0.06)] mb-6">
            <span className="text-mono text-[11px] text-[var(--color-teal)] tracking-wider">FEATURES FOR CREATIVES</span>
          </div>
          <h1 className="text-display text-4xl md:text-5xl text-white mb-6">
            Tools Built for{' '}
            <em className="text-[var(--color-teal)]">Creative Professionals</em>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto">
            Portfolio, matching, project management, messaging, and payments &mdash;
            everything you need to find work, deliver it, and get paid.
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
            <div className="w-[600px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(46,196,182,0.06) 0%, transparent 70%)' }} />
          </div>
          <div className="relative">
            <h2 className="text-display text-3xl md:text-4xl text-white mb-4">
              Ready to Take Your Creative Career Further?
            </h2>
            <p className="text-[var(--color-text-muted)] text-lg mb-8 max-w-xl mx-auto">
              Join Roster and start getting discovered by brands that value your talent.
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

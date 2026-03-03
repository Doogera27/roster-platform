import { Link } from 'react-router-dom';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import { SectionHeading } from '../components/marketing/SectionHeading';
import { CTASection } from '../components/marketing/CTASection';
import { SEOHead } from '../components/seo/SEOHead';
import { buildSoftwareApplicationSchema, buildBreadcrumbSchema } from '../utils/structuredData';

function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useRevealOnScroll(0.12);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
}

const features = [
  {
    id: 'ai-project-manager',
    label: 'AI PROJECT MANAGER',
    title: 'Your Intelligent Operations Layer',
    description: 'The AI PM monitors every project in your portfolio, detecting risks before they become problems and keeping every deliverable on track without manual oversight.',
    capabilities: [
      'Automated health scans across all active projects',
      'Real-time risk detection and budget burn analysis',
      'On-demand status reports with executive summaries',
      'Phase-level recommendations and timeline intelligence',
      'Critical alerts with actionable recommendations',
    ],
    audience: 'Both' as const,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
        <circle cx="9" cy="15" r="1" /><circle cx="15" cy="15" r="1" />
      </svg>
    ),
    gradient: 'radial-gradient(circle at 30% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)',
  },
  {
    id: 'brand-vault',
    label: 'BRAND VAULT',
    title: "Your Brand's Single Source of Truth",
    description: 'Every asset, guideline, and approved creative lives in one secure, organized vault. No more digging through emails or shared drives for the latest version.',
    capabilities: [
      'Centralized asset library with smart categorization',
      'Version history and approval workflows',
      'Brand guidelines and style standards',
      'Secure file storage with team access controls',
      'Quick search across all brand materials',
    ],
    audience: 'Client' as const,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M12 6v4" />
      </svg>
    ),
    gradient: 'radial-gradient(circle at 70% 50%, rgba(46,196,182,0.06) 0%, transparent 70%)',
  },
  {
    id: 'talent-discovery',
    label: 'TALENT DISCOVERY',
    title: 'Find the Right Creative for Every Brief',
    description: 'Search our vetted talent pool by discipline, industry experience, rate, and availability. Every creative has been reviewed for quality and reliability.',
    capabilities: [
      'Advanced search with 10+ filter dimensions',
      'Portfolio previews and work samples',
      'Availability and rate transparency',
      'Ratings and review history from past projects',
      'AI-powered talent matching recommendations',
    ],
    audience: 'Client' as const,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
    ),
    gradient: 'radial-gradient(circle at 30% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
  },
  {
    id: 'portfolio',
    label: 'PROFESSIONAL PORTFOLIO',
    title: 'Showcase Your Best Work',
    description: 'A dedicated portfolio page that displays your work samples, rates, specialties, and ratings to every brand searching for talent on Roster.',
    capabilities: [
      'Upload and organize your best work samples',
      'Set rates, specialties, and availability',
      'Display industry experience and project history',
      'Build reputation with ratings and reviews',
      'Priority placement with active membership',
    ],
    audience: 'Creative' as const,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    gradient: 'radial-gradient(circle at 70% 50%, rgba(46,196,182,0.06) 0%, transparent 70%)',
  },
  {
    id: 'messaging',
    label: 'REAL-TIME MESSAGING',
    title: 'Communication That Stays in Context',
    description: 'Every conversation lives alongside the project it belongs to. No more searching through Slack channels or email threads for that one piece of feedback.',
    capabilities: [
      'Project-scoped messaging channels',
      'File sharing and attachment support',
      'Threaded conversations for organized feedback',
      'Real-time notifications and unread indicators',
      'Full message history searchable by project',
    ],
    audience: 'Both' as const,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    gradient: 'radial-gradient(circle at 30% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
  },
  {
    id: 'budget-tracking',
    label: 'BUDGET TRACKING',
    title: 'Complete Financial Visibility',
    description: 'Set budgets, track spending in real time, and get alerts when thresholds are crossed. Integrated with the AI PM for proactive financial risk detection.',
    capabilities: [
      'Project and phase-level budget management',
      'Real-time spend tracking against approved budgets',
      'Automatic alerts at 50%, 75%, and 90% thresholds',
      'Burn rate analysis and runway projections',
      'Change order tracking and approval workflows',
    ],
    audience: 'Client' as const,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    gradient: 'radial-gradient(circle at 70% 50%, rgba(46,196,182,0.05) 0%, transparent 70%)',
  },
  {
    id: 'payments',
    label: 'AUTOMATED PAYMENTS',
    title: 'Get Paid on Time, Every Time',
    description: 'Roster handles invoicing and payment processing so creatives get paid reliably and clients have full financial transparency.',
    capabilities: [
      'Automated invoice generation for every project',
      'Secure payment processing through the platform',
      'Regular payment schedule for creatives',
      'Full financial dashboard and earnings history',
      'Creatives keep 100% of their project fees',
    ],
    audience: 'Creative' as const,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    gradient: 'radial-gradient(circle at 30% 50%, rgba(46,196,182,0.06) 0%, transparent 70%)',
  },
];

function AudienceBadge({ audience }: { audience: 'Client' | 'Creative' | 'Both' }) {
  if (audience === 'Both') {
    return (
      <div className="flex gap-1.5">
        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[var(--color-gold-dim)] text-[var(--color-gold)] border border-[var(--color-gold-border)]">
          Teams
        </span>
        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[rgba(46,196,182,0.08)] text-[var(--color-teal)] border border-[var(--color-teal-border)]">
          Creatives
        </span>
      </div>
    );
  }
  if (audience === 'Client') {
    return (
      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[var(--color-gold-dim)] text-[var(--color-gold)] border border-[var(--color-gold-border)]">
        Teams
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[rgba(46,196,182,0.08)] text-[var(--color-teal)] border border-[var(--color-teal-border)]">
      Creatives
    </span>
  );
}

export function FeaturesPage() {
  return (
    <div className="overflow-hidden pt-24">
      <SEOHead
        title="Features \u2014 Everything for Creative Operations | Roster"
        description="AI project management, talent discovery, brand vault, budget tracking, messaging, and payments. A complete creative operations platform for teams and creatives."
        canonical="https://www.rosterplatform.com/features"
        structuredData={[
          buildSoftwareApplicationSchema(),
          buildBreadcrumbSchema([
            { name: 'Home', url: 'https://www.rosterplatform.com/' },
            { name: 'Features', url: 'https://www.rosterplatform.com/features' },
          ]),
        ]}
      />

      {/* Header */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-display text-4xl md:text-5xl text-white mb-4">
            Built for Creative Operations <em className="text-[var(--color-gold)]">at Scale</em>
          </h1>
          <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto mb-8">
            Every tool your team needs to discover talent, manage projects, and ship exceptional creative work.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/for-clients/features" className="text-sm font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] transition-colors">
              Features for teams &rarr;
            </Link>
            <Link to="/for-creatives/features" className="text-sm font-medium text-[var(--color-teal)] hover:text-[var(--color-teal-light)] transition-colors">
              Features for creatives &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      {features.map((feature, index) => {
        const isReversed = index % 2 === 1;
        return (
          <Reveal key={feature.id}>
            <section
              id={feature.id}
              className="py-20 md:py-24 px-6"
              style={{ scrollMarginTop: '5rem' }}
            >
              <div className="max-w-6xl mx-auto">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isReversed ? 'lg:[direction:rtl]' : ''}`}>
                  {/* Text */}
                  <div className={isReversed ? 'lg:[direction:ltr]' : ''}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-label text-[var(--color-gold)]">{feature.label}</span>
                      <AudienceBadge audience={feature.audience} />
                    </div>
                    <h2 className="text-heading text-2xl md:text-3xl text-white mb-4">{feature.title}</h2>
                    <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">{feature.description}</p>
                    <ul className="space-y-3">
                      {feature.capabilities.map((cap, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <svg className="w-4 h-4 text-[var(--color-teal)] mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 8 7 12 13 4" />
                          </svg>
                          <span className="text-sm text-[var(--color-text-secondary)]">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual placeholder */}
                  <div className={isReversed ? 'lg:[direction:ltr]' : ''}>
                    <div
                      className="relative aspect-[4/3] rounded-[var(--radius-xl)] border border-[var(--color-border)] overflow-hidden flex items-center justify-center"
                      style={{ background: feature.gradient }}
                    >
                      <div className="text-[var(--color-gold)] opacity-30">
                        {feature.icon}
                      </div>
                      <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>
        );
      })}

      {/* Bottom CTA */}
      <CTASection
        heading="See Plans and Pricing"
        subtitle="Find the right plan for your team's creative operations."
        ctaLabel="View Pricing"
        ctaLink="/pricing"
      />
    </div>
  );
}

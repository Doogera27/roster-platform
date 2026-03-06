/**
 * FeatureMockup — Decorative CSS mock UI cards for feature pages.
 *
 * Each mockup is a purely visual representation of a product feature,
 * built entirely with CSS/Tailwind. No interactivity — just eye candy.
 */

interface FeatureMockupProps {
  /** Which feature to render */
  featureId: string;
  /** Color accent: 'gold' for clients, 'teal' for creatives */
  accent?: 'gold' | 'teal';
}

export function FeatureMockup({ featureId, accent = 'gold' }: FeatureMockupProps) {
  const accentColor = accent === 'gold' ? 'var(--color-gold)' : 'var(--color-teal)';
  const accentDim = accent === 'gold' ? 'var(--color-gold-dim)' : 'var(--color-teal-dim)';
  const accentBorder = accent === 'gold' ? 'var(--color-gold-border)' : 'var(--color-teal-border)';

  const mockups: Record<string, () => React.ReactNode> = {
    'ai-pm': () => <AIPMMockup accentColor={accentColor} accentDim={accentDim} accentBorder={accentBorder} />,
    'brand-vault': () => <BrandVaultMockup accentColor={accentColor} accentDim={accentDim} />,
    'talent-discovery': () => <TalentDiscoveryMockup accentColor={accentColor} accentDim={accentDim} accentBorder={accentBorder} />,
    'roster-management': () => <RosterManagementMockup accentColor={accentColor} accentDim={accentDim} accentBorder={accentBorder} />,
    'budget-tracking': () => <BudgetTrackingMockup accentColor={accentColor} accentDim={accentDim} accentBorder={accentBorder} />,
    'messaging': () => <MessagingMockup accentColor={accentColor} accentDim={accentDim} accentBorder={accentBorder} />,
    'portfolio': () => <PortfolioMockup accentColor={accentColor} accentDim={accentDim} />,
    'ai-matching': () => <AIMatchingMockup accentColor={accentColor} accentDim={accentDim} accentBorder={accentBorder} />,
    'phase-workflow': () => <PhaseWorkflowMockup accentColor={accentColor} accentDim={accentDim} accentBorder={accentBorder} />,
    'invoicing': () => <InvoicingMockup />,
  };

  const render = mockups[featureId];

  return (
    <div className="card p-6 min-h-[280px] flex items-center justify-center overflow-hidden">
      {render ? render() : <FallbackIcon accent={accent} />}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Shared helpers                                                  */
/* ════════════════════════════════════════════════════════════════ */

interface AccentProps {
  accentColor: string;
  accentDim: string;
  accentBorder?: string;
}

function FallbackIcon({ accent }: { accent: 'gold' | 'teal' }) {
  const bg = accent === 'gold' ? 'var(--color-gold-dim)' : 'rgba(46,196,182,0.1)';
  const border = accent === 'gold' ? 'var(--color-gold-border)' : 'var(--color-teal-border)';
  const color = accent === 'gold' ? 'var(--color-gold)' : 'var(--color-teal)';
  return (
    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: bg, border: `1px solid ${border}`, color }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  AI PM Mockup                                                    */
/* ════════════════════════════════════════════════════════════════ */

function AIPMMockup({ accentColor, accentDim, accentBorder }: AccentProps) {
  const projects = [
    { name: 'Brand Refresh', status: 'On Track', progress: 72, statusColor: '#22c55e' },
    { name: 'Social Campaign', status: 'At Risk', progress: 45, statusColor: '#f59e0b' },
    { name: 'Product Shoot', status: 'On Track', progress: 90, statusColor: '#22c55e' },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}>Active Projects</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: accentDim, color: accentColor, border: `1px solid ${accentBorder}` }}>
          AI Monitoring
        </span>
      </div>

      {/* Project rows */}
      {projects.map((p) => (
        <div key={p.name} className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--color-text-secondary)]">{p.name}</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${p.statusColor}15`, color: p.statusColor }}
            >
              {p.status}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${p.progress}%`, background: p.statusColor }}
            />
          </div>
          <div className="text-[10px] text-[var(--color-text-faint)] mt-1 text-right">{p.progress}%</div>
        </div>
      ))}

      {/* Alert toast */}
      <div className="flex items-center gap-2 rounded-lg bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] p-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-[10px] text-[#f59e0b]">Social Campaign timeline at risk &mdash; 2 tasks overdue</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Brand Vault Mockup                                              */
/* ════════════════════════════════════════════════════════════════ */

function BrandVaultMockup({ accentColor, accentDim }: AccentProps) {
  const files = [
    { name: 'Logo_Final', ext: 'AI', color: '#FF9A00' },
    { name: 'Brand_Guide', ext: 'PDF', color: '#FF4444' },
    { name: 'Hero_Image', ext: 'PSD', color: '#31A8FF' },
    { name: 'Social_Kit', ext: 'FIG', color: '#A259FF' },
    { name: 'Product_Shot', ext: 'JPG', color: '#22c55e' },
    { name: 'Icon_Set', ext: 'SVG', color: '#FF9A00' },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}>Brand Vault</span>
        <span className="text-[10px] text-[var(--color-text-faint)]">v2.4</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {files.map((f) => (
          <div key={f.name} className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-3 text-center">
            {/* Colored thumbnail */}
            <div
              className="w-full aspect-square rounded-md mb-2"
              style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
            />
            {/* File badge */}
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: `${f.color}20`, color: f.color }}
            >
              {f.ext}
            </span>
            <div className="text-[10px] text-[var(--color-text-faint)] mt-1 truncate">{f.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Talent Discovery Mockup                                         */
/* ════════════════════════════════════════════════════════════════ */

function TalentDiscoveryMockup({ accentColor, accentDim, accentBorder }: AccentProps) {
  const profiles = [
    { name: 'Sarah K.', role: 'Designer', match: 96 },
    { name: 'Marcus J.', role: 'Photographer', match: 91 },
    { name: 'Priya R.', role: 'Motion', match: 87 },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-2.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <span className="text-xs text-[var(--color-text-faint)]">Search creatives...</span>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        {['Design', 'Photography', 'Available Now'].map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-1 rounded-full" style={{ background: accentDim, color: accentColor, border: `1px solid ${accentBorder}` }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Profile cards */}
      {profiles.map((p) => (
        <div key={p.name} className="flex items-center gap-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[10px] font-medium text-[var(--color-text-secondary)]">
            {p.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white font-medium">{p.name}</div>
            <div className="text-[10px] text-[var(--color-text-faint)]">{p.role}</div>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: accentDim, color: accentColor }}
          >
            {p.match}% match
          </span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Roster Management Mockup                                        */
/* ════════════════════════════════════════════════════════════════ */

function RosterManagementMockup({ accentColor, accentDim, accentBorder }: AccentProps) {
  const members = [
    { name: 'Sarah Kim', role: 'Designer', color: '#818cf8' },
    { name: 'Marcus Jones', role: 'Photographer', color: '#22c55e' },
    { name: 'Alex Tran', role: 'Copywriter', color: '#f59e0b' },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}>Q1 Campaign Roster</span>
        <span className="text-[10px] text-[var(--color-text-faint)]">3 members</span>
      </div>

      {members.map((m) => (
        <div key={m.name} className="flex items-center gap-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: `${m.color}30` }}
          >
            {m.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white font-medium">{m.name}</div>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${m.color}15`, color: m.color }}>
              {m.role}
            </span>
          </div>
          <button
            type="button"
            className="text-[10px] px-2.5 py-1 rounded-md font-medium"
            style={{ background: accentDim, color: accentColor, border: `1px solid ${accentBorder}` }}
          >
            Invite
          </button>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Budget Tracking Mockup                                          */
/* ════════════════════════════════════════════════════════════════ */

function BudgetTrackingMockup({ accentColor, accentDim, accentBorder }: AccentProps) {
  const phases = [
    { name: 'Discovery', budget: 5000, actual: 4200 },
    { name: 'Design', budget: 12000, actual: 10800 },
    { name: 'Production', budget: 8000, actual: 3200 },
  ];
  const totalBudget = phases.reduce((s, p) => s + p.budget, 0);
  const totalActual = phases.reduce((s, p) => s + p.actual, 0);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}>Project Budget</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#22c55e15', color: '#22c55e' }}>
          On Budget
        </span>
      </div>

      {/* Bar chart */}
      <div className="space-y-2">
        {phases.map((p) => {
          const pct = Math.round((p.actual / p.budget) * 100);
          return (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[var(--color-text-secondary)]">{p.name}</span>
                <span className="text-[10px] text-[var(--color-text-faint)]">
                  ${(p.actual / 1000).toFixed(1)}k / ${(p.budget / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    background: pct > 90 ? '#f59e0b' : accentColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-3 flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-secondary)]">Total Spend</span>
        <div>
          <span className="text-sm font-semibold text-white">${(totalActual / 1000).toFixed(1)}k</span>
          <span className="text-[10px] text-[var(--color-text-faint)] ml-1">of ${(totalBudget / 1000).toFixed(0)}k</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Messaging Mockup                                                */
/* ════════════════════════════════════════════════════════════════ */

function MessagingMockup({ accentColor, accentDim, accentBorder }: AccentProps) {
  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}># brand-refresh</span>
        <span className="text-[10px] text-[var(--color-text-faint)]">3 online</span>
      </div>

      {/* Chat bubbles */}
      <div className="space-y-2">
        {/* Outgoing */}
        <div className="flex justify-end">
          <div className="rounded-xl rounded-br-md px-3 py-2 max-w-[75%] text-[11px]" style={{ background: accentDim, color: accentColor }}>
            Updated mockups are in the vault. Ready for review!
          </div>
        </div>

        {/* Incoming */}
        <div className="flex gap-2 items-end">
          <div className="w-5 h-5 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[8px] text-[var(--color-text-faint)] shrink-0">
            SK
          </div>
          <div className="rounded-xl rounded-bl-md bg-[rgba(255,255,255,0.05)] px-3 py-2 max-w-[75%] text-[11px] text-[var(--color-text-secondary)]">
            These look great! Small note on the header layout
          </div>
        </div>

        {/* File attachment */}
        <div className="flex gap-2 items-end">
          <div className="w-5 h-5 shrink-0" />
          <div className="rounded-xl rounded-bl-md bg-[rgba(255,255,255,0.05)] px-3 py-2 max-w-[75%]">
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-[10px] text-[var(--color-text-secondary)]">header_v2.fig</span>
            </div>
          </div>
        </div>

        {/* Typing indicator */}
        <div className="flex gap-2 items-end">
          <div className="w-5 h-5 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center text-[8px] text-[var(--color-text-faint)] shrink-0">
            MJ
          </div>
          <div className="rounded-xl rounded-bl-md bg-[rgba(255,255,255,0.05)] px-3 py-2">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-faint)] animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-faint)] animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-faint)] animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Portfolio Mockup (Creatives)                                    */
/* ════════════════════════════════════════════════════════════════ */

function PortfolioMockup({ accentColor, accentDim }: AccentProps) {
  const items = [
    { h: 'h-20', color: '#818cf8' },
    { h: 'h-28', color: '#f59e0b' },
    { h: 'h-24', color: '#22c55e' },
    { h: 'h-32', color: '#31A8FF' },
    { h: 'h-20', color: '#A259FF' },
    { h: 'h-24', color: '#FF4444' },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}>Portfolio</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: accentDim, color: accentColor }}>
          View Profile
        </span>
      </div>

      {/* Masonry grid */}
      <div className="columns-2 gap-2 space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className={`${item.h} rounded-lg break-inside-avoid`}
            style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}
          />
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  AI Matching Mockup (Creatives)                                  */
/* ════════════════════════════════════════════════════════════════ */

function AIMatchingMockup({ accentColor, accentDim, accentBorder }: AccentProps) {
  return (
    <div className="w-full space-y-3">
      {/* Match notification */}
      <div className="rounded-lg border p-4 text-center" style={{ background: accentDim, borderColor: accentBorder }}>
        <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: accentColor, fontFamily: 'var(--font-mono)' }}>
          New Match
        </div>
        <div className="text-3xl font-bold text-white mb-1">92%</div>
        <div className="text-xs text-[var(--color-text-muted)]">Brand Refresh Project</div>
      </div>

      {/* Skill overlap tags */}
      <div className="space-y-2">
        <span className="text-[10px] text-[var(--color-text-faint)]" style={{ fontFamily: 'var(--font-mono)' }}>MATCHING SKILLS</span>
        <div className="flex flex-wrap gap-1.5">
          {['Brand Design', 'Logo', 'Typography', 'Illustrator', 'Figma'].map((skill) => (
            <span key={skill} className="text-[10px] px-2 py-1 rounded-full" style={{ background: accentDim, color: accentColor, border: `1px solid ${accentBorder}` }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Project details */}
      <div className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] p-3 space-y-1.5">
        <div className="flex justify-between">
          <span className="text-[10px] text-[var(--color-text-faint)]">Budget</span>
          <span className="text-[10px] text-white">$4,500</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-[var(--color-text-faint)]">Timeline</span>
          <span className="text-[10px] text-white">3 weeks</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-[var(--color-text-faint)]">Client</span>
          <span className="text-[10px] text-white">Acme Co.</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Phase Workflow Mockup (Creatives)                               */
/* ════════════════════════════════════════════════════════════════ */

function PhaseWorkflowMockup({ accentColor, accentDim, accentBorder }: AccentProps) {
  const phases = [
    { name: 'Brief', done: true },
    { name: 'Create', done: false, current: true },
    { name: 'Review', done: false },
    { name: 'Deliver', done: false },
  ];

  return (
    <div className="w-full space-y-4">
      <span className="text-xs font-medium text-white block" style={{ fontFamily: 'var(--font-mono)' }}>Project Timeline</span>

      {/* Horizontal timeline */}
      <div className="flex items-center gap-1">
        {phases.map((p, i) => (
          <div key={p.name} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold mb-2"
                style={{
                  background: p.done ? accentColor : p.current ? accentDim : 'rgba(255,255,255,0.05)',
                  color: p.done ? 'var(--color-navy)' : p.current ? accentColor : 'var(--color-text-faint)',
                  border: p.current ? `2px solid ${accentColor}` : p.done ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {p.done ? (
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 8 7 12 13 4" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[10px] ${p.current ? 'font-medium' : ''}`} style={{ color: p.current ? accentColor : 'var(--color-text-faint)' }}>
                {p.name}
              </span>
            </div>
            {i < phases.length - 1 && (
              <div
                className="h-0.5 flex-1 -mt-5"
                style={{ background: p.done ? accentColor : 'var(--color-border)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current phase detail */}
      <div className="rounded-lg border p-3 space-y-2" style={{ background: accentDim, borderColor: accentBorder }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: accentColor }}>Create Phase</span>
          <span className="text-[10px] text-[var(--color-text-faint)]">2 of 4 tasks done</span>
        </div>
        <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
          <div className="h-full rounded-full w-1/2" style={{ background: accentColor }} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Invoicing Mockup (Creatives)                                    */
/* ════════════════════════════════════════════════════════════════ */

function InvoicingMockup() {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-white" style={{ fontFamily: 'var(--font-mono)' }}>Invoice #1042</span>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold" style={{ background: '#22c55e15', color: '#22c55e' }}>
          PAID
        </span>
      </div>

      {/* Line items */}
      <div className="rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
        {[
          { item: 'Brand Identity Design', amount: '$3,200' },
          { item: 'Logo Variations (5x)', amount: '$800' },
          { item: 'Style Guide Document', amount: '$500' },
        ].map((line) => (
          <div key={line.item} className="flex items-center justify-between px-3 py-2.5">
            <span className="text-[11px] text-[var(--color-text-secondary)]">{line.item}</span>
            <span className="text-[11px] text-white font-medium">{line.amount}</span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] px-3 py-3">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">Total</span>
        <span className="text-lg font-bold text-white">$4,500</span>
      </div>

      {/* Payment date */}
      <div className="text-center text-[10px] text-[var(--color-text-faint)]">
        Paid on Feb 14, 2025 &bull; Direct deposit
      </div>
    </div>
  );
}

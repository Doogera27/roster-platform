import { useState, useMemo } from 'react';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

type Approach = 'agency' | 'freelancers' | 'mix';

const TEAM_SIZES = [
  { label: '1–3 people', value: '1-3', recommended: 'Starter' },
  { label: '4–10 people', value: '4-10', recommended: 'Growth' },
  { label: '11–25 people', value: '11-25', recommended: 'Growth' },
  { label: '25+ people', value: '25+', recommended: 'Enterprise' },
];

const APPROACH_OPTIONS: { label: string; value: Approach; description: string }[] = [
  { label: 'Agency', value: 'agency', description: 'Traditional creative agency' },
  { label: 'In-House Freelancers', value: 'freelancers', description: 'Managing freelancers directly' },
  { label: 'Mix of Both', value: 'mix', description: 'Agency + some freelancers' },
];

function getTraditionalCosts(monthlySpend: number, approach: Approach) {
  switch (approach) {
    case 'agency':
      return {
        creativeCosts: monthlySpend,
        markup: monthlySpend * 0.25,
        markupPct: '25%',
        pmCost: 7500,
        sourcingHours: 10,
        adminHours: 20,
      };
    case 'freelancers':
      return {
        creativeCosts: monthlySpend,
        markup: 0,
        markupPct: '0%',
        pmCost: 5000,
        sourcingHours: 40,
        adminHours: 30,
      };
    case 'mix':
      return {
        creativeCosts: monthlySpend,
        markup: monthlySpend * 0.15,
        markupPct: '15%',
        pmCost: 6000,
        sourcingHours: 25,
        adminHours: 25,
      };
  }
}

function getRosterCosts(monthlySpend: number, teamSize: string) {
  let platformFee: number;
  let projectFeeRate: number;
  let plan: string;

  switch (teamSize) {
    case '1-3':
      platformFee = 99;
      projectFeeRate = 0.15;
      plan = 'Starter';
      break;
    case '4-10':
      platformFee = 299;
      projectFeeRate = 0.12;
      plan = 'Growth';
      break;
    case '11-25':
      platformFee = 299;
      projectFeeRate = 0.12;
      plan = 'Growth';
      break;
    default:
      platformFee = 799;
      projectFeeRate = 0.08;
      plan = 'Enterprise';
  }

  return {
    creativeCosts: monthlySpend,
    platformFee,
    projectFee: monthlySpend * projectFeeRate,
    projectFeeRate: `${projectFeeRate * 100}%`,
    sourcingHours: 5,
    adminHours: 2,
    plan,
  };
}

function formatCurrency(val: number) {
  if (val >= 1000) {
    return '$' + val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  return '$' + val.toFixed(0);
}

function AnimatedValue({ value, prefix = '$' }: { value: number; prefix?: string }) {
  const animated = useAnimatedCounter(Math.round(value), 800, true);
  return (
    <span>
      {prefix}{animated.toLocaleString('en-US')}
    </span>
  );
}

export function ROISavingsCalculator() {
  const [monthlySpend, setMonthlySpend] = useState(50000);
  const [teamSize, setTeamSize] = useState('4-10');
  const [approach, setApproach] = useState<Approach>('agency');

  const traditional = useMemo(() => getTraditionalCosts(monthlySpend, approach), [monthlySpend, approach]);
  const roster = useMemo(() => getRosterCosts(monthlySpend, teamSize), [monthlySpend, teamSize]);

  const traditionalTotal = traditional.creativeCosts + traditional.markup + traditional.pmCost;
  const rosterTotal = roster.creativeCosts + roster.platformFee + roster.projectFee;
  const monthlySavings = traditionalTotal - rosterTotal;
  const annualSavings = monthlySavings * 12;
  const hoursSaved = (traditional.sourcingHours + traditional.adminHours) - (roster.sourcingHours + roster.adminHours);

  const spendDisplay = monthlySpend >= 1000
    ? `$${(monthlySpend / 1000).toFixed(0)}K`
    : `$${monthlySpend}`;

  return (
    <div className="card p-8 md:p-10">
      <h3 className="text-heading text-2xl text-white mb-2">Calculate Your Savings</h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        See how much you could save by switching to Roster.
      </p>

      {/* Inputs */}
      <div className="space-y-6 mb-10">
        {/* Monthly spend slider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-label text-[var(--color-text-secondary)]">Monthly Creative Spend</label>
            <span className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
              {spendDisplay}
            </span>
          </div>
          <input
            type="range"
            min={5000}
            max={500000}
            step={5000}
            value={monthlySpend}
            onChange={(e) => setMonthlySpend(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-gold) 0%, var(--color-gold) ${((monthlySpend - 5000) / 495000) * 100}%, rgba(255,255,255,0.1) ${((monthlySpend - 5000) / 495000) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          <div className="flex justify-between text-[11px] text-[var(--color-text-faint)] mt-1">
            <span>$5K</span>
            <span>$500K</span>
          </div>
        </div>

        {/* Team size */}
        <div>
          <label className="text-label text-[var(--color-text-secondary)] mb-3 block">Team Size</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TEAM_SIZES.map((size) => (
              <button
                key={size.value}
                onClick={() => setTeamSize(size.value)}
                className={`px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all ${
                  teamSize === size.value
                    ? 'bg-[var(--color-gold-dim)] border border-[var(--color-gold-border)] text-[var(--color-gold)]'
                    : 'bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-mid)]'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-[var(--color-gold)] mt-2">
            Recommended plan: {TEAM_SIZES.find((s) => s.value === teamSize)?.recommended}
          </p>
        </div>

        {/* Current approach */}
        <div>
          <label className="text-label text-[var(--color-text-secondary)] mb-3 block">Current Approach</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {APPROACH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setApproach(opt.value)}
                className={`px-4 py-3 rounded-[var(--radius-md)] text-left transition-all ${
                  approach === opt.value
                    ? 'bg-[var(--color-gold-dim)] border border-[var(--color-gold-border)]'
                    : 'bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)] hover:border-[var(--color-border-mid)]'
                }`}
              >
                <div className={`text-sm font-medium ${approach === opt.value ? 'text-[var(--color-gold)]' : 'text-white'}`}>
                  {opt.label}
                </div>
                <div className="text-[11px] text-[var(--color-text-faint)] mt-0.5">{opt.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Without Roster */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 bg-[rgba(255,255,255,0.02)]">
          <div className="text-label text-[var(--color-danger)] mb-4">WITHOUT ROSTER</div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Creative costs</span>
              <span className="text-white">{formatCurrency(traditional.creativeCosts)}</span>
            </div>
            {traditional.markup > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Agency markup ({traditional.markupPct})</span>
                <span className="text-white">{formatCurrency(traditional.markup)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">PM / coordination</span>
              <span className="text-white">{formatCurrency(traditional.pmCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Sourcing time</span>
              <span className="text-white">{traditional.sourcingHours} hrs/mo</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Admin time</span>
              <span className="text-white">{traditional.adminHours} hrs/mo</span>
            </div>
            <div className="border-t border-[var(--color-border)] pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-white">Total</span>
                <span className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                  <AnimatedValue value={traditionalTotal} />
                  <span className="text-xs text-[var(--color-text-faint)]">/mo</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* With Roster */}
        <div className="rounded-[var(--radius-lg)] border-2 border-[rgba(201,168,76,0.3)] p-6 bg-[var(--color-gold-dim)]">
          <div className="text-label text-[var(--color-gold)] mb-4">WITH ROSTER</div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Creative costs</span>
              <span className="text-white">{formatCurrency(roster.creativeCosts)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Platform ({roster.plan})</span>
              <span className="text-white">{formatCurrency(roster.platformFee)}/mo</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Project fee ({roster.projectFeeRate})</span>
              <span className="text-white">{formatCurrency(roster.projectFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Sourcing time</span>
              <span className="text-[var(--color-teal)]">{roster.sourcingHours} hrs/mo</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Admin time</span>
              <span className="text-[var(--color-teal)]">{roster.adminHours} hrs/mo</span>
            </div>
            <div className="border-t border-[rgba(201,168,76,0.2)] pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-white">Total</span>
                <span className="text-lg font-semibold text-[var(--color-gold)]" style={{ fontFamily: 'var(--font-serif)' }}>
                  <AnimatedValue value={rosterTotal} />
                  <span className="text-xs text-[var(--color-text-faint)]">/mo</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Savings callout */}
      {monthlySavings > 0 && (
        <div className="rounded-[var(--radius-lg)] bg-[rgba(201,168,76,0.08)] border border-[var(--color-gold-border)] p-6 text-center">
          <div className="text-label text-[var(--color-gold)] mb-2">YOUR ESTIMATED SAVINGS</div>
          <div className="text-3xl md:text-4xl font-semibold text-[var(--color-gold)] mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
            <AnimatedValue value={monthlySavings} />/mo
          </div>
          <div className="text-lg text-white mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
            <AnimatedValue value={annualSavings} />/year
          </div>
          <div className="text-sm text-[var(--color-teal)]">
            Plus <strong>{hoursSaved} hours/month</strong> back for your team
          </div>
        </div>
      )}

      <p className="text-[11px] text-[var(--color-text-faint)] text-center mt-4">
        Estimates based on industry averages. Actual savings may vary based on your specific workflow and team structure.
      </p>
    </div>
  );
}

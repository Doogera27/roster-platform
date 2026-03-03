import { useState, useMemo } from 'react';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

function AnimatedValue({ value }: { value: number }) {
  const animated = useAnimatedCounter(Math.round(value), 800, true);
  return <span>${animated.toLocaleString('en-US')}</span>;
}

export function EarningsCalculator() {
  const [projectsPerMonth, setProjectsPerMonth] = useState(3);
  const [avgProjectValue, setAvgProjectValue] = useState(3000);

  const monthlyEarnings = useMemo(() => projectsPerMonth * avgProjectValue, [projectsPerMonth, avgProjectValue]);
  const annualEarnings = useMemo(() => monthlyEarnings * 12, [monthlyEarnings]);
  const membershipCost = 29 * 12; // monthly rate
  const annualMembershipCost = 199; // annual rate
  const netAnnualMonthly = annualEarnings - membershipCost;
  const netAnnualAnnual = annualEarnings - annualMembershipCost;

  const valueDisplay = avgProjectValue >= 1000
    ? `$${(avgProjectValue / 1000).toFixed(avgProjectValue % 1000 === 0 ? 0 : 1)}K`
    : `$${avgProjectValue}`;

  return (
    <div className="card p-8 md:p-10">
      <h3 className="text-heading text-2xl text-white mb-2">Estimate Your Earnings</h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        See what you could earn on Roster. You keep 100% of your project fees.
      </p>

      {/* Inputs */}
      <div className="space-y-6 mb-10">
        {/* Projects per month */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-label text-[var(--color-text-secondary)]">Projects Per Month</label>
            <span className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
              {projectsPerMonth}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={projectsPerMonth}
            onChange={(e) => setProjectsPerMonth(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-teal) 0%, var(--color-teal) ${((projectsPerMonth - 1) / 9) * 100}%, rgba(255,255,255,0.1) ${((projectsPerMonth - 1) / 9) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          <div className="flex justify-between text-[11px] text-[var(--color-text-faint)] mt-1">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        {/* Average project value */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-label text-[var(--color-text-secondary)]">Average Project Value</label>
            <span className="text-lg font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
              {valueDisplay}
            </span>
          </div>
          <input
            type="range"
            min={500}
            max={25000}
            step={500}
            value={avgProjectValue}
            onChange={(e) => setAvgProjectValue(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-teal) 0%, var(--color-teal) ${((avgProjectValue - 500) / 24500) * 100}%, rgba(255,255,255,0.1) ${((avgProjectValue - 500) / 24500) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
          <div className="flex justify-between text-[11px] text-[var(--color-text-faint)] mt-1">
            <span>$500</span>
            <span>$25K</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 text-center">
          <div className="text-label text-[var(--color-text-faint)] mb-2">MONTHLY EARNINGS</div>
          <div className="text-3xl font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
            <AnimatedValue value={monthlyEarnings} />
          </div>
        </div>
        <div className="rounded-[var(--radius-lg)] border-2 border-[rgba(46,196,182,0.3)] bg-[rgba(46,196,182,0.04)] p-6 text-center">
          <div className="text-label text-[var(--color-teal)] mb-2">ANNUAL EARNINGS</div>
          <div className="text-3xl font-semibold text-[var(--color-teal)]" style={{ fontFamily: 'var(--font-serif)' }}>
            <AnimatedValue value={annualEarnings} />
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] bg-[rgba(46,196,182,0.06)] border border-[var(--color-teal-border)] p-5">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-[var(--color-teal)] mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-[var(--color-text-secondary)]">
            <strong className="text-white">You keep 100% of your project fees.</strong>{' '}
            Your only cost is the Roster membership: $29/mo or $199/yr.
            Net annual earnings with annual membership: <strong className="text-[var(--color-teal)]">${netAnnualAnnual.toLocaleString('en-US')}</strong>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-[var(--color-text-faint)] text-center mt-4">
        Estimates based on your inputs. Actual earnings depend on project types, rates, and availability.
      </p>
    </div>
  );
}

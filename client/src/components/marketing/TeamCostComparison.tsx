import { useState, useMemo } from 'react';
import {
  CREATIVE_ROLES,
  BENEFITS_MULTIPLIER,
  ROSTER_PROJECT_FEE_RATE,
  ROSTER_PLATFORM_FEE,
  WEEKS_PER_MONTH,
  type CreativeRole,
} from '../../data/creativeRoleRates';

/* ─── Types ─── */
interface RoleConfig {
  role: CreativeRole;
  quantity: number;
  hoursPerWeek: number;
}

const HOURS_OPTIONS = [10, 20, 30, 40];

/* ─── Helpers ─── */
function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function calcInHouse(cfg: RoleConfig): number {
  return ((cfg.role.annualSalary * BENEFITS_MULTIPLIER) / 12) * cfg.quantity;
}

function calcAgency(cfg: RoleConfig): number {
  return cfg.role.agencyHourlyRate * cfg.hoursPerWeek * WEEKS_PER_MONTH * cfg.quantity;
}

function calcRosterBase(cfg: RoleConfig): number {
  return cfg.role.freelanceHourlyRate * cfg.hoursPerWeek * WEEKS_PER_MONTH * cfg.quantity;
}

/* ════════════════════════════════════════════════════════════════ */
/*  TeamCostComparison                                              */
/* ════════════════════════════════════════════════════════════════ */

export function TeamCostComparison() {
  const [selected, setSelected] = useState<RoleConfig[]>([]);

  /* ── Toggle role ── */
  function toggleRole(role: CreativeRole) {
    setSelected((prev) => {
      const exists = prev.find((r) => r.role.id === role.id);
      if (exists) return prev.filter((r) => r.role.id !== role.id);
      return [...prev, { role, quantity: 1, hoursPerWeek: 20 }];
    });
  }

  function updateConfig(roleId: string, patch: Partial<Pick<RoleConfig, 'quantity' | 'hoursPerWeek'>>) {
    setSelected((prev) =>
      prev.map((r) => (r.role.id === roleId ? { ...r, ...patch } : r)),
    );
  }

  /* ── Totals ── */
  const totals = useMemo(() => {
    if (selected.length === 0) return null;

    let inHouse = 0;
    let agency = 0;
    let rosterBase = 0;

    for (const cfg of selected) {
      inHouse += calcInHouse(cfg);
      agency += calcAgency(cfg);
      rosterBase += calcRosterBase(cfg);
    }

    const rosterFee = rosterBase * ROSTER_PROJECT_FEE_RATE;
    const roster = rosterBase + rosterFee + ROSTER_PLATFORM_FEE;

    const savingsVsAgency = agency - roster;
    const savingsVsInHouse = inHouse - roster;
    const bestSavings = Math.max(savingsVsAgency, savingsVsInHouse);
    const bestLabel = savingsVsAgency >= savingsVsInHouse ? 'vs. Agency' : 'vs. In-House';

    return { inHouse, agency, roster, rosterBase, rosterFee, savingsVsAgency, bestSavings, bestLabel };
  }, [selected]);

  return (
    <div className="space-y-8">
      {/* ── Role Selector ── */}
      <div>
        <div className="text-label text-[var(--color-gold)] mb-3">SELECT ROLES</div>
        <div className="flex flex-wrap gap-2">
          {CREATIVE_ROLES.map((role) => {
            const isActive = selected.some((r) => r.role.id === role.id);
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => toggleRole(role)}
                className={`${isActive ? 'chip-active' : ''} chip`}
              >
                {role.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Configuration per selected role ── */}
      {selected.length > 0 && (
        <div className="space-y-3">
          <div className="text-label text-[var(--color-gold)] mb-1">CONFIGURE TEAM</div>
          {selected.map((cfg) => (
            <div key={cfg.role.id} className="card-flat p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-white">{cfg.role.label}</span>
                <span className="text-xs text-[var(--color-text-faint)] ml-2">
                  {fmt(cfg.role.freelanceHourlyRate)}/hr avg
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">Qty</span>
                <div className="flex items-center rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateConfig(cfg.role.id, { quantity: Math.max(1, cfg.quantity - 1) })}
                    className="px-2.5 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  >
                    &minus;
                  </button>
                  <span className="px-3 py-1.5 text-sm text-white bg-[rgba(255,255,255,0.03)] min-w-[2rem] text-center">
                    {cfg.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateConfig(cfg.role.id, { quantity: Math.min(5, cfg.quantity + 1) })}
                    className="px-2.5 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Hours per week */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">Hrs/wk</span>
                <div className="flex rounded-[var(--radius-md)] border border-[var(--color-border)] overflow-hidden">
                  {HOURS_OPTIONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => updateConfig(cfg.role.id, { hoursPerWeek: h })}
                      className={`px-3 py-1.5 text-xs transition-colors ${
                        cfg.hoursPerWeek === h
                          ? 'bg-[var(--color-gold-dim)] text-[var(--color-gold)] font-medium'
                          : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Results ── */}
      {totals && (
        <div className="space-y-4">
          <div className="text-label text-[var(--color-gold)] mb-1">MONTHLY COST COMPARISON</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* In-House */}
            <div className="card-flat p-5">
              <div className="text-xs text-[var(--color-text-faint)] uppercase tracking-wide mb-1" style={{ fontFamily: 'var(--font-mono)' }}>In-House</div>
              <div className="text-2xl font-semibold text-white mb-1">{fmt(totals.inHouse)}</div>
              <div className="text-xs text-[var(--color-text-muted)]">/month &bull; Full salary + 30% benefits</div>
            </div>

            {/* Agency */}
            <div className="card-flat p-5">
              <div className="text-xs text-[var(--color-text-faint)] uppercase tracking-wide mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Agency</div>
              <div className="text-2xl font-semibold text-white mb-1">{fmt(totals.agency)}</div>
              <div className="text-xs text-[var(--color-text-muted)]">/month &bull; Agency hourly rates</div>
            </div>

            {/* Roster — highlighted */}
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-gold-border)] bg-[var(--color-gold-dim)] p-5">
              <div className="text-xs text-[var(--color-gold)] uppercase tracking-wide mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Roster</div>
              <div className="text-2xl font-semibold text-white mb-1">{fmt(totals.roster)}</div>
              <div className="text-xs text-[var(--color-text-muted)]">
                /month &bull; {fmt(totals.rosterBase)} talent + {fmt(totals.rosterFee)} fee + {fmt(ROSTER_PLATFORM_FEE)} platform
              </div>
            </div>
          </div>

          {/* Savings callout */}
          {totals.bestSavings > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-gold-border)] bg-[var(--color-gold-dim)] p-5 text-center">
              <div className="text-sm text-[var(--color-text-secondary)] mb-1">
                Estimated savings with Roster {totals.bestLabel}
              </div>
              <div className="text-3xl font-bold text-[var(--color-gold)]">
                {fmt(totals.bestSavings)}<span className="text-base font-normal text-[var(--color-text-muted)]">/mo</span>
              </div>
              <div className="text-sm text-[var(--color-gold)] mt-1">
                That&rsquo;s <strong>{fmt(totals.bestSavings * 12)}</strong> per year
              </div>
            </div>
          )}

          {/* Source note */}
          <p className="text-[11px] text-[var(--color-text-faint)] text-center leading-relaxed">
            Market rates sourced from Glassdoor, ZipRecruiter, and industry surveys (2024&ndash;2025 US averages).
            In-house includes 30% benefits overhead. Actual costs may vary by market and experience level.
          </p>
        </div>
      )}

      {/* Empty state */}
      {selected.length === 0 && (
        <div className="card-flat p-8 text-center">
          <p className="text-[var(--color-text-muted)]">
            Select one or more roles above to see how Roster compares to hiring in-house or using an agency.
          </p>
        </div>
      )}
    </div>
  );
}

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useRosterBuilder } from '../store/rosterBuilder';
import { clsx } from 'clsx';

const avatarColors = [
  { bg: '#2E4A6B', text: '#72D9D2' },
  { bg: '#3D2E5C', text: '#C9A84C' },
  { bg: '#2A3E2E', text: '#7DD9A0' },
  { bg: '#4A2E2E', text: '#E8C97A' },
  { bg: '#2E3D4A', text: '#60A5FA' },
];

function getAvatarColor(name: string) {
  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

const availabilityMap: Record<string, { label: string; badge: string }> = {
  AVAILABLE: { label: 'Available now', badge: 'badge-success' },
  LIMITED: { label: 'Limited availability', badge: 'badge-warning' },
  UNAVAILABLE: { label: 'Unavailable', badge: 'badge-danger' },
};

export function CreativeProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['creative', id],
    queryFn: () => api.get(`/creatives/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center gap-5 mb-8">
          <div className="skeleton w-20 h-20 rounded-xl" />
          <div>
            <div className="skeleton h-6 w-48 mb-2" />
            <div className="skeleton h-4 w-32" />
          </div>
        </div>
        <div className="skeleton h-4 w-full mb-3" />
        <div className="skeleton h-4 w-3/4" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-[var(--color-text-muted)]">Creative not found.</p>
        <Link to="/creatives" className="text-xs text-[var(--color-gold)] hover:underline mt-2 inline-block">Back to Creatives</Link>
      </div>
    );
  }

  const avail = availabilityMap[data.availability_status] || availabilityMap.UNAVAILABLE;
  const ac = getAvatarColor(`${data.first_name}${data.last_name}`);

  return (
    <div className="max-w-4xl">
      {/* Back */}
      <Link to="/creatives" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-faint)] hover:text-[var(--color-gold)] mb-6 transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3l-4 4 4 4" /></svg>
        All Creatives
      </Link>

      {/* Profile header */}
      <div className="card-flat p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="shrink-0">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ background: ac.bg, color: ac.text }}>
              {data.first_name?.[0]}{data.last_name?.[0]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-heading text-2xl text-white">{data.first_name} {data.last_name}</h1>
              {data.is_charter_member && <span className="badge badge-accent">Charter</span>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)] mb-4">
              <span className="text-mono text-[12px]">{data.tier}</span>
              <span className="text-[var(--color-border-mid)]">&bull;</span>
              <span>{data.experience_level}</span>
              <span className="text-[var(--color-border-mid)]">&bull;</span>
              <span className={`badge ${avail.badge}`}>{avail.label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.disciplines || []).map((d: string) => (
                <span key={d} className="chip">{d}</span>
              ))}
            </div>
          </div>
          <div className="shrink-0"><AddToRosterButton data={data} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card-flat p-6">
            <h2 className="text-label mb-3">About</h2>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{data.bio || 'No bio provided.'}</p>
          </section>

          {data.portfolio && data.portfolio.length > 0 && (
            <section className="card-flat p-6">
              <h2 className="text-label mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 gap-3">
                {data.portfolio.map((item: any) => (
                  <div key={item.id} className="rounded-xl bg-[var(--color-navy-light)] aspect-[4/3] flex items-center justify-center overflow-hidden border border-[var(--color-border)]">
                    <div className="text-center p-4">
                      <svg className="mx-auto mb-2 text-[var(--color-text-faint)]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="1.5" /><path d="M21 15l-5-5L6 21" />
                      </svg>
                      <div className="text-xs font-medium text-[var(--color-text-muted)] truncate">{item.filename}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card-flat p-6">
            <h2 className="text-label mb-4">Rates &amp; Terms</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-[var(--color-text-muted)]">Day rate</span>
                <span className="text-mono text-xl font-medium text-[var(--color-gold)]">
                  ${data.day_rate_cents ? (data.day_rate_cents / 100).toFixed(0) : '—'}
                </span>
              </div>
              <div className="border-t border-[var(--color-border)]" />
              <div className="flex justify-between items-baseline">
                <span className="text-sm text-[var(--color-text-muted)]">Rush rate</span>
                <span className="text-mono text-sm text-white">{data.rush_multiplier || '1.5'}x</span>
              </div>
              <div className="border-t border-[var(--color-border)]" />
              <div>
                <span className="text-sm text-[var(--color-text-muted)]">Revision policy</span>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">{data.revision_policy || 'Standard — 2 rounds included'}</p>
              </div>
            </div>
          </section>

          <section className="card-flat p-6">
            <h2 className="text-label mb-4">Track Record</h2>
            <div className="text-center mb-4">
              <div className="text-display text-3xl text-white">{data.projects_completed || 0}</div>
              <div className="text-mono text-[10px] text-[var(--color-text-faint)] mt-1">PROJECTS COMPLETED</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--color-navy-light)] rounded-xl p-3 text-center border border-[var(--color-border)]">
                <div className="text-lg font-bold text-white">{data.average_rating ? Number(data.average_rating).toFixed(1) : '—'}</div>
                <div className="text-mono text-[10px] text-[var(--color-text-faint)]">AVG RATING</div>
              </div>
              <div className="bg-[var(--color-navy-light)] rounded-xl p-3 text-center border border-[var(--color-border)]">
                <div className="text-lg font-bold text-white">{data.on_time_percentage ? `${data.on_time_percentage}%` : '—'}</div>
                <div className="text-mono text-[10px] text-[var(--color-text-faint)]">ON TIME</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AddToRosterButton({ data }: { data: any }) {
  const { addMember, removeMember, hasMember } = useRosterBuilder();
  const isInRoster = hasMember(data.id);

  const handleToggle = () => {
    if (isInRoster) {
      removeMember(data.id);
    } else {
      addMember({
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        tier: data.tier,
        day_rate_cents: data.day_rate_cents,
        disciplines: data.disciplines,
        availability_status: data.availability_status,
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={clsx(
        'inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] text-sm font-semibold transition-all duration-200',
        isInRoster
          ? 'bg-[var(--color-gold-dim)] text-[var(--color-gold)] border border-[var(--color-gold-border)]'
          : 'bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-hover)] text-[var(--color-navy)] hover:shadow-[0_8px_24px_var(--color-gold-glow)] hover:-translate-y-0.5',
      )}
    >
      {isInRoster ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7l3.5 3.5 5.5-6" />
          </svg>
          In Roster
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 2v10M2 7h10" />
          </svg>
          Add to Roster
        </>
      )}
    </button>
  );
}

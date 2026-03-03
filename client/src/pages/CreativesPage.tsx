import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { useRosterBuilder } from '../store/rosterBuilder';
import { useDevUser } from '../store/devUser';

// ── Constants ──────────────────────────────────────────────

const disciplines = [
  'All',
  'Design',
  'Copywriting',
  'Strategy',
  'Photography',
  'Motion',
  'UX',
  'Development',
  'Illustration',
  'Art Direction',
];

const experienceLevels = [
  { value: '', label: 'Any Level' },
  { value: 'JUNIOR', label: 'Junior' },
  { value: 'MID', label: 'Mid' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'EXPERT', label: 'Expert' },
];

const tiers = [
  { value: '', label: 'Any Tier' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'PRO', label: 'Pro' },
  { value: 'ELITE', label: 'Elite' },
];

const availabilityOptions = [
  { value: '', label: 'Any' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'LIMITED', label: 'Limited' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
];

const sortOptions = [
  { value: 'default', label: 'Relevance' },
  { value: 'rate_low', label: 'Rate: Low → High' },
  { value: 'rate_high', label: 'Rate: High → Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const avatarColors = [
  { bg: '#2E4A6B', text: '#72D9D2' },
  { bg: '#3D2E5C', text: '#C9A84C' },
  { bg: '#2A3E2E', text: '#7DD9A0' },
  { bg: '#4A2E2E', text: '#E8C97A' },
  { bg: '#2E3D4A', text: '#60A5FA' },
  { bg: '#3E3E2E', text: '#D4A574' },
];

function getAvatarColor(name: string) {
  const hash = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

const availabilityMap: Record<string, { label: string; badge: string }> = {
  AVAILABLE: { label: 'Available', badge: 'badge-success' },
  LIMITED: { label: 'Limited', badge: 'badge-warning' },
  UNAVAILABLE: { label: 'Unavailable', badge: 'badge-danger' },
};

const tierBadgeMap: Record<string, string> = {
  ELITE: 'bg-[rgba(201,168,76,0.15)] text-[var(--color-gold)] border-[var(--color-gold-border)]',
  PRO: 'bg-[rgba(46,196,182,0.12)] text-[var(--color-teal)] border-[rgba(46,196,182,0.3)]',
  MEMBER: 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] border-[var(--color-border)]',
};

// ── Main Page ──────────────────────────────────────────────

type ViewTab = 'browse' | 'favorites';

export function CreativesPage() {
  const user = useDevUser((s) => s.currentUser);
  const isClient = user?.role === 'CLIENT';

  const [tab, setTab] = useState<ViewTab>('browse');
  const [search, setSearch] = useState('');
  const [activeDiscipline, setActiveDiscipline] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filters
  const [experienceLevel, setExperienceLevel] = useState('');
  const [tier, setTier] = useState('');
  const [availability, setAvailability] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (experienceLevel) count++;
    if (tier) count++;
    if (availability) count++;
    if (minRate) count++;
    if (maxRate) count++;
    return count;
  }, [experienceLevel, tier, availability, minRate, maxRate]);

  const clearFilters = useCallback(() => {
    setExperienceLevel('');
    setTier('');
    setAvailability('');
    setMinRate('');
    setMaxRate('');
    setSortBy('default');
    setSearch('');
    setActiveDiscipline('All');
  }, []);

  // Browse query
  const { data, isLoading } = useQuery({
    queryKey: ['creatives', search, activeDiscipline, experienceLevel, tier, availability, minRate, maxRate],
    queryFn: () =>
      api.get('/creatives', {
        params: {
          q: search || undefined,
          disciplines: activeDiscipline !== 'All' ? activeDiscipline : undefined,
          experience_level: experienceLevel || undefined,
          tier: tier || undefined,
          availability: availability || undefined,
          min_day_rate: minRate ? Number(minRate) * 100 : undefined,
          max_day_rate: maxRate ? Number(maxRate) * 100 : undefined,
          limit: 50,
        },
      }).then((r) => r.data),
    enabled: tab === 'browse',
  });

  // Favorites query (CLIENT only)
  const { data: favData, isLoading: favLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get('/creatives/favorites').then((r) => r.data),
    enabled: tab === 'favorites' && isClient,
  });

  let creatives = (tab === 'browse' ? data?.data : favData?.data) || [];

  // Client-side sort
  if (sortBy === 'rate_low') {
    creatives = [...creatives].sort((a: any, b: any) => (a.day_rate_cents || 0) - (b.day_rate_cents || 0));
  } else if (sortBy === 'rate_high') {
    creatives = [...creatives].sort((a: any, b: any) => (b.day_rate_cents || 0) - (a.day_rate_cents || 0));
  } else if (sortBy === 'rating') {
    creatives = [...creatives].sort((a: any, b: any) => (b.average_rating || 0) - (a.average_rating || 0));
  }

  const loading = tab === 'browse' ? isLoading : favLoading;

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
        <div className="relative">
          <h1 className="text-display text-4xl text-white mb-2">
            Find <em>Talent</em>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Browse vetted creative professionals for your next project.
          </p>
        </div>
      </div>

      {/* Tabs (Browse / Favorites) */}
      {isClient && (
        <div className="flex gap-1 mb-5 p-1 bg-[var(--color-navy-light)] rounded-lg w-fit border border-[var(--color-border)]">
          <button
            onClick={() => setTab('browse')}
            className={clsx(
              'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
              tab === 'browse'
                ? 'bg-[var(--color-navy-mid)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-white',
            )}
          >
            Browse
          </button>
          <button
            onClick={() => setTab('favorites')}
            className={clsx(
              'px-4 py-1.5 rounded-md text-xs font-medium transition-all',
              tab === 'favorites'
                ? 'bg-[var(--color-navy-mid)] text-white shadow-sm'
                : 'text-[var(--color-text-muted)] hover:text-white',
            )}
          >
            ♥ Saved
          </button>
        </div>
      )}

      {/* Search + Filter bar */}
      {tab === 'browse' && (
        <>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="7" r="5" />
                <path d="M14.5 14.5l-3.5-3.5" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, skill, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-11"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={clsx(
                'px-4 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2',
                showFilters || activeFilterCount > 0
                  ? 'bg-[var(--color-gold-dim)] text-[var(--color-gold)] border-[var(--color-gold-border)]'
                  : 'bg-[var(--color-navy-light)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-gold-border)] hover:text-[var(--color-gold)]',
              )}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M1 3h12M3 7h8M5 11h4" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input w-44 text-xs"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="card-flat p-5 mb-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-label mb-1.5 block">Experience Level</label>
                <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="input text-xs w-full">
                  {experienceLevels.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-label mb-1.5 block">Tier</label>
                <select value={tier} onChange={(e) => setTier(e.target.value)} className="input text-xs w-full">
                  {tiers.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-label mb-1.5 block">Availability</label>
                <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="input text-xs w-full">
                  {availabilityOptions.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-label mb-1.5 block">Rate ($/day)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                    className="input text-xs w-full"
                    min="0"
                  />
                  <span className="text-[var(--color-text-faint)] text-xs">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                    className="input text-xs w-full"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="text-xs text-[var(--color-text-faint)] hover:text-[var(--color-gold)] transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          {/* Discipline chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {disciplines.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDiscipline(d)}
                className={clsx('chip', activeDiscipline === d && 'chip-active')}
              >
                {d}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Results count */}
      <div className="text-label mb-4 flex items-center justify-between">
        <span>{loading ? 'Loading...' : `${creatives.length} creative${creatives.length !== 1 ? 's' : ''}`}</span>
        {tab === 'browse' && activeFilterCount > 0 && (
          <span className="text-[10px] text-[var(--color-gold)]">{activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active</span>
        )}
      </div>

      {/* Results grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card-flat p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="skeleton w-[52px] h-[52px] rounded-xl" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-28 mb-2" />
                  <div className="skeleton h-3 w-20" />
                </div>
              </div>
              <div className="skeleton h-3 w-full mb-2" />
              <div className="skeleton h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : creatives.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-xl bg-[var(--color-navy-light)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 22c0-4.5 3.5-7 8-7s8 2.5 8 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            {tab === 'favorites' ? 'No saved creatives yet' : 'No creatives found'}
          </p>
          <p className="text-xs text-[var(--color-text-faint)]">
            {tab === 'favorites'
              ? 'Save creatives from the Browse tab to build your shortlist.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {creatives.map((c: any) => (
            <CreativeCard key={c.id} creative={c} isFavView={tab === 'favorites'} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Card Component ─────────────────────────────────────────

function CreativeCard({ creative: c, isFavView }: { creative: any; isFavView: boolean }) {
  const avail = availabilityMap[c.availability_status] || availabilityMap.UNAVAILABLE;
  const ac = getAvatarColor(`${c.first_name}${c.last_name}`);
  const { addMember, removeMember, hasMember } = useRosterBuilder();
  const isInRoster = hasMember(c.id);
  const user = useDevUser((s) => s.currentUser);
  const isClient = user?.role === 'CLIENT';
  const queryClient = useQueryClient();

  const favMutation = useMutation({
    mutationFn: () => api.post(`/creatives/${c.id}/favorite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const unfavMutation = useMutation({
    mutationFn: () => api.delete(`/creatives/${c.id}/favorite`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const handleRosterToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInRoster) {
      removeMember(c.id);
    } else {
      addMember({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        tier: c.tier,
        day_rate_cents: c.day_rate_cents,
        disciplines: c.disciplines,
        availability_status: c.availability_status,
      });
    }
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavView) {
      unfavMutation.mutate();
    } else {
      favMutation.mutate();
    }
  };

  const tbm = tierBadgeMap[c.tier] || tierBadgeMap.MEMBER;

  return (
    <Link to={`/creatives/${c.id}`} className="card group p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="relative shrink-0">
          <div
            className="w-[52px] h-[52px] rounded-xl flex items-center justify-center text-base font-semibold"
            style={{ background: ac.bg, color: ac.text }}
          >
            {c.first_name?.[0]}{c.last_name?.[0]}
          </div>
          {c.availability_status === 'AVAILABLE' && (
            <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-[var(--color-teal)] border-2 border-[var(--color-navy-mid)] flex items-center justify-center">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="var(--color-navy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 4l2 2 3-3.5" />
              </svg>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white group-hover:text-[var(--color-gold)] transition-colors truncate" style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 600 }}>
            {c.first_name} {c.last_name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {c.is_charter_member && (
              <span className="badge badge-accent text-[9px]">Charter</span>
            )}
            <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-semibold border', tbm)}>
              {c.tier}
            </span>
            {c.experience_level && (
              <span className="text-mono text-[10px] text-[var(--color-text-faint)]">{c.experience_level}</span>
            )}
          </div>
        </div>
      </div>

      {/* Rating */}
      {c.average_rating > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-[var(--color-gold)] text-xs">★</span>
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">{Number(c.average_rating).toFixed(1)}</span>
          {c.projects_completed > 0 && (
            <span className="text-[10px] text-[var(--color-text-faint)]">· {c.projects_completed} project{c.projects_completed !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}

      {/* Bio */}
      <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 mb-3 leading-relaxed">
        {c.bio || 'Creative professional available for projects.'}
      </p>

      {/* Disciplines */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(c.disciplines || []).slice(0, 3).map((d: string) => (
          <span key={d} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
            {d}
          </span>
        ))}
        {(c.disciplines || []).length > 3 && (
          <span className="text-[10px] text-[var(--color-text-faint)]">+{c.disciplines.length - 3}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
        <span className="text-mono text-[13px] font-medium text-white">
          ${c.day_rate_cents ? (c.day_rate_cents / 100).toFixed(0) : '—'}<span className="text-[var(--color-text-faint)] text-[11px]">/day</span>
        </span>
        <div className="flex items-center gap-2">
          {/* Favorite button */}
          {isClient && (
            <button
              onClick={handleFavorite}
              className={clsx(
                'w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all',
                isFavView
                  ? 'text-red-400 hover:bg-red-400/10'
                  : 'text-[var(--color-text-faint)] opacity-0 group-hover:opacity-100 hover:text-red-400',
              )}
              title={isFavView ? 'Remove from saved' : 'Save'}
            >
              {isFavView ? '♥' : '♡'}
            </button>
          )}
          <button
            onClick={handleRosterToggle}
            className={clsx(
              'px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all duration-200',
              isInRoster
                ? 'bg-[var(--color-gold-dim)] text-[var(--color-gold)] border border-[var(--color-gold-border)]'
                : 'bg-[rgba(255,255,255,0.05)] text-[var(--color-text-faint)] border border-[var(--color-border)] opacity-0 group-hover:opacity-100 hover:border-[var(--color-gold-border)] hover:text-[var(--color-gold)]',
            )}
          >
            {isInRoster ? '✓ Added' : '+ Roster'}
          </button>
          <span className={`badge ${avail.badge}`}>{avail.label}</span>
        </div>
      </div>
    </Link>
  );
}

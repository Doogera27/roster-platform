import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

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

export function RosterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['roster', id],
    queryFn: () => api.get(`/rosters/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });

  const saveMutation = useMutation({
    mutationFn: () => api.patch(`/rosters/${id}/save`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roster', id] }),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => api.delete(`/rosters/${id}/members/${memberId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roster', id] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl">
        <div className="skeleton h-7 w-48 mb-2" />
        <div className="skeleton h-4 w-32 mb-8" />
        <div className="skeleton h-24 w-full mb-6 rounded-xl" />
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 w-full rounded-xl mb-3" />)}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-[var(--color-text-muted)]">Roster not found.</p>
        <Link to="/rosters" className="text-xs text-[var(--color-gold)] hover:underline mt-2 inline-block">Back to Rosters</Link>
      </div>
    );
  }

  const { members = [], cost_estimate } = data;
  const primaryMembers = members.filter((m: any) => !m.is_backup);
  const backupMembers = members.filter((m: any) => m.is_backup);

  return (
    <div className="max-w-4xl">
      <Link to="/rosters" className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-faint)] hover:text-[var(--color-gold)] mb-6 transition-colors">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3l-4 4 4 4" /></svg>
        All Rosters
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-heading text-2xl text-white mb-1">{data.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-mono text-[11px] text-[var(--color-text-faint)]">{primaryMembers.length} members</span>
            {backupMembers.length > 0 && <span className="text-mono text-[11px] text-[var(--color-text-faint)]">+ {backupMembers.length} backup</span>}
            {data.is_saved && <span className="badge badge-success text-[9px]">Saved</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/creatives" className="btn-secondary">Add Members</Link>
          {!data.is_saved && <button onClick={() => saveMutation.mutate()} className="btn-accent">Save Roster</button>}
        </div>
      </div>

      {/* Cost summary */}
      {cost_estimate && (
        <div className="card-flat p-5 mb-6">
          <div className="flex items-center gap-8">
            <div>
              <div className="text-mono text-[11px] text-[var(--color-text-faint)] mb-1">EST. DAY RATE</div>
              <div className="text-display text-xl text-[var(--color-gold)]">${(cost_estimate.total_day_rate_cents / 100).toLocaleString()}</div>
            </div>
            <div className="w-px h-10 bg-[var(--color-border)]" />
            <div>
              <div className="text-mono text-[11px] text-[var(--color-text-faint)] mb-1">TEAM SIZE</div>
              <div className="text-display text-xl text-white">{cost_estimate.primary_member_count}</div>
            </div>
            <div className="w-px h-10 bg-[var(--color-border)]" />
            <div>
              <div className="text-mono text-[11px] text-[var(--color-text-faint)] mb-1">WEEKLY EST.</div>
              <div className="text-display text-xl text-white">${((cost_estimate.total_day_rate_cents / 100) * 5).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-label mb-3">Team Members</h2>
        {primaryMembers.length === 0 ? (
          <div className="card-flat p-8 text-center">
            <p className="text-sm text-[var(--color-text-muted)] mb-1">No members yet.</p>
            <p className="text-xs text-[var(--color-text-faint)]">Browse creatives to add talent.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {primaryMembers.map((m: any) => <MemberRow key={m.membership_id} member={m} onRemove={() => removeMemberMutation.mutate(m.membership_id)} />)}
          </div>
        )}
      </section>

      {backupMembers.length > 0 && (
        <section>
          <h2 className="text-label mb-3">Backup Creatives</h2>
          <div className="space-y-2">
            {backupMembers.map((m: any) => <MemberRow key={m.membership_id} member={m} onRemove={() => removeMemberMutation.mutate(m.membership_id)} backup />)}
          </div>
        </section>
      )}
    </div>
  );
}

function MemberRow({ member, onRemove, backup }: { member: any; onRemove: () => void; backup?: boolean }) {
  const ac = getAvatarColor(`${member.first_name}${member.last_name}`);
  return (
    <div className="card-flat p-4 flex items-center justify-between group roster-member-enter">
      <div className="flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-sm font-semibold" style={{ background: ac.bg, color: ac.text }}>
          {member.first_name?.[0]}{member.last_name?.[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{member.first_name} {member.last_name}</span>
            {backup && <span className="badge badge-neutral text-[9px]">Backup</span>}
            <span className="text-mono text-[10px] text-[var(--color-text-faint)]">{member.tier}</span>
          </div>
          <div className="flex items-center gap-3 text-mono text-[11px] text-[var(--color-text-faint)] mt-0.5">
            <span>{member.role_label}</span>
            <span className="text-[var(--color-border-mid)]">&bull;</span>
            <span className="text-[var(--color-gold)]">${(member.day_rate_cents / 100).toFixed(0)}/day</span>
          </div>
        </div>
      </div>
      <button onClick={(e) => { e.preventDefault(); onRemove(); }} className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded flex items-center justify-center text-[var(--color-text-faint)] hover:bg-[var(--color-danger-dim)] hover:text-[var(--color-danger)]">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3l6 6M9 3l-6 6" /></svg>
      </button>
    </div>
  );
}

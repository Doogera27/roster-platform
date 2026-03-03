import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useRosterBuilder, type RosterMember } from '../store/rosterBuilder';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

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

export function RosterPanel() {
  const { isOpen, close, members, removeMember, rosterName, setRosterName, clearAll, totalDayRate } =
    useRosterBuilder();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const createMutation = useMutation({
    mutationFn: async () => {
      setSaving(true);
      // Create the roster
      const res = await api.post('/rosters', { name: rosterName || 'Untitled Roster' });
      const roster = res.data.data;
      // Add each member
      for (const m of members) {
        await api.post(`/rosters/${roster.id}/members`, {
          creative_id: m.id,
          is_backup: false,
        });
      }
      return roster;
    },
    onSuccess: (roster: any) => {
      queryClient.invalidateQueries({ queryKey: ['rosters'] });
      clearAll();
      close();
      setSaving(false);
      navigate(`/rosters/${roster.id}`);
    },
    onError: () => setSaving(false),
  });

  if (!isOpen) return null;

  const total = totalDayRate();

  return (
    <>
      {/* Backdrop for mobile */}
      <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={close} />

      {/* Panel */}
      <div className="fixed top-16 right-0 bottom-0 w-[340px] z-50 bg-[var(--color-navy)] border-l border-[var(--color-border)] flex flex-col shadow-2xl"
        style={{ animation: 'slideInPanel 0.3s ease' }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-heading text-lg text-white">Roster Builder</h3>
            <button
              onClick={close}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-faint)] hover:bg-[rgba(255,255,255,0.06)] hover:text-white transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3l8 8M11 3l-8 8" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            placeholder="Roster name (e.g. Q1 Brand Campaign)"
            value={rosterName}
            onChange={(e) => setRosterName(e.target.value)}
            className="input text-sm"
          />
        </div>

        {/* Member list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-xl bg-[var(--color-navy-mid)] border border-dashed border-[var(--color-border-mid)] flex items-center justify-center mx-auto mb-4">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="7" r="3" />
                  <path d="M2 19c0-3.5 2.5-5.5 6-5.5" />
                  <path d="M16 11v6M13 14h6" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">No members yet</p>
              <p className="text-xs text-[var(--color-text-faint)] max-w-[200px] mx-auto">
                Click "Add to Roster" on creative profiles to start building your team.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-label mb-3">
                {members.length} member{members.length !== 1 ? 's' : ''}
              </div>
              {members.map((m) => (
                <PanelMemberRow key={m.id} member={m} onRemove={() => removeMember(m.id)} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {members.length > 0 && (
          <div className="px-5 py-4 border-t border-[var(--color-border)] bg-[var(--color-navy-mid)]">
            {/* Cost estimate */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-mono text-[10px] text-[var(--color-text-faint)] mb-0.5">EST. DAY RATE</div>
                <div className="text-display text-lg text-[var(--color-gold)]">
                  ${(total / 100).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-mono text-[10px] text-[var(--color-text-faint)] mb-0.5">WEEKLY EST.</div>
                <div className="text-mono text-sm text-white">
                  ${((total / 100) * 5).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => createMutation.mutate()}
                disabled={saving}
                className="btn-accent flex-1 text-sm"
              >
                {saving ? 'Creating...' : 'Save Roster'}
              </button>
              <button
                onClick={clearAll}
                className="btn-ghost text-xs text-[var(--color-text-faint)]"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function PanelMemberRow({ member: m, onRemove }: { member: RosterMember; onRemove: () => void }) {
  const ac = getAvatarColor(`${m.first_name}${m.last_name}`);

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-navy-mid)] border border-[var(--color-border)] group roster-member-enter">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0"
          style={{ background: ac.bg, color: ac.text }}
        >
          {m.first_name?.[0]}{m.last_name?.[0]}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate">{m.first_name} {m.last_name}</div>
          <div className="flex items-center gap-2 text-mono text-[10px] text-[var(--color-text-faint)]">
            <span>{m.tier}</span>
            {m.day_rate_cents && (
              <>
                <span className="text-[var(--color-border-mid)]">&bull;</span>
                <span className="text-[var(--color-gold)]">${(m.day_rate_cents / 100).toFixed(0)}/day</span>
              </>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded flex items-center justify-center text-[var(--color-text-faint)] hover:bg-[var(--color-danger-dim)] hover:text-[var(--color-danger)] shrink-0"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M2 2l6 6M8 2l-6 6" />
        </svg>
      </button>
    </div>
  );
}

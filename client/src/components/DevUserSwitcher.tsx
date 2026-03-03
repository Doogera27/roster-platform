import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useDevUser, type DevUser } from '../store/devUser';

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  CLIENT: { label: 'Client', color: 'var(--color-gold)', bg: 'var(--color-gold-dim)' },
  PM: { label: 'Project Manager', color: 'var(--color-teal)', bg: 'var(--color-teal-dim)' },
  CREATIVE: { label: 'Creative', color: '#C084FC', bg: 'rgba(192, 132, 252, 0.1)' },
};

export function DevUserSwitcher() {
  const { currentUser, allUsers, setCurrentUser, setAllUsers } = useDevUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch all dev users on mount
  useEffect(() => {
    api.get('/dev/users').then((res) => {
      const users: DevUser[] = res.data.data;
      setAllUsers(users);
      // Auto-select first user if none selected
      if (!currentUser && users.length > 0) {
        setCurrentUser(users[0]);
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const switchUser = (user: DevUser) => {
    setCurrentUser(user);
    setOpen(false);
    // Invalidate all queries so they refetch with new user context
    queryClient.invalidateQueries();
  };

  if (!currentUser) return null;

  const rc = roleConfig[currentUser.role] || roleConfig.CLIENT;

  // Group users by role
  const grouped: Record<string, DevUser[]> = {};
  for (const u of allUsers) {
    (grouped[u.role] = grouped[u.role] || []).push(u);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-all"
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
          style={{ background: rc.bg, color: rc.color }}
        >
          {currentUser.first_name[0]}{currentUser.last_name[0]}
        </div>
        {/* Name + role */}
        <div className="text-left hidden sm:block">
          <div className="text-xs font-medium text-white leading-none">
            {currentUser.first_name} {currentUser.last_name}
          </div>
          <div className="text-[10px] font-medium mt-0.5" style={{ color: rc.color, fontFamily: 'var(--font-mono)' }}>
            {rc.label}
          </div>
        </div>
        {/* Chevron */}
        <svg
          className="text-[var(--color-text-faint)]"
          width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[300px] bg-[var(--color-navy-mid)] border border-[var(--color-border-mid)] rounded-xl shadow-2xl overflow-hidden z-[999]"
          style={{ animation: 'fadeIn 0.15s ease' }}
        >
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <div className="text-mono text-[10px] text-[var(--color-text-faint)] font-medium">SWITCH PERSONA</div>
          </div>
          <div className="max-h-[400px] overflow-y-auto py-1">
            {(['CLIENT', 'PM', 'CREATIVE'] as const).map((role) => {
              const users = grouped[role];
              if (!users?.length) return null;
              const config = roleConfig[role];
              return (
                <div key={role}>
                  <div className="px-4 py-1.5">
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: config.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
                    >
                      {config.label.toUpperCase()}
                    </span>
                  </div>
                  {users.map((u) => {
                    const isActive = u.id === currentUser.id;
                    const urc = roleConfig[u.role];
                    return (
                      <button
                        key={u.id}
                        onClick={() => switchUser(u)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[rgba(255,255,255,0.05)] transition-colors text-left"
                        style={isActive ? { background: 'rgba(255,255,255,0.06)' } : undefined}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{ background: urc.bg, color: urc.color }}
                        >
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">
                            {u.first_name} {u.last_name}
                            {isActive && (
                              <span className="ml-2 text-[10px] text-[var(--color-teal)]">active</span>
                            )}
                          </div>
                          <div className="text-mono text-[10px] text-[var(--color-text-faint)] truncate">
                            {u.email}
                          </div>
                        </div>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: urc.color }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2.5 border-t border-[var(--color-border)] bg-[rgba(0,0,0,0.15)]">
            <div className="text-mono text-[9px] text-[var(--color-text-faint)]">
              DEV MODE — Switching personas refetches all data with the selected user context.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

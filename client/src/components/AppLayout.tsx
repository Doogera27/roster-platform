import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { clsx } from 'clsx';
import { isAuth0Configured } from '../config';
import { useRosterBuilder } from '../store/rosterBuilder';
import { useDevUser } from '../store/devUser';
import { RosterPanel } from './RosterPanel';
import { DevUserSwitcher } from './DevUserSwitcher';
import { NotificationBell } from './NotificationBell';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', exact: true },
  { path: '/creatives', label: 'Find Talent' },
  { path: '/rosters', label: 'Rosters' },
  { path: '/projects', label: 'Projects' },
  { path: '/messages', label: 'Messages' },
  { path: '/vault', label: 'Brand Vault' },
];

function Auth0UserMenu() {
  const { user, logout } = useAuth0();
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[var(--color-text-muted)]">{user?.email}</span>
      <button
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        className="btn-ghost text-xs"
      >
        Sign out
      </button>
    </div>
  );
}

const UserMenu = isAuth0Configured ? Auth0UserMenu : DevUserSwitcher;

function RosterBuilderToggle() {
  const { isOpen, toggle, members } = useRosterBuilder();

  return (
    <button
      onClick={toggle}
      className={clsx(
        'relative flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200',
        isOpen
          ? 'bg-[var(--color-gold-dim)] text-[var(--color-gold)]'
          : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]',
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="6" cy="5" r="2.5" />
        <path d="M1 14c0-3 2-4.5 5-4.5" />
        <path d="M12 9v5M9.5 11.5h5" />
      </svg>
      Roster
      {members.length > 0 && (
        <span className="min-w-[18px] h-[18px] rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] text-[10px] font-bold flex items-center justify-center">
          {members.length}
        </span>
      )}
    </button>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isOpen } = useRosterBuilder();
  const currentUser = useDevUser((s) => s.currentUser);
  const isPM = currentUser?.role === 'PM';

  return (
    <div className="min-h-screen bg-[var(--color-navy)]">
      {/* ─── Fixed Header ─── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--color-navy)] border-b border-[var(--color-border)] z-50">
        <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="font-[var(--font-serif)] text-[22px] font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                ROSTER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
            </Link>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200',
                      isActive
                        ? 'bg-[var(--color-gold-dim)] text-[var(--color-gold)]'
                        : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {isPM && (
                <Link
                  to="/admin"
                  className={clsx(
                    'px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-200',
                    location.pathname.startsWith('/admin')
                      ? 'bg-[var(--color-gold-dim)] text-[var(--color-gold)]'
                      : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]',
                  )}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          {/* Right: Roster toggle + User switcher */}
          <div className="flex items-center gap-3">
            <RosterBuilderToggle />
            <div className="w-px h-6 bg-[var(--color-border)]" />
            <NotificationBell />
            <div className="w-px h-6 bg-[var(--color-border)]" />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* ─── Main content ─── */}
      <main className="pt-16">
        <div
          className={clsx(
            'max-w-[1400px] mx-auto px-6 py-8 transition-all duration-300',
            isOpen && 'lg:mr-[340px]',
          )}
        >
          {children}
        </div>
      </main>

      {/* ─── Roster Builder Panel ─── */}
      <RosterPanel />
    </div>
  );
}

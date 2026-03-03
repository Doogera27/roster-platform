import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { AIPMDashboardWidget } from '../components/AIPMDashboardWidget';

export function DashboardPage() {
  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.data),
  });

  if (!user) return <DashboardSkeleton />;

  if (user.role === 'CREATIVE') return <CreativeDashboard user={user} />;
  if (user.role === 'PM') return <PMDashboard user={user} />;
  return <ClientDashboard user={user} />;
}

/* ═══════════════════════════════════════════════════════
   CLIENT DASHBOARD
   ═══════════════════════════════════════════════════════ */
function ClientDashboard({ user }: { user: any }) {
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data.data),
  });

  const { data: vaultData } = useQuery({
    queryKey: ['vault'],
    queryFn: () => api.get('/vault').then((r) => r.data.data),
  });

  const projects = projectsData || [];
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE');
  const vaultCompleteness = Math.round(vaultData?.completeness_score || 0);
  const vaultAssetCount = vaultData?.assets?.length || 0;

  return (
    <div>
      <DashboardHero name={user.first_name} subtitle="Here's what's happening across your creative projects." />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Active Projects" value={activeProjects.length.toString()} gold />
        <StatCard label="Total Projects" value={projects.length.toString()} />
        <StatCard label="Vault Assets" value={vaultAssetCount.toString()} />
        <StatCard label="Vault Score" value={`${vaultCompleteness}%`}
          valueColor={vaultCompleteness >= 80 ? 'var(--color-teal)' : vaultCompleteness >= 40 ? 'var(--color-gold)' : 'var(--color-danger)'} />
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <h2 className="text-label mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard title="Find Talent" description="Browse vetted creatives across every discipline." link="/creatives" linkLabel="Browse talent" />
          <ActionCard title="New Project" description="Submit a brief and launch your next creative project." link="/projects/new" linkLabel="Start project" />
          <ActionCard title="Brand Vault" description="Upload guidelines, logos, and templates for your team." link="/vault" linkLabel="Open vault" />
        </div>
      </div>

      {/* Active projects preview */}
      {activeProjects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-label">Active Projects</h2>
            <Link to="/projects" className="text-xs font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] transition-colors">
              View all &rarr;
            </Link>
          </div>
          <div className="space-y-2">
            {activeProjects.slice(0, 3).map((p: any) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="card-flat p-4 flex items-center justify-between group block">
                <div className="flex items-center gap-3">
                  <HealthDot health={p.health} />
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-[var(--color-gold)] transition-colors">{p.name}</div>
                    <div className="text-mono text-[11px] text-[var(--color-text-faint)]">
                      {p.project_type?.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
                <span className="badge badge-info">{p.status?.replace(/_/g, ' ')}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Vault coaching */}
      {vaultCompleteness < 80 && (
        <div className="mt-8 card-flat p-5 border-l-2 border-l-[var(--color-gold)]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-gold-dim)] flex items-center justify-center shrink-0">
              <svg width="14" height="14" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="7" r="6" /><path d="M7 4v4M7 10h.01" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-medium text-white mb-1">Complete your Brand Vault</div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Your vault is {vaultCompleteness}% complete. Uploading brand assets helps creative teams deliver work that's on-brand from day one.
              </p>
              <Link to="/vault" className="text-xs font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-hover)]">
                Go to Vault →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CREATIVE DASHBOARD
   ═══════════════════════════════════════════════════════ */
function CreativeDashboard({ user }: { user: any }) {
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data.data),
  });

  const projects = projectsData || [];
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE');
  const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED');
  const profile = user.creative_profile;

  return (
    <div>
      <DashboardHero name={user.first_name} subtitle="Your creative workspace — track projects and manage availability." />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Active Projects" value={activeProjects.length.toString()} gold />
        <StatCard label="Completed" value={completedProjects.length.toString()} />
        <StatCard label="Avg Rating" value={profile?.average_rating ? `${profile.average_rating.toFixed(1)}` : '—'} valueColor="var(--color-gold)" />
        <StatCard label="Availability" value={profile?.availability_status || '—'}
          valueColor={profile?.availability_status === 'AVAILABLE' ? 'var(--color-teal)' : profile?.availability_status === 'LIMITED' ? 'var(--color-gold)' : 'var(--color-danger)'} />
      </div>

      {/* Profile summary */}
      <div className="card-flat p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-label">Your Profile</h2>
          <span className={clsx('badge', profile?.tier === 'ELITE' ? 'badge-accent' : profile?.tier === 'PRO' ? 'badge-success' : 'badge-neutral')}>
            {profile?.tier || 'MEMBER'}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ProfileStat label="Day Rate" value={profile?.day_rate_cents ? `$${(profile.day_rate_cents / 100).toLocaleString()}` : '—'} />
          <ProfileStat label="Disciplines" value={profile?.disciplines?.length?.toString() || '0'} />
          <ProfileStat label="Projects Done" value={profile?.projects_completed?.toString() || '0'} />
          <ProfileStat label="On-Time Rate" value={profile?.projects_completed > 0 ? '95%' : '—'} />
        </div>
      </div>

      {/* Active work */}
      {activeProjects.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-label mb-4">Your Active Work</h2>
          <div className="space-y-2">
            {activeProjects.map((p: any) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="card-flat p-4 flex items-center justify-between group block">
                <div className="flex items-center gap-3">
                  <HealthDot health={p.health} />
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-[var(--color-gold)] transition-colors">{p.name}</div>
                    <div className="text-mono text-[11px] text-[var(--color-text-faint)]">{p.project_type?.replace(/_/g, ' ')}</div>
                  </div>
                </div>
                {p.due_date && (
                  <span className="text-mono text-[11px] text-[var(--color-text-faint)]">
                    Due {new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-flat p-8 text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-1">No active projects</p>
          <p className="text-xs text-[var(--color-text-faint)]">When clients add you to projects, they'll appear here.</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   PM DASHBOARD
   ═══════════════════════════════════════════════════════ */
function PMDashboard({ user }: { user: any }) {
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data.data),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.data),
  });

  const projects = projectsData || [];
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE');
  const atRisk = projects.filter((p: any) => p.health === 'AMBER' || p.health === 'RED');
  const metrics = dashboardData || {};

  return (
    <div>
      <DashboardHero name={user.first_name} subtitle="Project management overview — monitor health, manage escalations." />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Active Projects" value={activeProjects.length.toString()} gold />
        <StatCard label="At Risk" value={atRisk.length.toString()} valueColor={atRisk.length > 0 ? 'var(--color-danger)' : undefined} />
        <StatCard label="Pending Vetting" value={metrics.pending_applications?.toString() || '0'} valueColor="var(--color-gold)" />
        <StatCard label="Active Creatives" value={metrics.active_creatives?.toString() || '0'} />
      </div>

      {/* Escalation Queue */}
      {atRisk.length > 0 && (
        <div className="mb-8">
          <h2 className="text-label mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-danger)] animate-pulse" />
            Needs Attention
          </h2>
          <div className="space-y-2">
            {atRisk.map((p: any) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="card-flat p-4 flex items-center justify-between group block border-l-2 border-l-[var(--color-danger)]">
                <div className="flex items-center gap-3">
                  <HealthDot health={p.health} />
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-[var(--color-gold)] transition-colors">{p.name}</div>
                    <div className="text-mono text-[11px] text-[var(--color-text-faint)]">{p.project_type?.replace(/_/g, ' ')}</div>
                  </div>
                </div>
                <span className={clsx('badge', p.health === 'RED' ? 'badge-danger' : 'badge-warning')}>
                  {p.health === 'RED' ? 'Blocked' : 'At Risk'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* AI PM Intelligence Feed */}
      <AIPMDashboardWidget />

      {/* All active projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-label">All Active Projects</h2>
          <Link to="/projects" className="text-xs font-medium text-[var(--color-gold)] hover:text-[var(--color-gold-hover)] transition-colors">
            View all →
          </Link>
        </div>
        {activeProjects.length > 0 ? (
          <div className="space-y-2">
            {activeProjects.map((p: any) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="card-flat p-4 flex items-center justify-between group block">
                <div className="flex items-center gap-3">
                  <HealthDot health={p.health} />
                  <div>
                    <div className="text-sm font-medium text-white group-hover:text-[var(--color-gold)] transition-colors">{p.name}</div>
                    <div className="text-mono text-[11px] text-[var(--color-text-faint)]">{p.project_type?.replace(/_/g, ' ')}</div>
                  </div>
                </div>
                {p.due_date && (
                  <span className="text-mono text-[11px] text-[var(--color-text-faint)]">
                    Due {new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-flat p-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">No active projects right now.</p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActionCard title="Vetting Queue" description="Review pending creative applications." link="/creatives" linkLabel="Review applications" />
        <ActionCard title="All Creatives" description="Browse the full talent directory." link="/creatives" linkLabel="Browse talent" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════ */

function DashboardHero({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <div className="mb-10 relative" style={{ background: 'linear-gradient(160deg, var(--color-navy) 0%, #112233 100%)' }}>
      <div className="absolute top-0 right-0 w-[400px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
      <div className="relative py-8">
        <h1 className="text-display text-4xl text-white mb-2">
          Welcome back, <em>{name}</em>
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm">{subtitle}</p>
      </div>
      <div className="divider-gold" />
    </div>
  );
}

function StatCard({ label, value, gold, valueColor }: { label: string; value: string; gold?: boolean; valueColor?: string }) {
  return (
    <div className="card-flat p-5">
      <div className="text-label mb-2">{label}</div>
      <div className="text-display text-2xl" style={{ color: valueColor || (gold ? 'var(--color-gold)' : 'white') }}>
        {value}
      </div>
    </div>
  );
}

function ActionCard({ title, description, link, linkLabel }: { title: string; description: string; link: string; linkLabel: string }) {
  return (
    <Link to={link} className="card group p-6 flex flex-col">
      <h3 className="text-heading text-[17px] text-white mb-1.5">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4 flex-1 leading-relaxed">{description}</p>
      <span className="text-mono text-xs text-[var(--color-gold)] group-hover:text-[var(--color-gold-hover)] transition-colors">
        {linkLabel} &rarr;
      </span>
    </Link>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-mono text-[10px] text-[var(--color-text-faint)] mb-1">{label}</div>
      <div className="text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function HealthDot({ health }: { health: string }) {
  const colors: Record<string, string> = {
    GREEN: 'bg-[var(--color-teal)]',
    AMBER: 'bg-[var(--color-gold)]',
    RED: 'bg-[var(--color-danger)]',
  };
  return <div className={`w-2 h-2 rounded-full ${colors[health] || 'bg-[var(--color-text-faint)]'}`} />;
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="skeleton h-10 w-64 mb-2" />
      <div className="skeleton h-4 w-96 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
      </div>
    </div>
  );
}

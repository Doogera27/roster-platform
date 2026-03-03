/**
 * Admin Dashboard — Phase 5.3
 * Platform metrics, user management, application review.
 * Accessible to PM role.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { clsx } from 'clsx';

type AdminTab = 'overview' | 'applications' | 'users' | 'projects';

export function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const queryClient = useQueryClient();

  // Dashboard metrics
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });

  const { data: projectsData } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => api.get('/projects').then((r) => r.data),
  });

  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: () => api.get('/creatives/applications').then((r) => r.data),
    enabled: tab === 'applications' || tab === 'overview',
  });

  const users = usersData?.data || [];
  const projects = projectsData?.data || [];
  const applications = applicationsData?.data || [];

  // Metrics
  const clientCount = users.filter((u: any) => u.role === 'CLIENT').length;
  const creativeCount = users.filter((u: any) => u.role === 'CREATIVE').length;
  const pmCount = users.filter((u: any) => u.role === 'PM').length;
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;
  const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED').length;
  const totalRevenue = projects.reduce((sum: number, p: any) => sum + (p.spent_cents || 0), 0);

  const vetMutation = useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: string; notes?: string }) =>
      api.patch(`/creatives/${id}/vet`, { action, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
    },
  });

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'applications', label: `Applications${applications.length ? ` (${applications.length})` : ''}` },
    { key: 'users', label: 'Users' },
    { key: 'projects', label: 'Projects' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display text-3xl text-white mb-2">
          Admin <em>Dashboard</em>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Platform overview, user management, and application review.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-[var(--color-border)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px',
              tab === t.key
                ? 'text-[var(--color-gold)] border-[var(--color-gold)]'
                : 'text-[var(--color-text-muted)] border-transparent hover:text-white',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <MetricCard label="Clients" value={clientCount} color="var(--color-gold)" />
            <MetricCard label="Creatives" value={creativeCount} color="var(--color-teal)" />
            <MetricCard label="PMs" value={pmCount} color="#60A5FA" />
            <MetricCard label="Active Projects" value={activeProjects} color="var(--color-gold)" />
            <MetricCard label="Completed" value={completedProjects} color="var(--color-teal)" />
            <MetricCard label="Total Revenue" value={`$${(totalRevenue / 100).toLocaleString()}`} color="var(--color-gold)" />
          </div>

          {/* Pending applications summary */}
          {applications.length > 0 && (
            <div className="card-flat p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-white">{applications.length} Pending Applications</h3>
                <button onClick={() => setTab('applications')} className="text-xs text-[var(--color-gold)] hover:underline">
                  Review All →
                </button>
              </div>
              <div className="space-y-2">
                {applications.slice(0, 3).map((app: any) => (
                  <div key={app.id} className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-xs font-medium text-white">{app.first_name} {app.last_name}</span>
                      <span className="text-[10px] text-[var(--color-text-faint)] ml-2">{app.experience_level} · {(app.disciplines || []).join(', ')}</span>
                    </div>
                    <span className="badge badge-warning text-[10px]">Under Review</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent projects */}
          <div className="card-flat p-5">
            <h3 className="text-sm font-medium text-white mb-3">Recent Projects</h3>
            <div className="space-y-2">
              {projects.slice(0, 5).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                  <div>
                    <span className="text-xs font-medium text-white">{p.name}</span>
                    <span className="text-[10px] text-[var(--color-text-faint)] ml-2">{p.project_type?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-mono text-[11px] text-[var(--color-text-faint)]">
                      ${((p.budget_cents || 0) / 100).toLocaleString()}
                    </span>
                    <span className={clsx(
                      'badge text-[10px]',
                      p.status === 'ACTIVE' ? 'badge-success' : p.status === 'COMPLETED' ? 'badge-accent' : 'badge-warning',
                    )}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Applications */}
      {tab === 'applications' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {appsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card-flat p-5">
                  <div className="skeleton h-4 w-40 mb-2" />
                  <div className="skeleton h-3 w-60" />
                </div>
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[var(--color-text-muted)]">No pending applications.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app: any) => (
                <div key={app.id} className="card-flat p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-white">{app.first_name} {app.last_name}</h3>
                      <p className="text-xs text-[var(--color-text-faint)]">{app.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge text-[10px]">{app.experience_level}</span>
                      <span className="text-mono text-xs text-[var(--color-text-muted)]">
                        ${app.day_rate_cents ? (app.day_rate_cents / 100).toFixed(0) : '—'}/day
                      </span>
                    </div>
                  </div>

                  {app.bio && (
                    <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">{app.bio}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(app.disciplines || []).map((d: string) => (
                      <span key={d} className="chip text-[10px]">{d}</span>
                    ))}
                  </div>

                  {app.application_notes && (
                    <div className="bg-[var(--color-navy-light)] rounded-lg p-3 mb-4">
                      <span className="text-label block mb-1">Statement</span>
                      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{app.application_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => vetMutation.mutate({ id: app.id, action: 'APPROVE' })}
                      disabled={vetMutation.isPending}
                      className="btn-accent px-4 py-2 text-xs"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => vetMutation.mutate({ id: app.id, action: 'REJECT', notes: 'Application does not meet current requirements.' })}
                      disabled={vetMutation.isPending}
                      className="btn-ghost px-4 py-2 text-xs text-[var(--color-danger)] hover:bg-[rgba(255,107,107,0.1)]"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="card-flat overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-label text-left p-4">Name</th>
                  <th className="text-label text-left p-4">Email</th>
                  <th className="text-label text-left p-4">Role</th>
                  <th className="text-label text-left p-4">Status</th>
                  <th className="text-label text-left p-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="p-4 text-xs font-medium text-white">{u.first_name} {u.last_name}</td>
                    <td className="p-4 text-xs text-[var(--color-text-muted)]">{u.email}</td>
                    <td className="p-4">
                      <span className={clsx(
                        'badge text-[10px]',
                        u.role === 'CLIENT' ? 'badge-accent' : u.role === 'PM' ? 'badge-warning' : 'badge-success',
                      )}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={clsx('w-2 h-2 rounded-full inline-block mr-1.5', u.is_active ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-text-faint)]')} />
                      <span className="text-xs text-[var(--color-text-muted)]">{u.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="p-4 text-xs text-[var(--color-text-faint)] text-mono">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects */}
      {tab === 'projects' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <div className="card-flat overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-label text-left p-4">Project</th>
                  <th className="text-label text-left p-4">Type</th>
                  <th className="text-label text-left p-4">Status</th>
                  <th className="text-label text-left p-4">Budget</th>
                  <th className="text-label text-left p-4">Health</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p: any) => (
                  <tr key={p.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="p-4 text-xs font-medium text-white">{p.name}</td>
                    <td className="p-4 text-xs text-[var(--color-text-muted)]">{p.project_type?.replace('_', ' ')}</td>
                    <td className="p-4">
                      <span className={clsx(
                        'badge text-[10px]',
                        p.status === 'ACTIVE' ? 'badge-success' : p.status === 'COMPLETED' ? 'badge-accent' : 'badge-warning',
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-mono text-[var(--color-text-muted)]">
                      ${((p.budget_cents || 0) / 100).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={clsx(
                        'w-2 h-2 rounded-full inline-block',
                        p.health === 'GREEN' ? 'bg-[var(--color-teal)]' : p.health === 'AMBER' ? 'bg-yellow-500' : 'bg-red-500',
                      )} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="card-flat p-4">
      <div className="text-label mb-1">{label}</div>
      <div className="text-xl font-semibold" style={{ color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
    </div>
  );
}

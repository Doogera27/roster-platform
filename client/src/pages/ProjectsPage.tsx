import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { clsx } from 'clsx';

const statusConfig: Record<string, { label: string; badge: string }> = {
  DRAFT: { label: 'Draft', badge: 'badge-neutral' },
  PENDING_CONFIRMATION: { label: 'Pending', badge: 'badge-warning' },
  ACTIVE: { label: 'Active', badge: 'badge-info' },
  ON_HOLD: { label: 'On Hold', badge: 'badge-warning' },
  COMPLETED: { label: 'Completed', badge: 'badge-success' },
  CANCELLED: { label: 'Cancelled', badge: 'badge-danger' },
};

const healthConfig: Record<string, { color: string; label: string }> = {
  GREEN: { color: 'bg-[var(--color-teal)]', label: 'On track' },
  AMBER: { color: 'bg-[var(--color-gold)]', label: 'At risk' },
  RED: { color: 'bg-[var(--color-danger)]', label: 'Blocked' },
};

const typeLabels: Record<string, string> = {
  BRAND_IDENTITY: 'Brand Identity',
  CAMPAIGN_CONCEPT: 'Campaign Concept',
  WEBSITE_REDESIGN: 'Website Redesign',
  SOCIAL_CONTENT: 'Social Content',
  VIDEO_MOTION: 'Video & Motion',
  EMAIL_CAMPAIGN: 'Email Campaign',
  PRINT_OOH: 'Print & OOH',
  BRAND_PHOTOGRAPHY: 'Brand Photography',
};

export function ProjectsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then((r) => r.data.data),
  });

  const projects = data || [];
  const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE');
  const otherProjects = projects.filter((p: any) => p.status !== 'ACTIVE');

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-display text-4xl text-white mb-2">
            Your <em>Projects</em>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Track and manage your creative productions.
          </p>
        </div>
        <button onClick={() => navigate('/projects/new')} className="btn-accent">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M7 2v10M2 7h10" />
          </svg>
          New Project
        </button>
      </div>

      {/* Summary cards */}
      {projects.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MiniStat label="Active" value={activeProjects.length} accent />
          <MiniStat label="Total" value={projects.length} />
          <MiniStat
            label="On Track"
            value={projects.filter((p: any) => p.health === 'GREEN').length}
          />
          <MiniStat
            label="Needs Attention"
            value={projects.filter((p: any) => p.health === 'AMBER' || p.health === 'RED').length}
            warn={projects.some((p: any) => p.health === 'RED')}
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-flat p-5">
              <div className="flex items-center gap-4">
                <div className="skeleton w-3 h-3 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-48 mb-2" />
                  <div className="skeleton h-3 w-32" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-xl bg-[var(--color-navy-light)] border border-dashed border-[var(--color-border-mid)] flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h20M4 14h20M4 20h14" />
              <circle cx="22" cy="20" r="3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">No projects yet</p>
          <p className="text-xs text-[var(--color-text-faint)] max-w-xs mx-auto mb-4">
            Build a roster and submit a creative brief to start your first project.
          </p>
          <button onClick={() => navigate('/projects/new')} className="btn-secondary text-xs">Start a project</button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active projects */}
          {activeProjects.length > 0 && (
            <section>
              <h2 className="text-label mb-3">Active</h2>
              <div className="space-y-2">
                {activeProjects.map((p: any) => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}

          {/* Other projects */}
          {otherProjects.length > 0 && (
            <section>
              <h2 className="text-label mb-3">
                {activeProjects.length > 0 ? 'Other' : 'All Projects'}
              </h2>
              <div className="space-y-2">
                {otherProjects.map((p: any) => (
                  <ProjectRow key={p.id} project={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project: p }: { project: any }) {
  const status = statusConfig[p.status] || statusConfig.DRAFT;
  const health = healthConfig[p.health];
  const typeLabel = typeLabels[p.project_type] || p.project_type?.replace(/_/g, ' ');

  return (
    <Link to={`/projects/${p.id}`} className="card group p-5 block">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Health indicator */}
          <div className="pt-1.5">
            <div
              className={clsx('w-2.5 h-2.5 rounded-full', health?.color || 'bg-[var(--color-text-faint)]')}
              title={health?.label || 'Unknown'}
            />
          </div>
          <div>
            <h3
              className="text-[15px] font-semibold text-white group-hover:text-[var(--color-gold)] transition-colors"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {p.name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-mono text-[11px] text-[var(--color-text-faint)]">{typeLabel}</span>
              {p.due_date && (
                <>
                  <span className="text-[var(--color-border-mid)]">&bull;</span>
                  <span className="text-mono text-[11px] text-[var(--color-text-faint)]">
                    Due {new Date(p.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${status.badge}`}>{status.label}</span>
          <svg
            className="text-[var(--color-text-faint)] opacity-0 group-hover:opacity-100 transition-opacity"
            width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M5 3l4 4-4 4" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function MiniStat({ label, value, accent, warn }: { label: string; value: number; accent?: boolean; warn?: boolean }) {
  return (
    <div className="card-flat p-5">
      <div className="text-label mb-2">{label}</div>
      <div className={clsx(
        'text-display text-2xl',
        accent ? 'text-[var(--color-gold)]' :
        warn ? 'text-[var(--color-danger)]' :
        'text-white'
      )}>
        {value}
      </div>
    </div>
  );
}

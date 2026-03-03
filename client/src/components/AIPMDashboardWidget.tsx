import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

interface DashboardInsight {
  id: string;
  project_id: string;
  project_name: string;
  insight_type: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  summary: string;
  created_at: string;
}

interface AIPMDashboard {
  critical_count: number;
  warning_count: number;
  info_count: number;
  total_active_insights: number;
  top_insights: DashboardInsight[];
  projects_scanned: number;
}

export function AIPMDashboardWidget() {
  const { data, isLoading } = useQuery<AIPMDashboard>({
    queryKey: ['ai-pm-dashboard'],
    queryFn: () => api.get('/ai-pm/dashboard').then((r) => r.data.data),
    refetchInterval: 120_000, // Poll every 2 minutes
  });

  if (isLoading) {
    return (
      <div className="card-flat p-6 mb-8">
        <div className="skeleton h-5 w-48 mb-4" />
        <div className="flex gap-3 mb-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 flex-1 rounded-lg" />)}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!data || data.total_active_insights === 0) {
    return (
      <div className="card-flat p-6 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">✨</span>
          <h3 className="text-label">AI PM Intelligence</h3>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          All projects are healthy. No active alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="card-flat p-6 mb-8" style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3l2 1.5" />
          </svg>
          <h3 className="text-label">AI PM Intelligence</h3>
        </div>
        <span className="text-mono text-[10px] text-[var(--color-text-faint)]">
          {data.projects_scanned} project{data.projects_scanned !== 1 ? 's' : ''} monitored
        </span>
      </div>

      {/* Severity badges */}
      <div className="flex gap-3 mb-5">
        {data.critical_count > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-danger-dim)]">
            <div className="w-2 h-2 rounded-full bg-[var(--color-danger)] animate-pulse" />
            <span className="text-sm font-semibold text-[var(--color-danger)]">{data.critical_count}</span>
            <span className="text-[10px] text-[var(--color-danger)] opacity-70">critical</span>
          </div>
        )}
        {data.warning_count > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-gold-dim)]">
            <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" />
            <span className="text-sm font-semibold text-[var(--color-gold)]">{data.warning_count}</span>
            <span className="text-[10px] text-[var(--color-gold)] opacity-70">warning{data.warning_count > 1 ? 's' : ''}</span>
          </div>
        )}
        {data.info_count > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(255,255,255,0.04)]">
            <div className="w-2 h-2 rounded-full bg-[var(--color-teal)]" />
            <span className="text-sm font-semibold text-[var(--color-text-secondary)]">{data.info_count}</span>
            <span className="text-[10px] text-[var(--color-text-faint)]">info</span>
          </div>
        )}
      </div>

      {/* Top insights */}
      <div className="space-y-2">
        {data.top_insights.slice(0, 5).map((insight: any) => (
          <Link
            key={insight.id}
            to={`/projects/${insight.project_id}?tab=ai-pm`}
            className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.06)] transition-colors group"
          >
            <div className={clsx('w-1.5 h-1.5 rounded-full shrink-0 mt-1.5',
              insight.severity === 'CRITICAL' ? 'bg-[var(--color-danger)] animate-pulse' :
              insight.severity === 'WARNING' ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-teal)]'
            )} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white group-hover:text-[var(--color-gold)] transition-colors truncate">
                {insight.title}
              </div>
              <div className="text-mono text-[10px] text-[var(--color-text-faint)] mt-0.5">
                {insight.project_name}
              </div>
            </div>
            <span className={clsx('text-mono text-[9px] px-1.5 py-0.5 rounded shrink-0',
              insight.severity === 'CRITICAL' ? 'bg-[var(--color-danger-dim)] text-[var(--color-danger)]' :
              'bg-[var(--color-gold-dim)] text-[var(--color-gold)]'
            )}>
              {insight.severity}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

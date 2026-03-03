/**
 * ActivityFeed — Project Activity Timeline
 * Shows chronological events for a project: status changes,
 * deliverable submissions, phase activations, etc.
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { clsx } from 'clsx';

interface Activity {
  id: string;
  project_id: string;
  user_id: string | null;
  type: string;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  user_first_name: string | null;
  user_last_name: string | null;
  user_avatar_url: string | null;
  user_role: string | null;
}

const typeConfig: Record<string, { icon: string; color: string }> = {
  project_created: { icon: '🚀', color: 'var(--color-teal)' },
  project_status_changed: { icon: '📋', color: 'var(--color-gold)' },
  phase_activated: { icon: '▶', color: 'var(--color-teal)' },
  phase_completed: { icon: '✓', color: 'var(--color-teal)' },
  deliverable_submitted: { icon: '📎', color: 'var(--color-gold)' },
  deliverable_reviewed: { icon: '👁', color: 'var(--color-text-secondary)' },
  pm_assigned: { icon: '👤', color: 'var(--color-text-secondary)' },
  brief_reflection: { icon: '🤖', color: 'var(--color-gold)' },
  budget_update: { icon: '💰', color: 'var(--color-gold)' },
  health_update: { icon: '🔔', color: 'var(--color-danger)' },
  comment: { icon: '💬', color: 'var(--color-text-secondary)' },
};

export function ActivityFeed({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: () => api.get(`/activity/${projectId}`).then(r => r.data.data),
    refetchInterval: 30_000,
  });

  const activities: Activity[] = data || [];

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function getUserName(activity: Activity): string {
    if (activity.user_first_name) {
      return `${activity.user_first_name} ${activity.user_last_name || ''}`.trim();
    }
    return 'System';
  }

  const roleColors: Record<string, string> = {
    CLIENT: 'text-[var(--color-gold)]',
    CREATIVE: 'text-[var(--color-teal)]',
    PM: 'text-[var(--color-text-secondary)]',
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="flex-1">
              <div className="skeleton h-3 w-48 mb-2" />
              <div className="skeleton h-2.5 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-10">
        <svg className="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="9" />
        </svg>
        <p className="text-xs text-[var(--color-text-faint)]">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[var(--color-border)]" />

      <div className="space-y-0">
        {activities.map((activity, i) => {
          const config = typeConfig[activity.type] || { icon: '•', color: 'var(--color-text-faint)' };
          const isLast = i === activities.length - 1;

          return (
            <div key={activity.id} className={clsx('relative flex gap-3 py-3', !isLast && 'pb-3')}>
              {/* Icon */}
              <div
                className="relative z-10 w-8 h-8 rounded-full bg-[var(--color-navy)] border border-[var(--color-border)] flex items-center justify-center text-xs shrink-0"
                style={{ borderColor: config.color }}
              >
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-baseline gap-2">
                  <span className={clsx('text-xs font-medium', roleColors[activity.user_role || ''] || 'text-[var(--color-text-secondary)]')}>
                    {getUserName(activity)}
                  </span>
                  <span className="text-[10px] text-[var(--color-text-faint)]">{formatTime(activity.created_at)}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{activity.title}</p>
                {activity.body && (
                  <p className="text-[11px] text-[var(--color-text-faint)] mt-1 bg-[var(--color-navy-light)] rounded-lg p-2">{activity.body}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * NotificationBell — Spec System 08
 * Bell icon with unread count badge. Opens notification panel on click.
 * Polls for unread count every 30s.
 */
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { clsx } from 'clsx';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  project_id: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Poll unread count
  const { data: countData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get('/notifications/count').then(r => r.data.data),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  // Fetch notifications when panel is open
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications?limit=15').then(r => r.data),
    enabled: open,
    staleTime: 5_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const unreadCount = countData?.unread_count || 0;
  const notifications: Notification[] = notifData?.data || [];

  function handleNotificationClick(notif: Notification) {
    if (!notif.is_read) {
      markReadMutation.mutate(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  const typeIcons: Record<string, string> = {
    project_created: 'text-[var(--color-teal)]',
    project_started: 'text-[var(--color-teal)]',
    deliverable_submitted: 'text-[var(--color-gold)]',
    deliverable_approved: 'text-[var(--color-teal)]',
    deliverable_revision: 'text-[var(--color-danger)]',
    pm_assigned: 'text-[var(--color-text-secondary)]',
    brief_reflection_ready: 'text-[var(--color-gold)]',
    budget_warning: 'text-[var(--color-danger)]',
    health_changed: 'text-[var(--color-gold)]',
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-[var(--color-navy-light)] transition-colors"
        title="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13.5 6.75a4.5 4.5 0 1 0-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5S13.5 12 13.5 6.75Z" />
          <path d="M10.3 15.75a1.5 1.5 0 0 1-2.6 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[var(--color-danger)] text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[480px] bg-[var(--color-navy)] border border-[var(--color-border)] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-[11px] text-[var(--color-gold)] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <svg className="mx-auto mb-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-xs text-[var(--color-text-faint)]">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={clsx(
                    'w-full text-left px-4 py-3 border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-navy-light)] transition-colors',
                    !notif.is_read && 'bg-[var(--color-navy-light)]/50'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    {!notif.is_read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-[var(--color-gold)] shrink-0" />
                    )}
                    <div className={clsx('flex-1 min-w-0', notif.is_read && 'ml-[18px]')}>
                      <p className={clsx(
                        'text-xs leading-snug',
                        notif.is_read ? 'text-[var(--color-text-muted)]' : 'text-white font-medium'
                      )}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-[11px] text-[var(--color-text-faint)] mt-0.5 line-clamp-2">{notif.body}</p>
                      )}
                      <p className="text-[10px] text-[var(--color-text-faint)] mt-1">{timeAgo(notif.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

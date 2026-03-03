import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { clsx } from 'clsx';
import { ActivityFeed } from '../components/ActivityFeed';
import { AIPMTab } from '../components/AIPMTab';

const statusConfig: Record<string, { label: string; class: string }> = {
  DRAFT: { label: 'Draft', class: 'badge-neutral' },
  PENDING_CONFIRMATION: { label: 'Pending', class: 'badge-warning' },
  ACTIVE: { label: 'Active', class: 'badge-info' },
  ON_HOLD: { label: 'On Hold', class: 'badge-warning' },
  COMPLETED: { label: 'Completed', class: 'badge-success' },
  CANCELLED: { label: 'Cancelled', class: 'badge-danger' },
};

const phaseStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: 'var(--color-text-faint)', bg: 'rgba(255,255,255,0.04)' },
  ACTIVE: { label: 'Active', color: 'var(--color-teal)', bg: 'var(--color-teal-dim)' },
  COMPLETE: { label: 'Complete', color: 'var(--color-gold)', bg: 'var(--color-gold-dim)' },
  BLOCKED: { label: 'Blocked', color: 'var(--color-danger)', bg: 'var(--color-danger-dim)' },
};

const deliverableStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'var(--color-text-faint)' },
  SUBMITTED: { label: 'Submitted', color: 'var(--color-info)' },
  IN_REVIEW: { label: 'In Review', color: 'var(--color-gold)' },
  APPROVED: { label: 'Approved', color: 'var(--color-teal)' },
  REVISION_REQUESTED: { label: 'Revision Requested', color: 'var(--color-danger)' },
};

const healthColors: Record<string, string> = {
  GREEN: 'var(--color-teal)',
  AMBER: 'var(--color-gold)',
  RED: 'var(--color-danger)',
};

type Tab = 'overview' | 'phases' | 'team' | 'budget' | 'ai-pm' | 'activity';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data.data),
  });

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data.data),
  });

  const project = projectData;
  const phases = project?.phases || [];
  const userRole = meData?.role;

  // Compute progress
  const completedPhases = phases.filter((p: any) => p.status === 'COMPLETE').length;
  const progress = phases.length > 0 ? Math.round((completedPhases / phases.length) * 100) : 0;
  const budgetUsed = project ? Math.round(((project.spent_cents || 0) / (project.budget_cents || 1)) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-64 mb-4" />
        <div className="skeleton h-6 w-96" />
        <div className="grid grid-cols-4 gap-4 mt-8">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--color-text-muted)]">Project not found.</p>
        <Link to="/projects" className="btn-ghost text-sm mt-4 inline-block">← Back to Projects</Link>
      </div>
    );
  }

  const sc = statusConfig[project.status] || statusConfig.DRAFT;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link to="/projects" className="btn-ghost text-xs mb-4 inline-block">← Back to Projects</Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-display text-3xl text-white">{project.name}</h1>
              <span className={`badge ${sc.class}`}>{sc.label}</span>
            </div>
            <div className="flex items-center gap-4 text-mono text-[11px] text-[var(--color-text-faint)]">
              <span>{project.project_type?.replace(/_/g, ' ')}</span>
              {project.due_date && (
                <>
                  <span>·</span>
                  <span>Due {new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </>
              )}
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: healthColors[project.health] || healthColors.GREEN }} />
                {project.health || 'GREEN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MiniStat label="Progress" value={`${progress}%`} sub={`${completedPhases}/${phases.length} phases`} color="var(--color-teal)" />
        <MiniStat label="Budget" value={`$${((project.budget_cents || 0) / 100).toLocaleString()}`} sub={`${budgetUsed}% used`} color="var(--color-gold)" />
        <MiniStat label="Phases" value={phases.length.toString()} sub={`${phases.filter((p: any) => p.status === 'ACTIVE').length} active`} />
        <MiniStat label="Timeline" value={project.due_date ? `${Math.ceil((new Date(project.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d` : '—'} sub={project.due_date ? 'remaining' : 'no deadline'} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-[var(--color-border)]">
        {(['overview', 'phases', 'team', 'budget', 'ai-pm', 'activity'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px flex items-center gap-1.5',
              activeTab === tab
                ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-white',
            )}
          >
            {tab === 'ai-pm' ? (
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="7" cy="7" r="5" />
                  <path d="M7 4v3l2 1" />
                </svg>
                AI PM
              </>
            ) : (
              <span className="capitalize">{tab}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab project={project} phases={phases} progress={progress} />
      )}
      {activeTab === 'phases' && (
        <PhasesTab
          phases={phases}
          projectId={project.id}
          expandedPhase={expandedPhase}
          setExpandedPhase={setExpandedPhase}
          userRole={userRole}
          queryClient={queryClient}
        />
      )}
      {activeTab === 'team' && (
        <TeamTab project={project} />
      )}
      {activeTab === 'budget' && (
        <BudgetTab project={project} />
      )}
      {activeTab === 'ai-pm' && (userRole === 'PM' || userRole === 'CLIENT') && (
        <AIPMTab projectId={project.id} userRole={userRole} />
      )}
      {activeTab === 'activity' && (
        <div className="card-flat p-6" style={{ animation: 'fadeIn 0.2s ease' }}>
          <h3 className="text-label mb-4">Activity Timeline</h3>
          <ActivityFeed projectId={project.id} />
        </div>
      )}
    </div>
  );
}

/* ─── Overview Tab ─── */
function OverviewTab({ project, phases, progress }: { project: any; phases: any[]; progress: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Brief */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card-flat p-6">
          <h3 className="text-label mb-3">Project Brief</h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
            {project.brief || 'No brief provided.'}
          </p>
        </div>

        {/* Phase timeline */}
        <div className="card-flat p-6">
          <h3 className="text-label mb-4">Phase Progress</h3>
          {/* Progress bar */}
          <div className="w-full h-2 bg-[rgba(255,255,255,0.06)] rounded-full mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-gold)] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
          <div className="space-y-2">
            {phases.map((phase: any, i: number) => {
              const ps = phaseStatusConfig[phase.status] || phaseStatusConfig.PENDING;
              return (
                <div key={phase.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: ps.bg }}>
                    {phase.status === 'COMPLETE' ? (
                      <svg width="12" height="12" fill="none" stroke={ps.color} strokeWidth="2" strokeLinecap="round"><path d="M2 6l3 3L10 3" /></svg>
                    ) : (
                      <span className="text-[9px] font-bold" style={{ color: ps.color }}>{i + 1}</span>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className={clsx('text-sm', phase.status === 'COMPLETE' ? 'text-[var(--color-text-muted)]' : 'text-white')}>
                      {phase.name}
                    </span>
                    <span className="text-mono text-[10px]" style={{ color: ps.color }}>{ps.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="card-flat p-5">
          <h3 className="text-label mb-3">Details</h3>
          <dl className="space-y-3">
            <DetailRow label="Type" value={project.project_type?.replace(/_/g, ' ')} />
            <DetailRow label="Status" value={project.status?.replace(/_/g, ' ')} />
            <DetailRow label="Health" value={project.health || 'GREEN'} />
            <DetailRow label="Created" value={new Date(project.created_at).toLocaleDateString()} />
            {project.started_at && <DetailRow label="Started" value={new Date(project.started_at).toLocaleDateString()} />}
            {project.due_date && <DetailRow label="Due" value={new Date(project.due_date).toLocaleDateString()} />}
          </dl>
        </div>

        <div className="card-flat p-5">
          <h3 className="text-label mb-3">Budget</h3>
          <div className="text-display text-xl text-white mb-1">
            ${((project.budget_cents || 0) / 100).toLocaleString()}
          </div>
          <div className="w-full h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full mt-3 overflow-hidden">
            <div className={clsx('h-full rounded-full transition-all',
              (project.spent_cents || 0) / (project.budget_cents || 1) > 0.9 ? 'bg-[var(--color-danger)]' :
              (project.spent_cents || 0) / (project.budget_cents || 1) > 0.7 ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-teal)]'
            )} style={{ width: `${Math.min(100, ((project.spent_cents || 0) / (project.budget_cents || 1)) * 100)}%` }} />
          </div>
          <div className="text-mono text-[10px] text-[var(--color-text-faint)] mt-2">
            ${((project.spent_cents || 0) / 100).toLocaleString()} spent
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Phases Tab ─── */
function PhasesTab({ phases, projectId, expandedPhase, setExpandedPhase, userRole, queryClient }: {
  phases: any[];
  projectId: string;
  expandedPhase: string | null;
  setExpandedPhase: (id: string | null) => void;
  userRole: string;
  queryClient: any;
}) {
  return (
    <div className="space-y-3" style={{ animation: 'fadeIn 0.2s ease' }}>
      {phases.map((phase: any, i: number) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          index={i}
          projectId={projectId}
          allPhases={phases}
          expanded={expandedPhase === phase.id}
          onToggle={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
          userRole={userRole}
          queryClient={queryClient}
        />
      ))}
    </div>
  );
}

function PhaseCard({ phase, index, projectId, allPhases, expanded, onToggle, userRole, queryClient }: {
  phase: any; index: number; projectId: string; allPhases: any[]; expanded: boolean; onToggle: () => void; userRole: string; queryClient: any;
}) {
  const ps = phaseStatusConfig[phase.status] || phaseStatusConfig.PENDING;

  const { data: deliverables } = useQuery({
    queryKey: ['phase-deliverables', phase.id],
    queryFn: () => api.get(`/phases/${phase.id}/deliverables`).then((r) => r.data.data),
    enabled: expanded,
  });

  const [submitTitle, setSubmitTitle] = useState('');
  const [showSubmit, setShowSubmit] = useState(false);
  const [feedback, setFeedback] = useState('');

  const submitMutation = useMutation({
    mutationFn: () => api.post(`/phases/${phase.id}/deliverables`, { title: submitTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phase-deliverables', phase.id] });
      setSubmitTitle('');
      setShowSubmit(false);
    },
  });

  const approveMutation = useMutation({
    mutationFn: (deliverableId: string) =>
      api.patch(`/phases/${phase.id}/deliverables/${deliverableId}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phase-deliverables', phase.id] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  const revisionMutation = useMutation({
    mutationFn: ({ deliverableId, fb }: { deliverableId: string; fb: string }) =>
      api.patch(`/phases/${phase.id}/deliverables/${deliverableId}/request-revision`, { feedback: fb }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phase-deliverables', phase.id] });
      setFeedback('');
    },
  });

  return (
    <div className={clsx('rounded-xl border transition-all', expanded ? 'border-[var(--color-border-mid)]' : 'border-[var(--color-border)]')}
      style={{ background: expanded ? 'var(--color-navy-mid)' : 'rgba(26,46,69,0.5)' }}>
      {/* Phase header */}
      <button onClick={onToggle} className="w-full p-5 flex items-center gap-4 text-left">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: ps.bg }}>
          {phase.status === 'COMPLETE' ? (
            <svg width="14" height="14" fill="none" stroke={ps.color} strokeWidth="2" strokeLinecap="round"><path d="M3 7l3 3L11 4" /></svg>
          ) : (
            <span className="text-xs font-bold" style={{ color: ps.color }}>{index + 1}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{phase.name}</span>
            <span className="text-mono text-[10px] px-2 py-0.5 rounded-full" style={{ color: ps.color, background: ps.bg }}>
              {ps.label}
            </span>
          </div>
          <div className="text-xs text-[var(--color-text-faint)] mt-0.5">{phase.description}</div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {phase.typical_duration_days && (
            <span className="text-mono text-[10px] text-[var(--color-text-faint)]">{phase.typical_duration_days}d</span>
          )}
          <svg className={clsx('transition-transform', expanded && 'rotate-180')} width="14" height="14" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 5l4 4 4-4" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-[var(--color-border)]" style={{ animation: 'fadeIn 0.2s ease' }}>
          {/* Deliverables list */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-label">Deliverables</h4>
              {userRole === 'CREATIVE' && phase.status === 'ACTIVE' && (
                <button onClick={() => setShowSubmit(!showSubmit)} className="btn-ghost text-xs">
                  + Submit Deliverable
                </button>
              )}
            </div>

            {/* Submit form */}
            {showSubmit && (
              <div className="flex gap-2 mb-4">
                <input
                  value={submitTitle}
                  onChange={(e) => setSubmitTitle(e.target.value)}
                  placeholder="Deliverable title..."
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={() => submitMutation.mutate()}
                  disabled={!submitTitle.trim() || submitMutation.isPending}
                  className="btn-primary text-xs px-4"
                >
                  {submitMutation.isPending ? '...' : 'Submit'}
                </button>
              </div>
            )}

            {deliverables && deliverables.length > 0 ? (
              <div className="space-y-2">
                {deliverables.map((d: any) => {
                  const ds = deliverableStatusConfig[d.status] || deliverableStatusConfig.PENDING;
                  return (
                    <div key={d.id} className="p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[var(--color-border)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white">{d.title}</span>
                        <span className="text-mono text-[10px]" style={{ color: ds.color }}>{ds.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-mono text-[10px] text-[var(--color-text-faint)]">
                        <span>Rev {d.revision_number}</span>
                        <span>{new Date(d.created_at).toLocaleDateString()}</span>
                      </div>

                      {d.feedback && (
                        <div className="mt-2 p-2 rounded bg-[var(--color-danger-dim)] text-xs text-[var(--color-danger)]">
                          Feedback: {d.feedback}
                        </div>
                      )}

                      {/* Actions for CLIENT/PM */}
                      {(userRole === 'CLIENT' || userRole === 'PM') && d.status === 'SUBMITTED' && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => approveMutation.mutate(d.id)}
                            disabled={approveMutation.isPending}
                            className="btn-primary text-[11px] px-3 py-1.5"
                          >
                            Approve
                          </button>
                          <div className="flex-1 flex gap-2">
                            <input
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Revision feedback..."
                              className="input text-xs flex-1 py-1.5"
                            />
                            <button
                              onClick={() => revisionMutation.mutate({ deliverableId: d.id, fb: feedback })}
                              disabled={!feedback.trim() || revisionMutation.isPending}
                              className="btn-ghost text-[11px] px-3 text-[var(--color-danger)]"
                            >
                              Request Revision
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-faint)] py-3">No deliverables submitted yet.</p>
            )}
          </div>

          {/* Dependencies */}
          {phase.depends_on?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
              <span className="text-mono text-[10px] text-[var(--color-text-faint)]">
                Depends on: {phase.depends_on.map((depId: string) => {
                  const dep = allPhases?.find((p: any) => p.id === depId);
                  return dep?.name || depId;
                }).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Team Tab ─── */
function TeamTab({ project }: { project: any }) {
  const { data: rosterData } = useQuery({
    queryKey: ['roster', project.roster_id],
    queryFn: () => api.get(`/rosters/${project.roster_id}`).then((r) => r.data.data),
    enabled: !!project.roster_id,
  });

  const members = rosterData?.members || [];

  const avatarColors = [
    { bg: '#2E4A6B', text: '#72D9D2' },
    { bg: '#3D2E5C', text: '#C9A84C' },
    { bg: '#2A3E2E', text: '#7DD9A0' },
    { bg: '#4A2E2E', text: '#E8C97A' },
    { bg: '#2E3D4A', text: '#60A5FA' },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <h3 className="text-label mb-4">Project Team ({members.length} members)</h3>
      {members.length === 0 ? (
        <div className="card-flat p-8 text-center">
          <p className="text-[var(--color-text-muted)]">No team assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {members.map((m: any, i: number) => {
            const ac = avatarColors[i % avatarColors.length];
            return (
              <div key={m.id} className="card-flat p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: ac.bg, color: ac.text }}>
                  {(m.first_name || 'U')[0]}{(m.last_name || '')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{m.first_name} {m.last_name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {m.role_label && <span className="text-mono text-[10px] text-[var(--color-gold)]">{m.role_label}</span>}
                    {m.tier && <span className="text-mono text-[10px] text-[var(--color-text-faint)]">{m.tier}</span>}
                  </div>
                </div>
                {m.day_rate_cents && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium text-white">${(m.day_rate_cents / 100).toLocaleString()}</div>
                    <div className="text-mono text-[9px] text-[var(--color-text-faint)]">/ day</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Budget Tab ─── */
function BudgetTab({ project }: { project: any }) {
  const budget = (project.budget_cents || 0) / 100;
  const spent = (project.spent_cents || 0) / 100;
  const remaining = budget - spent;
  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-flat p-6">
          <div className="text-label mb-2">Total Budget</div>
          <div className="text-display text-2xl text-white">${budget.toLocaleString()}</div>
        </div>
        <div className="card-flat p-6">
          <div className="text-label mb-2">Spent</div>
          <div className="text-display text-2xl" style={{ color: pct > 90 ? 'var(--color-danger)' : pct > 70 ? 'var(--color-gold)' : 'var(--color-teal)' }}>
            ${spent.toLocaleString()}
          </div>
          <div className="text-mono text-[10px] text-[var(--color-text-faint)] mt-1">{pct}% of budget</div>
        </div>
        <div className="card-flat p-6">
          <div className="text-label mb-2">Remaining</div>
          <div className={clsx('text-display text-2xl', remaining < 0 ? 'text-[var(--color-danger)]' : 'text-white')}>
            ${remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Budget bar */}
      <div className="card-flat p-6">
        <h3 className="text-label mb-4">Budget Usage</h3>
        <div className="w-full h-4 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-500',
              pct > 90 ? 'bg-gradient-to-r from-[var(--color-danger)] to-[#FF8A8A]' :
              pct > 70 ? 'bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-hover)]' :
              'bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-teal-light)]'
            )}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-mono text-[10px] text-[var(--color-text-faint)]">$0</span>
          <span className="text-mono text-[10px] text-[var(--color-text-faint)]">${budget.toLocaleString()}</span>
        </div>

        {/* Threshold markers */}
        <div className="flex items-center gap-4 mt-4">
          <ThresholdMarker pct={75} label="75% Warning" color="var(--color-gold)" triggered={pct >= 75} />
          <ThresholdMarker pct={90} label="90% Alert" color="var(--color-danger)" triggered={pct >= 90} />
          <ThresholdMarker pct={100} label="Over Budget" color="var(--color-danger)" triggered={pct >= 100} />
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function MiniStat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="card-flat p-4">
      <div className="text-label mb-1">{label}</div>
      <div className="text-display text-xl" style={{ color: color || 'white' }}>{value}</div>
      {sub && <div className="text-mono text-[10px] text-[var(--color-text-faint)] mt-0.5">{sub}</div>}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-xs text-[var(--color-text-faint)]">{label}</dt>
      <dd className="text-xs font-medium text-[var(--color-text-secondary)]">{value}</dd>
    </div>
  );
}

function ThresholdMarker({ pct, label, color, triggered }: { pct: number; label: string; color: string; triggered: boolean }) {
  return (
    <div className={clsx('flex items-center gap-2 text-mono text-[10px]', triggered ? '' : 'opacity-40')}>
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span style={{ color }}>{label}</span>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { clsx } from 'clsx';

interface AIPMInsight {
  id: string;
  project_id: string;
  insight_type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  summary: string;
  details: Record<string, unknown>;
  recommendations: string[];
  status: string;
  created_at: string;
}

interface StatusReport {
  executive_summary: string;
  phase_status: Array<{ name: string; status: string; days_in_status: number; notes: string }>;
  budget_summary: {
    total_cents: number;
    spent_cents: number;
    percent_used: number;
    burn_rate_per_day: number;
    projected_total: number;
    assessment: string;
  };
  risks: Array<{ title: string; severity: string; mitigation: string }>;
  next_steps: string[];
  overall_health: string;
}

interface BudgetAnalysis {
  burn_rate_per_day_cents: number;
  projected_total_cents: number;
  runway_days: number;
  percent_used: number;
  status: string;
  recommendations: string[];
  optimization_opportunities: string[];
}

const severityConfig = {
  CRITICAL: {
    border: 'border-l-[var(--color-danger)]',
    badge: 'bg-[var(--color-danger-dim)] text-[var(--color-danger)]',
    icon: '!',
    dot: 'bg-[var(--color-danger)]',
  },
  WARNING: {
    border: 'border-l-[var(--color-gold)]',
    badge: 'bg-[var(--color-gold-dim)] text-[var(--color-gold)]',
    icon: '⚠',
    dot: 'bg-[var(--color-gold)]',
  },
  INFO: {
    border: 'border-l-[var(--color-teal)]',
    badge: 'bg-[var(--color-teal-dim)] text-[var(--color-teal)]',
    icon: 'i',
    dot: 'bg-[var(--color-teal)]',
  },
};

const insightTypeLabels: Record<string, string> = {
  HEALTH_CHECK: 'Health Check',
  RISK_DETECTION: 'Risk',
  BUDGET_ANALYSIS: 'Budget',
  TIMELINE_ALERT: 'Timeline',
  PHASE_RECOMMENDATION: 'Phase',
  WORKLOAD_ALERT: 'Workload',
  STATUS_REPORT: 'Report',
  MILESTONE_ALERT: 'Milestone',
};

export function AIPMTab({ projectId, userRole }: { projectId: string; userRole: string }) {
  const queryClient = useQueryClient();
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [statusReport, setStatusReport] = useState<StatusReport | null>(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState<BudgetAnalysis | null>(null);

  // Fetch active insights
  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['ai-pm-insights', projectId],
    queryFn: () => api.get(`/ai-pm/projects/${projectId}/insights`).then((r) => r.data.data),
    refetchInterval: 60_000, // Poll every 60s
  });

  const insights: AIPMInsight[] = insightsData || [];

  // Mutations
  const scanMutation = useMutation({
    mutationFn: () => api.post(`/ai-pm/projects/${projectId}/scan`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-pm-insights', projectId] }),
  });

  const reportMutation = useMutation({
    mutationFn: () => api.post(`/ai-pm/projects/${projectId}/status-report`).then((r) => r.data.data),
    onSuccess: (data: any) => setStatusReport(data),
  });

  const budgetMutation = useMutation({
    mutationFn: () => api.post(`/ai-pm/projects/${projectId}/budget-analysis`).then((r) => r.data.data),
    onSuccess: (data: any) => setBudgetAnalysis(data),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/ai-pm/insights/${id}/acknowledge`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-pm-insights', projectId] }),
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/ai-pm/insights/${id}/dismiss`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-pm-insights', projectId] }),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/ai-pm/insights/${id}/resolve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-pm-insights', projectId] }),
  });

  const isPM = userRole === 'PM';
  const criticalCount = insights.filter((i) => i.severity === 'CRITICAL').length;
  const warningCount = insights.filter((i) => i.severity === 'WARNING').length;

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Header with counts */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-label">AI Project Intelligence</h3>
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-danger-dim)] text-[var(--color-danger)]">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-gold-dim)] text-[var(--color-gold)]">
              {warningCount} warning{warningCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Quick Actions (PM only) */}
      {isPM && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
            className="btn-primary text-xs px-4 py-2 flex items-center gap-2"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="7" cy="7" r="5" />
              <path d="M7 4v3l2 1" />
            </svg>
            {scanMutation.isPending ? 'Scanning...' : 'Scan Now'}
          </button>
          <button
            onClick={() => reportMutation.mutate()}
            disabled={reportMutation.isPending}
            className="btn-ghost text-xs px-4 py-2"
          >
            {reportMutation.isPending ? 'Generating...' : 'Status Report'}
          </button>
          <button
            onClick={() => budgetMutation.mutate()}
            disabled={budgetMutation.isPending}
            className="btn-ghost text-xs px-4 py-2"
          >
            {budgetMutation.isPending ? 'Analyzing...' : 'Budget Analysis'}
          </button>
        </div>
      )}

      {/* Active Insights */}
      <div className="mb-8">
        <h4 className="text-mono text-[10px] text-[var(--color-text-faint)] uppercase tracking-wider mb-3">
          Active Insights ({insights.length})
        </h4>

        {insightsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : insights.length === 0 ? (
          <div className="card-flat p-8 text-center">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm text-[var(--color-text-muted)]">No active insights</p>
            <p className="text-xs text-[var(--color-text-faint)] mt-1">
              {isPM ? 'Run a scan to check project health.' : 'The AI PM will flag issues automatically.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => {
              const sev = severityConfig[insight.severity] || severityConfig.INFO;
              const expanded = expandedInsight === insight.id;

              return (
                <div
                  key={insight.id}
                  className={clsx('card-flat border-l-2 transition-all', sev.border)}
                >
                  {/* Insight header */}
                  <button
                    onClick={() => setExpandedInsight(expanded ? null : insight.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold', sev.badge)}>
                        {sev.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">{insight.title}</span>
                          <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-medium', sev.badge)}>
                            {insight.severity}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-[rgba(255,255,255,0.06)] text-[var(--color-text-faint)]">
                            {insightTypeLabels[insight.insight_type] || insight.insight_type}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{insight.summary}</p>
                      </div>
                      <svg
                        className={clsx('shrink-0 transition-transform mt-1', expanded && 'rotate-180')}
                        width="12" height="12" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5" strokeLinecap="round"
                      >
                        <path d="M3 4.5l3 3 3-3" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded recommendations + actions */}
                  {expanded && (
                    <div className="px-4 pb-4 border-t border-[var(--color-border)]" style={{ animation: 'fadeIn 0.15s ease' }}>
                      {/* Recommendations */}
                      {insight.recommendations?.length > 0 && (
                        <div className="mt-3">
                          <div className="text-mono text-[9px] text-[var(--color-text-faint)] uppercase tracking-wider mb-2">
                            Recommendations
                          </div>
                          <ul className="space-y-1.5">
                            {insight.recommendations.map((rec, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                                <span className="text-[var(--color-teal)] shrink-0 mt-0.5">→</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions (PM only) */}
                      {isPM && (
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--color-border)]">
                          <button
                            onClick={() => acknowledgeMutation.mutate(insight.id)}
                            disabled={acknowledgeMutation.isPending}
                            className="text-[11px] px-3 py-1.5 rounded-md bg-[rgba(255,255,255,0.06)] text-[var(--color-text-secondary)] hover:text-white hover:bg-[rgba(255,255,255,0.1)] transition-all"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => resolveMutation.mutate(insight.id)}
                            disabled={resolveMutation.isPending}
                            className="text-[11px] px-3 py-1.5 rounded-md bg-[var(--color-teal-dim)] text-[var(--color-teal)] hover:bg-[var(--color-teal)] hover:text-white transition-all"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => dismissMutation.mutate(insight.id)}
                            disabled={dismissMutation.isPending}
                            className="text-[11px] px-3 py-1.5 rounded-md text-[var(--color-text-faint)] hover:text-[var(--color-danger)] transition-all ml-auto"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="text-mono text-[9px] text-[var(--color-text-faint)] mt-3">
                        Generated {new Date(insight.created_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Report (if generated) */}
      {statusReport && (
        <div className="card-flat p-6 mb-6 border-l-2 border-l-[var(--color-gold)]" style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-label">Status Report</h4>
            <button onClick={() => setStatusReport(null)} className="text-[var(--color-text-faint)] hover:text-white text-xs">
              ✕
            </button>
          </div>

          {/* Executive Summary */}
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
            {statusReport.executive_summary}
          </p>

          {/* Phase Status */}
          <div className="mb-4">
            <div className="text-mono text-[9px] text-[var(--color-text-faint)] uppercase tracking-wider mb-2">Phase Status</div>
            <div className="space-y-1.5">
              {statusReport.phase_status?.map((ps, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">{ps.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-mono text-[10px] text-[var(--color-text-faint)]">{ps.days_in_status}d</span>
                    <span className={clsx('text-mono text-[10px] px-1.5 py-0.5 rounded',
                      ps.status === 'COMPLETE' ? 'bg-[var(--color-teal-dim)] text-[var(--color-teal)]' :
                      ps.status === 'ACTIVE' ? 'bg-[var(--color-gold-dim)] text-[var(--color-gold)]' :
                      'bg-[rgba(255,255,255,0.04)] text-[var(--color-text-faint)]'
                    )}>
                      {ps.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          {statusReport.risks?.length > 0 && (
            <div className="mb-4">
              <div className="text-mono text-[9px] text-[var(--color-text-faint)] uppercase tracking-wider mb-2">Risks</div>
              <div className="space-y-1.5">
                {statusReport.risks.map((risk, i) => (
                  <div key={i} className="p-2 rounded-lg bg-[rgba(255,255,255,0.03)] text-xs">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={clsx('w-1.5 h-1.5 rounded-full',
                        risk.severity === 'HIGH' ? 'bg-[var(--color-danger)]' :
                        risk.severity === 'MEDIUM' ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-teal)]'
                      )} />
                      <span className="text-white font-medium">{risk.title}</span>
                    </div>
                    <p className="text-[var(--color-text-faint)] ml-3.5">{risk.mitigation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {statusReport.next_steps?.length > 0 && (
            <div>
              <div className="text-mono text-[9px] text-[var(--color-text-faint)] uppercase tracking-wider mb-2">Next Steps</div>
              <ul className="space-y-1.5">
                {statusReport.next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-gold)] shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Budget Analysis (if generated) */}
      {budgetAnalysis && (
        <div className="card-flat p-6 border-l-2 border-l-[var(--color-teal)]" style={{ animation: 'fadeIn 0.2s ease' }}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-label">Budget Analysis</h4>
            <button onClick={() => setBudgetAnalysis(null)} className="text-[var(--color-text-faint)] hover:text-white text-xs">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-mono text-[9px] text-[var(--color-text-faint)]">Burn Rate</div>
              <div className="text-sm font-medium text-white">${((budgetAnalysis.burn_rate_per_day_cents || 0) / 100).toLocaleString()}/day</div>
            </div>
            <div>
              <div className="text-mono text-[9px] text-[var(--color-text-faint)]">Projected Total</div>
              <div className="text-sm font-medium text-white">${((budgetAnalysis.projected_total_cents || 0) / 100).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-mono text-[9px] text-[var(--color-text-faint)]">Runway</div>
              <div className={clsx('text-sm font-medium',
                (budgetAnalysis.runway_days || 0) < 14 ? 'text-[var(--color-danger)]' :
                (budgetAnalysis.runway_days || 0) < 30 ? 'text-[var(--color-gold)]' : 'text-[var(--color-teal)]'
              )}>
                {budgetAnalysis.runway_days} days
              </div>
            </div>
            <div>
              <div className="text-mono text-[9px] text-[var(--color-text-faint)]">Status</div>
              <div className={clsx('text-sm font-medium',
                budgetAnalysis.status === 'critical' || budgetAnalysis.status === 'over_budget' ? 'text-[var(--color-danger)]' :
                budgetAnalysis.status === 'warning' ? 'text-[var(--color-gold)]' : 'text-[var(--color-teal)]'
              )}>
                {budgetAnalysis.status?.replace('_', ' ').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {budgetAnalysis.recommendations?.length > 0 && (
            <div className="mb-3">
              <div className="text-mono text-[9px] text-[var(--color-text-faint)] uppercase tracking-wider mb-2">Recommendations</div>
              <ul className="space-y-1">
                {budgetAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-teal)] shrink-0">→</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optimization */}
          {budgetAnalysis.optimization_opportunities?.length > 0 && (
            <div>
              <div className="text-mono text-[9px] text-[var(--color-text-faint)] uppercase tracking-wider mb-2">Optimization Opportunities</div>
              <ul className="space-y-1">
                {budgetAnalysis.optimization_opportunities.map((opp, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-gold)] shrink-0">💡</span>
                    {opp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

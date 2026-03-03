/**
 * AI Brief Reflection Panel — Spec System 04
 * Shows AI analysis of a project brief: summary, deliverables,
 * ambiguities, timeline, budget assessment, and team recommendations.
 * Used in the project creation flow between submission and initialization.
 */
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { clsx } from 'clsx';

interface BriefReflection {
  summary: string;
  deliverables: string[];
  ambiguities: string[];
  proposed_timeline_days: number;
  phase_notes: string;
  flagged_gaps: string[];
  team_recommendations: string[];
  budget_assessment: string;
}

interface Props {
  projectId: string;
  onConfirm: () => void;
  onBack: () => void;
}

export function BriefReflectionPanel({ projectId, onConfirm, onBack }: Props) {
  const [reflection, setReflection] = useState<BriefReflection | null>(null);

  const reflectMutation = useMutation({
    mutationFn: () => api.post(`/projects/${projectId}/ai/reflect`).then(r => r.data.data),
    onSuccess: (data: any) => setReflection(data),
  });

  // Auto-trigger on mount
  useEffect(() => {
    reflectMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (reflectMutation.isPending) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-navy-light)] border border-[var(--color-border)] flex items-center justify-center">
              <svg className="animate-pulse" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
                <path d="M10 2v4M10 14v4M2 10h4M14 10h4M4.93 4.93l2.83 2.83M12.24 12.24l2.83 2.83M4.93 15.07l2.83-2.83M12.24 7.76l2.83-2.83" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Analyzing your brief...</p>
            <p className="text-xs text-[var(--color-text-faint)]">AI is reviewing your project requirements</p>
          </div>
        </div>
        <div className="max-w-xs mx-auto">
          <div className="h-1 bg-[var(--color-navy-light)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--color-gold)] rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (reflectMutation.isError) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-lg bg-[var(--color-danger)]/10 flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--color-danger)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v5M10 14v.01" />
          </svg>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">Could not analyze brief. You can still proceed.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => reflectMutation.mutate()} className="btn-secondary text-xs">Retry</button>
          <button onClick={onConfirm} className="btn-accent text-xs">Continue Anyway</button>
        </div>
      </div>
    );
  }

  if (!reflection) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--color-gold)" strokeWidth="1.5">
            <path d="M8 2v4M8 10v4M2 8h4M10 8h4" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Brief Analysis</h3>
          <p className="text-xs text-[var(--color-text-faint)]">Review these insights before launching your project</p>
        </div>
      </div>

      {/* Summary */}
      <div className="card-flat p-4">
        <h4 className="text-label mb-2">Summary</h4>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{reflection.summary}</p>
      </div>

      {/* Deliverables */}
      <div className="card-flat p-4">
        <h4 className="text-label mb-2">Expected Deliverables</h4>
        <ul className="space-y-1.5">
          {reflection.deliverables.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
              <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--color-teal)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 7l3 3 5-6" />
              </svg>
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* Two-column: Ambiguities & Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ambiguities */}
        {reflection.ambiguities.length > 0 && (
          <div className="card-flat p-4 border-l-2 border-[var(--color-gold)]">
            <h4 className="text-label mb-2 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="var(--color-gold)">
                <circle cx="6" cy="6" r="5" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" />
                <path d="M6 4v2.5M6 8.5v.01" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Questions to Consider
            </h4>
            <ul className="space-y-2">
              {reflection.ambiguities.map((a, i) => (
                <li key={i} className="text-xs text-[var(--color-text-muted)] leading-relaxed">{a}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Flagged Gaps */}
        {reflection.flagged_gaps.length > 0 && (
          <div className="card-flat p-4 border-l-2 border-[var(--color-danger)]">
            <h4 className="text-label mb-2 flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--color-danger)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 1l5 10H1L6 1z" />
                <path d="M6 5v2M6 9v.01" />
              </svg>
              Flagged Gaps
            </h4>
            <ul className="space-y-2">
              {reflection.flagged_gaps.map((g, i) => (
                <li key={i} className="text-xs text-[var(--color-text-muted)] leading-relaxed">{g}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Timeline & Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-flat p-4">
          <h4 className="text-label mb-1">Estimated Timeline</h4>
          <p className="text-display text-2xl text-[var(--color-gold)]">{reflection.proposed_timeline_days} days</p>
          <p className="text-xs text-[var(--color-text-faint)] mt-1">{reflection.phase_notes}</p>
        </div>
        <div className="card-flat p-4">
          <h4 className="text-label mb-1">Budget Assessment</h4>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{reflection.budget_assessment}</p>
        </div>
      </div>

      {/* Team Recommendations */}
      {reflection.team_recommendations.length > 0 && (
        <div className="card-flat p-4">
          <h4 className="text-label mb-2">Recommended Team</h4>
          <div className="flex flex-wrap gap-2">
            {reflection.team_recommendations.map((r, i) => (
              <span key={i} className="badge badge-neutral">{r}</span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={onBack} className="btn-secondary text-xs">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 3L5 7l4 4" />
          </svg>
          Edit Brief
        </button>
        <button onClick={onConfirm} className="btn-accent">
          Launch Project
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 3l4 4-4 4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

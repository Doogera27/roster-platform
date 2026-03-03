import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { clsx } from 'clsx';
import { BriefReflectionPanel } from '../components/BriefReflectionPanel';

const projectTypes = [
  { value: 'BRAND_IDENTITY', label: 'Brand Identity', desc: 'Logo, visual system, brand guidelines', icon: '◆', duration: '~4 weeks' },
  { value: 'CAMPAIGN_CONCEPT', label: 'Campaign Concept', desc: 'Creative campaigns and launches', icon: '◈', duration: '~3.5 weeks' },
  { value: 'WEBSITE_REDESIGN', label: 'Website Redesign', desc: 'Full website design and development', icon: '▣', duration: '~7 weeks' },
  { value: 'SOCIAL_CONTENT', label: 'Social Content', desc: 'Social media strategy and assets', icon: '◎', duration: '~2.5 weeks' },
  { value: 'VIDEO_MOTION', label: 'Video & Motion', desc: 'Video production and animation', icon: '▶', duration: '~4 weeks' },
  { value: 'EMAIL_CAMPAIGN', label: 'Email Campaign', desc: 'Email design and campaign execution', icon: '✉', duration: '~2 weeks' },
  { value: 'PRINT_OOH', label: 'Print & OOH', desc: 'Print materials and outdoor advertising', icon: '▧', duration: '~2 weeks' },
  { value: 'BRAND_PHOTOGRAPHY', label: 'Brand Photography', desc: 'Professional photography shoots', icon: '◯', duration: '~2 weeks' },
];

const steps = ['Type', 'Brief', 'Roster', 'Budget', 'Review', 'AI Analysis'];

export function NewProjectPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draftProjectId, setDraftProjectId] = useState<string | null>(null);
  const [form, setForm] = useState({
    project_type: '',
    name: '',
    brief: '',
    roster_id: '',
    budget_cents: 0,
    budget_display: '',
    due_date: '',
  });

  const update = (partial: Partial<typeof form>) => setForm((f) => ({ ...f, ...partial }));

  // Workflow templates (Phase 5.1)
  const { data: templatesData } = useQuery({
    queryKey: ['workflow-templates'],
    queryFn: () => api.get('/projects/templates').then((r) => r.data.data),
  });
  const templates = (templatesData || []) as any[];
  const selectedTemplate = useMemo(
    () => templates.find((t: any) => t.project_type === form.project_type),
    [templates, form.project_type],
  );

  const { data: rostersData } = useQuery({
    queryKey: ['rosters'],
    queryFn: () => api.get('/rosters').then((r) => r.data.data),
    enabled: step >= 2,
  });
  const rosters = rostersData || [];

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/projects', {
        name: form.name,
        project_type: form.project_type,
        roster_id: form.roster_id,
        brief: form.brief,
        budget_cents: form.budget_cents,
        due_date: form.due_date || undefined,
      }),
    onSuccess: (res: any) => {
      const project = res.data.data;
      navigate(`/projects/${project.id}`);
    },
  });

  const initMutation = useMutation({
    mutationFn: (projectId: string) =>
      api.post(`/projects/${projectId}/initialize`),
    onSuccess: (res: any) => {
      navigate(`/projects/${res.data.data.id}`);
    },
  });

  const canContinue = () => {
    if (step === 0) return form.project_type !== '';
    if (step === 1) return form.name.trim().length > 0 && form.brief.trim().length >= 10;
    if (step === 2) return form.roster_id !== '';
    if (step === 3) return form.budget_cents > 0;
    return true;
  };

  const handleCreateDraft = async () => {
    try {
      const res = await createMutation.mutateAsync();
      const project = res.data.data;
      setDraftProjectId(project.id);
      setStep(5); // Move to AI Analysis step
    } catch {
      // Error handled by mutation state
    }
  };

  const handleConfirmAndLaunch = async () => {
    if (!draftProjectId) return;
    try {
      await initMutation.mutateAsync(draftProjectId);
    } catch {
      // Error handled by mutation state
    }
  };

  const selectedType = projectTypes.find((t) => t.value === form.project_type);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button onClick={() => navigate('/projects')} className="btn-ghost text-xs mb-4">
          ← Back to Projects
        </button>
        <h1 className="text-display text-3xl text-white mb-2">
          Create a <em>New Project</em>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Define your project, select a team, and set your budget.
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                i === step && 'bg-[var(--color-gold-dim)] text-[var(--color-gold)] border border-[var(--color-gold-border)]',
                i < step && 'bg-[rgba(46,196,182,0.1)] text-[var(--color-teal)] cursor-pointer',
                i > step && 'bg-[rgba(255,255,255,0.03)] text-[var(--color-text-faint)]',
              )}
            >
              {i < step ? (
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 6l3 3L10 3" /></svg>
              ) : (
                <span className="text-[10px] font-bold">{i + 1}</span>
              )}
              {s}
            </button>
            {i < steps.length - 1 && (
              <div className={clsx('w-8 h-px', i < step ? 'bg-[var(--color-teal)]' : 'bg-[var(--color-border)]')} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Project Type */}
      {step === 0 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <h2 className="text-heading text-xl text-white mb-1">What type of project?</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">This determines the workflow template and phase structure.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projectTypes.map((type) => {
              const selected = form.project_type === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => update({ project_type: type.value })}
                  className={clsx(
                    'p-5 rounded-xl text-left transition-all border group',
                    selected
                      ? 'bg-[var(--color-gold-dim)] border-[var(--color-gold-border)]'
                      : 'bg-[var(--color-navy-mid)] border-[var(--color-border)] hover:border-[var(--color-border-mid)]',
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={clsx('text-lg', selected ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-faint)]')}>
                      {type.icon}
                    </span>
                    <span className="text-mono text-[10px] text-[var(--color-text-faint)]">{type.duration}</span>
                  </div>
                  <div className={clsx('text-sm font-medium mb-1', selected ? 'text-[var(--color-gold)]' : 'text-white')}>
                    {type.label}
                  </div>
                  <div className="text-xs text-[var(--color-text-faint)]">{type.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Workflow Template Preview */}
          {selectedTemplate && (
            <div className="mt-6 card-flat p-5" style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-white">Workflow Template</h3>
                  <p className="text-xs text-[var(--color-text-faint)] mt-0.5">{selectedTemplate.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-mono text-xs text-[var(--color-teal)]">{selectedTemplate.estimated_total_duration_days} days</span>
                  <p className="text-[10px] text-[var(--color-text-faint)]">estimated duration</p>
                </div>
              </div>

              {/* Phase timeline */}
              <div className="space-y-0">
                {(selectedTemplate.phases as any[]).map((phase: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-[var(--color-gold)] bg-[var(--color-navy-mid)] mt-1.5 shrink-0" />
                      {idx < (selectedTemplate.phases as any[]).length - 1 && (
                        <div className="w-px flex-1 bg-[var(--color-border)] min-h-[28px]" />
                      )}
                    </div>
                    {/* Phase content */}
                    <div className="pb-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white">{phase.name}</span>
                        <span className="text-mono text-[10px] text-[var(--color-text-faint)]">{phase.typical_duration_days}d</span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-faint)] leading-relaxed mt-0.5">{phase.description}</p>
                      {phase.required_roles && phase.required_roles.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {phase.required_roles.map((role: string) => (
                            <span key={role} className="px-1.5 py-0.5 rounded text-[9px] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-faint)] border border-[var(--color-border)]">
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTemplate.recommended_roles?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <span className="text-label mb-1 block">Recommended Roles</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTemplate.recommended_roles.map((role: string) => (
                      <span key={role} className="chip text-[10px]">{role}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Brief */}
      {step === 1 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <h2 className="text-heading text-xl text-white mb-1">Project Brief</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Describe what you need. The more detail you provide, the better your creative team can deliver.
          </p>

          <div className="space-y-5">
            <div>
              <label className="text-label mb-2 block">Project Name *</label>
              <input
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder={`e.g. ${selectedType?.label || 'Project'} — Spring 2026`}
                className="input"
              />
            </div>

            <div>
              <label className="text-label mb-2 block">Creative Brief *</label>
              <textarea
                value={form.brief}
                onChange={(e) => update({ brief: e.target.value })}
                placeholder="Describe the project goals, target audience, deliverables, and any specific requirements or constraints..."
                rows={8}
                className="input resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[var(--color-text-faint)]">
                  Include objectives, target audience, tone of voice, and any reference materials.
                </p>
                <span className={clsx('text-mono text-[10px]', form.brief.length < 10 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-faint)]')}>
                  {form.brief.length} chars
                </span>
              </div>
            </div>

            {selectedType && (
              <div className="card-flat p-4">
                <div className="text-label mb-2">Selected Type</div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--color-gold)]">{selectedType.icon}</span>
                  <span className="text-sm font-medium text-white">{selectedType.label}</span>
                  <span className="text-mono text-[10px] text-[var(--color-text-faint)]">{selectedType.duration}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Roster Selection */}
      {step === 2 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <h2 className="text-heading text-xl text-white mb-1">Select a Roster</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Choose the creative team for this project from your saved rosters.
          </p>

          {rosters.length === 0 ? (
            <div className="card-flat p-8 text-center">
              <p className="text-[var(--color-text-muted)] mb-4">You haven't created any rosters yet.</p>
              <button onClick={() => navigate('/creatives')} className="btn-secondary text-sm">
                Browse Talent & Build a Roster
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {rosters.map((roster: any) => {
                const selected = form.roster_id === roster.id;
                return (
                  <button
                    key={roster.id}
                    onClick={() => update({ roster_id: roster.id })}
                    className={clsx(
                      'w-full p-5 rounded-xl text-left transition-all border flex items-center justify-between',
                      selected
                        ? 'bg-[var(--color-gold-dim)] border-[var(--color-gold-border)]'
                        : 'bg-[var(--color-navy-mid)] border-[var(--color-border)] hover:border-[var(--color-border-mid)]',
                    )}
                  >
                    <div>
                      <div className={clsx('text-sm font-medium mb-1', selected ? 'text-[var(--color-gold)]' : 'text-white')}>
                        {roster.name}
                      </div>
                      <div className="text-mono text-[11px] text-[var(--color-text-faint)]">
                        {roster.member_count || 0} members
                        {roster.cost_estimate && (
                          <> · ${((roster.cost_estimate || 0) / 100).toLocaleString()}/day</>
                        )}
                      </div>
                    </div>
                    {selected && (
                      <svg width="20" height="20" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round">
                        <path d="M4 10l4 4L16 6" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Budget & Timeline */}
      {step === 3 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <h2 className="text-heading text-xl text-white mb-1">Budget & Timeline</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Set your project budget and target completion date.
          </p>

          <div className="space-y-5">
            <div>
              <label className="text-label mb-2 block">Project Budget *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)] text-sm">$</span>
                <input
                  type="text"
                  value={form.budget_display}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    const num = parseInt(val) || 0;
                    update({ budget_display: num ? num.toLocaleString() : '', budget_cents: num * 100 });
                  }}
                  placeholder="10,000"
                  className="input pl-7"
                />
              </div>
              <div className="flex gap-2 mt-3">
                {[5000, 10000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => update({ budget_cents: amt * 100, budget_display: amt.toLocaleString() })}
                    className={clsx(
                      'flex-1 py-2 rounded-lg text-xs font-medium border transition-all',
                      form.budget_cents === amt * 100
                        ? 'bg-[var(--color-gold-dim)] border-[var(--color-gold-border)] text-[var(--color-gold)]'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-mid)]',
                    )}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-label mb-2 block">Target Completion Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => update({ due_date: e.target.value })}
                className="input"
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-[var(--color-text-faint)] mt-2">
                {selectedType && `Typical duration for ${selectedType.label}: ${selectedType.duration}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <h2 className="text-heading text-xl text-white mb-1">Review & Launch</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">
            Confirm your project details before launching.
          </p>

          <div className="space-y-4">
            <ReviewRow label="Project Type" value={selectedType?.label || ''} />
            <ReviewRow label="Project Name" value={form.name} />
            <ReviewRow label="Brief" value={form.brief.length > 200 ? form.brief.slice(0, 200) + '…' : form.brief} />
            <ReviewRow label="Roster" value={rosters.find((r: any) => r.id === form.roster_id)?.name || ''} />
            <ReviewRow label="Budget" value={`$${(form.budget_cents / 100).toLocaleString()}`} />
            {form.due_date && <ReviewRow label="Due Date" value={new Date(form.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />}
          </div>

          {(createMutation.isError || initMutation.isError) && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--color-danger-dim)] border border-[rgba(255,107,107,0.25)]">
              <p className="text-sm text-[var(--color-danger)]">
                {(createMutation.error as any)?.response?.data?.errors?.[0]?.message || 'Failed to create project. Please try again.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 5: AI Analysis */}
      {step === 5 && draftProjectId && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <BriefReflectionPanel
            projectId={draftProjectId}
            onConfirm={handleConfirmAndLaunch}
            onBack={() => setStep(4)}
          />
          {initMutation.isPending && (
            <div className="text-center py-4">
              <p className="text-sm text-[var(--color-text-muted)]">Initializing project phases...</p>
            </div>
          )}
          {initMutation.isError && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--color-danger-dim)] border border-[rgba(255,107,107,0.25)]">
              <p className="text-sm text-[var(--color-danger)]">Failed to launch project. Please try again.</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation — hidden on AI Analysis step (BriefReflectionPanel has its own buttons) */}
      {step < 5 && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--color-border)]">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="btn-ghost text-sm">← Back</button>
          ) : (
            <button onClick={() => navigate('/projects')} className="btn-ghost text-sm">Cancel</button>
          )}

          {step < 4 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canContinue()} className="btn-primary px-6 py-2.5 text-sm">
              Continue →
            </button>
          ) : (
            <button
              onClick={handleCreateDraft}
              disabled={createMutation.isPending}
              className="btn-accent px-8 py-2.5 text-sm"
            >
              {createMutation.isPending ? 'Creating…' : 'Review with AI →'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-flat p-4 flex items-start gap-4">
      <div className="text-label w-28 shrink-0 pt-0.5">{label}</div>
      <div className="text-sm text-white leading-relaxed">{value}</div>
    </div>
  );
}

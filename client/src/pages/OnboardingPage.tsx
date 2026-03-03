import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { clsx } from 'clsx';

const industries = [
  'Consumer Brands', 'Technology', 'Healthcare', 'Financial Services',
  'Real Estate', 'Food & Beverage', 'Fashion & Apparel', 'Entertainment',
  'Education', 'Nonprofit', 'Hospitality', 'Retail', 'Other',
];

const creativeNeeds = [
  { id: 'brand_identity', label: 'Brand Identity', desc: 'Logo, visual system, brand guidelines' },
  { id: 'campaign', label: 'Campaigns', desc: 'Ad campaigns, launches, promotions' },
  { id: 'web_design', label: 'Web Design', desc: 'Website design and development' },
  { id: 'social', label: 'Social Content', desc: 'Social media assets and strategy' },
  { id: 'video', label: 'Video & Motion', desc: 'Video production, animation, motion' },
  { id: 'photography', label: 'Photography', desc: 'Product, lifestyle, brand photography' },
  { id: 'copywriting', label: 'Copywriting', desc: 'Brand voice, messaging, content' },
  { id: 'print', label: 'Print & OOH', desc: 'Packaging, signage, collateral' },
];

const steps = [
  { num: 1, label: 'Company' },
  { num: 2, label: 'Brand' },
  { num: 3, label: 'Needs' },
  { num: 4, label: 'Welcome' },
];

interface OnboardingData {
  company_name: string;
  website: string;
  industry: string;
  brand_description: string;
  creative_needs: string[];
  team_size: string;
}

export function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    company_name: '',
    website: '',
    industry: '',
    brand_description: '',
    creative_needs: [],
    team_size: '',
  });

  const mutation = useMutation({
    mutationFn: (payload: OnboardingData) =>
      api.post('/auth/onboarding', payload),
    onSuccess: () => setStep(4),
  });

  const update = (partial: Partial<OnboardingData>) =>
    setData((d) => ({ ...d, ...partial }));

  const toggleNeed = (id: string) => {
    const needs = data.creative_needs.includes(id)
      ? data.creative_needs.filter((n) => n !== id)
      : [...data.creative_needs, id];
    update({ creative_needs: needs });
  };

  const canContinue = () => {
    if (step === 1) return data.company_name.trim().length > 0 && data.industry.length > 0;
    if (step === 2) return true; // optional
    if (step === 3) return data.creative_needs.length > 0;
    return true;
  };

  const next = () => {
    if (step === 3) {
      mutation.mutate(data);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-navy)] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #112233 100%)' }}>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(46,196,182,0.04) 0%, transparent 70%)' }} />

        <div className="relative flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-2">
            <span className="text-[22px] font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>ROSTER</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
          </div>

          <div className="max-w-md">
            <h1 className="text-display text-4xl text-white mb-4 leading-tight">
              {step === 1 && <>Tell us about <em>your company</em></>}
              {step === 2 && <>Define your <em>brand identity</em></>}
              {step === 3 && <>What creative work do <em>you need?</em></>}
              {step === 4 && <>You're all set, <em>welcome aboard</em></>}
            </h1>
            <p className="text-[var(--color-text-muted)] leading-relaxed">
              {step === 1 && "We'll use this to personalize your experience and match you with the right creative talent."}
              {step === 2 && 'Share your brand story so creative teams can hit the ground running on every project.'}
              {step === 3 && 'Select the types of creative work you typically need. You can always change this later.'}
              {step === 4 && 'Your workspace is ready. Start browsing vetted creatives and building your first roster.'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {steps.map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step >= s.num
                    ? 'bg-[var(--color-gold)] text-[var(--color-navy)]'
                    : 'bg-[rgba(255,255,255,0.06)] text-[var(--color-text-faint)]',
                )}>
                  {step > s.num ? (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M2 7l3.5 3.5L12 4" />
                    </svg>
                  ) : s.num}
                </div>
                <span className={clsx(
                  'text-mono text-[10px] font-medium',
                  step >= s.num ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-faint)]',
                )}>
                  {s.label}
                </span>
                {s.num < 4 && <div className={clsx('w-6 h-px', step > s.num ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-border)]')} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right content panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[22px] font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>ROSTER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
            </div>
            <div className="flex gap-2 mb-4">
              {steps.map((s) => (
                <div key={s.num} className={clsx('flex-1 h-1 rounded-full', step >= s.num ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-border)]')} />
              ))}
            </div>
          </div>

          {/* Step 1: Company Details */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="text-label mb-6">Step 1 of 3</div>
              <h2 className="text-heading text-2xl text-white mb-2">Company Details</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-8">This helps us match you with relevant creative talent.</p>

              <div className="space-y-5">
                <div>
                  <label className="text-label mb-2 block">Company Name *</label>
                  <input
                    value={data.company_name}
                    onChange={(e) => update({ company_name: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-label mb-2 block">Website</label>
                  <input
                    value={data.website}
                    onChange={(e) => update({ website: e.target.value })}
                    placeholder="e.g. acmecorp.com"
                    className="input"
                  />
                </div>

                <div>
                  <label className="text-label mb-2 block">Industry *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {industries.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => update({ industry: ind })}
                        className={clsx(
                          'px-3 py-2.5 rounded-lg text-sm text-left transition-all border',
                          data.industry === ind
                            ? 'bg-[var(--color-gold-dim)] border-[var(--color-gold-border)] text-[var(--color-gold)]'
                            : 'bg-[rgba(255,255,255,0.03)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-mid)] hover:text-white',
                        )}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Brand Identity */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="text-label mb-6">Step 2 of 3</div>
              <h2 className="text-heading text-2xl text-white mb-2">Your Brand</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-8">Help creatives understand your brand from day one. You can skip this and add assets to your Brand Vault later.</p>

              <div className="space-y-5">
                <div>
                  <label className="text-label mb-2 block">Brand Description</label>
                  <textarea
                    value={data.brand_description}
                    onChange={(e) => update({ brand_description: e.target.value })}
                    placeholder="Tell us about your brand's personality, values, and target audience..."
                    rows={5}
                    className="input resize-none"
                  />
                  <p className="text-xs text-[var(--color-text-faint)] mt-2">This helps creative teams align with your brand voice and visual identity.</p>
                </div>

                <div className="card-flat p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-gold-dim)] flex items-center justify-center">
                      <svg width="20" height="20" fill="none" stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M10 4v12M4 10h12" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Brand Vault</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Upload logos, guidelines, and brand assets</div>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-text-faint)]">
                    You'll be able to upload brand assets in your Brand Vault after setup. This gives your creative teams instant access to everything they need.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Creative Needs */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="text-label mb-6">Step 3 of 3</div>
              <h2 className="text-heading text-2xl text-white mb-2">Creative Needs</h2>
              <p className="text-sm text-[var(--color-text-muted)] mb-8">Select the types of creative work you typically need. This helps us surface the most relevant talent.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {creativeNeeds.map((need) => {
                  const selected = data.creative_needs.includes(need.id);
                  return (
                    <button
                      key={need.id}
                      onClick={() => toggleNeed(need.id)}
                      className={clsx(
                        'p-4 rounded-xl text-left transition-all border',
                        selected
                          ? 'bg-[var(--color-gold-dim)] border-[var(--color-gold-border)]'
                          : 'bg-[rgba(255,255,255,0.03)] border-[var(--color-border)] hover:border-[var(--color-border-mid)]',
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={clsx('text-sm font-medium', selected ? 'text-[var(--color-gold)]' : 'text-white')}>
                          {need.label}
                        </span>
                        {selected && (
                          <svg width="16" height="16" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round">
                            <path d="M3 8l3.5 3.5L13 5" />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs text-[var(--color-text-faint)]">{need.desc}</div>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="text-label mb-2 block">Typical Team Size</label>
                <div className="flex gap-2">
                  {['1-3', '4-8', '9-15', '15+'].map((size) => (
                    <button
                      key={size}
                      onClick={() => update({ team_size: size })}
                      className={clsx(
                        'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border',
                        data.team_size === size
                          ? 'bg-[var(--color-gold-dim)] border-[var(--color-gold-border)] text-[var(--color-gold)]'
                          : 'bg-[rgba(255,255,255,0.03)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-mid)]',
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Welcome */}
          {step === 4 && (
            <div style={{ animation: 'fadeIn 0.3s ease' }} className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--color-gold-dim)] flex items-center justify-center">
                <svg width="36" height="36" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round">
                  <path d="M8 18l7 7L28 11" />
                </svg>
              </div>
              <h2 className="text-display text-3xl text-white mb-3">
                Welcome to <em>Roster</em>
              </h2>
              <p className="text-[var(--color-text-muted)] mb-2 max-w-sm mx-auto">
                Your workspace is ready. Here's what you can do next:
              </p>

              <div className="grid grid-cols-1 gap-3 mt-8 mb-8 text-left max-w-sm mx-auto">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.03)]">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-gold-dim)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[var(--color-gold)]">1</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Browse creative talent</div>
                    <div className="text-xs text-[var(--color-text-faint)]">Explore vetted designers, strategists, and more</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.03)]">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-gold-dim)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[var(--color-gold)]">2</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Build your first roster</div>
                    <div className="text-xs text-[var(--color-text-faint)]">Assemble the perfect team for your project</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.03)]">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-gold-dim)] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[var(--color-gold)]">3</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Upload brand assets</div>
                    <div className="text-xs text-[var(--color-text-faint)]">Add logos, guidelines, and templates to your vault</div>
                  </div>
                </div>
              </div>

              <button onClick={onComplete} className="btn-primary px-8 py-3 text-sm">
                Go to Dashboard →
              </button>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 4 && (
            <div className="flex items-center justify-between mt-10">
              {step > 1 ? (
                <button onClick={() => setStep((s) => s - 1)} className="btn-ghost text-sm">
                  ← Back
                </button>
              ) : <div />}
              <button
                onClick={next}
                disabled={!canContinue() || mutation.isPending}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                {mutation.isPending ? 'Setting up...' : step === 3 ? 'Complete Setup' : 'Continue →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

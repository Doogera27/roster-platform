import { useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getInvite, isValidInvite } from '../data/charterInvites';
import { CHARTER_BENEFITS } from '../data/charterBenefits';

/* ─── Specialty options (shared between Primary + Other) ─── */
const SPECIALTIES = [
  'Design',
  'Photography',
  'Videography',
  'Illustration',
  'Motion Graphics',
  'Copywriting',
  'Art Direction',
  'Branding',
  'Social Media',
  'Web Development',
  'Other',
] as const;

const EXPERIENCE_OPTIONS = ['1-2', '3-5', '6-10', '10+'] as const;

/* ─── Types ─── */
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  portfolio: string;
  location: string;
  primarySpecialty: string;
  otherSpecialties: string[];
  experience: string;
  sampleWork: string;
  bio: string;
  howKnowZach: string;
}

const INITIAL_FORM: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  portfolio: '',
  location: '',
  primarySpecialty: '',
  otherSpecialties: [],
  experience: '',
  sampleWork: '',
  bio: '',
  howKnowZach: '',
};

/* Benefits imported from shared data file (CHARTER_BENEFITS) */

/* ════════════════════════════════════════════════════════════════ */
/*  Charter Page                                                   */
/* ════════════════════════════════════════════════════════════════ */

export function CharterPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const invite = inviteCode ? getInvite(inviteCode) : undefined;

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  /* ── Invalid invite ── */
  if (!inviteCode || !isValidInvite(inviteCode)) {
    return (
      <div className="min-h-screen bg-[var(--color-navy)] flex flex-col items-center justify-center px-6 text-center">
        <Logo />
        <div className="mt-12 max-w-md">
          <h1 className="text-display text-3xl text-white mb-4">This invite link isn't valid</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">
            Charter access is invite-only. If you think this is a mistake, reach out to Zach directly.
          </p>
          <Link to="/" className="btn-primary px-6 py-3 text-sm">
            Visit Roster
          </Link>
        </div>
      </div>
    );
  }

  /* ── Helpers ── */
  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleOtherSpecialty(s: string) {
    setForm((prev) => ({
      ...prev,
      otherSpecialties: prev.otherSpecialties.includes(s)
        ? prev.otherSpecialties.filter((x) => x !== s)
        : [...prev.otherSpecialties, s],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/.netlify/functions/charter-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, inviteCode }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  /* ── Success state ── */
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[var(--color-navy)] flex flex-col items-center justify-center px-6 text-center">
        <Logo />
        <div className="mt-12 max-w-lg">
          {/* Animated checkmark */}
          <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-[var(--color-teal-dim)] border-2 border-[var(--color-teal-border)] flex items-center justify-center animate-[scaleIn_0.4s_ease-out]">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-display text-3xl text-white mb-3">
            You're in the running, {invite!.name}.
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg mb-8">
            Zach will review your application and be in touch soon. Welcome to the beginning of something great.
          </p>
          <Link to="/" className="btn-secondary px-6 py-3 text-sm">
            Learn more about Roster
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main page ── */
  return (
    <div className="min-h-screen bg-[var(--color-navy)]">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-center py-6">
        <Logo />
      </header>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-8 pb-12 text-center">
        {/* Charter badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-[var(--color-teal-border)] bg-[var(--color-teal-dim)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)]" />
          <span className="text-[var(--color-teal-light)] text-xs font-medium tracking-wide uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
            Invite Only
          </span>
        </div>

        <h1 className="text-display text-4xl sm:text-5xl text-white mb-4">
          Hey {invite!.name}, you're invited.
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg max-w-xl mx-auto leading-relaxed">
          Join the founding cohort of Roster — an invite-only creative operations platform.
          Help us build something that actually works for creatives.
        </p>
      </section>

      {/* ── Why Charter ── */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-2 gap-4">
          {CHARTER_BENEFITS.map((b) => (
            <div
              key={b.title}
              className="card-flat p-5 flex gap-4 items-start"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-[var(--color-teal-dim)] border border-[var(--color-teal-border)] flex items-center justify-center text-[var(--color-teal)]">
                {b.icon}
              </div>
              <div>
                <h3 className="text-heading text-base text-white mb-1">{b.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Application Form ── */}
      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="card-flat p-8 sm:p-10">
          <h2 className="text-heading text-2xl text-white mb-1">Apply for Charter Access</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-8">
            Tell us about yourself. This takes about 3 minutes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name (two columns) */}
            <div className="grid sm:grid-cols-2 gap-4">
              <FieldGroup label="First Name" required>
                <input
                  className="input"
                  type="text"
                  required
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                />
              </FieldGroup>
              <FieldGroup label="Last Name" required>
                <input
                  className="input"
                  type="text"
                  required
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                />
              </FieldGroup>
            </div>

            {/* Email */}
            <FieldGroup label="Email" required>
              <input
                className="input"
                type="email"
                required
                placeholder="jane@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </FieldGroup>

            {/* Portfolio */}
            <FieldGroup label="Portfolio URL" required>
              <input
                className="input"
                type="url"
                required
                placeholder="https://yourportfolio.com"
                value={form.portfolio}
                onChange={(e) => set('portfolio', e.target.value)}
              />
            </FieldGroup>

            {/* Location */}
            <FieldGroup label="Location" required hint="City, State/Country">
              <input
                className="input"
                type="text"
                required
                placeholder="Austin, TX"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
              />
            </FieldGroup>

            {/* Primary Specialty */}
            <FieldGroup label="Primary Specialty" required>
              <select
                className="input"
                required
                value={form.primarySpecialty}
                onChange={(e) => set('primarySpecialty', e.target.value)}
              >
                <option value="">Select your main specialty</option>
                {SPECIALTIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </FieldGroup>

            {/* Other Specialties (checkboxes) */}
            <FieldGroup label="Other Specialties" hint="Select all that apply">
              <div className="flex flex-wrap gap-2 mt-1">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleOtherSpecialty(s)}
                    className={`${
                      form.otherSpecialties.includes(s) ? 'chip-active' : ''
                    } chip`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FieldGroup>

            {/* Experience */}
            <FieldGroup label="Years of Experience" required>
              <select
                className="input"
                required
                value={form.experience}
                onChange={(e) => set('experience', e.target.value)}
              >
                <option value="">Select range</option>
                {EXPERIENCE_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o} years</option>
                ))}
              </select>
            </FieldGroup>

            {/* Sample Work */}
            <FieldGroup label="Sample Work URL" hint="Optional — link to a standout project">
              <input
                className="input"
                type="url"
                placeholder="https://dribbble.com/shots/..."
                value={form.sampleWork}
                onChange={(e) => set('sampleWork', e.target.value)}
              />
            </FieldGroup>

            {/* Bio */}
            <FieldGroup label="Short Bio" required hint="What should brands know about you?">
              <textarea
                className="input min-h-[100px] resize-y"
                required
                maxLength={500}
                placeholder="Tell us about your work, style, and what makes you stand out..."
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
              />
              <div className="text-right text-xs text-[var(--color-text-faint)] mt-1">
                {form.bio.length}/500
              </div>
            </FieldGroup>

            {/* How do you know Zach */}
            <FieldGroup label="How do you know Zach?" required>
              <textarea
                className="input min-h-[80px] resize-y"
                required
                placeholder="We worked together on..., Met at..., Referred by..."
                value={form.howKnowZach}
                onChange={(e) => set('howKnowZach', e.target.value)}
              />
            </FieldGroup>

            {/* Error message */}
            {status === 'error' && (
              <div className="p-3 rounded-lg bg-[var(--color-danger-dim)] border border-[rgba(255,107,107,0.25)] text-[var(--color-danger)] text-sm">
                {errorMsg}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-primary w-full py-3.5 text-sm"
            >
              {status === 'submitting' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Apply for Charter Access'
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center pb-8">
        <p className="text-xs text-[var(--color-text-faint)]">
          Roster &mdash; The Creative Operations Platform
        </p>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Shared sub-components                                          */
/* ════════════════════════════════════════════════════════════════ */

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span
        className="text-[22px] font-semibold tracking-tight text-white"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        ROSTER
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)]" />
    </Link>
  );
}

function FieldGroup({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block mb-1.5">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
          {required && <span className="text-[var(--color-teal)] ml-0.5">*</span>}
        </span>
        {hint && (
          <span className="text-xs text-[var(--color-text-faint)] ml-2">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

export default CharterPage;

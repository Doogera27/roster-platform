import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { isAuth0Configured } from '../config';

export function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[var(--color-navy)]">
      {/* ─── Left panel — Brand story ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #112233 100%)' }}>
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-100" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(46,196,182,0.04) 0%, transparent 70%)' }} />

        <div className="relative flex flex-col justify-between p-12 w-full">
          {/* Logo + Back to home */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                ROSTER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
            </div>
            <Link to="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
              Back to home
            </Link>
          </div>

          {/* Hero copy */}
          <div className="max-w-lg">
            <h1 className="text-display text-5xl mb-6 leading-tight text-white">
              The best creative work starts with <em>the right team.</em>
            </h1>
            <p className="text-lg text-[var(--color-text-muted)] leading-relaxed mb-10">
              Roster connects marketing leaders with vetted creative talent — designers,
              strategists, photographers, and more — through an AI-managed production layer
              that keeps every project on brief, on brand, and on time.
            </p>

            {/* Social proof */}
            <div className="flex gap-10">
              <div>
                <div className="text-2xl font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>500+</div>
                <div className="text-mono text-xs text-[var(--color-text-faint)] mt-1">VETTED CREATIVES</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>98%</div>
                <div className="text-mono text-xs text-[var(--color-text-faint)] mt-1">ON-TIME DELIVERY</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white" style={{ fontFamily: 'var(--font-serif)' }}>4.9</div>
                <div className="text-mono text-xs text-[var(--color-text-faint)] mt-1">AVG. RATING</div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="max-w-md">
            <blockquote className="text-sm text-[var(--color-text-muted)] leading-relaxed italic" style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>
              "Roster replaced our entire freelancer sourcing workflow. We went from weeks of
              back-and-forth to shipping creative in days."
            </blockquote>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--color-navy-light)]" />
              <div>
                <div className="text-sm font-medium text-[var(--color-text-secondary)]">Sarah Chen</div>
                <div className="text-mono text-[10px] text-[var(--color-text-faint)]">VP MARKETING, MERIDIAN</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right panel — Auth form ─── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--color-navy-mid)]">
        <div className="w-full max-w-sm">
          {/* Mobile logo + back link */}
          <div className="lg:hidden mb-10">
            <Link to="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-gold)] transition-colors flex items-center gap-1.5 mb-6">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 12L6 8l4-4" />
              </svg>
              Back to home
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-serif)' }}>ROSTER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
            </div>
          </div>

          <h2 className="text-heading text-2xl text-white mb-2">Welcome back</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-8">
            Sign in to manage your creative projects and teams.
          </p>

          <AuthButtons />

          <p className="mt-8 text-center text-xs text-[var(--color-text-faint)]">
            By continuing, you agree to Roster's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthButtons() {
  if (!isAuth0Configured) {
    return (
      <div className="text-center text-sm text-[var(--color-text-muted)]">
        Auth0 not configured — dev mode active.
      </div>
    );
  }

  const { loginWithRedirect } = useAuth0();

  return (
    <div className="space-y-3">
      <button onClick={() => loginWithRedirect()} className="btn-primary w-full py-3 text-sm">
        Sign in
      </button>
      <button
        onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
        className="btn-secondary w-full py-3 text-sm"
      >
        Create an account
      </button>
    </div>
  );
}

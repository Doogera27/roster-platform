import { Link } from 'react-router-dom';
import { CHARTER_BENEFITS } from '../../data/charterBenefits';

export function CharterPreview() {
  return (
    <section className="py-20 md:py-28 border-y border-[rgba(255,255,255,0.04)]" aria-label="Charter Creative Program">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-teal-border)] bg-[var(--color-teal-dim)] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)]" />
          <span
            className="text-[var(--color-teal-light)] text-xs font-medium tracking-wide uppercase"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Charter Creative Program
          </span>
        </div>

        <h2 className="text-display text-3xl md:text-4xl text-white mb-4">
          Be a Founding Creative
        </h2>
        <p className="text-[var(--color-text-muted)] text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          We&rsquo;re hand-picking our first cohort of creative professionals to help
          shape Roster from the ground up. Invite-only access for those who want to
          build something great.
        </p>

        {/* Benefits 2x2 grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left">
          {CHARTER_BENEFITS.map((b) => (
            <div key={b.title} className="card-flat p-5 flex gap-4 items-start">
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

        {/* CTA */}
        <Link
          to="/for-creatives"
          className="inline-flex items-center justify-center gap-2 text-[15px] px-8 py-3.5 font-semibold rounded-[var(--radius-md)] border border-[var(--color-teal-border)] text-[var(--color-teal)] hover:bg-[var(--color-teal-dim)] transition-all"
        >
          Learn About Joining &rarr;
        </Link>
      </div>
    </section>
  );
}

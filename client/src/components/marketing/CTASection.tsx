import { Link } from 'react-router-dom';

interface CTASectionProps {
  heading: string;
  subtitle?: string;
  ctaLabel: string;
  ctaLink: string;
}

export function CTASection({ heading, subtitle, ctaLabel, ctaLink }: CTASectionProps) {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] rounded-full opacity-100" style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)' }} />
      </div>

      <div className="relative max-w-3xl mx-auto text-center px-6">
        <h2 className="text-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
          {heading}
        </h2>
        {subtitle && (
          <p className="text-[var(--color-text-muted)] text-base md:text-lg leading-relaxed mb-8">
            {subtitle}
          </p>
        )}
        <Link to={ctaLink} className="btn-primary text-[15px] px-8 py-3.5 inline-block">
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}

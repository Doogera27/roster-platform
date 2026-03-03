import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
  type: 'client' | 'creative' | 'agency';
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  interval?: number;
}

export function TestimonialCarousel({ testimonials, interval = 6000 }: TestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [isPaused, next, interval, testimonials.length]);

  const current = testimonials[activeIndex];
  if (!current) return null;

  const typeLabel = current.type === 'client' ? 'CLIENT' : current.type === 'creative' ? 'CREATIVE' : 'AGENCY';
  const typeColor = current.type === 'creative' ? 'var(--color-teal)' : 'var(--color-gold)';

  return (
    <div
      className="max-w-3xl mx-auto text-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Type Badge */}
      <div
        className="text-mono text-[10px] tracking-widest mb-6 inline-block px-3 py-1 rounded-full border"
        style={{ color: typeColor, borderColor: `${typeColor}33` }}
      >
        {typeLabel}
      </div>

      {/* Quote */}
      <div className="relative min-h-[120px] flex items-center justify-center">
        <blockquote
          key={activeIndex}
          className="text-xl md:text-2xl text-[var(--color-text-secondary)] leading-relaxed italic animate-fade-in"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          &ldquo;{current.quote}&rdquo;
        </blockquote>
      </div>

      {/* Attribution */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--color-navy-light)] flex items-center justify-center text-sm font-medium text-[var(--color-text-muted)]">
          {current.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-white">{current.name}</div>
          <div className="text-mono text-[10px] text-[var(--color-text-faint)] uppercase">
            {current.title}, {current.company}
          </div>
        </div>
      </div>

      {/* Dots */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={clsx(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === activeIndex
                  ? 'bg-[var(--color-gold)] w-6'
                  : 'bg-[var(--color-text-faint)] hover:bg-[var(--color-text-muted)]',
              )}
              aria-label={`View testimonial ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

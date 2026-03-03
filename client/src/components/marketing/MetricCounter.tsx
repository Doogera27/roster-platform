import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface MetricCounterProps {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
}

export function MetricCounter({ target, prefix = '', suffix = '', label, duration = 2000 }: MetricCounterProps) {
  const { ref, isVisible } = useRevealOnScroll();
  const prefersReduced = useReducedMotion();
  const animatedValue = useAnimatedCounter(target, duration, isVisible);

  const displayValue = prefersReduced ? target : animatedValue;

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-semibold text-[var(--color-gold)]" style={{ fontFamily: 'var(--font-serif)' }}>
        {prefix}{displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-mono text-xs text-[var(--color-text-faint)] mt-2 tracking-wider uppercase">
        {label}
      </div>
    </div>
  );
}

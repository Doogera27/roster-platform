import { clsx } from 'clsx';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  goldWord?: string;
}

export function SectionHeading({ title, subtitle, align = 'center', goldWord }: SectionHeadingProps) {
  let renderedTitle: React.ReactNode = title;
  if (goldWord && title.includes(goldWord)) {
    const parts = title.split(goldWord);
    renderedTitle = (
      <>
        {parts[0]}<span className="text-[var(--color-gold)]">{goldWord}</span>{parts[1]}
      </>
    );
  }

  return (
    <div className={clsx(align === 'center' && 'text-center', 'mb-12 md:mb-16')}>
      <h2 className="text-display text-3xl md:text-4xl lg:text-[2.75rem] text-white mb-4">
        {renderedTitle}
      </h2>
      {subtitle && (
        <p className={clsx('text-[var(--color-text-muted)] text-base md:text-lg leading-relaxed', align === 'center' && 'max-w-2xl mx-auto')}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

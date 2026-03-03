interface StatBlockProps {
  value: string;
  label: string;
}

export function StatBlock({ value, label }: StatBlockProps) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-semibold text-[var(--color-gold)]" style={{ fontFamily: 'var(--font-serif)' }}>
        {value}
      </div>
      <div className="text-label text-[var(--color-text-faint)] mt-2">
        {label}
      </div>
    </div>
  );
}

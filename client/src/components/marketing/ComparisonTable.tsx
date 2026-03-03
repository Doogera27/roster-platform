import { clsx } from 'clsx';

interface ComparisonRow {
  feature: string;
  traditional: boolean | string;
  roster: boolean | string;
}

interface ComparisonTableProps {
  rows: ComparisonRow[];
  traditionalLabel?: string;
  rosterLabel?: string;
}

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <svg className="w-5 h-5 text-[var(--color-teal)]" viewBox="0 0 20 20" fill="currentColor" aria-label="Yes">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-[var(--color-danger)]" viewBox="0 0 20 20" fill="currentColor" aria-label="No">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  }
  return <span className="text-sm text-[var(--color-text-secondary)]">{value}</span>;
}

export function ComparisonTable({ rows, traditionalLabel = 'Traditional', rosterLabel = 'Roster' }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border-mid)]">
            <th className="text-left py-4 px-4 text-sm font-medium text-[var(--color-text-muted)]">Feature</th>
            <th className="text-center py-4 px-4 text-sm font-medium text-[var(--color-text-muted)] w-32">{traditionalLabel}</th>
            <th className="text-center py-4 px-4 text-sm font-medium text-[var(--color-gold)] w-32 border-x border-[var(--color-gold-border)]">{rosterLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={clsx(
                'border-b border-[var(--color-border)]',
                'hover:bg-[rgba(255,255,255,0.02)] transition-colors',
              )}
            >
              <td className="py-3.5 px-4 text-sm text-white">{row.feature}</td>
              <td className="py-3.5 px-4 text-center">
                <div className="flex justify-center"><CellValue value={row.traditional} /></div>
              </td>
              <td className="py-3.5 px-4 text-center border-x border-[var(--color-gold-border)] bg-[var(--color-gold-dim)]">
                <div className="flex justify-center"><CellValue value={row.roster} /></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

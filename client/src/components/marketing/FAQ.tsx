import { useState } from 'react';
import { clsx } from 'clsx';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2" role="list">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const headingId = `faq-q-${i}`;
        const panelId = `faq-a-${i}`;

        return (
          <div key={i} className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden" role="listitem">
            <button
              id={headingId}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              <span className="text-[15px] font-medium text-white pr-4">{item.question}</span>
              <svg
                className={clsx(
                  'w-4 h-4 text-[var(--color-text-muted)] shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <polyline points="4 6 8 10 12 6" />
              </svg>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              className={clsx(
                'overflow-hidden transition-all duration-300',
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div className="px-5 pb-5 text-sm text-[var(--color-text-muted)] leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

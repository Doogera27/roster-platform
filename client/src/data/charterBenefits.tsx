import type { ReactNode } from 'react';

export interface CharterBenefit {
  icon: ReactNode;
  title: string;
  desc: string;
}

export const CHARTER_BENEFITS: CharterBenefit[] = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: 'Shape the Platform',
    desc: 'Direct input on features, workflows, and how Roster works. Your feedback builds the product.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18" /><path d="M18 15h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M6 15H4.5a2.5 2.5 0 0 1 0-5H6" /><line x1="6" y1="9" x2="6" y2="15" /><line x1="18" y1="9" x2="18" y2="15" /><rect x="6" y="15" width="12" height="4" rx="1" />
      </svg>
    ),
    title: 'Founding Member Status',
    desc: 'Charter Creative badge on your profile. Priority placement when clients start searching.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Lock In Free Access',
    desc: 'Free membership for the entire charter period. No fees until we officially launch.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: 'First to Market',
    desc: 'First access to client projects when we go live. Get matched before anyone else.',
  },
];

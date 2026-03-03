import { create } from 'zustand';

export interface RosterMember {
  id: string;
  first_name: string;
  last_name: string;
  tier?: string;
  day_rate_cents?: number;
  disciplines?: string[];
  availability_status?: string;
}

interface RosterBuilderState {
  isOpen: boolean;
  rosterName: string;
  members: RosterMember[];
  open: () => void;
  close: () => void;
  toggle: () => void;
  setRosterName: (name: string) => void;
  addMember: (member: RosterMember) => void;
  removeMember: (id: string) => void;
  hasMember: (id: string) => boolean;
  clearAll: () => void;
  totalDayRate: () => number;
}

export const useRosterBuilder = create<RosterBuilderState>((set, get) => ({
  isOpen: false,
  rosterName: '',
  members: [],

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  setRosterName: (name: string) => set({ rosterName: name }),

  addMember: (member: RosterMember) => {
    const { members, isOpen } = get();
    if (members.some((m) => m.id === member.id)) return;
    set({ members: [...members, member], isOpen: isOpen || true });
  },

  removeMember: (id: string) => {
    set((s) => ({ members: s.members.filter((m) => m.id !== id) }));
  },

  hasMember: (id: string) => {
    return get().members.some((m) => m.id === id);
  },

  clearAll: () => set({ members: [], rosterName: '' }),

  totalDayRate: () => {
    return get().members.reduce((sum, m) => sum + (m.day_rate_cents || 0), 0);
  },
}));

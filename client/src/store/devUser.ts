import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DevUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'CLIENT' | 'CREATIVE' | 'PM';
  organization_id: string | null;
}

interface DevUserState {
  currentUser: DevUser | null;
  allUsers: DevUser[];
  setCurrentUser: (user: DevUser) => void;
  setAllUsers: (users: DevUser[]) => void;
}

export const useDevUser = create<DevUserState>()(
  persist(
    (set) => ({
      currentUser: null,
      allUsers: [],
      setCurrentUser: (user) => set({ currentUser: user }),
      setAllUsers: (users) => set({ allUsers: users }),
    }),
    {
      name: 'roster-dev-user',
      partialize: (state) => ({ currentUser: state.currentUser }),
    },
  ),
);

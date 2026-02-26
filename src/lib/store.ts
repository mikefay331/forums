import { create } from 'zustand';

// Supabase User type
export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  username: string;
  email: string;
  wallet_address: string | null;
  avatar: string | null;
  bio: string | null;
  total_rewards: number;
  role: string;
  is_verified: boolean;
  experience: number;
  posts: number;
  level: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
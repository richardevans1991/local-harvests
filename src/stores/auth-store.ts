"use client";

import { create } from "zustand";
import { api } from "@/lib/api-client";
import type { User, UserRole } from "@/types";

interface AuthState {
  currentUser: User | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  login: (
    email: string,
    password: string,
    role: UserRole
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  currentUser: null,
  initialized: false,

  initialize: async () => {
    try {
      const { user } = await api.auth.me();
      set({ currentUser: user, initialized: true });
    } catch {
      set({ currentUser: null, initialized: true });
    }
  },

  register: async (email, password, name, role) => {
    try {
      const { user } = await api.auth.register(email, password, name, role);
      set({ currentUser: user });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed.",
      };
    }
  },

  login: async (email, password, role) => {
    try {
      const { user } = await api.auth.login(email, password, role);
      set({ currentUser: user });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed.",
      };
    }
  },

  logout: async () => {
    try {
      await api.auth.logout();
    } finally {
      set({ currentUser: null });
    }
  },
}));
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    id: number | null;
    username: string | null;
    email: string | null;
    setUser: (id: number, username: string, email: string) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            id: null,
            username: null,
            email: null,
            setUser: (id, username, email) => set({ id, username, email }),
            clearUser: () => set({ id: null, username: null, email: null }),
        }),
        { name: "auth-storage" }
    )
);

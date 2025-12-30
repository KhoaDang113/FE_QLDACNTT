import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/api/types";
import authService from "@/api/services/authService";
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        const oldUser = get().user;

        // Chỉ xoá cart khi chuyển sang user khác hoàn toàn
        const isDifferentUser = oldUser?.id && oldUser.id !== user?.id;
        if (isDifferentUser && typeof window !== "undefined") {
          localStorage.removeItem(`cart_${oldUser.id}`);
        }

        set({
          user,
          isAuthenticated: !!user,
        });
      },

      logout: async () => {
        const currentUser = get().user;

        try {
          await authService.logout();
        } catch (e) {
          console.log("Logout API error", e);
        }

        // Clear cart của user hiện tại khi logout
        if (currentUser?.id && typeof window !== "undefined") {
          localStorage.removeItem(`cart_${currentUser.id}`);
        }
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart_guest");
        }

        set({
          user: null,
          isAuthenticated: false,
        });
      },

      initAuth: async () => {
        try {
          const accessToken =
            typeof window !== "undefined"
              ? localStorage.getItem("accessToken")
              : null;

          let user: User | null = null;

          if (accessToken) {
            user = await authService.getMe();
          } else {
            const { success, accessToken: newToken } =
              await authService.refreshToken();

            if (!success || !newToken) {
              throw new Error("Refresh failed");
            }

            if (typeof window !== "undefined") {
              localStorage.setItem("accessToken", newToken);
            }

            user = await authService.getMe();
          }

          if (user) {
            set({ user, isAuthenticated: true });
            if (user.role === "staff") {
              try {
                const staffService = (
                  await import("@/api/services/staffService")
                ).default;
                staffService.setOnline().catch(() => {});
              } catch {
                // ignore
              }
            }
            else if (user.role === "shipper") {
              try {
                const shipperService = (
                  await import("@/api/services/shipperService")
                ).default;
                shipperService.setOnlineStatus(true).catch(() => {});
              } catch {
                // ignore
              }
            }
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          console.log("Auth initialization failed", error);
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
          }
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage", // key trong localStorage
    }
  )
);

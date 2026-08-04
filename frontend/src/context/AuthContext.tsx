"use client";

import { createContext, useContext, useEffect } from "react";
import { useLogOut, useMe } from "../hooks/customer/useAuth";
import { User } from "../types/auth.types";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  isError: boolean;
  logout: () => void;
  isLoggingOut: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useMe();

  const { mutate: executeLogout, isPending: isLoggingOut } = useLogOut();

  const user: User | null = data ?? null; // ✅ single source

  // 2. Wrap it in a controller to wipe client state records on completion
  const logout = () => {
    executeLogout(undefined, {
      onSuccess: () => {
        queryClient.cancelQueries({ queryKey: ["me"] });
        queryClient.setQueryData(["me"], null);
        queryClient.removeQueries({
          predicate: (query) => query.queryKey[0] !== "me",
        });
        toast.success("Logged out safely!");
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Could not complete logout action");
      },
    });
  };

  useEffect(() => {
    if (isError) {
      const status = (error as any)?.response?.status;
      // ❌ ignore 401 (not logged in)
      if (status !== 401) {
        toast.error(
          (error as any)?.response?.data?.message || "Something went wrong"
        );
      }
    }
  }, [isError, error]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading: isLoading,
        isError,
        logout,
        isLoggingOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("Wrap inside AuthProvider");
  return ctx;
};
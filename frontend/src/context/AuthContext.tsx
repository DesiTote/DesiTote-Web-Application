import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { BackendUser } from '../lib/apiTypes';

interface AuthContextValue {
  user: BackendUser | null;
  isLoading: boolean;
  /** Resolves with the seconds the API wants us to wait before offering a resend. */
  sendRegisterOtp: (email: string) => Promise<number>;
  verifyRegisterOtp: (email: string, otp: string) => Promise<void>;
  register: (data: { fullName: string; email: string; mobileNumber: string; password: string }) => Promise<void>;
  login: (email: string, password: string) => Promise<BackendUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get<{ user: BackendUser }>('/api/auth/profile');
      setUser(res.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshProfile();
      setIsLoading(false);
    })();
  }, [refreshProfile]);

  const sendRegisterOtp = useCallback(async (email: string) => {
    const res = await api.post<{ resendAvailableIn?: number }>('/api/auth/send-otp', {
      email,
      type: 'register',
    });
    return res?.resendAvailableIn ?? 30;
  }, []);

  const verifyRegisterOtp = useCallback(async (email: string, otp: string) => {
    await api.post('/api/auth/verify-otp', { email, otp, type: 'register' });
  }, []);

  const register = useCallback(
    async (data: { fullName: string; email: string; mobileNumber: string; password: string }) => {
      await api.post('/api/auth/register', data);
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    await api.post<{ user: BackendUser }>('/api/auth/login', { email, password });

    // The login response body is not proof of a working session. If the browser
    // refused the auth cookie, trusting it would show a signed-in header over a
    // session the server never sees, and the first sign of trouble would be
    // "Not authorized" on add-to-cart. Read the profile back instead: that only
    // succeeds if the cookie was stored and returned.
    try {
      const profile = await api.get<{ user: BackendUser }>('/api/auth/profile');
      setUser(profile.user);
      return profile.user;
    } catch {
      setUser(null);
      throw new ApiError(
        401,
        'Your details were correct, but this browser did not keep you signed in. Allow cookies for this site (or leave private browsing) and try again.'
      );
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, sendRegisterOtp, verifyRegisterOtp, register, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function authErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return 'Something went wrong. Please try again.';
}

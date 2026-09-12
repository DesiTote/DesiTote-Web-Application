import React, { createContext, useCallback, useContext, useState } from 'react';

export type AuthModalMode = 'login' | 'register-details';

interface AuthModalContextValue {
  isOpen: boolean;
  initialMode: AuthModalMode;
  openAuthModal: (onSuccess?: () => void, initialMode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  handleSuccess: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export const AuthModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<AuthModalMode>('login');
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | undefined>(undefined);

  const openAuthModal = useCallback((onSuccess?: () => void, mode: AuthModalMode = 'login') => {
    setOnSuccessCallback(() => onSuccess);
    setInitialMode(mode);
    setIsOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsOpen(false);
    setOnSuccessCallback(undefined);
  }, []);

  const handleSuccess = useCallback(() => {
    setIsOpen(false);
    onSuccessCallback?.();
    setOnSuccessCallback(undefined);
  }, [onSuccessCallback]);

  return (
    <AuthModalContext.Provider value={{ isOpen, initialMode, openAuthModal, closeAuthModal, handleSuccess }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within an AuthModalProvider');
  return ctx;
}

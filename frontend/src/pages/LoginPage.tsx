import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';

export function LoginPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const { openAuthModal, isOpen } = useAuthModal();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/';

  useEffect(() => {
    if (authIsLoading) return;
    if (user) {
      navigate(next, { replace: true });
      return;
    }
    if (!isOpen) {
      openAuthModal(() => navigate(next, { replace: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authIsLoading]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <p className="text-sm text-[#0B1420]/50">Log in to continue…</p>
    </div>
  );
}

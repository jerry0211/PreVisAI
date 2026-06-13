import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/session';

/**
 * Redirects to /login when there is no signed-in user. Returns the resolved
 * email once known (null while redirecting) so guarded pages can render safely.
 */
export function useRequireAuth(): string | null {
  const navigate = useNavigate();
  const [email] = useState(() => getCurrentUser());

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  return email;
}

import { useAuth } from '@/hooks/useAuth';

export function useBlocked() {
  const { user, logout } = useAuth();
  
  return {
    user,
    logout
  };
}

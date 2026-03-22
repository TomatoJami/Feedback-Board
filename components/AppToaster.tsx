'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';

export default function AppToaster() {
  const { user } = useAuth();
  const [leftOffset, setLeftOffset] = useState(0);

  useEffect(() => {
    function calcOffset() {
      // Find the active element in the top-right (avatar or login button)
      const btn = document.getElementById('user-menu-btn') || document.getElementById('login-btn');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        // Calculate the center of the button relative to the left edge of viewport
        setLeftOffset(rect.left + rect.width / 2);
      } else {
        // Fallback to top-right corner if button is not found (usually about 40px from edge)
        setLeftOffset(window.innerWidth - 48);
      }
    }

    // Calculate on mount and after a small delay (for layout to settle)
    calcOffset();
    const timer = setTimeout(calcOffset, 1000); // 1s delay for full render

    window.addEventListener('resize', calcOffset);
    return () => {
      window.removeEventListener('resize', calcOffset);
      clearTimeout(timer);
    };
  }, [user]); // Re-calculate when auth state changes

  if (user?.status === 'blocked') {
    return null;
  }

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      containerStyle={{
        top: '80px',
        left: leftOffset ? `${leftOffset}px` : 'auto',
        right: 'auto',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      toastOptions={{
        duration: 2000,
        style: {
          background: 'rgba(24, 24, 27, 0.95)',
          color: '#fff',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          minWidth: 'max-content',
          maxWidth: '300px',
          fontWeight: 600,
          boxShadow:
            '0 12px 25px -6px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.3)',
        },
        success: {
          iconTheme: {
            primary: '#6366f1',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

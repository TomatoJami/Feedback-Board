'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function AppToaster() {
  const [rightOffset, setRightOffset] = useState(24);

  useEffect(() => {
    function calcOffset() {
      // Find the user avatar button in the navbar
      const btn = document.getElementById('user-menu-btn');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        // Right offset = distance from right edge of avatar to right edge of viewport
        setRightOffset(window.innerWidth - rect.right);
      }
    }

    // Calculate on mount and after a small delay (for layout to settle)
    calcOffset();
    const timer = setTimeout(calcOffset, 500);

    window.addEventListener('resize', calcOffset);
    return () => {
      window.removeEventListener('resize', calcOffset);
      clearTimeout(timer);
    };
  }, []);

  return (
    <Toaster
      position="top-right"
      reverseOrder={true}
      containerStyle={{
        top: 72,
        right: rightOffset,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(24, 24, 27, 0.8)',
          color: '#fff',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '12px 20px',
          fontSize: '0.95rem',
          fontWeight: 500,
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(99, 102, 241, 0.1)',
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

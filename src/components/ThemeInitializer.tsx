'use client';

import { useEffect } from 'react';
import { useDynamicTheme } from '@/hooks/useDynamicTheme';

export default function ThemeInitializer() {
  const { theme } = useDynamicTheme();

  // The useDynamicTheme hook already applies theme classes to document.body
  // This component just ensures the hook is mounted on the client side
  useEffect(() => {
    // This effect runs once on mount to ensure theme is applied
  }, [theme]);

  return null; // This component renders nothing
}

'use client';

import { useEffect } from 'react';

/**
 * Hook to suppress hydration warnings for browser extension attributes
 * This prevents hydration mismatches caused by browser extensions that
 * inject attributes into DOM elements
 */
export function useSuppressHydrationWarning() {
  useEffect(() => {
    // List of known browser extension attributes that cause hydration issues
    const extensionAttributes = [
      '__processed_',
      'bis_register',
      'fdprocessedid',
      'data-lastpass-',
      'data-1p-',
      'data-dashlane-',
      'autocomplete="off"', // Often added by password managers
    ];

    // Store original console.warn
    const originalWarn = console.warn;

    // Override console.warn to filter out hydration warnings for browser extensions
    console.warn = (...args: unknown[]) => {
      const message = args[0];
      
      if (typeof message === 'string') {
        // Check if it's a React hydration warning about browser extension attributes
        if (message.includes('A tree hydrated but some attributes') || 
            message.includes('react-hydration-error')) {
          
          // Check if the warning mentions known browser extension attributes
          const isExtensionWarning = extensionAttributes.some(attr => 
            args.some((arg: unknown) => 
              typeof arg === 'string' && arg.includes(attr)
            )
          );
          
          if (isExtensionWarning) {
            // Suppress this warning as it's caused by browser extensions
            return;
          }
        }
      }
      
      // Call original console.warn for all other warnings
      originalWarn.apply(console, args);
    };

    // Cleanup: restore original console.warn when component unmounts
    return () => {
      console.warn = originalWarn;
    };
  }, []);
}

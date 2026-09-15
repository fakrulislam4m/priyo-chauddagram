import { useState, useEffect } from 'react';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
  isKeyboardOpen: boolean;
}

/**
 * useSafeAreaInsets Hook
 * Implements dynamic safe area insets calculation and keyboard detection
 * compatible with react-native-safe-area-context specifications on web/mobile shell.
 */
export function useSafeAreaInsets(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    isKeyboardOpen: false
  });

  useEffect(() => {
    let initialViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    const calculateInsets = () => {
      // 1. Check computed CSS env(safe-area-inset-*)
      let computedBottom = 0;
      if (typeof window !== 'undefined') {
        const div = document.createElement('div');
        div.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
        div.style.position = 'fixed';
        div.style.visibility = 'hidden';
        document.body.appendChild(div);
        const style = window.getComputedStyle(div);
        computedBottom = parseFloat(style.paddingBottom) || 0;
        document.body.removeChild(div);
      }

      // 2. Fallback heuristic for iPhone / modern Android with gesture bar
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/.test(navigator.userAgent);

      let effectiveBottom = computedBottom;
      if (effectiveBottom === 0) {
        if (isIOS) {
          // iPhone X and above home indicator
          effectiveBottom = 20;
        } else if (isAndroid) {
          effectiveBottom = 8;
        }
      }

      // 3. Detect virtual keyboard via window.visualViewport
      let isKeyboardOpen = false;
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        // If current visual viewport is significantly smaller (> 150px difference) than outer window
        if (initialViewportHeight - currentHeight > 150) {
          isKeyboardOpen = true;
        }
      }

      setInsets({
        top: 0,
        bottom: effectiveBottom,
        left: 0,
        right: 0,
        isKeyboardOpen
      });
    };

    calculateInsets();

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', calculateInsets);
      window.visualViewport.addEventListener('scroll', calculateInsets);
    }
    window.addEventListener('resize', calculateInsets);
    window.addEventListener('orientationchange', calculateInsets);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', calculateInsets);
        window.visualViewport.removeEventListener('scroll', calculateInsets);
      }
      window.removeEventListener('resize', calculateInsets);
      window.removeEventListener('orientationchange', calculateInsets);
    };
  }, []);

  return insets;
}

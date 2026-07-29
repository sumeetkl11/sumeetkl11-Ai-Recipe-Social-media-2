import { useEffect, useRef } from 'react';

export default function useRevalidateOnFocus(callback, options = {}) {
  const {
    enabled = true,
    intervalMs = 45000,
    runOnMount = true
  } = options;
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let intervalId = null;

    const run = () => {
      callbackRef.current?.();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        run();
      }
    };

    const handleFocus = () => {
      run();
    };

    if (runOnMount) {
      run();
    }

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    if (intervalMs > 0) {
      intervalId = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
          run();
        }
      }, intervalMs);
    }

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);

      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [enabled, intervalMs, runOnMount]);
}

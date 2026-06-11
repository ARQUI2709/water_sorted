// ============================================
// CUSTOM REACT HOOKS
// ============================================

import React from 'react';

// --------------------------------------------
// useTimer — count-up timer for game sessions
// --------------------------------------------
export function useTimer(running) {
  const [seconds, setSeconds] = React.useState(0);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(ref.current);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const reset = React.useCallback(() => setSeconds(0), []);

  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return { sec: seconds, time, reset };
}

// --------------------------------------------
// useFocusTrap — dialog focus management
// --------------------------------------------
// Returns a ref for the dialog container. While `active`: focuses the first
// focusable element, keeps Tab cycling inside the container, closes on
// Escape, and restores focus to the previously focused element on close.
export function useFocusTrap(active, onClose) {
  const ref = React.useRef(null);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => {
    if (!active || !ref.current) return;
    const node = ref.current;
    const previous = document.activeElement;

    const focusables = () => Array.from(
      node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.disabled);

    const first = focusables()[0];
    if (first) first.focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key === 'Escape' && onCloseRef.current) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const firstEl = els[0];
      const lastEl = els[els.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && (document.activeElement === lastEl || !node.contains(document.activeElement))) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous && previous.focus) previous.focus({ preventScroll: true });
    };
  }, [active]);

  return ref;
}

// --------------------------------------------
// useWakeLock — keep the screen on while playing
// --------------------------------------------
// Silent no-op where the Wake Lock API is unavailable (HTTP, old browsers).
export function useWakeLock(active) {
  React.useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock = null;
    let released = false;

    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch { }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !released) acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      released = true;
      document.removeEventListener('visibilitychange', onVisibility);
      try { lock?.release(); } catch { }
    };
  }, [active]);
}

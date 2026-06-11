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

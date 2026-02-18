// ============================================
// AUDIO & HAPTIC FEEDBACK
// ============================================

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  return audioContext;
}

function playTone(frequency, duration = 0.08, volume = 0.12, type = "sine") {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

const soundTap  = () => playTone(600, 0.05, 0.08);
const soundPour = () => {
  playTone(440, 0.1, 0.1);
  setTimeout(() => playTone(520, 0.1, 0.08), 60);
};
const soundError = () => playTone(200, 0.15, 0.1, "square");
const soundWin   = () => {
  [523, 659, 784, 1047].forEach((freq, i) =>
    setTimeout(() => playTone(freq, 0.2, 0.12), i * 120)
  );
};
const soundDone  = () => playTone(880, 0.12, 0.1);

// Haptic feedback (vibration API)
const haptic      = (ms = 10)          => { try { navigator.vibrate?.(ms);               } catch (e) {} };
const hapticError = ()                 => { try { navigator.vibrate?.([30, 50, 30]);      } catch (e) {} };
const hapticWin   = ()                 => { try { navigator.vibrate?.([50, 80, 50, 80, 100]); } catch (e) {} };

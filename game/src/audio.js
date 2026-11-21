// Tiny synthesised sounds through WebAudio: no audio files, no network, everything is made
// on the spot. A short oscillator blip with a quick fade; the pitch pattern is what tells a
// found difference from a wrong click from a cleared scene.
export function createAudio() {
  let context = null;
  let enabled = true;

  function ensure() {
    if (context === null) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
      } catch {
        context = null;
      }
    }
    if (context !== null && context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  /** Play `notes` (frequencies in Hz) one after another, each lasting `step` seconds. */
  function play(notes, step, type, volume) {
    if (!enabled) return;
    const audio = ensure();
    if (audio === null) return;
    const start = audio.currentTime + 0.01;
    notes.forEach((frequency, index) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      const at = start + index * step;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(volume, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + step * 0.95);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(at);
      oscillator.stop(at + step);
    });
  }

  return {
    get enabled() {
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      return enabled;
    },
    click() {
      play([520], 0.06, 'sine', 0.12);
    },
    found() {
      play([660, 880], 0.09, 'sine', 0.2);
    },
    wrong() {
      play([180, 140], 0.12, 'square', 0.1);
    },
    hint() {
      play([980], 0.08, 'sine', 0.12);
    },
    sceneClear() {
      play([523, 659, 784, 1047], 0.11, 'triangle', 0.2);
    },
    victory() {
      play([523, 659, 784, 1047, 1319, 1568], 0.13, 'triangle', 0.2);
    },
    gameOver() {
      play([392, 330, 262, 196], 0.16, 'triangle', 0.18);
    },
  };
}

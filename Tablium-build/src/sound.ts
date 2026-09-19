export type UiSound = 'click' | 'success' | 'delete' | 'pop';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  return audioContext;
}

export function playUiSound(sound: UiSound = 'click', enabled = true) {
  if (!enabled) return;
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') void context.resume();

  const now = context.currentTime;
  const settings: Record<UiSound, { frequency: number; duration: number; type: OscillatorType }> = {
    click: { frequency: 520, duration: 0.045, type: 'sine' },
    success: { frequency: 740, duration: 0.12, type: 'sine' },
    delete: { frequency: 180, duration: 0.1, type: 'triangle' },
    pop: { frequency: 390, duration: 0.08, type: 'sine' },
  };
  const option = settings[sound];
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = option.type;
  oscillator.frequency.setValueAtTime(option.frequency, now);
  if (sound === 'success') oscillator.frequency.exponentialRampToValueAtTime(option.frequency * 1.35, now + option.duration);
  if (sound === 'delete') oscillator.frequency.exponentialRampToValueAtTime(option.frequency * 0.65, now + option.duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + option.duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + option.duration + 0.01);
}

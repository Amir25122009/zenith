// Native Web Audio Ambient Soundscapes for Deep Work & Focus

let ctx: AudioContext | null = null;
let currentSource: { stop: () => void } | null = null;
let activeSound: string | null = null;
let masterGain: GainNode | null = null;

function getContext(): AudioContext {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AudioContextClass();
    masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.4, ctx.currentTime);
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export function setAmbientVolume(val: number) { // 0.0 - 1.0
  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), ctx.currentTime);
  }
}

export function getActiveAmbientSound(): string | null {
  return activeSound;
}

export function stopAmbientSound() {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch { /* ignore */ }
    currentSource = null;
  }
  activeSound = null;
}

export function playAmbientSound(type: 'rain' | 'waves' | 'alpha' | 'whitenoise') {
  const context = getContext();
  stopAmbientSound();
  activeSound = type;

  if (type === 'alpha') {
    // 432Hz Alpha Wave binaural drone
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const gain = context.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, context.currentTime);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(442, context.currentTime); // 10Hz alpha beat difference

    gain.gain.setValueAtTime(0.15, context.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    if (masterGain) gain.connect(masterGain);

    osc1.start();
    osc2.start();

    currentSource = {
      stop: () => {
        osc1.stop();
        osc2.stop();
        osc1.disconnect();
        osc2.disconnect();
      },
    };
    return;
  }

  // Noise generator buffer for rain / waves / white noise
  const bufferSize = context.sampleRate * 2;
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === 'rain') {
      // Pink noise filter simulation
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
      b6 = white * 0.115926;
    } else if (type === 'waves') {
      // Brown noise (deep rumble)
      b0 = (b0 + (0.02 * white)) / 1.02;
      output[i] = b0 * 2.5;
    } else {
      // White noise
      output[i] = white * 0.08;
    }
  }

  const whiteNoise = context.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = type === 'waves' ? 'lowpass' : 'bandpass';
  filter.frequency.setValueAtTime(type === 'waves' ? 350 : 1200, context.currentTime);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.3, context.currentTime);

  // If waves, modulate gain to simulate incoming and receding waves
  let lfo: OscillatorNode | null = null;
  if (type === 'waves') {
    lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.setValueAtTime(0.12, context.currentTime); // ~8 sec ocean swell
    lfoGain.gain.setValueAtTime(0.15, context.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
  }

  whiteNoise.connect(filter);
  filter.connect(gain);
  if (masterGain) gain.connect(masterGain);

  whiteNoise.start();

  currentSource = {
    stop: () => {
      whiteNoise.stop();
      if (lfo) lfo.stop();
      whiteNoise.disconnect();
    },
  };
}

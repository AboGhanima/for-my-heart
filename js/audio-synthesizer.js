/**
 * ============================================================================
 * Web Audio API White / Pink Noise Synthesizer & Audio Player Bridge
 * ============================================================================
 * Generates synthetic relaxing sound (Pink / White noise + soothing low-pass filter)
 * ensuring 100% offline reliability without external MP3 dependencies, while also
 * controlling the standard HTML5 <audio> element.
 */

class CalmingAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.noiseNode = null;
    this.gainNode = null;
    this.filterNode = null;
    this.binauralOsc = null;
    this.binauralGain = null;
    this.isPlaying = false;
    this.volume = 0.7;
    this.htmlAudioElement = document.getElementById('whiteNoiseAudio');
  }

  /**
   * Initializes AudioContext safely on user interaction
   */
  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Generates a smooth pink/white noise buffer
   * Pink noise has a 1/f spectral density which is naturally much more calming
   * for sensory overload than harsh raw white noise.
   */
  generatePinkNoiseBuffer() {
    const bufferSize = this.audioCtx.sampleRate * 4; // 4 seconds looping buffer
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  /**
   * Plays calming sensory white/pink noise intervention
   * @param {Object} options - volume, fadeTime
   */
  play({ volume = 0.7, fadeDurationMs = 1500 } = {}) {
    this.initContext();
    if (this.isPlaying) return;

    this.volume = volume;
    const now = this.audioCtx.currentTime;
    const fadeSec = fadeDurationMs / 1000;

    // 1. Setup Pink Noise Source
    const noiseBuffer = this.generatePinkNoiseBuffer();
    this.noiseNode = this.audioCtx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // 2. Setup Warm Lowpass Filter (800Hz cutoff removes harsh frequencies)
    this.filterNode = this.audioCtx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(800, now);
    this.filterNode.Q.setValueAtTime(1.0, now);

    // 3. Setup Gain Node for smooth fade-in
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0.001, now);
    this.gainNode.gain.exponentialRampToValueAtTime(Math.max(0.01, this.volume), now + fadeSec);

    // 4. Subtle 432Hz calming tone generator
    this.binauralOsc = this.audioCtx.createOscillator();
    this.binauralOsc.type = 'sine';
    this.binauralOsc.frequency.setValueAtTime(136.1, now); // Om frequency / grounding tone
    this.binauralGain = this.audioCtx.createGain();
    this.binauralGain.gain.setValueAtTime(0.001, now);
    this.binauralGain.gain.exponentialRampToValueAtTime(0.04 * this.volume, now + fadeSec);

    // Connect Audio Graph
    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    this.binauralOsc.connect(this.binauralGain);
    this.binauralGain.connect(this.audioCtx.destination);

    // Start Sources
    this.noiseNode.start(0);
    this.binauralOsc.start(0);

    // Also trigger HTML audio element fallback if configured with audio file
    if (this.htmlAudioElement) {
      try {
        this.htmlAudioElement.volume = this.volume;
        this.htmlAudioElement.play().catch(() => {
          // Handled by Web Audio API
        });
      } catch (e) {}
    }

    this.isPlaying = true;
    this.onStateChange(true);
    console.log('[Audio Engine] Calming white/pink noise intervention started.');
  }

  /**
   * Stops the calming noise with smooth fade-out
   */
  stop(fadeDurationMs = 800) {
    if (!this.isPlaying || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const fadeSec = fadeDurationMs / 1000;

    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + fadeSec);
    }

    if (this.binauralGain) {
      this.binauralGain.gain.setValueAtTime(this.binauralGain.gain.value, now);
      this.binauralGain.gain.exponentialRampToValueAtTime(0.0001, now + fadeSec);
    }

    setTimeout(() => {
      try {
        if (this.noiseNode) {
          this.noiseNode.stop();
          this.noiseNode.disconnect();
        }
        if (this.binauralOsc) {
          this.binauralOsc.stop();
          this.binauralOsc.disconnect();
        }
      } catch (e) {}
      this.isPlaying = false;
      this.onStateChange(false);
      console.log('[Audio Engine] Calming sound stopped.');
    }, fadeDurationMs);

    if (this.htmlAudioElement) {
      try {
        this.htmlAudioElement.pause();
        this.htmlAudioElement.currentTime = 0;
      } catch (e) {}
    }
  }

  /**
   * Adjust volume dynamically
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx && this.isPlaying) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
    if (this.htmlAudioElement) {
      this.htmlAudioElement.volume = this.volume;
    }
  }

  /**
   * State callback to be overridden by UI controller
   */
  onStateChange(isPlaying) {}
}

window.calmingAudioEngine = new CalmingAudioEngine();

// Advanced FM Synth Audio Service for Cyberpunk UI
// Uses Frequency Modulation to create metallic/sci-fi textures

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy init
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 48000 });
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4; // Reasonable master volume
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Helper for FM Synthesis
  // Carrier: The main audible frequency
  // Modulator: Vibrates the carrier frequency to create texture (metallic, bell-like, etc.)
  private playFMSound(
    carrierFreq: number, 
    modFreq: number, 
    modIdx: number, 
    duration: number, 
    type: OscillatorType = 'sine'
  ) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Carrier Oscillator
    const carrier = this.ctx.createOscillator();
    carrier.type = type;
    carrier.frequency.value = carrierFreq;

    // Modulator Oscillator
    const modulator = this.ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.value = modFreq;

    // Modulator Gain (The "depth" of the modulation)
    const modulatorGain = this.ctx.createGain();
    modulatorGain.gain.value = modIdx * modFreq;

    // Envelope Gain (Volume control)
    const envGain = this.ctx.createGain();
    envGain.gain.setValueAtTime(0.3, t);
    envGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    // Connections: Modulator -> ModulatorGain -> Carrier.frequency
    modulator.connect(modulatorGain);
    modulatorGain.connect(carrier.frequency);

    // Carrier -> Envelope -> Master
    carrier.connect(envGain);
    envGain.connect(this.masterGain);

    // Start/Stop
    carrier.start(t);
    modulator.start(t);
    carrier.stop(t + duration);
    modulator.stop(t + duration);
  }

  playHoverSound() {
    // High-tech "Blip"
    // High frequency carrier, quick decay
    this.playFMSound(1200, 50, 10, 0.08, 'sine');
  }

  playSelectSound() {
    // Mechanical "Lock-on"
    // Lower frequency, harmonic ratio for metallic sound
    this.playFMSound(220, 440, 5, 0.2, 'triangle');
  }

  playClickSound() {
    // Sharp UI click
    this.playFMSound(800, 1200, 2, 0.05, 'square');
  }

  playSuccessSound() {
    // Ethereal "Access Granted" chime
    // A simple major chord arpeggio simulation
    this.init();
    if (!this.ctx || !this.masterGain) return;
    
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C Major
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.05 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(now + i * 0.05);
      osc.stop(now + 1.5);
    });
  }

  // --- TTS DECODING ---
  
  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array): Promise<AudioBuffer> {
    if (!this.ctx) throw new Error("AudioContext not initialized");
    
    const dataInt16 = new Int16Array(data.buffer);
    const numChannels = 1;
    const sampleRate = 24000;
    const frameCount = dataInt16.length;
    
    const buffer = this.ctx.createBuffer(numChannels, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }

  async playPCMData(base64Data: string) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
        const bytes = this.decodeBase64(base64Data);
        const audioBuffer = await this.decodeAudioData(bytes);
        
        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.masterGain);
        source.start();
    } catch (e) {
        console.error("Audio decode error:", e);
    }
  }
}

export const audioService = new AudioService();

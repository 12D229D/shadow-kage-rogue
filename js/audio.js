const Audio = {
  ctx: null,
  enabled: true,
  isInitialized: false,

  init: function() {
    if (this.isInitialized) return;
    
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
    }
  },

  ensureContext: function() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  playTone: function(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration / 1000);
  },

  playFootstep: function(isRunning = false) {
    const freq = isRunning ? 150 : 200;
    this.playTone(freq, 50, 'triangle', 0.1);
  },

  playShuriken: function() {
    this.playTone(800, 100, 'square', 0.2);
    setTimeout(() => this.playTone(600, 150, 'sawtooth', 0.15), 50);
  },

  playSmoke: function() {
    this.playTone(100, 300, 'triangle', 0.2);
  },

  playDecoy: function() {
    this.playTone(400, 100, 'sine', 0.2);
    this.playTone(800, 100, 'sine', 0.15);
  },

  playAlert: function() {
    this.playTone(600, 200, 'sawtooth', 0.3);
    setTimeout(() => this.playTone(500, 200, 'sawtooth', 0.3), 200);
    setTimeout(() => this.playTone(400, 200, 'sawtooth', 0.3), 400);
  },

  playKill: function() {
    this.playTone(300, 100, 'square', 0.3);
    setTimeout(() => this.playTone(200, 200, 'square', 0.2), 100);
  },

  playBackground: function() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.value = 60;
    gain.gain.value = 0.05;
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    this.backgroundOsc = osc;
    this.backgroundGain = gain;
  },

  stopBackground: function() {
    if (this.backgroundOsc) {
      this.backgroundOsc.stop();
      this.backgroundOsc = null;
    }
  }
};

window.Audio = Audio;
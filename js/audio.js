/* こえ（よみあげ）と こうかおん */

const Voice = {
  enabled: true,
  jp: null,

  init() {
    if (!('speechSynthesis' in window)) return;
    const pick = () => {
      const vs = speechSynthesis.getVoices();
      this.jp = vs.find(v => v.lang === 'ja-JP') || vs.find(v => v.lang && v.lang.startsWith('ja')) || null;
    };
    pick();
    speechSynthesis.onvoiceschanged = pick;
  },

  speak(text) {
    if (!this.enabled || !text || !('speechSynthesis' in window)) return;
    // えもじ・きごうは よまない
    const clean = text
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}️‍]/gu, '')
      .replace(/[「」]/g, '')
      .replace(/\n/g, '。');
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'ja-JP';
      if (this.jp) u.voice = this.jp;
      u.rate = 0.95;
      u.pitch = 1.15;
      speechSynthesis.speak(u);
    } catch (e) { /* よみあげが つかえない かんきょう */ }
  },

  stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  },
};

const Sfx = {
  on: true,
  ctx: null,

  ensure() {
    if (!this.ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (C) this.ctx = new C();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, dur = 0.15, type = 'sine', vol = 0.2, when = 0, slide = null) {
    if (!this.on) return;
    const c = this.ensure();
    if (!c) return;
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  },

  noise(dur = 0.4, vol = 0.25, freq = 900) {
    if (!this.on) return;
    const c = this.ensure();
    if (!c) return;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    f.Q.value = 0.7;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(c.destination);
    src.start();
  },

  click()   { this.tone(1100, 0.04, 'square', 0.04); },
  pop()     { this.tone(600, 0.12, 'sine', 0.25, 0, 950); },
  good()    { [523, 659, 784].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.2, i * 0.09)); },
  oops()    { this.tone(360, 0.28, 'sine', 0.18, 0, 230); },
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.22, i * 0.12));
    this.tone(1047, 0.7, 'triangle', 0.2, 0.5);
    this.tone(784, 0.7, 'triangle', 0.12, 0.5);
  },
  whoosh()  { this.tone(900, 0.35, 'sawtooth', 0.05, 0, 180); this.noise(0.35, 0.12, 1800); },
  splash()  { this.noise(0.5, 0.35, 700); },
  nibble()  { this.tone(820, 0.07, 'sine', 0.15); },
  sink()    { this.tone(420, 0.35, 'sine', 0.22, 0, 140); },
  reel()    { this.tone(1500, 0.03, 'square', 0.035); this.tone(1300, 0.03, 'square', 0.035, 0.05); },
  strain()  { this.tone(180, 0.12, 'sawtooth', 0.08); },
};

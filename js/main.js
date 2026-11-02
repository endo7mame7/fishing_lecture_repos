/* ゲームの しくみ（シーンの きりかえ・セリフ・ボタン） */

const App = {
  stage: null,
  controls: null,
  guideText: null,
  bearBox: null,
  lastSay: '',
  timers: new Set(),
  rafs: new Set(),
  cleanup: null,

  init() {
    const $ = s => document.querySelector(s);
    this.stage = $('#stage');
    this.controls = $('#controls');
    this.guideText = $('#guide-text');
    this.bearBox = $('#bear');
    this.bubble = document.querySelector('.bubble');
    this.progress = $('#progress');

    Voice.init();

    // さいしょの タッチで おとを ならせるように する
    document.addEventListener('pointerdown', () => Sfx.ensure(), { passive: true });

    $('#guide').addEventListener('click', () => Voice.speak(this.lastSay));
    $('#home-btn').addEventListener('click', () => { Sfx.click(); this.go('title'); });

    const sb = $('#sound-btn');
    sb.addEventListener('click', () => {
      const on = !Voice.enabled;
      Voice.enabled = on;
      Sfx.on = on;
      if (!on) Voice.stop();
      sb.textContent = on ? '🔊' : '🔇';
      sb.setAttribute('aria-label', on ? 'おとと こえを けす' : 'おとと こえを だす');
    });

    this.progress.innerHTML = STEPS.map(s =>
      `<li><span class="p-ico">${s.icon}</span><span class="p-lbl">${s.label}</span></li>`).join('');

    this.go('title');
  },

  go(name, opts = {}) {
    if (this.cleanup) { try { this.cleanup(); } catch (e) {} }
    this.cleanup = null;
    this.timers.forEach(id => clearTimeout(id));
    this.timers.clear();
    this.rafs.forEach(h => cancelAnimationFrame(h.id));
    this.rafs.clear();

    this.stage.className = 'stage';
    this.stage.innerHTML = '';
    this.controls.innerHTML = '';

    const scene = Scenes[name];
    document.querySelector('#guide').classList.toggle('clerk', !!scene.clerk);
    this.setStep(scene.step);
    this.cleanup = scene.enter(opts) || null;
  },

  setStep(i) {
    this.progress.classList.toggle('hidden', i < 0);
    [...this.progress.children].forEach((li, j) => {
      li.classList.toggle('done', j < i);
      li.classList.toggle('now', j === i);
    });
  },

  say(text, mood = 'happy') {
    this.lastSay = text;
    this.guideText.textContent = text;
    this.bearBox.innerHTML = Art.bear(mood);
    this.bubble.classList.remove('pop');
    void this.bubble.offsetWidth;
    this.bubble.classList.add('pop');
    Voice.speak(text);
  },

  after(ms, fn) {
    const id = setTimeout(() => { this.timers.delete(id); fn(); }, ms);
    this.timers.add(id);
    return id;
  },

  // まいフレーム よばれる。fn が false を かえすと とまる
  loop(fn) {
    let last = performance.now();
    const h = { id: 0 };
    const tick = now => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (fn(dt, now) === false) { this.rafs.delete(h); return; }
      h.id = requestAnimationFrame(tick);
    };
    h.id = requestAnimationFrame(tick);
    this.rafs.add(h);
    return () => { cancelAnimationFrame(h.id); this.rafs.delete(h); };
  },

  btn(label, { cls = '', onClick } = {}) {
    const b = document.createElement('button');
    b.className = 'btn ' + cls;
    b.innerHTML = label;
    b.addEventListener('click', () => { Sfx.click(); onClick && onClick(b); });
    return b;
  },

  setControls(...nodes) {
    this.controls.replaceChildren(...nodes);
  },
};

// HTML もじれつ → エレメント
function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function confetti(container, n = 40) {
  const colors = ['#ff8a3d', '#ffd54a', '#43b581', '#4fa3e8', '#ef5b9b', '#a374ff'];
  const box = h('<div class="confetti"></div>');
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    s.style.left = Math.random() * 100 + '%';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = (Math.random() * 0.8) + 's';
    s.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
    s.style.transform = `rotate(${Math.random() * 360}deg)`;
    box.appendChild(s);
  }
  container.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

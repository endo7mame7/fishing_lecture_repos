/* それぞれの ばめん */

const Scenes = {};

/* ───────── タイトル ───────── */
Scenes.title = {
  step: -1,
  enter() {
    App.say('こんにちは! ぼくは クマせんせい。\nいっしょに つりを してみよう!');
    App.stage.classList.add('stage-title');
    App.stage.innerHTML = `
      <div class="title-screen">
        <div class="title-sub">クマせんせいの</div>
        <h1 class="title-main">つり きょうしつ</h1>
        <div class="title-fish">
          ${['aji', 'tai', 'saba'].map((id, i) => `<div class="swim swim-${i}">${Art.fish(FISH_BY_ID[id])}</div>`).join('')}
        </div>
        <div class="title-waves"></div>
      </div>`;
    const start = Save.data.tutorialDone
      ? App.btn('🎣 つりに いく', { cls: 'big green', onClick: () => App.go('bait', { again: true }) })
      : null;
    App.setControls(
      App.btn('▶ はじめる', { cls: 'big pulse', onClick: () => App.go('tools') }),
      ...(start ? [start] : []),
      App.btn('📖 ずかん', { cls: 'blue', onClick: () => App.go('zukan') }),
    );
  },
};

/* ───────── 1. どうぐ あつめ ───────── */
Scenes.tools = {
  step: 0,
  enter() {
    App.say('まずは つりの どうぐを あつめよう!\nつりに いる ものを タッチしてね。');
    const need = TOOLS.filter(t => t.ok).length;
    let got = 0;

    const wrap = h(`<div class="tools"><div class="counter"></div><div class="grid"></div></div>`);
    const counter = wrap.querySelector('.counter');
    const grid = wrap.querySelector('.grid');
    const update = () => {
      counter.innerHTML = Array.from({ length: need }, (_, i) =>
        `<span class="dot ${i < got ? 'on' : ''}">${i < got ? '★' : '☆'}</span>`).join('');
    };

    shuffle(TOOLS).forEach(t => {
      const icon = t.icon === 'BOBBER' ? Art.bobberIcon() : t.icon;
      const b = h(`<button class="item"><span class="ico">${icon}</span><span class="lbl">${t.name}</span></button>`);
      b.addEventListener('click', () => {
        if (b.classList.contains('got')) { App.say(t.say); return; }
        if (t.ok) {
          b.classList.add('got');
          got++;
          update();
          if (got === need) {
            Sfx.fanfare();
            App.say(t.say + '\nぜんぶ そろったね! すごい!', 'wow');
            confetti(App.stage);
            App.setControls(App.btn('つぎへ ▶', { cls: 'big pulse green', onClick: () => App.go('safety') }));
          } else {
            Sfx.good();
            App.say(t.say);
          }
        } else {
          b.classList.remove('shake');
          void b.offsetWidth;
          b.classList.add('shake', 'no');
          Sfx.oops();
          App.say(t.say, 'think');
        }
      });
      grid.appendChild(b);
    });

    update();
    App.stage.appendChild(wrap);
  },
};

/* ───────── 2. あんぜんの やくそく ───────── */
Scenes.safety = {
  step: 1,
  enter() {
    let idx = 0;
    const show = () => {
      const q = SAFETY[idx];
      App.say(`やくそく ${idx + 1}。\n${q.q}`);
      App.setControls();
      const card = h(`
        <div class="quiz">
          <div class="quiz-num">やくそく ${idx + 1} / ${SAFETY.length}</div>
          <div class="quiz-q">${q.q}</div>
          <div class="choices"></div>
        </div>`);
      const choices = card.querySelector('.choices');
      const opts = shuffle([{ ...q.a, ok: true }, { ...q.b, ok: false }]);
      opts.forEach(o => {
        const b = h(`<button class="choice"><span class="ico">${o.icon}</span><span class="lbl">${o.label}</span><span class="mark"></span></button>`);
        b.addEventListener('click', () => {
          if (card.classList.contains('solved')) return;
          if (o.ok) {
            card.classList.add('solved');
            b.classList.add('yes');
            b.querySelector('.mark').textContent = '⭕';
            Sfx.good();
            App.say(o.say, 'wow');
            const last = idx === SAFETY.length - 1;
            App.setControls(App.btn(last ? 'えさを つけに いこう ▶' : 'つぎの やくそく ▶', {
              cls: 'big pulse green',
              onClick: () => {
                if (last) App.go('bait');
                else { idx++; show(); }
              },
            }));
          } else {
            b.classList.add('no');
            b.querySelector('.mark').textContent = '❌';
            Sfx.oops();
            App.say(o.say, 'think');
          }
        });
        choices.appendChild(b);
      });
      App.stage.replaceChildren(card);
    };
    show();
  },
};

/* ───────── 3. えさを つける ───────── */
Scenes.bait = {
  step: 2,
  enter(opts) {
    App.say(opts.again
      ? 'えさを つけなおそう!\nみみずを はりまで うごかしてね。'
      : 'つぎは えさを つけよう!\nみみずを ゆびで うごかして、はりに くっつけてね。');

    const wrap = h(`
      <div class="bait">
        <div class="bait-left">
          <div class="worm">${Art.worm()}</div>
          <div class="cup">えさばこ</div>
        </div>
        <div class="bait-arrow">👉</div>
        <div class="bait-right">
          <div class="hook-box">${Art.hook()}<div class="hook-target"></div></div>
          <div class="hook-lbl">はり</div>
        </div>
      </div>`);
    App.stage.appendChild(wrap);

    const worm = wrap.querySelector('.worm');
    const target = wrap.querySelector('.hook-target');
    const hookBox = wrap.querySelector('.hook-box');
    let drag = null;
    let done = false;

    const center = el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    const success = () => {
      done = true;
      worm.classList.add('gone');
      hookBox.classList.add('baited');
      wrap.querySelector('.bait-arrow').textContent = '✨';
      Sfx.good();
      App.say('つけられたね! これで さかなが よってくるよ。\nほんとうの はりは とがっているから、おとなの ひとと いっしょに つけようね。', 'wow');
      App.setControls(App.btn('うみへ いこう ▶', { cls: 'big pulse green', onClick: () => App.go('fishing') }));
    };

    const moveTo = (dx, dy, smooth) => {
      worm.style.transition = smooth ? 'transform .45s ease' : 'none';
      worm.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    worm.addEventListener('pointerdown', e => {
      if (done) return;
      worm.setPointerCapture(e.pointerId);
      drag = { sx: e.clientX, sy: e.clientY, moved: 0 };
      worm.classList.add('dragging');
      Sfx.pop();
    });
    worm.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
      moveTo(dx, dy, false);
    });
    const end = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      worm.classList.remove('dragging');
      const a = center(worm), b = center(target);
      const near = Math.hypot(a.x - b.x, a.y - b.y) < 110;
      if (near) {
        success();
      } else if (moved < 12) {
        // タップだけでも じどうで はりへ
        const cur = worm.style.transform.match(/-?[\d.]+/g) || [0, 0];
        moveTo(+cur[0] + (b.x - a.x), +cur[1] + (b.y - a.y), true);
        App.after(480, success);
      } else {
        moveTo(0, 0, true);
        App.say('おしい! もうすこし はりの ちかくまで もっていってね。', 'think');
      }
    };
    worm.addEventListener('pointerup', end);
    worm.addEventListener('pointercancel', end);
  },
};

/* ───────── 4〜6. なげる・まつ・まく ───────── */
Scenes.fishing = {
  step: 3,
  enter() {
    const st = App.stage;
    st.classList.add('stage-sea');
    st.innerHTML = Art.seaScene();
    const svg = st.querySelector('svg');
    const E = id => svg.querySelector('#' + id);

    // よこながの がめんでは いっぱいに ひろげ、たてながでは うえと したに そらと うみを のばす
    const fit = () => {
      const W = st.clientWidth, H = st.clientHeight;
      if (!W || !H) return;
      const wide = W / H >= 800 / 450;
      svg.setAttribute('preserveAspectRatio', wide ? 'xMidYMid slice' : 'xMidYMid meet');
      if (!wide) {
        const sc = W / 800;
        const split = (H / 2 + (241 - 225) * sc) / H * 100;
        st.style.background = `linear-gradient(#8fd3ff 0, #dff5ff ${split}%, #3f9fdc ${split}%, #1a68b0 100%)`;
      } else {
        st.style.background = '';
      }
    };
    fit();
    window.addEventListener('resize', fit);
    const line = E('line'), bob = E('bobber'), shadow = E('fishShadow'), shadowInner = E('fishShadowInner');
    const kid = E('kid'), rod = E('rod'), fx = E('fx');
    const NS = 'http://www.w3.org/2000/svg';

    const TIP = { x: 262, y: 112 };
    const WATER = 240;
    const PIER = 218;

    const s = {
      phase: 'look', t: 0,
      bx: TIP.x, by: TIP.y, landX: 500, fu: 0, power: 0,
      dip: 0, dipCur: 0, bite: 'idle', round: 0,
      dist: 100, struggling: false, nextSwitch: 0, strugCount: 0, tension: 0,
      fish: null, ui: null,
    };

    /* こうか */
    const ripple = (x, y = WATER, big = false) => {
      const e = document.createElementNS(NS, 'ellipse');
      e.setAttribute('cx', x); e.setAttribute('cy', y + 2);
      e.setAttribute('rx', big ? 26 : 16); e.setAttribute('ry', big ? 7 : 4);
      e.setAttribute('class', 'ripple');
      fx.appendChild(e);
      setTimeout(() => e.remove(), 1200);
    };
    const splash = (x, y = WATER) => {
      for (let i = 0; i < 7; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x); c.setAttribute('cy', y);
        c.setAttribute('r', 3 + Math.random() * 3);
        c.setAttribute('class', 'drop');
        c.style.setProperty('--dx', ((Math.random() - 0.5) * 70) + 'px');
        c.style.setProperty('--dy', (-25 - Math.random() * 45) + 'px');
        fx.appendChild(c);
        setTimeout(() => c.remove(), 900);
      }
    };
    const floatText = (text, x, y, cls = '') => {
      const tx = document.createElementNS(NS, 'text');
      tx.setAttribute('x', x); tx.setAttribute('y', y);
      tx.setAttribute('text-anchor', 'middle');
      tx.setAttribute('class', 'float-text ' + cls);
      tx.textContent = text;
      fx.appendChild(tx);
      setTimeout(() => tx.remove(), 1600);
    };

    /* えがく */
    const draw = () => {
      bob.setAttribute('transform', `translate(${s.bx.toFixed(1)},${s.by.toFixed(1)})`);
      const topY = s.by - 24;
      let sag = 45;
      if (s.phase === 'flying') sag = 0;
      if (s.phase === 'reel') sag = s.struggling ? -4 : 14;
      const cx = (TIP.x + s.bx) / 2;
      const cy = Math.max(TIP.y, topY) + sag;
      line.setAttribute('d', `M${TIP.x} ${TIP.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${s.bx.toFixed(1)} ${topY.toFixed(1)}`);
      line.classList.toggle('taut', s.phase === 'reel' && s.struggling);
    };

    /* フェーズ: うしろを みる */
    const look = () => {
      s.phase = 'look';
      App.setStep(3);
      App.say('さおを なげる まえに…\nうしろに ひとが いないか みよう!');
      App.setControls(App.btn('👀 うしろを みる', {
        cls: 'big pulse',
        onClick: b => {
          b.disabled = true;
          kid.classList.add('look-back');
          App.after(500, () => floatText('だれも いない!', 110, 90, 'ok'));
          App.after(1400, () => {
            kid.classList.remove('look-back');
            App.say('だれも いないね! よし!\nタイミングよく ボタンを おして、さおを なげよう。', 'wow');
            power();
          });
        },
      }));
    };

    /* フェーズ: ちからを きめて なげる */
    const power = () => {
      s.phase = 'power';
      const meter = h(`
        <div class="meter-wrap">
          <div class="meter"><div class="needle"></div></div>
          <div class="meter-lbl"><span>ちかく</span><span>とおく</span></div>
        </div>`);
      const needle = meter.querySelector('.needle');
      let v = 0, mt = 0;
      const stop = App.loop(dt => {
        mt += dt;
        v = (Math.sin(mt * 2.4 - Math.PI / 2) + 1) / 2;
        needle.style.left = (v * 100) + '%';
      });
      App.setControls(meter, App.btn('🎣 えいっ! なげる', {
        cls: 'big',
        onClick: b => {
          b.disabled = true;
          stop();
          cast(v);
        },
      }));
    };

    const cast = p => {
      s.phase = 'flying';
      s.power = p;
      s.fu = 0;
      s.landX = 360 + p * 360;
      rod.classList.remove('swing');
      void rod.getBoundingClientRect();
      rod.classList.add('swing');
      Sfx.whoosh();
    };

    const landed = () => {
      s.bx = s.landX;
      s.by = WATER;
      Sfx.splash();
      ripple(s.bx, WATER, true);
      splash(s.bx);
      const p = s.power;
      const msg = p < 0.33 ? 'ちかくに おちたね。ちかくにも さかなは いるよ!'
        : p < 0.7 ? 'じょうず! ちょうど いい ところに おちたよ!'
        : 'すごい! とおくまで とんだね!';
      App.say(msg + '\nうきを よーく みてね。ぐーっと しずんだら「あわせる!」を おしてね。', 'wow');
      wait(true);
    };

    /* フェーズ: うきを みて まつ */
    const wait = first => {
      s.phase = 'wait';
      s.bite = 'idle';
      s.dip = 0;
      App.setStep(4);
      const r = ++s.round;
      const hookBtn = App.btn('✊ あわせる!', { cls: 'big hook-btn', onClick: () => onHook(hookBtn) });
      App.setControls(hookBtn);

      let tt = (first ? 6000 : 2500) + Math.random() * 2500;
      const nibbles = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < nibbles; i++) {
        App.after(tt, () => { if (s.round === r) nibble(); });
        tt += 1100 + Math.random() * 800;
      }
      App.after(tt + 400, () => { if (s.round === r) sink(r, hookBtn); });
    };

    const nibble = () => {
      s.bite = 'nibble';
      s.dip = 9;
      Sfx.nibble();
      ripple(s.bx);
      floatText('ちょん', s.bx + 30, WATER - 40, 'small');
      App.after(200, () => { if (s.bite === 'nibble') s.dip = 0; });
    };

    const sink = (r, hookBtn) => {
      s.bite = 'sink';
      s.dip = 30;
      Sfx.sink();
      ripple(s.bx, WATER, true);
      floatText('ぐぐーっ!', s.bx, WATER - 50, 'big');
      hookBtn.classList.add('now');
      hookBtn.innerHTML = '✊ いまだ! あわせる!';
      App.after(3400, () => {
        if (s.round !== r || s.phase !== 'wait') return;
        s.bite = 'gone';
        s.dip = 0;
        hookBtn.classList.remove('now');
        hookBtn.innerHTML = '✊ あわせる!';
        Sfx.oops();
        App.say('あ〜、にげちゃった。\nだいじょうぶ! また さかなが くるよ。うきを みていてね。', 'think');
        App.after(1800, () => { if (s.round === r) wait(false); });
      });
    };

    const onHook = hookBtn => {
      if (s.phase !== 'wait') return;
      if (s.bite === 'sink') {
        hookBtn.disabled = true;
        hooked();
      } else if (s.bite === 'nibble') {
        Sfx.oops();
        App.say('いまは「ちょんちょん」。さかなが えさを つついているだけだよ。\nぐーっと しずむまで まってね!', 'think');
      } else if (s.bite === 'idle') {
        Sfx.oops();
        App.say('まだ さかなは きていないよ。\nうきを じーっと みていようね。', 'think');
      }
    };

    /* フェーズ: いとを まく */
    const hooked = () => {
      s.round++;
      s.phase = 'reel';
      App.setStep(5);
      s.fish = pickFish();
      s.dist = 100;
      s.tension = 0;
      s.struggling = false;
      s.strugCount = 0;
      s.nextSwitch = s.t + 2.6;
      shadow.setAttribute('opacity', '1');
      const sc = 0.75 + s.fish.len * 0.35;
      shadowInner.setAttribute('transform', `scale(-${sc},${sc})`);
      Sfx.good();
      floatText('かかった!', s.bx, WATER - 60, 'big');
      splash(s.bx);
      App.say('かかった! 「まく」ボタンを なんども おして、いとを まこう!\nさかなが あばれたら、てを とめて まってね。', 'wow');

      const ui = h(`
        <div class="reel-ui">
          <div class="reel-status calm">いまだ! まこう!</div>
          <div class="tension"><span>いと</span><div class="bar"><div class="fill"></div></div></div>
        </div>`);
      s.ui = { status: ui.querySelector('.reel-status'), fill: ui.querySelector('.fill'), bar: ui.querySelector('.bar') };
      App.setControls(ui, App.btn('🔄 くるくる まく!', { cls: 'big reel-btn', onClick: reelTap }));
    };

    const reelTap = () => {
      if (s.phase !== 'reel') return;
      if (s.struggling) {
        s.tension += 30;
        Sfx.strain();
        s.ui.bar.classList.remove('flash');
        void s.ui.bar.offsetWidth;
        s.ui.bar.classList.add('flash');
        if (s.tension >= 100) {
          s.tension = 55;
          s.dist = Math.min(100, s.dist + 12);
          App.say('いとが きれちゃう! さかなが あばれている ときは、てを とめて まってね。', 'think');
        }
      } else {
        s.dist -= 7;
        Sfx.reel();
        rod.classList.remove('tug');
        void rod.getBoundingClientRect();
        rod.classList.add('tug');
        if (s.dist <= 0) landFish();
      }
    };

    const setStruggle = on => {
      s.struggling = on;
      if (on) {
        s.strugCount++;
        s.nextSwitch = s.t + 1.6 + Math.random() * 0.9;
        s.ui.status.className = 'reel-status fight';
        s.ui.status.textContent = 'あばれてる! まって!';
        if (s.strugCount <= 2) App.say('あばれてる! いまは まって!', 'think');
        Sfx.splash();
        splash(s.bx, WATER);
      } else {
        s.nextSwitch = s.t + 2.0 + Math.random() * 1.6;
        s.ui.status.className = 'reel-status calm';
        s.ui.status.textContent = 'いまだ! まこう!';
        if (s.strugCount <= 2) App.say('おとなしく なったよ。いまだ! まこう!');
      }
    };

    const landFish = () => {
      s.phase = 'landed';
      Sfx.splash();
      splash(s.bx, WATER);
      shadow.setAttribute('opacity', '0');
      floatText('つれた!', s.bx, WATER - 70, 'big');
      App.setControls();
      Save.data.tutorialDone = true;
      Save.write();
      App.after(900, () => App.go('caught', { fish: s.fish }));
    };

    /* まいフレーム */
    App.loop(dt => {
      s.t += dt;
      if (s.phase === 'flying') {
        s.fu = Math.min(1, s.fu + dt / 0.9);
        const u = s.fu;
        s.bx = TIP.x + (s.landX - TIP.x) * u;
        s.by = TIP.y + (WATER - TIP.y) * u - Math.sin(Math.PI * u) * 130;
        if (u >= 1) landed();
      } else if (s.phase === 'wait') {
        s.dipCur += (s.dip - s.dipCur) * Math.min(1, dt * 14);
        s.by = WATER + Math.sin(s.t * 2.2) * 2.5 + s.dipCur;
      } else if (s.phase === 'reel') {
        if (s.t >= s.nextSwitch) setStruggle(!s.struggling);
        if (s.struggling) {
          s.dist = Math.min(100, s.dist + dt * 4);
          s.tension = Math.max(0, s.tension - dt * 18);
          if (Math.random() < dt * 3) ripple(s.bx);
        } else {
          s.tension = Math.max(0, s.tension - dt * 45);
        }
        const wig = s.struggling ? Math.sin(s.t * 22) * 7 : Math.sin(s.t * 4) * 2;
        const fxX = PIER + 25 + (s.landX - PIER - 25) * Math.max(0, s.dist) / 100;
        shadow.setAttribute('transform', `translate(${(fxX + wig).toFixed(1)},${WATER + 40 + (s.struggling ? 6 : 0)}) rotate(${wig})`);
        s.bx = fxX + wig * 0.5;
        s.by = WATER + 8 + (s.struggling ? 10 : 0);
        s.ui.fill.style.width = Math.min(100, s.tension) + '%';
        s.ui.fill.classList.toggle('danger', s.tension > 60);
      }
      draw();
    });

    draw();
    look();
    return () => {
      window.removeEventListener('resize', fit);
      st.style.background = '';
    };
  },
};

/* ───────── つれた! ───────── */
Scenes.caught = {
  step: 6,
  enter({ fish }) {
    const isNew = !Save.data.caught[fish.id];
    Save.addFish(fish.id);
    const first = Save.total() === 1;

    App.stage.classList.add('stage-caught');
    const wrap = h(`
      <div class="caught">
        <div class="rays"></div>
        ${isNew ? '<div class="badge-new">はじめて!</div>' : ''}
        ${fish.rare ? '<div class="badge-rare">レア!</div>' : ''}
        <div class="caught-fish">${Art.fish(fish)}</div>
        <div class="caught-name">${fish.name}</div>
        <div class="caught-fact">${fish.fact}</div>
      </div>`);
    App.stage.appendChild(wrap);
    confetti(App.stage, 60);
    Sfx.fanfare();
    App.say(`やったね! ${fish.name}が つれたよ!\n${fish.fact}`, 'wow');

    const fishEl = wrap.querySelector('.caught-fish');

    const finish = () => {
      if (first) {
        wrap.appendChild(h('<div class="medal">🏅 はじめての つり せいこう!<br>きみは つり めいじん!</div>'));
      }
      App.setControls(
        App.btn('🎣 もういちど つる', { cls: 'big pulse green', onClick: () => App.go('bait', { again: true }) }),
        App.btn('📖 ずかん', { cls: 'blue', onClick: () => App.go('zukan') }),
        App.btn('🏠 おわる', { cls: 'gray', onClick: () => App.go('title') }),
      );
    };

    const manners = () => {
      App.say('さかなを さわるときは、てを みずで ぬらしてから やさしくね。\nこの さかな、どうする?');
      App.setControls(
        App.btn('👋 うみに かえす', {
          cls: 'blue',
          onClick: () => {
            fishEl.classList.add('release');
            Sfx.splash();
            App.say('ばいばい! げんきでね。\nうみに かえすと、また おおきく なるよ。', 'wow');
            finish();
          },
        }),
        App.btn('🪣 もってかえる', {
          cls: '',
          onClick: () => {
            fishEl.classList.add('to-bucket');
            Sfx.pop();
            App.say('たべる ぶんだけ もってかえろうね。\nおうちで「いただきます」しようね。', 'wow');
            finish();
          },
        }),
      );
    };

    App.setControls(App.btn('つぎへ ▶', { cls: 'big pulse', onClick: manners }));
  },
};

/* ───────── ずかん ───────── */
Scenes.zukan = {
  step: -1,
  enter() {
    const kinds = Save.kinds();
    App.say(kinds === 0
      ? 'これは さかな ずかん。\nつった さかなが ここに のるよ。つりに いってみよう!'
      : `いままでに ${kinds}しゅるいの さかなを つったよ!\nさかなを タッチすると おはなし するよ。`);

    const wrap = h(`<div class="zukan"><div class="zukan-head">📖 さかな ずかん <b>${kinds} / ${FISH.length}</b></div><div class="zukan-grid"></div></div>`);
    const grid = wrap.querySelector('.zukan-grid');
    FISH.forEach(f => {
      const n = Save.data.caught[f.id] || 0;
      const card = h(`
        <button class="zcard ${n ? '' : 'unknown'}">
          ${f.rare && n ? '<span class="zrare">レア</span>' : ''}
          ${Art.fish(f, { silhouette: !n })}
          <span class="zname">${n ? f.name : '？？？'}</span>
          ${n ? `<span class="zcount">${n}ひき</span>` : ''}
        </button>`);
      card.addEventListener('click', () => {
        if (n) { Sfx.pop(); App.say(`${f.name}。\n${f.fact}`); }
        else { Sfx.click(); App.say('まだ つれていない さかなだよ。\nつりに いって さがしてみよう!', 'think'); }
      });
      grid.appendChild(card);
    });
    App.stage.appendChild(wrap);

    App.setControls(
      App.btn('🎣 つりに いく', {
        cls: 'big green',
        onClick: () => Save.data.tutorialDone ? App.go('bait', { again: true }) : App.go('tools'),
      }),
      App.btn('🏠 もどる', { cls: 'gray', onClick: () => App.go('title') }),
    );
  },
};

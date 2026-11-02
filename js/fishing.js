/* つり（ねらって なげる → まつ → かけひきして まく）と つれた ばめん */

// きょう つった かず（ページを ひらいている あいだ）
const Today = { fish: 0, junk: 0 };

Scenes.fishing = {
  step: 2,
  enter() {
    if (!Loadout.ready()) { App.go('shop'); return; }
    const M = Loadout.m;
    const useBobber = M.indicator === 'bobber';
    const isDrop = M.cast === 'drop';
    const isLure = Loadout.gear.bait === 'jig';

    const st = App.stage;
    st.classList.add('stage-sea');
    st.innerHTML = Art.seaScene() + `<div class="sea-hud">きょう 🐟 ${Today.fish}ひき${Today.junk ? ` ・ 🗑️ ${Today.junk}こ` : ''}</div>`;
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

    const line = E('line'), bob = E('bobber'), weight = E('weight');
    const shadow = E('fishShadow'), shadowInner = E('fishShadowInner');
    const kid = E('kid'), rod = E('rod'), fx = E('fx');
    const schoolG = E('school'), spotG = E('spot'), aim = E('aim'), jumper = E('jumper');
    const NS = 'http://www.w3.org/2000/svg';

    bob.style.display = useBobber ? '' : 'none';
    weight.querySelector('.w-sinker').style.display = isLure ? 'none' : '';
    weight.querySelector('.w-lure').style.display = isLure ? '' : 'none';
    weight.setAttribute('opacity', useBobber ? '0' : '1');

    const BASE = { x: 166, y: 178 };
    const ROD = { x: 96, y: -66 };
    const WATER = 240;
    const PIER = 218;
    const DEPTH = WATER + 70;

    const rodPoint = (a, k = 1) => ({
      x: BASE.x + k * (ROD.x * Math.cos(a) - ROD.y * Math.sin(a)),
      y: BASE.y + k * (ROD.x * Math.sin(a) + ROD.y * Math.cos(a)),
    });
    let TIP = rodPoint(0);

    // さかなが いそうな ポイント
    const spotX = isDrop ? PIER + 50 : 430 + Math.random() * 260;

    const s = {
      phase: 'look', t: 0,
      bx: TIP.x, by: TIP.y, landX: 500, fu: 0, q: 0,
      dip: 0, dipCur: 0, bend: 0, bendCur: 0, shakeUntil: 0,
      bite: 'idle', round: 0, sinkT: 0, nice: false,
      dist: 100, struggling: false, nextSwitch: 0, strugCount: 0, tension: 0, holding: false, snapCool: 0,
      catch: null, ui: null, biteX: null,
    };

    /* ── こうか ── */
    const ripple = (x, y = WATER, big = false) => {
      const e = document.createElementNS(NS, 'ellipse');
      e.setAttribute('cx', x); e.setAttribute('cy', y + 2);
      e.setAttribute('rx', big ? 26 : 16); e.setAttribute('ry', big ? 7 : 4);
      e.setAttribute('class', 'ripple');
      fx.appendChild(e);
      setTimeout(() => e.remove(), 1200);
    };
    const splash = (x, y = WATER, n = 7) => {
      for (let i = 0; i < n; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x); c.setAttribute('cy', y);
        c.setAttribute('r', 3 + Math.random() * 3);
        c.setAttribute('class', 'drop');
        c.style.setProperty('--dx', ((Math.random() - 0.5) * 80) + 'px');
        c.style.setProperty('--dy', (-25 - Math.random() * 50) + 'px');
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
    const cuePos = () => (useBobber ? { x: s.bx, y: WATER - 45 } : { x: TIP.x + 40, y: TIP.y - 25 });

    /* ── ポイント（とり と あわ）と さかなの むれ ── */
    if (!isDrop) {
      spotG.innerHTML = `
        <g class="birds">
          <path class="bird b1" d="M${spotX - 30} 150 q10 -10 20 0 q10 -10 20 0" stroke="#4a4f57" stroke-width="3" fill="none"/>
          <path class="bird b2" d="M${spotX + 10} 128 q8 -8 16 0 q8 -8 16 0" stroke="#4a4f57" stroke-width="3" fill="none"/>
        </g>`;
    }
    const bubbles = document.createElementNS(NS, 'g');
    spotG.appendChild(bubbles);
    const school = [0, 1, 2].map(i => {
      const g = document.createElementNS(NS, 'g');
      g.innerHTML = `<ellipse rx="${20 - i * 3}" ry="${8 - i}" fill="#0b2a44" opacity=".4"/><path d="M${-18 + i * 3} 0 l-12 -7 v14 z" fill="#0b2a44" opacity=".4"/>`;
      schoolG.appendChild(g);
      return { g, ph: Math.random() * 6, y: WATER + 42 + i * 14 };
    });

    /* ── えがく ── */
    const draw = () => {
      let a = s.bendCur;
      if (s.t < s.shakeUntil) a += Math.sin(s.t * 45) * 0.05;
      TIP = rodPoint(a);
      const c = rodPoint(a * 0.3, 0.55);
      rod.setAttribute('d', `M${BASE.x} ${BASE.y} Q${c.x.toFixed(1)} ${c.y.toFixed(1)} ${TIP.x.toFixed(1)} ${TIP.y.toFixed(1)}`);

      let endY;
      if (useBobber) {
        bob.setAttribute('transform', `translate(${s.bx.toFixed(1)},${s.by.toFixed(1)})`);
        endY = s.by - 24;
      } else {
        weight.setAttribute('transform', `translate(${s.bx.toFixed(1)},${s.by.toFixed(1)})`);
        endY = s.by;
      }
      let sag = useBobber ? 45 : 20;
      if (s.phase === 'flying') sag = 0;
      if (s.phase === 'reel') sag = s.tension > 60 ? -4 : 10;
      const cx = (TIP.x + s.bx) / 2;
      const cy = Math.max(TIP.y, Math.min(endY, WATER)) + sag;
      line.setAttribute('d', `M${TIP.x.toFixed(1)} ${TIP.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${s.bx.toFixed(1)} ${endY.toFixed(1)}`);
      line.classList.toggle('taut', s.phase === 'reel' && s.tension > 70);

      // むれ: ポイントの まわりを およぐ。アタリの ときは 1ぴきが エサへ
      const hidden = s.phase === 'reel' || s.phase === 'landed';
      school.forEach((f, i) => {
        let x = spotX + Math.sin(s.t * 0.6 + f.ph) * 70;
        let y = f.y + Math.sin(s.t * 1.3 + f.ph) * 6;
        const dir = Math.cos(s.t * 0.6 + f.ph) >= 0 ? 1 : -1;
        if (i === 0 && s.biteX !== null) { x = s.biteX; y = useBobber ? WATER + 40 : s.by; }
        f.g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${dir},1)`);
        f.g.setAttribute('opacity', hidden ? '0' : '1');
      });
      if (Math.random() < 0.04) {
        const b = document.createElementNS(NS, 'circle');
        b.setAttribute('cx', spotX + (Math.random() - 0.5) * 60); b.setAttribute('cy', WATER + 2);
        b.setAttribute('r', 2 + Math.random() * 3); b.setAttribute('class', 'bubble');
        bubbles.appendChild(b);
        setTimeout(() => b.remove(), 1500);
      }
    };

    /* ── うしろを みる ── */
    const look = () => {
      s.phase = 'look';
      App.setStep(2);
      if (isDrop) {
        App.say(`${M.name}は、あしもとの かべぎわに さかなが かくれているよ。\nしかけを そっと おとそう!`);
        App.setControls(App.btn('⬇️ そっと おとす', {
          cls: 'big pulse',
          onClick: b => { b.disabled = true; cast(spotX); },
        }));
        return;
      }
      App.say('さおを なげる まえに…\nうしろに ひとが いないか みよう!');
      App.setControls(App.btn('👀 うしろを みる', {
        cls: 'big pulse',
        onClick: b => {
          b.disabled = true;
          kid.classList.add('look-back');
          App.after(500, () => floatText('だれも いない!', 110, 90, 'ok'));
          App.after(1400, () => {
            kid.classList.remove('look-back');
            aimPhase();
          });
        },
      }));
    };

    /* ── ねらって なげる ── */
    const aimPhase = () => {
      s.phase = 'aim';
      App.say('とりが とんでいて、あわが でている ところに さかなが いるよ!\nきいろい マークが ポイントに きたら なげよう!', 'wow');
      aim.setAttribute('opacity', '1');
      let x = 330, at = 0;
      const stop = App.loop(dt => {
        at += dt;
        x = 330 + (Math.sin(at * 1.6 - Math.PI / 2) + 1) / 2 * 410;
        aim.setAttribute('transform', `translate(${x.toFixed(1)},${WATER + 4})`);
      });
      App.setControls(App.btn('🎣 えいっ! なげる', {
        cls: 'big',
        onClick: b => {
          b.disabled = true;
          stop();
          aim.setAttribute('opacity', '0');
          cast(x);
        },
      }));
    };

    const cast = x => {
      s.phase = 'flying';
      s.fu = 0;
      s.startX = TIP.x;
      s.startY = TIP.y;
      s.landX = x;
      s.q = isDrop ? 1 : Math.max(0, 1 - Math.abs(x - spotX) / 170);
      if (!isDrop) {
        rod.classList.remove('swing');
        void rod.getBoundingClientRect();
        rod.classList.add('swing');
        Sfx.whoosh();
      }
    };

    const landed = () => {
      s.bx = s.landX;
      s.by = WATER;
      Sfx.splash();
      ripple(s.bx, WATER, true);
      splash(s.bx);
      let msg;
      if (isDrop) msg = 'ぽちゃん! かべぎわに おちたよ。';
      else if (s.q > 0.75) { msg = 'どんぴしゃ! ポイントに はいったよ!'; floatText('どんぴしゃ!', s.bx, WATER - 50, 'big'); Sfx.good(); }
      else if (s.q > 0.35) msg = 'おしい! ポイントの ちかくだよ。';
      else msg = 'ポイントから すこし はなれちゃった。さかなが くるまで まとう。';
      let how;
      if (useBobber) how = 'ウキが ぐーっと しずんだら すぐ「あわせる!」';
      else if (isLure) how = 'ルアーを まいて さそうよ。さおさきが ぐいーっと まがったら すぐ「あわせる!」';
      else how = 'さおさきが ぐいーっと まがったら すぐ「あわせる!」';
      App.say(msg + '\n' + how, 'wow');
      wait(true);
    };

    /* ── アタリを まつ ── */
    const wait = first => {
      s.phase = 'wait';
      s.bite = 'idle';
      s.dip = 0;
      s.bend = 0;
      s.biteX = null;
      App.setStep(3);
      const r = ++s.round;
      const hookBtn = App.btn('✊ あわせる!', { cls: 'big hook-btn', onClick: () => onHook(hookBtn) });
      App.setControls(hookBtn);

      const slow = 1.4 - 0.8 * s.q; // ポイントに ちかいほど はやく くる
      let tt = ((first ? 5000 : 2500) + Math.random() * 2000) * slow;
      App.after(Math.max(0, tt - 1200), () => { if (s.round === r) s.biteX = s.bx; });
      const nibbles = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < nibbles; i++) {
        App.after(tt, () => { if (s.round === r) nibble(); });
        tt += 900 + Math.random() * 800;
      }
      App.after(tt + 300, () => { if (s.round === r) sink(r, hookBtn); });
    };

    const nibble = () => {
      s.bite = 'nibble';
      Sfx.nibble();
      const c = cuePos();
      if (useBobber) {
        s.dip = 9;
        ripple(s.bx);
        App.after(200, () => { if (s.bite === 'nibble') s.dip = 0; });
        floatText('ちょん', c.x + 30, c.y, 'small');
      } else {
        s.shakeUntil = s.t + 0.45;
        floatText('ぷるぷる', c.x, c.y, 'small');
      }
    };

    const sink = (r, hookBtn) => {
      s.bite = 'sink';
      s.sinkT = s.t;
      Sfx.sink();
      const c = cuePos();
      if (useBobber) {
        s.dip = 30;
        ripple(s.bx, WATER, true);
        floatText('ぐぐーっ!', c.x, c.y - 5, 'big');
      } else {
        s.bend = 0.32;
        floatText('ぐいーっ!', c.x + 20, c.y, 'big');
      }
      hookBtn.classList.add('now');
      hookBtn.innerHTML = '✊ いまだ! あわせる!';
      App.after(3000, () => {
        if (s.round !== r || s.phase !== 'wait') return;
        s.bite = 'gone';
        s.dip = 0;
        s.bend = 0;
        s.biteX = null;
        hookBtn.classList.remove('now');
        hookBtn.innerHTML = '✊ あわせる!';
        Sfx.oops();
        App.say(`あ〜、にげちゃった。\nだいじょうぶ! また さかなが くるよ。${useBobber ? 'ウキ' : 'さおさき'}を みていてね。`, 'think');
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
        App.say(useBobber
          ? 'いまは「ちょんちょん」。さかなが えさを つついているだけだよ。\nぐーっと しずむまで まってね!'
          : 'いまは「ぷるぷる」。さかなが えさを つついているだけだよ。\nさおさきが ぐいーっと まがるまで まってね!', 'think');
      } else if (s.bite === 'idle') {
        Sfx.oops();
        App.say(`まだ さかなは きていないよ。\n${useBobber ? 'ウキ' : 'さおの さき'}を じーっと みていようね。`, 'think');
      }
    };

    /* ── かかった! つれる ものを きめる ── */
    const decideCatch = () => {
      if (Save.total() > 0 && Math.random() < 0.1) {
        return { junk: JUNK[Math.floor(Math.random() * JUNK.length)] };
      }
      const fish = pickFish();
      const [lo, hi] = fish.size;
      const bonus = s.q * 0.15 + (s.nice ? 0.12 : 0);
      const raw = lo + (hi - lo) * Math.pow(Math.random(), 1.4);
      const size = Math.min(hi, Math.round(raw * (1 + bonus)));
      return { fish, size };
    };

    /* ── まく（かけひき） ── */
    const hooked = () => {
      const react = s.t - s.sinkT;
      s.nice = react < 0.9;
      s.round++;
      s.phase = 'reel';
      s.biteX = null;
      App.setStep(4);
      s.catch = decideCatch();
      s.dist = 100;
      s.tension = 0;
      s.struggling = false;
      s.strugCount = 0;
      s.nextSwitch = s.t + 2.2;
      s.reelStart = s.bx;
      const f = s.catch.fish;
      const sz = s.catch.size || 20;
      s.power = f ? 0.8 + sz / (sz + 30) + (f.rare ? 0.3 : 0) : 1.3; // おおきいほど つよい
      shadow.setAttribute('opacity', '1');
      const sc = f ? 0.6 + sz / 50 : 0.9;
      shadowInner.setAttribute('transform', `scale(-${sc},${sc})`);
      Sfx.good();
      floatText(s.nice ? 'ナイス あわせ!' : 'かかった!', s.bx, WATER - 60, 'big');
      splash(s.bx);
      App.say((s.nice ? 'ナイス あわせ! すぐ あわせると がっちり かかるよ。\n' : 'かかった!\n')
        + '「まく」を おしている あいだ いとが まけるよ。\nいとが あかく なったり、さかなが あばれたら、てを はなしてね!', 'wow');

      const ui = h(`
        <div class="fight-ui">
          <div class="reel-status calm">おして まこう!</div>
          <div class="fight-row"><span>いと</span><div class="tbar"><div class="tzone"></div><div class="tfill"></div></div></div>
          <div class="fight-row"><span>きょり</span><div class="dbar"><span class="d-fish">🐟</span><span class="d-me">🧒</span></div></div>
        </div>`);
      s.ui = { status: ui.querySelector('.reel-status'), fill: ui.querySelector('.tfill'), bar: ui.querySelector('.tbar'), dfish: ui.querySelector('.d-fish') };
      const reelBtn = App.btn('🔄 おして まく', { cls: 'big reel-btn' });
      const set = v => e => { s.holding = v; reelBtn.classList.toggle('holding', v); if (v) { try { reelBtn.setPointerCapture(e.pointerId); } catch (err) {} } };
      reelBtn.addEventListener('pointerdown', set(true));
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => reelBtn.addEventListener(ev, set(false)));
      App.setControls(ui, reelBtn);
    };

    const setStruggle = on => {
      s.struggling = on;
      if (on) {
        s.strugCount++;
        s.nextSwitch = s.t + (1.2 + Math.random() * 0.8) * Math.min(1.3, s.power);
        if (s.strugCount <= 2) App.say('あばれてる! てを はなして まって!', 'think');
        Sfx.splash();
        splash(s.bx, WATER);
        if (s.catch.fish && s.dist < 85 && Math.random() < 0.55) jump();
      } else {
        s.nextSwitch = s.t + 2.2 + Math.random() * 1.3;
        if (s.strugCount <= 2) App.say('おとなしく なったよ。いまだ! おして まこう!');
      }
    };

    // さかなが みずから とびだす（エラあらい）
    const jump = () => {
      const f = s.catch.fish;
      const x0 = s.bx;
      const g = document.createElementNS(NS, 'g');
      g.innerHTML = `<svg x="-45" y="-29" width="90" height="58" viewBox="0 0 214 136">${Art.fish(f).replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, '')}</svg>`;
      jumper.appendChild(g);
      floatText('ばしゃっ!', x0, WATER - 90, 'big');
      let t = 0;
      App.loop(dt => {
        t += dt / 0.8;
        const y = WATER - 20 - Math.sin(Math.PI * Math.min(1, t)) * 80;
        g.setAttribute('transform', `translate(${(x0 - t * 20).toFixed(1)},${y.toFixed(1)}) rotate(${(-40 + t * 80).toFixed(1)})`);
        if (t >= 1) { g.remove(); splash(x0 - 20, WATER, 9); Sfx.splash(); return false; }
      });
    };

    const landFish = () => {
      s.phase = 'landed';
      Sfx.splash();
      splash(s.bx, WATER);
      shadow.setAttribute('opacity', '0');
      floatText(s.catch.junk ? 'あれ?' : 'つれた!', s.bx, WATER - 70, 'big');
      App.setControls();
      Save.data.tutorialDone = true;
      Save.write();
      App.after(900, () => App.go('caught', s.catch));
    };

    const reelUpdate = dt => {
      if (s.t >= s.nextSwitch && !s.catch.junk) setStruggle(!s.struggling);
      s.snapCool = Math.max(0, s.snapCool - dt);
      const maxed = s.tension >= 100;
      if (s.holding) {
        // いとが ピンピンの ときは ドラグが すべって あまり まけない
        // あばれている ときに まくと、ぎゃくに いとを ひきだされる
        if (s.struggling) s.dist += 4 * dt;
        else s.dist -= (16 / Math.sqrt(s.power)) * (maxed ? 0.7 : 1) * dt;
        s.tension += (s.struggling ? 80 : 20 + 8 * s.power) * dt;
        if (Math.random() < dt * 8) Sfx.reel();
      } else {
        s.tension -= 55 * dt;
        if (s.struggling) s.dist += 2 * dt;
      }
      s.tension = Math.max(0, s.tension);
      s.dist = Math.min(100, s.dist);
      if (maxed && s.holding && s.snapCool <= 0) {
        s.snapCool = 2.5;
        Sfx.strain();
        s.ui.bar.classList.remove('flash'); void s.ui.bar.offsetWidth; s.ui.bar.classList.add('flash');
        floatText('いとが きれそう!', s.bx, WATER - 60, 'small');
        App.say('いとが きれちゃう! いとが あかい ときは てを はなしてね。', 'think');
      }
      s.tension = Math.min(100, s.tension);
      s.bend = 0.1 + s.tension / 400 + (s.struggling ? 0.08 : 0);

      // ひょうじ
      const danger = s.tension > 70;
      s.ui.fill.style.width = s.tension + '%';
      s.ui.fill.classList.toggle('danger', danger);
      s.ui.dfish.style.left = (s.dist * 0.88) + '%';
      let msg, cls;
      if (s.struggling) { msg = 'あばれてる! てを はなして!'; cls = 'fight'; }
      else if (danger && s.holding) { msg = 'いとが ピンピン! てを はなそう'; cls = 'fight'; }
      else { msg = s.holding ? 'いいぞ! まいてる!' : 'おして まこう!'; cls = 'calm'; }
      if (s.ui.status.textContent !== msg) { s.ui.status.textContent = msg; s.ui.status.className = 'reel-status ' + cls; }

      const wig = s.struggling ? Math.sin(s.t * 22) * 8 : Math.sin(s.t * 4) * 2;
      const fxX = PIER + 25 + (s.reelStart - PIER - 25) * Math.max(0, s.dist) / 100;
      shadow.setAttribute('transform', `translate(${(fxX + wig).toFixed(1)},${WATER + 40 + (s.struggling ? 6 : 0)}) rotate(${wig})`);
      s.bx = fxX + wig * 0.5;
      s.by = useBobber ? WATER + 8 + (s.struggling ? 10 : 0) : WATER + 36;
      if (s.struggling && Math.random() < dt * 3) ripple(s.bx);
      if (s.dist <= 0) landFish();
    };

    /* ── まいフレーム ── */
    App.loop(dt => {
      s.t += dt;
      s.bendCur += (s.bend - s.bendCur) * Math.min(1, dt * 10);

      if (s.phase === 'look' || s.phase === 'aim') {
        s.bx = TIP.x;
        s.by = TIP.y + (useBobber ? 0 : 30);
      } else if (s.phase === 'flying') {
        s.fu = Math.min(1, s.fu + dt / (isDrop ? 0.6 : 0.9));
        const u = s.fu;
        s.bx = s.startX + (s.landX - s.startX) * u;
        s.by = s.startY + (WATER - s.startY) * u - Math.sin(Math.PI * u) * (isDrop ? 30 : 130);
        if (u >= 1) landed();
      } else if (s.phase === 'wait') {
        if (useBobber) {
          s.dipCur += (s.dip - s.dipCur) * Math.min(1, dt * 14);
          s.by = WATER + Math.sin(s.t * 2.2) * 2.5 + s.dipCur;
        } else {
          const target = isLure ? WATER + 40 : DEPTH;
          s.by += (target - s.by) * Math.min(1, dt * 2);
          if (isLure && s.bite === 'idle') s.bx = Math.max(PIER + 110, s.bx - dt * 9);
        }
        if (s.biteX !== null) s.biteX = s.bx;
      } else if (s.phase === 'reel') {
        reelUpdate(dt);
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
  step: 5,
  enter({ fish, size, junk }) {
    if (junk) return caughtJunk(junk);

    const isNew = !Save.data.caught[fish.id];
    const prevBest = (Save.data.best || {})[fish.id] || 0;
    const isBest = !isNew && size > prevBest;
    Save.addFish(fish.id);
    Save.data.best = Save.data.best || {};
    if (size > prevBest) Save.data.best[fish.id] = size;
    Save.write();
    Today.fish++;
    const first = Save.total() === 1;

    App.stage.classList.add('stage-caught');
    const wrap = h(`
      <div class="caught">
        <div class="rays"></div>
        ${isNew ? '<div class="badge-new">はじめて!</div>' : ''}
        ${isBest ? '<div class="badge-new best">じこベスト!</div>' : ''}
        ${fish.rare ? '<div class="badge-rare">レア!</div>' : ''}
        <div class="caught-fish">${Art.fish(fish)}</div>
        <div class="caught-name">${fish.name} <span class="caught-size">📏 ${size}センチ</span></div>
        <div class="caught-fact">${fish.fact}</div>
      </div>`);
    App.stage.appendChild(wrap);
    confetti(App.stage, 60);
    Sfx.fanfare();
    App.say(`やったね! ${size}センチの ${fish.name}が つれたよ!${isBest ? '\nじこベスト こうしん!' : ''}\n${fish.fact}`, 'wow');

    const fishEl = wrap.querySelector('.caught-fish');
    const factEl = wrap.querySelector('.caught-fact');

    const finish = text => {
      App.say(text, 'wow');
      if (first) wrap.appendChild(h('<div class="medal">🏅 はじめての つり せいこう!<br>きみは つり めいじん!</div>'));
      caughtControls();
    };

    const handling = () => {
      const notes = [
        fish.spiky
          ? { ico: '⚠️', text: `${fish.name}は とげや はが あるよ。さわらずに、おとなに もってもらおう。` }
          : { ico: '🤲', text: 'てを みずで ぬらしてから、やさしく さわろうね。' },
        { ico: '🙋', text: 'はりは おとなに はずしてもらおう。' },
      ];
      wrap.classList.add('handling');
      factEl.replaceWith(h(`<ul class="notes">${notes.map(n => `<li><span class="n-ico"><span class="emoji">${n.ico}</span></span>${n.text}</li>`).join('')}</ul>`));
      App.say(notes.map(n => n.text).join('\n') + '\nこの さかな、どうする?');
      App.setControls(
        App.btn('👋 うみに かえす', {
          cls: 'blue',
          onClick: () => {
            fishEl.classList.add('release');
            Sfx.splash();
            finish('ばいばい! げんきでね。\nうみに かえすと、また おおきく なるよ。');
          },
        }),
        App.btn('🪣 もってかえる', {
          onClick: () => {
            fishEl.classList.add('to-bucket');
            Sfx.pop();
            finish('たべる ぶんだけ もってかえろうね。\nおうちで「いただきます」しようね。');
          },
        }),
      );
    };

    App.setControls(App.btn('つぎへ ▶', { cls: 'big pulse', onClick: handling }));
  },
};

function caughtControls() {
  App.setControls(
    App.btn('🎣 もういちど つる', { cls: 'big pulse green', onClick: () => App.go('prep', { only: 'bait' }) }),
    App.btn('🏪 どうぐを かえる', { cls: '', onClick: () => App.go('shop') }),
    App.btn('📖 ずかん', { cls: 'blue', onClick: () => App.go('zukan') }),
    App.btn('🏠', { cls: 'gray', onClick: () => App.go('title') }),
  );
}

function caughtJunk(junk) {
  Save.data.junk = (Save.data.junk || 0) + 1;
  Save.write();
  Today.junk++;
  App.stage.classList.add('stage-junk');
  const wrap = h(`
    <div class="caught">
      <div class="junk-ico">${junk.icon}</div>
      <div class="caught-name">${junk.name}</div>
      <div class="caught-fact">${junk.say}</div>
    </div>`);
  App.stage.appendChild(wrap);
  Sfx.oops();
  App.say(`あれれ? ${junk.name}が つれちゃった!\n${junk.say}`, 'think');
  App.setControls(App.btn('🗑️ ごみぶくろに いれる', {
    cls: 'big pulse',
    onClick: () => {
      wrap.querySelector('.junk-ico').classList.add('to-bucket');
      Sfx.good();
      wrap.appendChild(h(`<div class="medal">🌊 うみを きれいに したよ!<br>ごみ ひろい ${Save.data.junk}こめ</div>`));
      App.say('きれいな うみを まもったね! えらい!\nつりで でた ごみも、ぜんぶ もってかえろうね。', 'wow');
      caughtControls();
    },
  }));
}

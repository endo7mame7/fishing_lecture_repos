/* つり と つれた ばめん

   つりかたごとに あそびかたが ちがう（#8 #10）
   - ウキづり:   ねらって なげる → ウキを みて あわせる
   - ちょいなげ: ねらって なげる → そこに ついたら いとふけを とる → ゆっくり ひいて（サビいて）さそう。いわに ねがかり ちゅうい
   - ルアー:     ねらって なげる → かぞえて しずめ、むれの ふかさで まく → しゃくって さそう → もどってきたら かいしゅう
   - サビキ:     あしもとに おとす → むれの ふかさ（たな）で とめる → しゃくって エサを だす → なくなったら まきあげて つめなおす
   - さぐりづり: あなに おとす → ゆっくり ちょんちょん しゃくって さそう → いなければ となりの あなへ

   むずかしさ（#9）: あわせる じかんは みじかめ。まいている ときに いとが あかい ままだと きれる。ときどき バレる。
*/

// きょう つった かず（ページを ひらいている あいだ）
const Today = { fish: 0, junk: 0 };

Scenes.fishing = {
  step: 2,
  enter() {
    if (!Loadout.ready()) { App.go('shop'); return; }
    const M = Loadout.m;
    const MODE = M.id; // choinage / sabiki / uki / lure / saguri
    const useBobber = M.indicator === 'bobber';
    const isDrop = M.cast === 'drop';

    const st = App.stage;
    st.classList.add('stage-sea');
    st.innerHTML = Art.seaScene() + `
      <div class="sea-hud">きょう 🐟 ${Today.fish}ひき${Today.junk ? ` ・ 🗑️ ${Today.junk}こ` : ''}</div>
      <div class="depth-gauge" hidden><span class="dg-lbl">ふかさ</span><div class="dg-col"><span class="dg-fish">🐟</span><span class="dg-hook"></span></div></div>`;
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
      // ふかさ メーターを、えの うみの ひょうめん〜そこに ぴったり あわせる
      const sc = wide ? Math.max(W / 800, H / 450) : Math.min(W / 800, H / 450);
      const offY = (H - 450 * sc) / 2;
      const g = st.querySelector('.depth-gauge');
      const top = Math.max(4, offY + WATER * sc - 22);
      g.style.top = top + 'px';
      g.style.bottom = 'auto';
      g.style.height = (offY + BOTTOM * sc - top) + 'px';
    };

    const line = E('line'), bob = E('bobber'), weight = E('weight');
    const shadow = E('fishShadow'), shadowInner = E('fishShadowInner');
    const kid = E('kid'), rod = E('rod'), fx = E('fx');
    const schoolG = E('school'), spotG = E('spot'), aim = E('aim'), jumper = E('jumper');
    const gauge = st.querySelector('.depth-gauge');
    const NS = 'http://www.w3.org/2000/svg';

    const BASE = { x: 166, y: 178 };
    const ROD = { x: 96, y: -66 };
    const WATER = 240;
    const PIER = 218;
    const BOTTOM = 362; // うみの そこ（よこながの がめんでも みえる たかさ）
    fit();
    window.addEventListener('resize', fit);

    // しかけの みため
    weight.insertAdjacentHTML('beforeend', `
      <g class="w-basket"><path d="M0 -24 V-10" stroke="#555" stroke-width="1.5"/><rect x="-9" y="-11" width="18" height="20" rx="3" fill="#ff9f43" stroke="#d07a20" stroke-width="2"/>
        <path d="M0 9 V40" stroke="#555" stroke-width="1"/><circle cx="-6" cy="18" r="2.5" fill="#ff7eb6"/><circle cx="6" cy="27" r="2.5" fill="#ff7eb6"/><circle cx="-6" cy="36" r="2.5" fill="#ff7eb6"/></g>`);
    const showWeight = kind => {
      weight.querySelector('.w-sinker').style.display = kind === 'sinker' || kind === 'burakuri' ? '' : 'none';
      weight.querySelector('.w-lure').style.display = kind === 'lure' ? '' : 'none';
      weight.querySelector('.w-basket').style.display = kind === 'basket' ? '' : 'none';
      weight.querySelector('.w-sinker').setAttribute('fill', kind === 'burakuri' ? '#e53935' : '#6b6f76');
    };
    showWeight({ choinage: 'sinker', lure: 'lure', sabiki: 'basket', saguri: 'burakuri', uki: 'none' }[MODE]);
    bob.style.display = useBobber ? '' : 'none';
    weight.setAttribute('opacity', useBobber ? '0' : '1');

    const rodPoint = (a, k = 1) => ({
      x: BASE.x + k * (ROD.x * Math.cos(a) - ROD.y * Math.sin(a)),
      y: BASE.y + k * (ROD.x * Math.sin(a) + ROD.y * Math.cos(a)),
    });
    let TIP = rodPoint(0);

    /* ── つりばの じゅんび（ポイント・むれ・いわ・あな） ── */
    const spotX = isDrop ? PIER + 80 : 430 + Math.random() * 260;
    let tana; // さかなの いる ふかさ
    if (MODE === 'sabiki' || MODE === 'lure') tana = WATER + 40 + Math.random() * 70;
    else if (MODE === 'uki') tana = WATER + 42;
    else tana = BOTTOM - 14;
    const depthM = y => Math.max(0, Math.round((y - WATER) / 30));

    const rocks = MODE === 'choinage'
      ? [spotX - 80 - Math.random() * 50, spotX + 60 + Math.random() * 50].filter(x => x > PIER + 100 && x < 770)
      : [];
    const holes = MODE === 'saguri' ? [PIER + 30, PIER + 72, PIER + 114].map(x => ({ x, fish: false })) : [];
    if (holes.length) {
      const k = Math.floor(Math.random() * 3);
      holes[k].fish = true;
      if (Math.random() < 0.4) holes[(k + 1 + Math.floor(Math.random() * 2)) % 3].fish = true;
    }

    // うみの そこ・いわ
    const bed = document.createElementNS(NS, 'g');
    bed.innerHTML = `<path d="M0 ${BOTTOM + 8} Q200 ${BOTTOM} 400 ${BOTTOM + 6} T800 ${BOTTOM + 4} V450 H0 Z" fill="#d9c38f"/>`
      + rocks.map(x => `<ellipse cx="${x}" cy="${BOTTOM + 4}" rx="24" ry="14" fill="#6d6a62"/><ellipse cx="${x - 6}" cy="${BOTTOM}" rx="8" ry="4" fill="#8a877e"/>`).join('')
      + (MODE === 'saguri' ? [PIER + 9, PIER + 51, PIER + 93, PIER + 135].map(x => `<rect x="${x - 15}" y="${BOTTOM - 40}" width="30" height="50" rx="8" fill="#7d7a70"/>`).join('') : '');
    schoolG.parentNode.insertBefore(bed, schoolG);

    if (!isDrop) {
      spotG.innerHTML = `
        <g class="birds">
          <path class="bird b1" d="M${spotX - 30} 150 q10 -10 20 0 q10 -10 20 0" stroke="#4a4f57" stroke-width="3" fill="none"/>
          <path class="bird b2" d="M${spotX + 10} 128 q8 -8 16 0 q8 -8 16 0" stroke="#4a4f57" stroke-width="3" fill="none"/>
        </g>`;
    }
    const bubbles = document.createElementNS(NS, 'g');
    spotG.appendChild(bubbles);
    const school = (MODE === 'saguri' ? [] : [0, 1, 2]).map(i => {
      const g = document.createElementNS(NS, 'g');
      g.innerHTML = `<ellipse rx="${20 - i * 3}" ry="${8 - i}" fill="#0b2a44" opacity=".4"/><path d="M${-18 + i * 3} 0 l-12 -7 v14 z" fill="#0b2a44" opacity=".4"/>`;
      schoolG.appendChild(g);
      return { g, ph: Math.random() * 6, dy: (i - 1) * 10 };
    });
    const chumG = document.createElementNS(NS, 'g');
    schoolG.appendChild(chumG);

    const s = {
      phase: 'look', sub: '', t: 0, first: true,
      bx: TIP.x, by: TIP.y, landX: 500, fu: 0, q: 0, taut: true,
      dip: 0, dipCur: 0, bend: 0, bendCur: 0, shakeUntil: 0, hold: false,
      bite: 'idle', round: 0, sinkT: 0, nice: false, biteX: null,
      interest: 0, need: 3, idleT: 0, hinted: {},
      count: 0, lastTwitch: -9, chum: 5, cloudT: -9, hole: 0, lastChon: -9, chons: 0, snagFails: 0,
      dist: 100, struggling: false, nextSwitch: 0, strugCount: 0, tension: 0, holding: false, breakT: 0, warnT: 0, baraDone: false,
      catch: null, ui: null,
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
    const chumBurst = (x, y) => {
      for (let i = 0; i < 10; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x); c.setAttribute('cy', y);
        c.setAttribute('r', 2 + Math.random() * 2.5);
        c.setAttribute('class', 'chum');
        c.style.setProperty('--dx', ((Math.random() - 0.5) * 70) + 'px');
        c.style.setProperty('--dy', ((Math.random() - 0.3) * 40) + 'px');
        chumG.appendChild(c);
        setTimeout(() => c.remove(), 2600);
      }
    };
    const cuePos = () => (useBobber ? { x: s.bx, y: WATER - 45 } : { x: TIP.x + 40, y: TIP.y - 25 });
    const hintOnce = (key, text, mood = 'think') => {
      if (s.hinted[key]) return;
      s.hinted[key] = true;
      App.say(text, mood);
    };

    // おしている あいだ だけ うごく ボタン
    const holdCtl = (label, cls = 'big') => {
      const b = App.btn(label, { cls: cls + ' hold-ctl' });
      const set = v => e => {
        s.hold = v;
        b.classList.toggle('holding', v);
        if (v) { try { b.setPointerCapture(e.pointerId); } catch (err) {} }
      };
      b.addEventListener('pointerdown', set(true));
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, set(false)));
      s.hold = false;
      return b;
    };

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
        endY = MODE === 'sabiki' ? s.by - 24 : s.by;
      }
      let sag = useBobber ? 45 : (s.taut ? 8 : 45);
      if (s.phase === 'flying') sag = 0;
      if (s.phase === 'reel') sag = s.tension > 60 ? -4 : 10;
      const cx = (TIP.x + s.bx) / 2;
      const cy = Math.max(TIP.y, Math.min(endY, WATER)) + sag;
      line.setAttribute('d', s.phase === 'broken' ? '' : `M${TIP.x.toFixed(1)} ${TIP.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${s.bx.toFixed(1)} ${endY.toFixed(1)}`);
      line.classList.toggle('taut', s.phase === 'reel' && s.tension > 70);

      // むれ
      const hidden = s.phase === 'reel' || s.phase === 'landed';
      school.forEach((f, i) => {
        const cxs = MODE === 'sabiki' ? PIER + 90 : spotX;
        let x = cxs + Math.sin(s.t * 0.6 + f.ph) * (MODE === 'sabiki' ? 50 : 70);
        let y = tana + f.dy + Math.sin(s.t * 1.3 + f.ph) * 5;
        const dir = Math.cos(s.t * 0.6 + f.ph) >= 0 ? 1 : -1;
        if (i === 0 && s.biteX !== null) { x = s.biteX + 6; y = useBobber ? WATER + 40 : s.by; }
        f.g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${dir},1)`);
        f.g.setAttribute('opacity', hidden ? '0' : '1');
      });
      if (!isDrop && Math.random() < 0.04) {
        const b = document.createElementNS(NS, 'circle');
        b.setAttribute('cx', spotX + (Math.random() - 0.5) * 60); b.setAttribute('cy', WATER + 2);
        b.setAttribute('r', 2 + Math.random() * 3); b.setAttribute('class', 'bubble');
        bubbles.appendChild(b);
        setTimeout(() => b.remove(), 1500);
      }

      // ふかさ メーター（ルアー・サビキ）
      if (!gauge.hidden) {
        const range = BOTTOM - WATER;
        gauge.querySelector('.dg-fish').style.top = ((tana - WATER) / range * 100) + '%';
        const hook = gauge.querySelector('.dg-hook');
        hook.style.top = (Math.max(0, Math.min(1, (s.by - WATER) / range)) * 100) + '%';
        hook.textContent = `${depthM(s.by)}m`;
      }
    };

    /* ── うしろを みる ── */
    const look = () => {
      s.phase = 'look';
      App.setStep(2);
      if (isDrop) { dropReady(); return; }
      App.say('さおを なげる まえに…\nうしろに ひとが いないか みよう!');
      App.setControls(App.btn('👀 うしろを みる', {
        cls: 'big pulse',
        onClick: b => {
          b.disabled = true;
          kid.classList.add('look-back');
          App.after(500, () => floatText('だれも いない!', 110, 90, 'ok'));
          App.after(1400, () => { kid.classList.remove('look-back'); aimPhase(); });
        },
      }));
    };

    // もういちど なげる（おとす）
    const recast = msg => {
      s.round++;
      s.phase = 'look';
      s.sub = '';
      s.taut = true;
      s.bend = 0;
      s.biteX = null;
      shadow.setAttribute('opacity', '0');
      gauge.hidden = true;
      if (msg) App.say(msg);
      App.after(msg ? 1600 : 0, () => (isDrop ? dropReady() : aimPhase()));
    };

    /* ── ねらって なげる ── */
    const aimPhase = () => {
      s.phase = 'aim';
      App.setStep(2);
      App.say(s.first
        ? 'とりが とんでいて、あわが でている ところに さかなが いるよ!\nきいろい マークが ポイントに きたら なげよう!'
        : 'もういちど ポイントを ねらって なげよう!', 'wow');
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

    const dropReady = () => {
      s.phase = 'aim';
      App.setStep(2);
      const x = MODE === 'saguri' ? holes[s.hole].x : PIER + 60;
      App.say(MODE === 'sabiki'
        ? (s.first ? 'サビキづりは、あしもとに カゴを そっと おとすよ。' : 'エサを つめた カゴを、また そっと おとそう!')
        : 'さぐりづりは、あしもとの ブロックの すきま（あな）に しかけを おとすよ。');
      App.setControls(App.btn('⬇️ そっと おとす', {
        cls: 'big pulse',
        onClick: b => { b.disabled = true; cast(x); },
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
      let msg = '';
      if (!isDrop) {
        if (s.q > 0.75) { msg = 'どんぴしゃ! '; floatText('どんぴしゃ!', s.bx, WATER - 50, 'big'); Sfx.good(); }
        else if (s.q > 0.35) msg = 'おしい! ポイントの ちかくだよ。';
        else msg = 'ポイントから すこし はなれちゃった。';
      }
      const start = { uki: startUki, choinage: startChoi, lure: startLure, sabiki: startSabiki, saguri: startSaguri }[MODE];
      start(msg);
      s.first = false;
    };

    /* ── アタリ（どの つりかたも おなじ） ── */
    const biteSeq = onMiss => {
      s.phase = 'bite';
      s.bite = 'idle';
      s.hold = false;
      App.setStep(3);
      const r = ++s.round;
      const hookBtn = App.btn('✊ あわせる!', { cls: 'big hook-btn', onClick: () => onHook(hookBtn) });
      App.setControls(hookBtn);
      s.biteX = s.bx;
      let tt = 300 + Math.random() * 500;
      const n = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) {
        App.after(tt, () => { if (s.round === r) nibble(); });
        tt += 800 + Math.random() * 700;
      }
      App.after(tt, () => { if (s.round === r) sink(r, hookBtn, onMiss); });
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

    const sink = (r, hookBtn, onMiss) => {
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
      // あわせる じかんは みじかめ（#9）
      App.after(2200, () => {
        if (s.round !== r || s.phase !== 'bite') return;
        s.bite = 'gone';
        s.dip = 0;
        s.bend = 0;
        s.biteX = null;
        hookBtn.classList.remove('now');
        hookBtn.disabled = true;
        Sfx.oops();
        App.say(`あ〜、にげちゃった。\nアタリが きたら すぐ あわせよう!`, 'think');
        App.after(1600, () => { if (s.round === r) onMiss(); });
      });
    };

    const onHook = hookBtn => {
      if (s.bite === 'sink' && s.phase === 'bite') {
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

    /* ── ねがかり・いとが きれる・バレる ── */
    const snag = resume => {
      s.phase = 'snag';
      s.snagFails = 0;
      s.bend = 0.28;
      s.hold = false;
      Sfx.strain();
      floatText('ねがかり!', s.bx, s.by - 30, 'big');
      App.say('ねがかり! そこの いわに ひっかかっちゃった。\nむりに ひっぱらず、さおを あおって はずそう!', 'think');
      App.setControls(App.btn('💪 さおを あおる', {
        cls: 'big',
        onClick: () => {
          if (s.phase !== 'snag') return;
          s.shakeUntil = s.t + 0.4;
          if (Math.random() < 0.45) {
            s.bend = 0;
            s.phase = 'mode';
            Sfx.good();
            App.say('はずれた! よかった。', 'wow');
            App.after(800, resume);
          } else if (++s.snagFails >= 3) {
            lineBreak('snag');
          } else {
            Sfx.strain();
            App.say('まだ はずれない… もういちど あおってみよう!', 'think');
          }
        },
      }));
    };

    const lineBreak = why => {
      s.round++;
      s.phase = 'broken';
      s.bend = 0;
      s.hold = false;
      Sfx.strain();
      Sfx.oops();
      floatText('ぷつん!', TIP.x + 60, TIP.y, 'big');
      shadow.setAttribute('opacity', '0');
      weight.setAttribute('opacity', '0');
      bob.style.display = 'none';
      gauge.hidden = true;
      App.say(why === 'fight'
        ? 'ぷつん! いとが きれちゃった…\nいとが あかい ときに まきつづけると きれるよ。あばれたら てを はなそうね。'
        : 'ぷつん! しかけが とれなくて、いとが きれちゃった…\nしかけを むすびなおそう。', 'think');
      App.setControls(App.btn('🪢 しかけを むすびなおす', { cls: 'big pulse', onClick: () => App.go('prep', { task: 'knot' }) }));
    };

    const barashi = () => {
      s.round++;
      s.phase = 'bara';
      s.hold = false;
      Sfx.oops();
      shadow.setAttribute('opacity', '0');
      floatText('バレた…', s.bx, WATER - 60, 'big');
      splash(s.bx, WATER);
      App.setControls();
      App.say('あっ! はりが はずれて にげちゃった（バレた）…\nすぐに あわせると がっちり かかって バレにくいよ。', 'think');
      App.after(2600, () => recast());
    };

    /* ═════ つりかたごとの あそびかた ═════ */

    /* ウキづり */
    const startUki = msg => {
      s.phase = 'mode';
      App.setStep(3);
      s.biteX = null;
      const r = ++s.round;
      const hookBtn = App.btn('✊ あわせる!', { cls: 'big hook-btn', onClick: () => onHook(hookBtn) });
      App.setControls(hookBtn);
      if (msg !== undefined) App.say(msg + '\nウキが ぐーっと しずんだら すぐ「あわせる!」', 'wow');
      const wait = ((msg !== undefined ? 4500 : 2500) + Math.random() * 2000) * (1.4 - 0.8 * s.q);
      App.after(wait, () => { if (s.round === r) biteSeq(() => startUki()); });
    };

    /* ちょいなげ */
    const startChoi = msg => {
      s.phase = 'mode';
      s.sub = 'sink';
      s.taut = false;
      App.setStep(3);
      App.setControls();
      App.say((msg || '') + '\nおもりが しずんでいくよ… そこに つくまで まってね。', 'wow');
    };
    const choiDrag = () => {
      s.phase = 'mode';
      s.sub = 'drag';
      s.interest = 0;
      s.need = (2.2 + Math.random() * 2.5) * (1.4 - 0.6 * s.q);
      App.setControls(holdCtl('🐢 ゆっくり ひく（サビく）'));
    };
    const updateChoi = dt => {
      if (s.sub === 'sink') {
        s.by = Math.min(BOTTOM, s.by + 90 * dt);
        if (s.by >= BOTTOM) {
          s.sub = 'slack';
          floatText('とん', s.bx, BOTTOM - 25, 'small');
          App.say('そこに ついたよ! いとが たるんでいるね。\nすこし まいて、いとを ピンと はろう。');
          App.setControls(App.btn('🔄 いとふけを とる', {
            cls: 'big pulse',
            onClick: () => {
              s.taut = true;
              Sfx.reel();
              App.say('いとが ピンと はったね。\nボタンを おしている あいだ、ゆっくり ひいて すなの そこを さぐろう。ときどき とまって まつのも だいじ!', 'wow');
              choiDrag();
            },
          }));
        }
      } else if (s.sub === 'drag') {
        if (s.hold) {
          s.bx -= 16 * dt;
          s.interest += dt;
          s.idleT = 0;
          s.bend = 0.05;
          if (rocks.some(x => Math.abs(s.bx - x) < 16)) {
            snag(() => { s.bx -= 34; App.say('ゆっくり ひいて さそおう。'); choiDrag(); });
            return;
          }
        } else {
          s.interest += 0.3 * dt;
          s.idleT += dt;
          s.bend = 0;
          if (s.idleT > 6) hintOnce('choiIdle', 'ときどき ゆっくり ひいて、さかなを さそおう!');
        }
        if (s.interest >= s.need) { biteSeq(() => { App.say('また ゆっくり ひいて さそおう。'); choiDrag(); }); return; }
        if (s.bx <= PIER + 70) recast('しかけが てまえまで もどってきたよ。もういちど なげよう!');
      }
    };

    /* ルアー */
    const startLure = msg => {
      s.phase = 'mode';
      s.sub = 'fall';
      s.count = 0;
      s.hinted.lureNear = false;
      App.setStep(3);
      gauge.hidden = false;
      App.say((msg || '') + `\nルアーが しずんでいくよ。いっしょに かぞえよう!\nさかなは ${depthM(tana)}mくらいの ふかさに いるよ。そこまで しずんだら「まきはじめる」!`, 'wow');
      App.setControls(App.btn('🔄 まきはじめる', { cls: 'big pulse', onClick: () => lureRetrieve() }));
    };
    const lureRetrieve = () => {
      if (s.phase !== 'mode') return;
      s.sub = 'retrieve';
      s.taut = true;
      App.say('ボタンを おしている あいだ まくよ。「しゃくる」で ルアーを ピョンと うごかして さそおう!');
      App.setControls(holdCtl('🔄 まく'), App.btn('⤴️ しゃくる', {
        cls: 'big blue',
        onClick: () => {
          if (s.phase !== 'mode' || s.sub !== 'retrieve') return;
          s.by = Math.max(WATER + 10, s.by - 26);
          s.lastTwitch = s.t;
          s.shakeUntil = s.t + 0.25;
          Sfx.tone(900, 0.06, 'triangle', 0.12);
          floatText('キラッ', s.bx, s.by - 14, 'small');
        },
      }));
    };
    const updateLure = dt => {
      const near = Math.abs(s.by - tana) < 32 && Math.abs(s.bx - spotX) < 130;
      if (s.sub === 'fall') {
        s.taut = false;
        s.by = Math.min(BOTTOM, s.by + 40 * dt);
        const c = depthM(s.by);
        if (c > s.count) { s.count = c; floatText(String(c), s.bx + 22, s.by, 'small'); Sfx.tone(600 + c * 60, 0.06, 'sine', 0.1); }
        if (s.by >= BOTTOM) {
          if (Math.random() < 0.5) { snag(() => { s.by -= 40; lureRetrieve(); }); return; }
          hintOnce('lureBottom', 'そこに ついちゃった! ねがかり しないうちに まこう!');
          lureRetrieve();
        }
      } else if (s.sub === 'retrieve') {
        if (s.hold) {
          s.bx -= 42 * dt;
          s.by = Math.max(WATER + 12, s.by - 6 * dt);
          s.bend = 0.05;
          if (Math.random() < dt * 6) Sfx.reel();
        } else {
          s.by = Math.min(BOTTOM, s.by + 24 * dt);
          s.bend = 0;
          if (s.by >= BOTTOM && Math.random() < dt * 0.5) { snag(() => { s.by -= 40; lureRetrieve(); }); return; }
        }
        const moving = s.hold || s.t - s.lastTwitch < 1.2;
        if (near && moving) {
          const chance = (0.35 + (s.t - s.lastTwitch < 1.5 ? 0.7 : 0)) * (0.6 + 0.6 * s.q);
          if (Math.random() < chance * dt) { biteSeq(() => { App.say('また まいて さそおう!'); lureRetrieve(); }); return; }
        } else if (near && !moving) {
          hintOnce('lureNear', 'むれの ちかくだよ! まいたり しゃくったりして うごかそう!', 'wow');
        } else if (!near && Math.abs(s.bx - spotX) < 130) {
          hintOnce('lureDepth', s.by < tana ? 'むれは もっと ふかいよ。てを はなすと ルアーが しずむよ。' : 'むれは もっと あさいよ。しゃくって ルアーを うかせよう。');
        }
        if (s.bx <= PIER + 60) recast('ルアーが もどってきたよ。かいしゅうして もういちど なげよう!');
      }
    };

    /* サビキ */
    const startSabiki = () => {
      s.phase = 'mode';
      s.sub = 'fall';
      s.taut = false;
      App.setStep(3);
      gauge.hidden = false;
      App.say(`カゴが しずんでいくよ。\nむれが いる ふかさ（たな）は ${depthM(tana)}mくらい。そこで「とめる」!`, 'wow');
      App.setControls(App.btn('✋ ここで とめる', { cls: 'big pulse', onClick: () => sabikiStop() }));
    };
    const sabikiStop = () => {
      if (s.phase !== 'mode' || s.sub !== 'fall') return;
      s.sub = 'shake';
      s.taut = true;
      s.restY = s.by;
      const diff = s.by - tana;
      App.say(Math.abs(diff) < 28 ? 'ばっちり! たなに あわせたね。\n「しゃくる」で カゴから エサを だして、さかなを あつめよう!'
        : diff < 0 ? 'むれは もっと ふかいよ。「さげる」で あわせよう。' : 'むれは もっと あさいよ。「あげる」で あわせよう。', Math.abs(diff) < 28 ? 'wow' : 'think');
      sabikiControls();
    };
    const sabikiControls = () => {
      App.setControls(
        App.btn('⬆️ あげる', { cls: 'gray', onClick: () => { if (s.sub === 'shake') s.restY = Math.max(WATER + 15, s.restY - 18); } }),
        App.btn(`〽️ しゃくる <small>のこり ${s.chum}</small>`, { cls: 'big', onClick: sabikiShake }),
        App.btn('⬇️ さげる', { cls: 'gray', onClick: () => { if (s.sub === 'shake') s.restY = Math.min(BOTTOM - 10, s.restY + 18); } }),
      );
    };
    const sabikiShake = () => {
      if (s.phase !== 'mode' || s.sub !== 'shake' || s.chum <= 0) return;
      s.chum--;
      s.by = s.restY - 16;
      s.shakeUntil = s.t + 0.3;
      chumBurst(s.bx, s.restY);
      Sfx.tone(500, 0.1, 'triangle', 0.12);
      sabikiControls();
      const near = Math.abs(s.restY - tana) < 30;
      const r = s.round;
      if (near && Math.random() < 0.45 + 0.1 * (5 - s.chum)) {
        App.after(600 + Math.random() * 900, () => { if (s.round === r && s.phase === 'mode') biteSeq(sabikiResume); });
        return;
      }
      if (!near) hintOnce('sabikiTana', 'エサが むれと ちがう ふかさで でているよ。たなを あわせよう!');
      if (s.chum <= 0) {
        App.after(1400, () => {
          if (s.round !== r || s.phase !== 'mode') return;
          s.sub = 'empty';
          App.say('カゴの エサが なくなった!\nすぐ まきあげて、エサを つめなおそう。', 'think');
          App.setControls(holdCtl('🔄 まきあげる'));
        });
      }
    };
    const sabikiResume = () => {
      s.phase = 'mode';
      if (s.chum > 0) { s.sub = 'shake'; App.say('また しゃくって さそおう!'); sabikiControls(); }
      else { s.sub = 'empty'; App.say('カゴの エサが なくなった! まきあげて つめなおそう。', 'think'); App.setControls(holdCtl('🔄 まきあげる')); }
    };
    const updateSabiki = dt => {
      if (s.sub === 'fall') {
        s.by = Math.min(BOTTOM - 10, s.by + 50 * dt);
        if (s.by >= BOTTOM - 10) { App.say('そこまで おちちゃった。', 'think'); sabikiStop(); }
      } else if (s.sub === 'shake') {
        s.by += (s.restY - s.by) * Math.min(1, dt * 6);
      } else if (s.sub === 'empty') {
        if (s.hold) {
          s.by -= 80 * dt;
          if (Math.random() < dt * 6) Sfx.reel();
          if (s.by <= WATER - 4) {
            s.sub = 'refill';
            s.hold = false;
            App.say('あがってきた! コマセカゴに アミエビを つめよう。');
            App.setControls(App.btn('🥄 エサを つめる', {
              cls: 'big pulse',
              onClick: () => {
                s.chum = 5;
                Sfx.pop();
                gauge.hidden = true;
                s.phase = 'look';
                s.bx = TIP.x; s.by = TIP.y + 30;
                dropReady();
              },
            }));
          }
        }
      } else if (s.sub === 'refill') {
        s.by += (TIP.y + 30 - s.by) * Math.min(1, dt * 4);
      }
    };

    /* さぐりづり */
    const startSaguri = () => {
      s.phase = 'mode';
      s.sub = 'fall';
      s.taut = false;
      s.interest = 0;
      s.chons = 0;
      s.need = 2 + Math.floor(Math.random() * 2);
      App.setStep(3);
      App.setControls();
      App.say(`${s.hole + 1}ばんめの あなに おとしたよ。そこまで しずむのを まとう。`);
    };
    const saguriControls = () => {
      App.setControls(
        App.btn('〽️ ちょんちょん', { cls: 'big', onClick: saguriChon }),
        App.btn('➡️ となりの あなへ', { cls: 'blue', onClick: saguriNext }),
      );
    };
    const saguriChon = () => {
      if (s.phase !== 'mode' || s.sub !== 'search') return;
      const gap = s.t - s.lastChon;
      s.lastChon = s.t;
      s.by = BOTTOM - 30;
      s.shakeUntil = s.t + 0.2;
      s.chons++;
      Sfx.tone(700, 0.05, 'triangle', 0.1);
      const hole = holes[s.hole];
      if (gap < 0.7) {
        s.interest = Math.max(0, s.interest - 1);
        if (s.chons > 1) App.say('はやすぎ! さかなが びっくりしちゃう。\nゆっくり「ちょん… ちょん…」だよ。', 'think');
        return;
      }
      if (hole.fish) {
        s.interest++;
        if (s.interest >= s.need) {
          const r = s.round;
          App.after(400 + Math.random() * 600, () => { if (s.round === r && s.phase === 'mode') biteSeq(() => { s.phase = 'mode'; s.sub = 'search'; s.interest = 0; App.say('また ゆっくり ちょんちょん。'); saguriControls(); }); });
        }
      } else if (s.chons >= 4) {
        hintOnce('hole' + s.hole, 'この あなには いないみたい。\nとなりの あなを さぐってみよう!');
      }
    };
    const saguriNext = () => {
      if (s.phase !== 'mode') return;
      s.hole = (s.hole + 1) % holes.length;
      s.bx = holes[s.hole].x;
      s.by = WATER + 10;
      Sfx.pop();
      startSaguri();
    };
    const updateSaguri = dt => {
      if (s.sub === 'fall') {
        s.by = Math.min(BOTTOM - 14, s.by + 80 * dt);
        if (s.by >= BOTTOM - 14) {
          s.sub = 'search';
          s.taut = true;
          floatText('とん', s.bx, BOTTOM - 40, 'small');
          App.say('あなの そこに ついたよ!\n「ちょんちょん」で、ゆっくり しかけを うごかして さそおう。');
          saguriControls();
        }
      } else if (s.sub === 'search') {
        s.by += (BOTTOM - 14 - s.by) * Math.min(1, dt * 5);
      }
    };

    /* ═════ かかった! まく（かけひき） ═════ */
    const decideCatch = () => {
      if (Save.total() > 0 && Math.random() < 0.1) {
        return { junk: JUNK[Math.floor(Math.random() * JUNK.length)] };
      }
      const fish = pickFish();
      const [lo, hi] = fish.size;
      const bonus = s.q * 0.15 + (s.nice ? 0.12 : 0);
      const raw = lo + (hi - lo) * Math.pow(Math.random(), 1.4);
      const size = Math.min(hi, Math.round(raw * (1 + bonus)));
      // サビキは いっぺんに なんびきも かかることが ある
      const multi = MODE === 'sabiki' ? 1 + (Math.random() < 0.4 ? 1 : 0) + (Math.random() < 0.15 ? 1 : 0) : 1;
      return { fish, size, multi };
    };

    const hooked = () => {
      s.nice = s.t - s.sinkT < 0.9;
      s.round++;
      s.phase = 'reel';
      s.biteX = null;
      s.hold = false;
      App.setStep(4);
      s.catch = decideCatch();
      s.dist = 100;
      s.tension = 0;
      s.breakT = 0;
      s.baraDone = false;
      s.struggling = false;
      s.strugCount = 0;
      s.nextSwitch = s.t + 2.2;
      s.reelStart = s.bx;
      s.reelDepth = s.by;
      gauge.hidden = true;
      const f = s.catch.fish;
      const sz = (s.catch.size || 20) * (s.catch.multi || 1) ** 0.5;
      s.power = f ? 0.8 + sz / (sz + 30) + (f.rare ? 0.3 : 0) : 1.3;
      shadow.setAttribute('opacity', '1');
      const sc = f ? 0.6 + sz / 50 : 0.9;
      shadowInner.setAttribute('transform', `scale(-${sc},${sc})`);
      Sfx.good();
      floatText(s.nice ? 'ナイス あわせ!' : 'かかった!', s.bx, WATER - 60, 'big');
      splash(s.bx);
      App.say((s.nice ? 'ナイス あわせ!\n' : 'かかった!\n')
        + '「まく」を おしている あいだ いとが まけるよ。\nいとが あかく なったり、さかなが あばれたら、てを はなしてね! きれちゃうよ!', 'wow');

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
        // ときどき はりが はずれる（#9）。あわせが おそいと バレやすい
        if (!s.baraDone && s.strugCount >= 2) {
          s.baraDone = true;
          if (Math.random() < (s.nice ? 0.08 : 0.2)) { App.after(500, () => { if (s.phase === 'reel') barashi(); }); return; }
        }
        if (s.catch.fish && s.dist < 85 && Math.random() < 0.55) jump();
      } else {
        s.nextSwitch = s.t + 2.2 + Math.random() * 1.3;
        if (s.strugCount <= 2) App.say('おとなしく なったよ。いまだ! おして まこう!');
      }
    };

    // さかなが みずから とびだす
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
      if (s.phase !== 'reel') return;
      if (s.holding) {
        if (s.struggling) s.dist += 4 * dt;
        else s.dist -= (16 / Math.sqrt(s.power)) * dt;
        s.tension += (s.struggling ? 90 : 20 + 8 * s.power) * dt;
        if (Math.random() < dt * 8) Sfx.reel();
      } else {
        s.tension -= 55 * dt;
        if (s.struggling) s.dist += 2 * dt;
      }
      s.tension = Math.min(100, Math.max(0, s.tension));
      s.dist = Math.min(100, s.dist);

      // いとが あかい まま まきつづけると きれる（#9）
      if (s.tension >= 100 && s.holding) {
        s.breakT += dt;
        if (s.breakT > 0.9) { lineBreak('fight'); return; }
      } else {
        s.breakT = Math.max(0, s.breakT - dt);
      }
      if (s.tension > 85 && s.holding && s.t - s.warnT > 2) {
        s.warnT = s.t;
        Sfx.strain();
        s.ui.bar.classList.remove('flash'); void s.ui.bar.offsetWidth; s.ui.bar.classList.add('flash');
        floatText('きれそう!', s.bx, WATER - 60, 'small');
      }
      s.bend = 0.1 + s.tension / 400 + (s.struggling ? 0.08 : 0);

      const danger = s.tension > 70;
      s.ui.fill.style.width = s.tension + '%';
      s.ui.fill.classList.toggle('danger', danger);
      s.ui.dfish.style.left = (s.dist * 0.88) + '%';
      let msg, cls;
      if (s.tension > 85 && s.holding) { msg = 'きれちゃう! てを はなして!'; cls = 'fight'; }
      else if (s.struggling) { msg = 'あばれてる! てを はなして!'; cls = 'fight'; }
      else if (danger && s.holding) { msg = 'いとが ピンピン! てを はなそう'; cls = 'fight'; }
      else { msg = s.holding ? 'いいぞ! まいてる!' : 'おして まこう!'; cls = 'calm'; }
      if (s.ui.status.textContent !== msg) { s.ui.status.textContent = msg; s.ui.status.className = 'reel-status ' + cls; }

      const wig = s.struggling ? Math.sin(s.t * 22) * 8 : Math.sin(s.t * 4) * 2;
      const k = Math.max(0, s.dist) / 100;
      const fxX = PIER + 25 + (s.reelStart - PIER - 25) * k;
      const fy = WATER + 30 + (Math.max(WATER + 30, s.reelDepth) - WATER - 30) * k + (s.struggling ? 6 : 0);
      shadow.setAttribute('transform', `translate(${(fxX + wig).toFixed(1)},${fy.toFixed(1)}) rotate(${wig})`);
      s.bx = fxX + wig * 0.5;
      s.by = useBobber ? WATER + 8 + (s.struggling ? 10 : 0) : fy - 4;
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
        weight.setAttribute('opacity', useBobber ? '0' : '1');
      } else if (s.phase === 'flying') {
        s.fu = Math.min(1, s.fu + dt / (isDrop ? 0.6 : 0.9));
        const u = s.fu;
        s.bx = s.startX + (s.landX - s.startX) * u;
        s.by = s.startY + (WATER - s.startY) * u - Math.sin(Math.PI * u) * (isDrop ? 30 : 130);
        if (u >= 1) landed();
      } else if (s.phase === 'mode' || s.phase === 'bite') {
        if (useBobber) {
          s.dipCur += (s.dip - s.dipCur) * Math.min(1, dt * 14);
          s.by = WATER + Math.sin(s.t * 2.2) * 2.5 + s.dipCur;
        } else if (s.phase === 'mode') {
          ({ choinage: updateChoi, lure: updateLure, sabiki: updateSabiki, saguri: updateSaguri }[MODE])(dt);
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
  enter({ fish, size, junk, multi = 1 }) {
    if (junk) return caughtJunk(junk);

    const isNew = !Save.data.caught[fish.id];
    const prevBest = (Save.data.best || {})[fish.id] || 0;
    const isBest = !isNew && size > prevBest;
    for (let i = 0; i < multi; i++) Save.addFish(fish.id);
    Save.data.best = Save.data.best || {};
    if (size > prevBest) Save.data.best[fish.id] = size;
    Save.write();
    Today.fish += multi;
    const first = Save.total() === multi;

    App.stage.classList.add('stage-caught');
    const wrap = h(`
      <div class="caught">
        <div class="rays"></div>
        ${isNew ? '<div class="badge-new">はじめて!</div>' : ''}
        ${isBest ? '<div class="badge-new best">じこベスト!</div>' : ''}
        ${fish.rare ? '<div class="badge-rare">レア!</div>' : ''}
        ${multi > 1 ? `<div class="badge-multi">${multi}ひき いっぺんに!</div>` : ''}
        <div class="caught-fish">${Art.fish(fish)}</div>
        <div class="caught-name">${fish.name} <span class="caught-size">📏 ${size}センチ</span></div>
        <div class="caught-fact">${fish.fact}</div>
      </div>`);
    App.stage.appendChild(wrap);
    confetti(App.stage, 60);
    Sfx.fanfare();
    App.say(`やったね! ${multi > 1 ? `${fish.name}が ${multi}ひき いっぺんに つれたよ! いちばん おおきいのは ${size}センチ!` : `${size}センチの ${fish.name}が つれたよ!`}${isBest ? '\nじこベスト こうしん!' : ''}\n${fish.fact}`, 'wow');

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

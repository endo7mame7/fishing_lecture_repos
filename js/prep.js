/* つりばでの じゅんび ミニゲーム
   さお・しかけ・みずくみの どれか 1つ（ランダム）→ エサ（つりかたで かわる）
   - さお: のばす・ガイドを そろえる・いとを とおす・いとを だす
   - しかけ: クリンチノットで スナップサルカンに むすぶ
   - みずくみ: ロープつき バケツ
*/

const PREP_TASKS = [
  { id: 'rod', name: 'さお', icon: '🎣', run: prepRod },
  { id: 'knot', name: 'しかけ', icon: '🪢', run: prepKnot },
  { id: 'water', name: 'みずくみ', icon: '🪣', run: prepWater },
  { id: 'bait', name: 'エサ', icon: '🪱', run: prepBait },
];

/* opts.only: その じゅんびだけ やる（もういちど つる ときは エサだけ） */
Scenes.prep = {
  step: 1,
  enter(opts) {
    if (!Loadout.ready()) { App.go('shop'); return; }
    // さお・しかけ・みずくみから ランダムで 1つ ＋ エサつけ（#5）
    let list;
    if (opts.only) list = PREP_TASKS.filter(t => t.id === opts.only);
    else {
      const pool = PREP_TASKS.filter(t => t.id !== 'bait');
      const pick = opts.task ? pool.find(t => t.id === opts.task) : pool[Math.floor(Math.random() * pool.length)];
      list = [pick, PREP_TASKS.find(t => t.id === 'bait')];
    }
    let i = 0;

    const next = () => {
      if (i < list.length - 1) { i++; start(); } else App.go('fishing');
    };

    const start = () => {
      App.stopAll();
      const task = list[i];
      const wrap = h(`
        <div class="prep">
          <div class="shop-tabs">
            ${list.map((t, j) => `<span class="tab ${j === i ? 'now' : ''} ${j < i ? 'done' : ''}">${t.icon} ${t.name}</span>`).join('')}
          </div>
          <div class="prep-area"></div>
        </div>`);
      App.stage.replaceChildren(wrap);
      const area = wrap.querySelector('.prep-area');

      // まえに クリアした じゅんびは とばせる
      const skip = Save.data.prepDone && Save.data.prepDone[task.id]
        ? App.btn('とばす ⏭', { cls: 'gray', onClick: next })
        : null;
      const ui = {
        controls: (...nodes) => App.setControls(...nodes, ...(skip ? [skip] : [])),
        done: msg => {
          Save.data.prepDone = Save.data.prepDone || {};
          Save.data.prepDone[task.id] = true;
          Save.write();
          Sfx.fanfare();
          confetti(App.stage);
          App.say(msg, 'wow');
          // じどうで つぎの じゅんび（さいごは つり）へ
          App.setControls();
          App.after(2600, next);
        },
      };
      ui.controls();
      task.run(area, ui);
    };

    start();
  },
};

/* ───────── きょうつうの しかけ ───────── */

// ゆびで うごかして ターゲットに くっつける（タップだけでも じどうで いく）
function makeDrag(el, target, onSuccess, onMiss) {
  let pos = { x: 0, y: 0 }, drag = null, done = false;
  const center = e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const moveTo = (x, y, smooth) => {
    pos = { x, y };
    el.style.transition = smooth ? 'transform .45s ease' : 'none';
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  el.style.touchAction = 'none';
  el.classList.add('draggable');
  el.addEventListener('pointerdown', e => {
    if (done) return;
    el.setPointerCapture(e.pointerId);
    drag = { sx: e.clientX - pos.x, sy: e.clientY - pos.y, ox: pos.x, oy: pos.y, moved: 0 };
    el.classList.add('dragging');
    Sfx.pop();
  });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    const x = e.clientX - drag.sx, y = e.clientY - drag.sy;
    drag.moved = Math.max(drag.moved, Math.hypot(x - drag.ox, y - drag.oy));
    moveTo(x, y, false);
  });
  const end = () => {
    if (!drag) return;
    const moved = drag.moved;
    drag = null;
    el.classList.remove('dragging');
    const a = center(el), t = center(target);
    if (Math.hypot(a.x - t.x, a.y - t.y) < 100 || moved < 12) {
      done = true;
      el.classList.remove('draggable');
      const box = target.closest && target.closest('.hook-box');
      if (box) box.classList.add('baited');
      moveTo(pos.x + t.x - a.x, pos.y + t.y - a.y, true);
      App.after(480, onSuccess);
    } else {
      moveTo(0, 0, true);
      if (onMiss) onMiss();
    }
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

// おしている あいだ すすむ ボタン
function holdBtn(label, { speed = 0.4, canHold = () => true, onBlocked, onProgress, onDone }) {
  const b = App.btn(`<span class="hold-fill"></span><span class="hold-lbl">${label}</span>`, { cls: 'big hold-btn' });
  const fill = b.querySelector('.hold-fill');
  let holding = false, p = 0, finished = false;
  b.addEventListener('pointerdown', e => {
    if (finished) return;
    if (!canHold()) { if (onBlocked) onBlocked(); return; }
    holding = true;
    try { b.setPointerCapture(e.pointerId); } catch (err) {}
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, () => { holding = false; }));
  App.loop(dt => {
    if (!holding || finished) return;
    p = Math.min(1, p + dt * speed);
    fill.style.width = (p * 100) + '%';
    if (onProgress) onProgress(p);
    if (p >= 1) { finished = true; holding = false; onDone(); return false; }
  });
  return b;
}

// SVG の ひかる タップ ばしょ
function tapSpot(svg, x, y, r, onTap) {
  const NS = 'http://www.w3.org/2000/svg';
  const c = document.createElementNS(NS, 'circle');
  c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', r);
  c.setAttribute('class', 'tap-spot');
  c.addEventListener('click', () => onTap(c));
  svg.appendChild(c);
  return c;
}

/* ───────── 1. さおの じゅんび ───────── */
function prepRod(area, ui) {
  const Y = 120;
  const SEG = [[40, 220, 14], [220, 360, 11], [360, 500, 9], [500, 630, 7], [630, 760, 5]];
  const GX = [196, 340, 480, 610, 752];
  const GR = [12, 10, 8, 7, 6];
  const ringPos = k => ({ x: GX[k], y: Y + SEG[k][2] / 2 + 16 + GR[k] * 1.6 + GR[k] });
  const SPOOL = { x: 160, y: 196 };
  const st = { phase: 'extend', ext: 0, ang: [0, 0, 0, 0, 0], threaded: 0, bail: 'closed', out: 0 };

  area.innerHTML = `
    <svg viewBox="0 0 800 300" class="prep-svg">
      <g id="segs"></g>
      <path id="pline" fill="none" stroke="#2e9e5b" stroke-width="2.5"/>
      <g id="guides"></g>
      <g id="reel">
        <path d="M130 ${Y + 7} V170" stroke="#555" stroke-width="6"/>
        <circle cx="130" cy="214" r="26" fill="#4a4f57"/>
        <ellipse cx="130" cy="188" rx="30" ry="9" fill="#7fd88a" stroke="#3b7d4a" stroke-width="2"/>
        <path d="M172 214 h22" stroke="#333" stroke-width="5" stroke-linecap="round"/><circle cx="198" cy="214" r="6" fill="#333"/>
        <path id="bail" d="M100 188 Q130 160 160 188" stroke="#c0c6cc" stroke-width="5" fill="none" stroke-linecap="round"/>
        <text x="130" y="268" text-anchor="middle" class="svg-lbl">リール</text>
      </g>
      <g id="spots"></g>
    </svg>`;
  const svg = area.querySelector('svg');
  const segs = svg.querySelector('#segs'), guidesG = svg.querySelector('#guides');
  const pline = svg.querySelector('#pline'), bail = svg.querySelector('#bail');
  const spots = svg.querySelector('#spots');
  const NS = 'http://www.w3.org/2000/svg';

  // ガイド（あとで まわすので さきに つくる）
  const guides = GX.map((x, k) => {
    const g = document.createElementNS(NS, 'g');
    const top = Y + SEG[k][2] / 2;
    const stem = 16 + GR[k] * 1.6;
    g.innerHTML = `<path d="M${x} ${top} V${top + stem}" stroke="#8a949d" stroke-width="3"/>
      <circle cx="${x}" cy="${top + stem + GR[k]}" r="${GR[k]}" fill="none" stroke="#8a949d" stroke-width="3.5"/>`;
    g.style.transformBox = 'view-box';
    g.style.transformOrigin = `${x}px ${top}px`;
    g.style.transition = 'transform .45s ease';
    g.style.display = k === 0 ? '' : 'none';
    g.addEventListener('click', () => onGuide(k));
    guidesG.appendChild(g);
    return g;
  });

  const drawSegs = () => {
    segs.innerHTML = SEG.slice(0, st.ext + 1).map(([x0, x1, w], k) =>
      `<rect x="${x0}" y="${Y - w / 2}" width="${x1 - x0}" height="${w}" rx="${w / 2}" fill="${k === 0 ? '#3d3d46' : '#2f6fb0'}"/>`
    ).join('') + `<rect x="40" y="${Y - 9}" width="70" height="18" rx="9" fill="#c9a26b"/>`;
  };

  const drawLine = () => {
    if (st.threaded === 0) { pline.setAttribute('d', ''); return; }
    let d = `M${SPOOL.x} ${SPOOL.y}`;
    for (let k = 0; k < st.threaded; k++) { const p = ringPos(k); d += ` L${p.x} ${p.y}`; }
    if (st.threaded === 5) {
      const tip = ringPos(4);
      d += ` L${tip.x + 8} ${tip.y + 30 + st.out * 110}`;
    }
    pline.setAttribute('d', d);
  };

  const setGuideAngle = k => { guides[k].style.transform = `rotate(${st.ang[k]}deg)`; };

  /* ① のばす */
  const extendSpot = () => {
    spots.innerHTML = '';
    if (st.ext >= 4) return;
    const x = SEG[st.ext][1];
    tapSpot(spots, x, Y, 24, () => {
      st.ext++;
      const k = st.ext;
      st.ang[k] = [70, -110, 150, -65, 120][k] * (Math.random() < 0.5 ? 1 : -1);
      guides[k].style.display = '';
      setGuideAngle(k);
      Sfx.pop();
      drawSegs();
      if (st.ext < 4) {
        extendSpot();
      } else {
        spots.innerHTML = '';
        st.phase = 'align';
        App.say('のびたね! でも ガイド（いとを とおす わっか）が まがっているよ。\nまがった ガイドを タッチして、リールと おなじ したむきに そろえよう。', 'think');
        guides.forEach((g, i) => g.classList.toggle('glow', st.ang[i] !== 0));
      }
    });
  };

  /* ② ガイドを そろえる ／ ③ いとを とおす */
  function onGuide(k) {
    if (st.phase === 'align') {
      if (st.ang[k] === 0) return;
      st.ang[k] = 0;
      setGuideAngle(k);
      guides[k].classList.remove('glow');
      Sfx.good();
      if (st.ang.every(a => a === 0)) {
        st.phase = 'thread';
        App.say('ガイドが まっすぐ そろったね!\nつぎは いとを ガイドに とおすよ。リールに ちかい ガイドから じゅんばんに タッチしてね。', 'wow');
        guides[0].classList.add('glow');
      }
    } else if (st.phase === 'thread') {
      if (k !== st.threaded) {
        Sfx.oops();
        App.say('リールに ちかい ガイドから じゅんばんに とおそう。ひかっている ガイドだよ。', 'think');
        return;
      }
      guides[k].classList.remove('glow');
      st.threaded++;
      Sfx.pop();
      drawLine();
      if (st.threaded < 5) {
        guides[st.threaded].classList.add('glow');
      } else {
        startLineOut();
      }
    }
  }

  /* ④ いとを だす れんしゅう */
  function startLineOut() {
    st.phase = 'out';
    App.say('いとが とおったね! さいごに いとの だしかたを れんしゅうしよう。\n① ベールを ひらく → ② いとを ひっぱる → ③ ベールを もどす', 'wow');
    const setBail = open => {
      st.bail = open ? 'open' : 'closed';
      bail.setAttribute('d', open ? 'M100 188 Q130 236 160 188' : 'M100 188 Q130 160 160 188');
      bailBtn.innerHTML = open ? '🔒 ベールを もどす' : '🔓 ベールを ひらく';
      Sfx.click();
    };
    const bailBtn = App.btn('🔓 ベールを ひらく', {
      cls: 'blue',
      onClick: () => {
        if (st.bail === 'closed') {
          setBail(true);
          if (st.out < 1) App.say('ベールが ひらいたよ。これで いとが でるように なった!\n「ひっぱる」を おしつづけて いとを だそう。');
        } else {
          setBail(false);
          if (st.out >= 1) {
            ui.done('さおの じゅんび かんりょう!\nベールを もどすと いとが とまるよ。ハンドルを まわしても もどるんだ。');
          } else {
            App.say('まだ いとが でていないよ。ベールを ひらいてから ひっぱろう。', 'think');
          }
        }
      },
    });
    const pull = holdBtn('🤏 ひっぱる', {
      speed: 0.5,
      canHold: () => st.bail === 'open',
      onBlocked: () => { Sfx.oops(); App.say('ベールが とじていると いとが でないよ。\nさきに ベールを ひらこう!', 'think'); },
      onProgress: p => { st.out = p; drawLine(); },
      onDone: () => { App.say('いとが でたね! さいごに ベールを もどそう。', 'wow'); bailBtn.classList.add('pulse'); },
    });
    ui.controls(bailBtn, pull);
  }

  drawSegs();
  extendSpot();
  App.say('まずは さおを のばそう!\nさきっぽの ほうから じゅんばんに ひきだすよ。ひかっている ところを タッチしてね。');
}

/* ───────── 2. しかけの じゅんび（クリンチノット） ───────── */
function prepKnot(area, ui) {
  const R = { x: 200, y: 150 };
  const isLure = Loadout.gear.bait === 'jig';
  const rig = ITEM_BY_ID[Loadout.gear.rig];
  const st = { step: 0, wraps: 0, tight: 0 };

  area.innerHTML = `
    <div class="knot">
      <svg viewBox="0 0 800 300" class="prep-svg">
        <g id="swivel">
          <path id="snap" d="M118 150 L70 150 q-22 0 -22 -16 q0 -16 22 -16 L110 140" stroke="#8a949d" stroke-width="5" fill="none" stroke-linecap="round"/>
          <circle cx="126" cy="150" r="9" fill="none" stroke="#8a949d" stroke-width="5"/>
          <rect x="136" y="141" width="44" height="18" rx="9" fill="#a7b0b8"/>
          <circle cx="${R.x}" cy="${R.y}" r="13" fill="none" stroke="#8a949d" stroke-width="5"/>
          <text x="130" y="205" text-anchor="middle" class="svg-lbl">スナップサルカン</text>
        </g>
        <g id="kline" fill="none" stroke="#2e9e5b" stroke-width="3.5" stroke-linecap="round"></g>
        <g id="kspots"></g>
      </svg>
      <div class="knot-steps"></div>
    </div>`;
  const svg = area.querySelector('svg');
  const kline = svg.querySelector('#kline');
  const spots = svg.querySelector('#kspots');
  const stepsEl = area.querySelector('.knot-steps');
  const STEPS = ['わに とおす', '5かい まく', 'すきまに とおす', 'しめる', 'きる', ...(isLure ? [] : ['しかけを つける'])];

  const drawSteps = () => {
    stepsEl.innerHTML = STEPS.map((s, i) => `<span class="${i < st.step ? 'done' : i === st.step ? 'now' : ''}">${i + 1}. ${s}</span>`).join('');
  };

  const draw = () => {
    const sp = 18 * (1 - 0.65 * st.tight);
    const x0 = 232 - 6 * st.tight;
    let d = '';
    if (st.step === 0) {
      d = `<path d="M790 150 L300 150"/><circle cx="300" cy="150" r="4" fill="#2e9e5b"/>`;
    } else {
      d = `<path d="M790 156 L${R.x + 12} 156"/>`;
      d += `<path d="M${R.x + 12} 156 Q${R.x - 20} 150 ${R.x + 12} 144"/>`;
      const xEnd = x0 + st.wraps * sp;
      for (let i = 0; i < st.wraps; i++) {
        const x = x0 + i * sp;
        d += `<path d="M${x} 136 C${x + 12} 140 ${x + 12} 160 ${x} 164"/>`;
      }
      if (st.step <= 2) {
        d += `<path d="M${R.x + 12} 144 L${Math.max(xEnd, R.x + 30) + 90} 144"/>`;
      } else {
        // さきっぽを わの ちかくの すきまに もどす
        d += `<path d="M${R.x + 12} 144 L${xEnd + 4} 144 Q${xEnd + 30} 112 ${R.x + 22} 150"/>`;
        if (st.step <= 4) d += `<path d="M${R.x + 22} 150 L${R.x + 30} 186"/>`;
        else d += `<path d="M${R.x + 22} 150 L${R.x + 25} 158"/>`;
      }
    }
    kline.innerHTML = d;
    drawSteps();
  };

  const go = () => {
    spots.innerHTML = '';
    draw();
    if (st.step === 0) {
      App.say('しかけは スナップサルカンに いとを むすぶだけ。\n「クリンチノット」という むすびかたを れんしゅうしよう! まずは いとを わに とおしてね。');
      tapSpot(spots, R.x, R.y, 22, () => { Sfx.pop(); st.step = 1; go(); });
    } else if (st.step === 1) {
      App.say('とおったら、いとの さきっぽを もとの いとに くるくる まきつけるよ。\nひかっている ところを 5かい タッチ!');
      tapSpot(spots, 290, 150, 46, () => {
        st.wraps++;
        Sfx.tone(500 + st.wraps * 80, 0.08, 'triangle', 0.15);
        App.say(`${st.wraps}かい!`);
        draw();
        if (st.wraps >= 5) { st.step = 2; App.after(400, go); }
      });
    } else if (st.step === 2) {
      App.say('まいたら、さきっぽを わの ちかくに できた すきまに とおそう。\nひかっている すきまを タッチ!');
      tapSpot(spots, R.x + 22, 150, 16, () => { Sfx.pop(); st.step = 3; go(); });
    } else if (st.step === 3) {
      App.say('さいごに ゆっくり ひっぱって しめよう。\nしめる まえに みずで ぬらすと、いとが こすれて よわく ならないよ。');
      ui.controls(holdBtn('💧 ぬらして ゆっくり しめる', {
        speed: 0.45,
        onProgress: p => { st.tight = p; draw(); },
        onDone: () => { Sfx.good(); st.step = 4; go(); },
      }));
    } else if (st.step === 4) {
      App.say('しっかり しまったね! あまった さきっぽを ハサミで きろう。\nすこしだけ のこして きるのが コツだよ。');
      ui.controls(App.btn('✂️ きる', { cls: 'big', onClick: () => { Sfx.pop(); st.step = 5; go(); } }));
    } else if (st.step === 5 && !isLure) {
      App.say(`むすべたね! さいごに ${rig.name}を スナップに つけよう。\nゆびで うごかしてね。`);
      ui.controls();
      const item = h(`<div class="knot-rig">${Art.gear(rig.art)}</div>`);
      area.querySelector('.knot').appendChild(item);
      const target = tapSpot(spots, 60, 134, 30, () => {});
      makeDrag(item, target, () => {
        st.step = 6;
        draw();
        spots.innerHTML = '';
        ui.done('しかけの じゅんび かんりょう!\nクリンチノットが できたね。すごい!');
      });
    } else {
      ui.controls();
      ui.done('しかけの じゅんび かんりょう!\nクリンチノットが できたね。ルアーは エサの じゅんびで つけるよ。');
    }
  };
  go();
}

/* ───────── 3. みずくみ ───────── */
function prepWater(area, ui) {
  const HAND = { x: 300, y: 92 };
  const TOP = 150, FLOAT = 286;
  const st = { phase: 'grip', by: TOP, water: 0, tilt: 0, lastPull: 0, spills: 0 };

  area.innerHTML = `
    <svg viewBox="0 0 800 400" class="prep-svg water-svg">
      <rect width="800" height="270" fill="#cdeeff"/>
      <rect y="268" width="800" height="132" fill="#3f9fdc"/>
      <path d="M380 300 q10 -6 20 0 t20 0 M560 330 q10 -6 20 0 t20 0 M460 370 q10 -6 20 0 t20 0" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none"/>
      <rect x="0" y="110" width="330" height="22" fill="#a8743f"/>
      <rect x="40" y="132" width="16" height="268" fill="#6b4529"/><rect x="250" y="132" width="16" height="268" fill="#6b4529"/>
      <g id="wkid">
        <rect x="246" y="60" width="30" height="40" rx="11" fill="#ff8a3d"/>
        <circle cx="261" cy="42" r="18" fill="#f6d2b0"/>
        <path d="M241 38 Q261 12 281 38 Z" fill="#4caf7a"/>
        <rect x="248" y="98" width="8" height="12" fill="#3b5ba5"/><rect x="266" y="98" width="8" height="12" fill="#3b5ba5"/>
        <path d="M272 72 L${HAND.x} ${HAND.y}" stroke="#f2c49b" stroke-width="8" stroke-linecap="round"/>
      </g>
      <path id="rope" stroke="#c9a26b" stroke-width="3" fill="none"/>
      <g id="bucket">
        <clipPath id="bclip"><path d="M-22 -24 L22 -24 L16 22 L-16 22 Z"/></clipPath>
        <path d="M-22 -24 L22 -24 L16 22 L-16 22 Z" fill="#4fa3e8" stroke="#2f7cc0" stroke-width="3"/>
        <rect id="bwater" x="-24" y="22" width="48" height="0" fill="#1d6fb8" clip-path="url(#bclip)"/>
        <path d="M-22 -24 Q0 -50 22 -24" stroke="#555" stroke-width="2.5" fill="none"/>
      </g>
      <g id="wfx"></g>
      <text id="wlbl" x="560" y="80" text-anchor="middle" class="svg-lbl big"></text>
    </svg>`;
  const svg = area.querySelector('svg');
  const bucket = svg.querySelector('#bucket'), rope = svg.querySelector('#rope');
  const bwater = svg.querySelector('#bwater'), wlbl = svg.querySelector('#wlbl');
  const BX = 420;

  const draw = () => {
    const swing = st.phase === 'pull' ? Math.sin(performance.now() / 180) * Math.min(12, st.spills * 3) : 0;
    bucket.setAttribute('transform', `translate(${BX + swing} ${st.by}) rotate(${st.tilt + swing * 0.6})`);
    rope.setAttribute('d', `M${HAND.x} ${HAND.y} Q${(HAND.x + BX) / 2} ${Math.max(HAND.y, st.by) - 10} ${BX + swing} ${st.by - 46}`);
    const hgt = 46 * st.water / 100;
    bwater.setAttribute('y', 22 - hgt);
    bwater.setAttribute('height', hgt);
    wlbl.textContent = st.phase === 'scoop' || st.phase === 'pull' ? `みず ${Math.round(st.water)}%` : '';
  };
  App.loop(() => { draw(); });

  const splash = () => {
    const fx = svg.querySelector('#wfx');
    for (let i = 0; i < 6; i++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', BX); c.setAttribute('cy', 270); c.setAttribute('r', 4);
      c.setAttribute('class', 'drop');
      c.style.setProperty('--dx', ((Math.random() - 0.5) * 60) + 'px');
      c.style.setProperty('--dy', (-20 - Math.random() * 40) + 'px');
      fx.appendChild(c);
      setTimeout(() => c.remove(), 900);
    }
  };

  const animateTo = (target, dur, cb) => {
    const from = st.by; let t = 0;
    App.loop(dt => {
      t = Math.min(1, t + dt / dur);
      st.by = from + (target - from) * (1 - Math.pow(1 - t, 2));
      if (t >= 1) { if (cb) cb(); return false; }
    });
  };

  const grip = () => {
    st.phase = 'grip';
    App.say('ロープつきの バケツで うみの みずを くもう!\nロープは どう もつ?');
    ui.controls(...shuffle([
      App.btn('✊ しっかり にぎる', {
        cls: 'green',
        onClick: () => { Sfx.good(); App.say('せいかい! てに まきつけると、バケツに ひっぱられて あぶないよ。', 'wow'); App.after(1800, drop); },
      }),
      App.btn('🌀 てに まきつける', {
        cls: '',
        onClick: () => { Sfx.oops(); App.say('てに まきつけると、バケツが おもくて うみに ひっぱられちゃうかも。\nしっかり にぎろうね。', 'think'); },
      }),
    ]));
  };

  const drop = () => {
    st.phase = 'drop';
    st.water = 0; st.tilt = 0; st.by = TOP; st.spills = 0;
    App.say('バケツを うみに おとそう!');
    ui.controls(App.btn('⬇️ バケツを おとす', {
      cls: 'big pulse',
      onClick: b => {
        b.disabled = true;
        Sfx.whoosh();
        animateTo(FLOAT, 0.7, () => { Sfx.splash(); splash(); scoop(); });
      },
    }));
  };

  const scoop = () => {
    st.phase = 'scoop';
    App.say('バケツが ぷかぷか ういちゃった。\nロープを「くいっ」と ひいて、バケツを たおして みずを いれよう!');
    const b = App.btn('〽️ くいっ!', {
      cls: 'big',
      onClick: () => {
        if (st.phase !== 'scoop') return;
        st.tilt = 70;
        Sfx.tone(300, 0.15, 'sine', 0.2, 0, 200);
        App.after(350, () => { st.tilt = 0; });
        st.water = Math.min(100, st.water + 34);
        splash();
        if (st.water >= 100) {
          st.phase = 'wait';
          Sfx.good();
          App.after(600, pull);
        }
      },
    });
    ui.controls(b);
  };

  const pull = () => {
    st.phase = 'pull';
    st.by = FLOAT + 10;
    App.say('みずが いっぱい! ゆっくり ひきあげよう。\n「たぐる」を ゆっくり おしてね。いそぐと みずが こぼれるよ。');
    ui.controls(App.btn('🤲 たぐる', {
      cls: 'big',
      onClick: () => {
        if (st.phase !== 'pull') return;
        const now = performance.now();
        const fast = now - st.lastPull < 420;
        st.lastPull = now;
        if (fast) {
          st.spills++;
          st.water = Math.max(0, st.water - 14);
          Sfx.splash();
          if (st.spills <= 2 || st.spills % 3 === 0) App.say('ゆっくり ゆっくり! いそぐと バケツが ゆれて みずが こぼれるよ。', 'think');
        } else {
          st.spills = Math.max(0, st.spills - 1);
          Sfx.tone(700, 0.05, 'triangle', 0.1);
        }
        st.by = Math.max(TOP, st.by - 16);
        if (st.by <= TOP) {
          st.phase = 'end';
          if (st.water >= 50) {
            ui.done('みずくみ せいこう!\nこの みずで てを ぬらしたり、アミエビを まぜたり するよ。');
          } else {
            Sfx.oops();
            App.say('みずが すくなく なっちゃった。もういちど くんでみよう!', 'think');
            App.after(1800, drop);
          }
        }
      },
    }));
  };

  grip();
}

/* ───────── 4. エサの じゅんび ───────── */
function prepBait(area, ui) {
  const id = Loadout.gear.bait;
  if (id === 'amiebi') return baitAmiebi(area, ui);
  if (id === 'okiami') return baitOkiami(area, ui);
  if (id === 'jig') return baitJig(area, ui);
  return baitWorm(area, ui);
}

// はり（とおした エサを すこしずつ みせる）
function hookWithBait(color, w = 13) {
  return `
<svg viewBox="0 0 120 230" class="hook-svg" aria-hidden="true">
  <line x1="70" y1="0" x2="70" y2="112" stroke="#555" stroke-width="2"/>
  <path d="M70 110 L70 172 Q70 204 45 204 Q20 204 20 178 L20 168" stroke="#9aa4ad" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M20 166 L31 179" stroke="#9aa4ad" stroke-width="6" stroke-linecap="round"/>
  <path class="threaded" d="M22 172 Q20 204 45 204 Q70 204 70 172 L70 130" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>
  <path class="tail" d="M70 130 q12 14 0 26 q-12 14 0 30" stroke="${color}" stroke-width="${w - 2}" fill="none" stroke-linecap="round" opacity="0"/>
</svg>`;
}

function baitLayout(leftHtml, leftLbl, rightHtml, rightLbl) {
  return h(`
    <div class="bait">
      <div class="bait-left"><div class="bait-item">${leftHtml}</div><div class="cup">${leftLbl}</div></div>
      <div class="bait-arrow">👉</div>
      <div class="bait-right"><div class="hook-box">${rightHtml}<div class="hook-target"></div></div><div class="hook-lbl">${rightLbl}</div></div>
    </div>`);
}

// アオイソメ（ちょいなげ・さぐりづり）
function baitWorm(area, ui) {
  const box = baitLayout(`<div class="worm wriggle">${Art.gear('aoisome')}</div>`, 'アオイソメ', hookWithBait('#b5533c', 11), Loadout.gear.rig === 'burakuri' ? 'ブラクリの はり' : 'はり');
  area.appendChild(box);
  const worm = box.querySelector('.worm');
  const target = box.querySelector('.hook-target');
  const threaded = box.querySelector('.threaded');
  const tail = box.querySelector('.tail');
  let grabbed = false;

  App.say('エサは アオイソメ（ゴカイの なかま）。にょろにょろ うごくよ!\nそっと タッチして つまもう。');
  worm.addEventListener('click', function grab() {
    if (grabbed) return;
    grabbed = true;
    worm.classList.remove('wriggle');
    Sfx.pop();
    App.say('つかめた! あたまの すぐ うしろを つまむと すべらないよ。\nはりの さきを あたまから さすよ。はりまで もっていってね。', 'wow');
    App.after(50, () => makeDrag(worm, target, thread));
  });

  function thread() {
    worm.style.visibility = 'hidden';
    box.querySelector('.bait-arrow').textContent = '✨';
    threaded.style.strokeDashoffset = '92';
    App.say('ささった! はりの まがりに そって、すこしずつ とおそう。\nボタンを おしつづけてね。');
    ui.controls(holdBtn('👉 そーっと とおす', {
      speed: 0.4,
      onProgress: p => { threaded.style.strokeDashoffset = String(92 - 92 * p); },
      onDone: () => { tail.setAttribute('opacity', '1'); cut(); },
    }));
  }

  function cut() {
    App.say('はりから でた ぶんを「たらし」と いうよ。\nたらしは どのくらい のこす?');
    const choices = [
      { label: '✂️ ながく のこす（5センチ）', ok: false, say: 'ながすぎると、さかなが たらしだけ たべちゃうよ。' },
      { label: '✂️ すこし のこす（1〜2センチ）', ok: true },
      { label: '✂️ ぜんぶ きる', ok: false, say: 'たらしが ないと うごかないから、さかなが きづきにくいよ。' },
    ];
    ui.controls(...shuffle(choices).map(c => App.btn(c.label, {
      cls: '',
      onClick: () => {
        if (!c.ok) { Sfx.oops(); App.say(c.say, 'think'); return; }
        ui.done('ばっちり! たらしが ゆらゆら うごいて、さかなが よってくるよ。\nほんとうの はりは とがっているから、おとなと いっしょに つけようね。');
      },
    })));
  }
}

// オキアミ（ウキづり）
function baitOkiami(area, ui) {
  const shrimp = `
<svg viewBox="0 0 140 90" class="okiami-svg" aria-hidden="true">
  <path d="M36 50 Q44 20 80 22 Q112 24 112 46 Q110 66 86 66" stroke="#f48a9c" stroke-width="20" fill="none" stroke-linecap="round"/>
  <circle cx="104" cy="40" r="3.5" fill="#222"/>
  <path d="M112 38 l20 -14 M112 42 l22 -6" stroke="#f48a9c" stroke-width="2"/>
  <g class="shrimp-tail"><path d="M40 52 L14 40 L18 58 L10 72 Z" fill="#f7a8b6" stroke="#e48a9c" stroke-width="2"/></g>
</svg>`;
  const box = baitLayout(`<div class="okiami">${shrimp}</div>`, 'オキアミ', hookWithBait('#f48a9c', 14), 'はり');
  area.appendChild(box);
  const item = box.querySelector('.okiami');
  const tailEl = item.querySelector('.shrimp-tail');
  const target = box.querySelector('.hook-target');
  const threaded = box.querySelector('.threaded');

  App.say('エサは オキアミ。まずは しっぽを ちぎろう。\nしっぽを タッチしてね。');
  tailEl.classList.add('glow');
  tailEl.addEventListener('click', e => {
    e.stopPropagation();
    if (tailEl.dataset.done) return;
    tailEl.dataset.done = '1';
    tailEl.style.display = 'none';
    Sfx.pop();
    App.say('しっぽを とると、はりが まっすぐ とおしやすく なるよ。\nしっぽの ほうから はりを さそう。はりまで もっていってね。', 'wow');
    makeDrag(item, target, () => {
      item.style.visibility = 'hidden';
      threaded.style.strokeDashoffset = '92';
      App.say('せなかに そって まるく まげながら とおそう。\nボタンを おしつづけてね。');
      ui.controls(holdBtn('👉 まるく とおす', {
        speed: 0.45,
        onProgress: p => { threaded.style.strokeDashoffset = String(92 - 92 * p); },
        onDone: () => ui.done('きれいに つけられたね!\nはりさきが みの なかに かくれるように するのが コツだよ。'),
      }));
    });
  });
}

// アミエビ（サビキづり）
function baitAmiebi(area, ui) {
  const st = { mix: 0, fill: 0, phase: 'drop' };
  const bowl = `
<svg viewBox="0 0 200 200" class="bowl-svg" aria-hidden="true">
  <path d="M20 50 L180 50 L160 180 L40 180 Z" fill="#ffb74d" stroke="#e08a1e" stroke-width="5"/>
  <clipPath id="bowlClip"><path d="M24 54 L176 54 L157 176 L43 176 Z"/></clipPath>
  <g clip-path="url(#bowlClip)">
    <rect id="bowlWater" x="0" y="180" width="200" height="0" fill="#3f9fdc" opacity=".6"/>
    <g id="mush"></g>
    <rect id="block" x="70" y="120" width="60" height="44" rx="6" fill="#f7b6c2" stroke="#e48a9c" stroke-width="3" opacity="0"/>
  </g>
  <text x="100" y="34" text-anchor="middle" class="svg-lbl">コマセバケツ</text>
</svg>`;
  const box = baitLayout(`<div class="block-item">${Art.gear('amiebi')}</div>`, 'こおった アミエビ', bowl, '');
  area.appendChild(box);
  const item = box.querySelector('.block-item');
  const target = box.querySelector('.hook-target');
  const bowlSvg = box.querySelector('.bowl-svg');
  const block = bowlSvg.querySelector('#block'), water = bowlSvg.querySelector('#bowlWater'), mush = bowlSvg.querySelector('#mush');

  App.say('サビキづりの エサは アミエビ。\nまずは こおった ブロックを バケツに いれよう!');
  makeDrag(item, target, () => {
    item.style.visibility = 'hidden';
    block.setAttribute('opacity', '1');
    Sfx.pop();
    App.say('つぎは うみの みずを すこし いれよう。\nかたまりが とけやすく なるよ。');
    ui.controls(App.btn('🪣 うみの みずを いれる', {
      cls: 'big blue',
      onClick: b => {
        b.disabled = true;
        Sfx.splash();
        water.setAttribute('y', 140); water.setAttribute('height', 40);
        startMix();
      },
    }));
  });

  function startMix() {
    st.phase = 'mix';
    App.say('スコップで よーく まぜよう!\nバケツの なかを ゆびで ぐるぐる こすってね。');
    const meter = h('<div class="mini-meter"><span>まぜまぜ</span><div class="bar"><div class="fill"></div></div></div>');
    const fill = meter.querySelector('.fill');
    const add = v => {
      if (st.phase !== 'mix') return;
      st.mix = Math.min(100, st.mix + v);
      fill.style.width = st.mix + '%';
      const k = 1 - st.mix / 100;
      block.setAttribute('width', 60 * k + 4);
      block.setAttribute('x', 100 - (60 * k + 4) / 2);
      block.setAttribute('height', 44 * k + 4);
      block.setAttribute('y', 164 - (44 * k + 4));
      const need = Math.floor(st.mix / 4);
      while (mush.childElementCount < need) {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', 55 + Math.random() * 90); c.setAttribute('cy', 140 + Math.random() * 34);
        c.setAttribute('r', 3 + Math.random() * 3); c.setAttribute('fill', '#f39bb0');
        mush.appendChild(c);
      }
      if (st.mix >= 100) {
        st.phase = 'fill';
        Sfx.good();
        startFill();
      }
    };
    let last = null;
    bowlSvg.style.touchAction = 'none';
    bowlSvg.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse' && e.buttons === 0) { last = null; return; }
      if (last) add(Math.hypot(e.clientX - last.x, e.clientY - last.y) / 18);
      last = { x: e.clientX, y: e.clientY };
    });
    bowlSvg.addEventListener('pointerup', () => { last = null; });
    ui.controls(meter, App.btn('🥄 まぜる', { cls: '', onClick: () => add(10) }));
  }

  function startFill() {
    App.say('とろとろに なったね! スコップで コマセカゴに つめよう。\n8ぶんめ（すこし すきまが ある くらい）まで いれてね。');
    const basket = h(`
      <div class="basket-wrap">
        <svg viewBox="0 0 100 120" class="basket-svg">
          <rect x="15" y="20" width="70" height="90" rx="10" fill="#fff3e0" stroke="#e08a1e" stroke-width="4"/>
          <rect id="bfill" x="17" y="108" width="66" height="0" fill="#f39bb0"/>
          <path d="M15 50 H85 M15 80 H85 M38 20 V110 M62 20 V110" stroke="#e08a1e" stroke-width="3"/>
          <line x1="12" y1="38" x2="88" y2="38" stroke="#43b581" stroke-width="2" stroke-dasharray="4 3"/>
        </svg>
        <span>コマセカゴ</span>
      </div>`);
    box.querySelector('.bait-left').replaceChildren(basket);
    box.querySelector('.bait-arrow').textContent = '👈';
    const bfill = basket.querySelector('#bfill');
    ui.controls(App.btn('🥄 つめる', {
      cls: 'big',
      onClick: () => {
        st.fill = Math.min(80, st.fill + 20);
        Sfx.pop();
        const hgt = 88 * st.fill / 100;
        bfill.setAttribute('y', 108 - hgt); bfill.setAttribute('height', hgt);
        if (st.fill >= 80) ui.done('8ぶんめ! ばっちり。\nつめすぎると カゴから でてこないから、すこし すきまを あけるのが コツだよ。');
        else App.say(`${st.fill / 20}かいめ。もうすこし!`);
      },
    }));
  }
}

// メタルジグ（ルアーづり）
function baitJig(area, ui) {
  const jig = `
<svg viewBox="0 0 140 80" class="jig-svg" aria-hidden="true">
  <defs><linearGradient id="jg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f7fd0"/><stop offset=".5" stop-color="#d9e6f2"/><stop offset="1" stop-color="#9fb4c8"/></linearGradient></defs>
  <path d="M20 40 Q56 14 112 36 Q120 40 112 44 Q56 66 20 40 Z" fill="url(#jg2)" stroke="#5c7a96" stroke-width="2"/>
  <circle cx="104" cy="38" r="3.5" fill="#222"/>
  <circle cx="122" cy="40" r="4" fill="none" stroke="#8a949d" stroke-width="2.5"/>
  <g class="jig-hook tangled"><rect x="0" y="22" width="44" height="50" fill="transparent"/><path d="M20 40 q-10 4 -12 18 q0 8 8 6" stroke="#8a949d" stroke-width="3" fill="none"/><path class="tangle" d="M30 30 q-20 10 -6 22 q14 8 -4 18" stroke="#ff6fa8" stroke-width="2" fill="none"/></g>
</svg>`;
  const snap = open => `
<svg viewBox="0 0 120 230" class="hook-svg snap-svg" aria-hidden="true">
  <line x1="60" y1="0" x2="60" y2="120" stroke="#b7e3f7" stroke-width="4"/>
  <circle cx="60" cy="126" r="7" fill="none" stroke="#8a949d" stroke-width="4"/>
  <path d="M60 133 q-20 6 -20 34 q0 28 20 34" stroke="#8a949d" stroke-width="5" fill="none"/>
  <path d="${open ? 'M60 201 q30 -10 40 -50' : 'M60 201 q20 -6 20 -34 q0 -28 -20 -34'}" stroke="#8a949d" stroke-width="5" fill="none"/>
</svg>`;
  const box = baitLayout(`<div class="jig">${jig}</div>`, 'メタルジグ', snap(false), 'スナップ');
  area.appendChild(box);
  const item = box.querySelector('.jig');
  const hook = item.querySelector('.jig-hook');
  const target = box.querySelector('.hook-target');
  const hookBox = box.querySelector('.hook-box');
  const setSnap = open => { hookBox.querySelector('.snap-svg').outerHTML = snap(open); };
  let step = 0;

  App.say('ルアーは エサの かわり。まずは フックを チェック!\nいとが からまっているよ。フックを タッチして ほどこう。');
  hook.classList.add('glow');
  // ちいさい フックだけでなく、ルアーの どこを タッチしても ほどける
  item.addEventListener('click', () => {
    if (step !== 0) return;
    step = 1;
    hook.classList.remove('glow', 'tangled');
    hook.querySelector('.tangle').style.display = 'none';
    Sfx.good();
    App.say('ほどけた! からまったままだと さかなが かからないよ。\nつぎは スナップを ひらこう。');
    ui.controls(App.btn('🔓 スナップを ひらく', {
      cls: 'big blue',
      onClick: b => {
        b.disabled = true;
        setSnap(true);
        Sfx.click();
        App.say('ひらいたね。メタルジグを スナップまで もっていこう!');
        ui.controls();
        makeDrag(item, target, () => {
          App.say('つけたら スナップを しっかり とじよう!');
          ui.controls(App.btn('🔒 スナップを とじる', {
            cls: 'big pulse',
            onClick: () => {
              setSnap(false);
              Sfx.click();
              ui.done('じゅんび かんりょう!\nスナップを とじないと、なげたときに ルアーが とんでいっちゃうよ。');
            },
          }));
        });
      },
    }));
  });
}

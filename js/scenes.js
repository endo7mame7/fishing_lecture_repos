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
      </div>`;
    const again = Loadout.ready()
      ? App.btn('🎣 おなじ どうぐで つる', { cls: 'green', onClick: () => App.go('bait') })
      : null;
    App.setControls(
      App.btn('🏪 つりぐやさんへ', { cls: 'big pulse', onClick: () => App.go('method') }),
      ...(again ? [again] : []),
      App.btn('📖 ずかん', { cls: 'blue', onClick: () => App.go('zukan') }),
    );
  },
};

/* ───────── 1-a. つりかたを えらぶ ───────── */
Scenes.method = {
  step: 0,
  enter() {
    App.say('いらっしゃい! ここは つりぐやさん。\nまずは どんな つりを するか えらんでね。');
    let sel = null;
    const wrap = h(`<div class="methods"><div class="shop-head">🏪 どんな つりを する?</div><div class="methods-grid"></div></div>`);
    const grid = wrap.querySelector('.methods-grid');
    const next = App.btn('これに する ▶', {
      cls: 'big green',
      onClick: () => {
        if (!sel) { App.say('つりかたを 1つ タッチしてね。', 'think'); return; }
        if (Loadout.method !== sel) Loadout.reset(sel);
        App.go('shop', { shelf: 0 });
      },
    });

    METHODS.forEach(m => {
      const names = m.fish.map(id => FISH_BY_ID[id]).filter(f => !f.rare).map(f => f.name).join('・');
      const card = h(`
        <button class="mcard">
          <span class="m-ico">${Art.gear(m.art)}</span>
          <span class="m-name">${m.name}</span>
          <span class="m-fish">🐟 ${names}</span>
        </button>`);
      card.addEventListener('click', () => {
        sel = m.id;
        grid.querySelectorAll('.mcard').forEach(c => c.classList.toggle('selected', c === card));
        next.classList.add('pulse');
        Sfx.pop();
        App.say(`${m.name}。\n${m.desc}`);
      });
      grid.appendChild(card);
    });

    App.stage.appendChild(wrap);
    App.setControls(App.btn('◀', { cls: 'gray', onClick: () => App.go('title') }), next);
  },
};

/* ───────── 1-b. つりぐやさんの たな ───────── */
Scenes.shop = {
  step: 0,
  enter(opts) {
    if (!Loadout.method) { App.go('method'); return; }
    const M = Loadout.m;
    let idx = opts.shelf || 0;

    const shelfDone = sh => {
      if (sh.type === 'one') return !!Loadout.gear[sh.id];
      if (sh.type === 'must') return sh.items.filter(i => i.ok).every(i => Loadout.safety.includes(i.id));
      return true;
    };

    const render = () => {
      const sh = SHELVES[idx];
      const wrap = h(`
        <div class="shop">
          <div class="shop-tabs">
            ${SHELVES.map((s, i) => `<span class="tab ${i === idx ? 'now' : ''} ${shelfDone(s) && i !== idx ? 'done' : ''}">${s.title}</span>`).join('')}
          </div>
          <div class="shop-head"><span class="shop-method">${M.name}</span> ${sh.title}</div>
          <div class="shelf shelf-${sh.items.length > 6 ? 'many' : 'few'}"></div>
        </div>`);
      const shelf = wrap.querySelector('.shelf');
      const cards = {};

      const mark = (card, text, cls) => {
        const m = card.querySelector('.badge');
        m.textContent = text;
        m.className = 'badge ' + cls;
      };

      sh.items.forEach(it => {
        const card = h(`
          <button class="gcard">
            <span class="g-ico">${Art.icon(it)}</span>
            <span class="g-name">${it.name}</span>
            <span class="badge"></span>
          </button>`);
        cards[it.id] = card;

        // すでに えらんでいる ものを ひょうじ
        if (sh.type === 'one' && Loadout.gear[sh.id] === it.id) {
          card.classList.add('selected');
          const ok = M.gear[sh.id] === it.id;
          mark(card, ok ? '◎' : '△', ok ? 'good' : 'meh');
        }
        if (sh.type === 'must' && Loadout.safety.includes(it.id)) { card.classList.add('selected'); mark(card, '✔', 'good'); }
        if (sh.type === 'free' && Loadout.extra.includes(it.id)) { card.classList.add('selected'); mark(card, '✔', 'good'); }

        card.addEventListener('click', () => {
          if (sh.type === 'one') {
            Loadout.gear[sh.id] = it.id;
            Object.values(cards).forEach(c => { c.classList.remove('selected', 'hint'); mark(c, '', ''); });
            card.classList.add('selected');
            const best = M.gear[sh.id];
            if (it.id === best) {
              mark(card, '◎', 'good');
              Sfx.good();
              App.say(`${it.say}\n◎ ${M.name}に ぴったり!`, 'wow');
            } else {
              mark(card, '△', 'meh');
              cards[best].classList.add('hint');
              Sfx.pop();
              App.say(`${it.say}\nでも ${M.name}には「${ITEM_BY_ID[best].name}」が おすすめだよ。`, 'think');
            }
          } else if (it.ok === false) {
            card.classList.remove('shake');
            void card.offsetWidth;
            card.classList.add('shake', 'no');
            Sfx.oops();
            App.say(it.say, 'think');
          } else if (sh.type === 'must') {
            if (!Loadout.safety.includes(it.id)) Loadout.safety.push(it.id);
            card.classList.add('selected');
            mark(card, '✔', 'good');
            Sfx.good();
            App.say(it.say + (shelfDone(sh) ? '\nこれで あんしん!' : ''), 'wow');
          } else {
            const i = Loadout.extra.indexOf(it.id);
            if (i < 0) {
              Loadout.extra.push(it.id);
              card.classList.add('selected');
              mark(card, '✔', 'good');
              Sfx.good();
              App.say(it.say);
            } else {
              Loadout.extra.splice(i, 1);
              card.classList.remove('selected');
              mark(card, '', '');
              Sfx.click();
              App.say(`${it.name}は やめておくね。`);
            }
          }
          next.classList.toggle('pulse', shelfDone(sh));
        });
        shelf.appendChild(card);
      });

      App.stage.replaceChildren(wrap);
      App.say(`${sh.title}。\n${sh.say}`);

      const last = idx === SHELVES.length - 1;
      const next = App.btn(last ? '🧾 おかいけい ▶' : 'つぎの たな ▶', {
        cls: 'big green' + (shelfDone(sh) ? ' pulse' : ''),
        onClick: () => {
          if (!shelfDone(sh)) {
            App.say(sh.type === 'must'
              ? 'ライフジャケットと ぼうしを わすれずに えらんでね!'
              : 'どれか 1つ えらんでね。', 'think');
            return;
          }
          if (last) App.go('receipt');
          else { idx++; render(); }
        },
      });
      const back = App.btn('◀', {
        cls: 'gray',
        onClick: () => {
          if (idx === 0) App.go('method');
          else { idx--; render(); }
        },
      });
      App.setControls(back, next);
    };

    render();
  },
};

/* ───────── 1-c. おかいけい（どうぐの かくにん） ───────── */
Scenes.receipt = {
  step: 0,
  enter() {
    if (!Loadout.ready()) { App.go(Loadout.method ? 'shop' : 'method', { shelf: 0 }); return; }
    const M = Loadout.m;
    const n = Loadout.matchCount();
    const rows = SHELVES.filter(s => s.type === 'one').map(s => {
      const it = ITEM_BY_ID[Loadout.gear[s.id]];
      const ok = M.gear[s.id] === it.id;
      return `
        <li class="${ok ? 'ok' : 'ng'}">
          <span class="r-ico">${Art.icon(it)}</span>
          <span class="r-txt"><small>${s.title}</small>${it.name}${ok ? '' : `<em>おすすめ: ${ITEM_BY_ID[M.gear[s.id]].name}</em>`}</span>
          <span class="r-mark">${ok ? '◎' : '△'}</span>
        </li>`;
    }).join('');
    const extras = [...Loadout.safety, ...Loadout.extra].map(id => `<span class="r-chip">${Art.icon(ITEM_BY_ID[id])}</span>`).join('');

    App.stage.appendChild(h(`
      <div class="receipt">
        <div class="shop-head">🧾 <span class="shop-method">${M.name}</span> の どうぐ</div>
        <div class="stars">${'★'.repeat(n)}<span>${'☆'.repeat(4 - n)}</span></div>
        <ul class="r-list">${rows}</ul>
        <div class="r-extra">${extras}</div>
      </div>`));

    if (n === 4) {
      Sfx.fanfare();
      confetti(App.stage);
      App.say('ぜんぶ ぴったり! すごい!\nこれなら めずらしい さかなも つれるかも!', 'wow');
    } else if (n >= 2) {
      App.say('いくつか ちがう どうぐが あるね。\nこのままでも つりは できるけど、つれにくいかも。えらびなおしてみる?', 'think');
    } else {
      App.say('どうぐが あまり あっていないみたい。\nこのままだと なかなか つれないよ。えらびなおしてみよう!', 'think');
    }

    App.setControls(
      App.btn('◀ えらびなおす', { cls: 'gray', onClick: () => App.go('shop', { shelf: 0 }) }),
      App.btn('つりに いく ▶', {
        cls: 'big green pulse',
        onClick: () => {
          Loadout.save();
          App.go(Save.data.safetyDone ? 'bait' : 'safety');
        },
      }),
    );
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
            App.setControls(App.btn(last ? 'じゅんびを しよう ▶' : 'つぎの やくそく ▶', {
              cls: 'big pulse green',
              onClick: () => {
                if (last) {
                  Save.data.safetyDone = true;
                  Save.write();
                  App.go('bait');
                } else { idx++; show(); }
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

/* ───────── 3. じゅんび（エサ・ルアーを つける） ───────── */
function targetArt(kind) {
  if (kind === 'basket') {
    return `
<svg viewBox="0 0 120 230" class="hook-svg" aria-hidden="true">
  <line x1="60" y1="0" x2="60" y2="110" stroke="#555" stroke-width="2"/>
  <rect x="25" y="110" width="70" height="80" rx="10" fill="#ffb74d" stroke="#e08a1e" stroke-width="4"/>
  <path d="M25 135 H95 M25 160 H95 M48 110 V190 M72 110 V190" stroke="#e08a1e" stroke-width="3"/>
  <line x1="60" y1="190" x2="60" y2="225" stroke="#555" stroke-width="2"/>
</svg>`;
  }
  if (kind === 'snap') {
    return `
<svg viewBox="0 0 120 230" class="hook-svg" aria-hidden="true">
  <line x1="60" y1="0" x2="60" y2="120" stroke="#b7e3f7" stroke-width="4"/>
  <circle cx="60" cy="126" r="7" fill="none" stroke="#8a949d" stroke-width="4"/>
  <path d="M60 133 q-20 6 -20 34 q0 28 20 34 q20 -6 20 -34 q0 -28 -20 -34" stroke="#8a949d" stroke-width="5" fill="none"/>
</svg>`;
  }
  return Art.hook();
}

Scenes.bait = {
  step: 2,
  enter() {
    if (!Loadout.ready()) { App.go('method'); return; }
    const b = ITEM_BY_ID[Loadout.gear.bait];
    const kind = b.id === 'amiebi' ? 'basket' : b.id === 'jig' ? 'snap' : 'hook';
    const label = { basket: 'コマセカゴ', snap: 'スナップ', hook: 'はり' }[kind];
    const verb = kind === 'basket' ? `${b.name}を カゴに つめよう!` : kind === 'snap' ? `${b.name}を スナップに つけよう!` : `${b.name}を はりに つけよう!`;
    App.say(`${verb}\n${b.name}を ゆびで うごかして、${label}まで もっていってね。`);

    const wrap = h(`
      <div class="bait">
        <div class="bait-left">
          <div class="worm drag-item">${Art.gear(b.art)}</div>
          <div class="cup">${b.name}</div>
        </div>
        <div class="bait-arrow">👉</div>
        <div class="bait-right">
          <div class="hook-box">${targetArt(kind)}<div class="hook-target"></div></div>
          <div class="hook-lbl">${label}</div>
        </div>
      </div>`);
    App.stage.appendChild(wrap);

    const worm = wrap.querySelector('.worm');
    const target = wrap.querySelector('.hook-target');
    const hookBox = wrap.querySelector('.hook-box');
    let drag = null;
    let done = false;
    let pos = { x: 0, y: 0 };

    const center = el => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };
    const moveTo = (dx, dy, smooth) => {
      pos = { x: dx, y: dy };
      worm.style.transition = smooth ? 'transform .45s ease' : 'none';
      worm.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const snapToTarget = () => {
      const a = center(worm), t = center(target);
      moveTo(pos.x + (t.x - a.x), pos.y + (t.y - a.y), true);
    };

    const success = () => {
      done = true;
      worm.classList.add('attached');
      hookBox.classList.add('baited');
      wrap.querySelector('.bait-arrow').textContent = '✨';
      Sfx.good();
      const msg = kind === 'basket'
        ? 'つめられたね! カゴを ふると アミエビが でて、さかなが あつまってくるよ。'
        : kind === 'snap'
          ? 'つけられたね! スナップは しっかり とじてね。ルアーの はりも とがっているから きをつけて。'
          : 'つけられたね! これで さかなが よってくるよ。\nほんとうの はりは とがっているから、おとなの ひとと いっしょに つけようね。';
      App.say(msg, 'wow');
      App.setControls(App.btn('うみへ いこう ▶', { cls: 'big pulse green', onClick: () => App.go('fishing') }));
    };

    worm.addEventListener('pointerdown', e => {
      if (done) return;
      worm.setPointerCapture(e.pointerId);
      drag = { sx: e.clientX - pos.x, sy: e.clientY - pos.y, moved: 0, ox: pos.x, oy: pos.y };
      worm.classList.add('dragging');
      Sfx.pop();
    });
    worm.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      drag.moved = Math.max(drag.moved, Math.hypot(dx - drag.ox, dy - drag.oy));
      moveTo(dx, dy, false);
    });
    const end = () => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      worm.classList.remove('dragging');
      const a = center(worm), t = center(target);
      const near = Math.hypot(a.x - t.x, a.y - t.y) < 110;
      if (near || moved < 12) {
        // ちかくで はなした・タップだけ → じどうで くっつく
        snapToTarget();
        App.after(480, success);
      } else {
        moveTo(0, 0, true);
        App.say(`おしい! もうすこし ${label}の ちかくまで もっていってね。`, 'think');
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
    if (!Loadout.ready()) { App.go('method'); return; }
    const M = Loadout.m;
    const useBobber = M.indicator === 'bobber';
    const isDrop = M.cast === 'drop';
    const isLure = Loadout.gear.bait === 'jig';
    const match = Loadout.matchCount();
    const glasses = Loadout.has('glasses');

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

    const line = E('line'), bob = E('bobber'), weight = E('weight');
    const shadow = E('fishShadow'), shadowInner = E('fishShadowInner');
    const kid = E('kid'), rod = E('rod'), fx = E('fx');
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

    // さおの しなり（a: ラジアン、おおきいほど したに まがる）
    const rodPoint = (a, k = 1) => ({
      x: BASE.x + k * (ROD.x * Math.cos(a) - ROD.y * Math.sin(a)),
      y: BASE.y + k * (ROD.x * Math.sin(a) + ROD.y * Math.cos(a)),
    });
    let TIP = rodPoint(0);

    const s = {
      phase: 'look', t: 0,
      bx: TIP.x, by: TIP.y, landX: 500, fu: 0, power: 0, inWater: false,
      dip: 0, dipCur: 0, bend: 0, bendCur: 0, shakeUntil: 0,
      bite: 'idle', round: 0, approach: null,
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
    // アタリを しらせる ばしょ（ウキ or さおさき）
    const cuePos = () => (useBobber ? { x: s.bx, y: WATER - 45 } : { x: TIP.x + 40, y: TIP.y - 25 });

    /* えがく */
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
      if (s.phase === 'reel') sag = s.struggling ? -4 : 10;
      const cx = (TIP.x + s.bx) / 2;
      const cy = Math.max(TIP.y, Math.min(endY, WATER)) + sag;
      line.setAttribute('d', `M${TIP.x.toFixed(1)} ${TIP.y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${s.bx.toFixed(1)} ${endY.toFixed(1)}`);
      line.classList.toggle('taut', s.phase === 'reel' && s.struggling);
    };

    /* フェーズ: うしろを みる → なげる / あしもとに おとす */
    const look = () => {
      s.phase = 'look';
      App.setStep(3);
      if (isDrop) {
        App.say(`${M.name}は、あしもとに しかけを そっと おとすよ。\nボタンを おしてね。`);
        App.setControls(App.btn('⬇️ そっと おとす', {
          cls: 'big pulse',
          onClick: b => { b.disabled = true; cast(0); },
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
            App.say('だれも いないね! よし!\nタイミングよく ボタンを おして、さおを なげよう。', 'wow');
            power();
          });
        },
      }));
    };

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
      s.startX = TIP.x;
      s.startY = TIP.y;
      s.landX = isDrop ? PIER + 50 : 360 + p * 360;
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
      s.inWater = true;
      Sfx.splash();
      ripple(s.bx, WATER, true);
      splash(s.bx);
      let msg;
      if (isDrop) msg = 'ぽちゃん! しかけが そこまで しずんでいくよ。';
      else if (s.power < 0.33) msg = 'ちかくに おちたね。ちかくにも さかなは いるよ!';
      else if (s.power < 0.7) msg = 'じょうず! ちょうど いい ところに おちたよ!';
      else msg = 'すごい! とおくまで とんだね!';

      let how;
      if (useBobber) how = 'ウキを よーく みてね。ぐーっと しずんだら「あわせる!」を おしてね。';
      else if (isLure) how = 'ルアーを ゆっくり まいて うごかすよ。さおさきが ぐいーっと まがったら「あわせる!」!';
      else how = 'さおの さきを よーく みてね。ぐいーっと まがったら「あわせる!」を おしてね。';
      const notes = [];
      if (glasses) notes.push('へんこう サングラスで みずの なかも みえるよ!');
      if (match < 4) notes.push('どうぐが すこし あっていないから、まつ じかんが ながいかも。');
      // ふきだしが ながく なりすぎないように、おしらせが あるときは みじかく
      App.say((notes.length ? how + '\n' + notes.join('') : msg + '\n' + how), 'wow');
      wait(true);
    };

    /* フェーズ: アタリを まつ */
    const wait = first => {
      s.phase = 'wait';
      s.bite = 'idle';
      s.dip = 0;
      s.bend = 0;
      App.setStep(4);
      const r = ++s.round;
      const hookBtn = App.btn('✊ あわせる!', { cls: 'big hook-btn', onClick: () => onHook(hookBtn) });
      App.setControls(hookBtn);

      const slow = 1 + (4 - match) * 0.5;
      let tt = ((first ? 6000 : 2500) + Math.random() * 2500) * slow;
      s.approach = glasses ? { t0: s.t, t1: s.t + tt / 1000 } : null;
      const nibbles = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < nibbles; i++) {
        App.after(tt, () => { if (s.round === r) nibble(); });
        tt += 1100 + Math.random() * 800;
      }
      App.after(tt + 400, () => { if (s.round === r) sink(r, hookBtn); });
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
      App.after(3400, () => {
        if (s.round !== r || s.phase !== 'wait') return;
        s.bite = 'gone';
        s.dip = 0;
        s.bend = 0;
        s.approach = null;
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

    /* フェーズ: いとを まく */
    const hooked = () => {
      s.round++;
      s.phase = 'reel';
      s.approach = null;
      App.setStep(5);
      s.fish = pickFish();
      s.dist = 100;
      s.tension = 0;
      s.struggling = false;
      s.strugCount = 0;
      s.nextSwitch = s.t + 2.6;
      s.reelStart = s.bx;
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
      s.bendCur += (s.bend - s.bendCur) * Math.min(1, dt * 10);

      if (s.phase === 'look' || s.phase === 'power') {
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
          // しかけが そこへ しずむ
          const target = isLure ? WATER + 40 : DEPTH;
          s.by += (target - s.by) * Math.min(1, dt * 2);
          if (isLure && s.bite === 'idle') s.bx = Math.max(PIER + 110, s.bx - dt * 9);
        }
        // へんこう サングラス: さかなが ちかづくのが みえる
        if (s.approach && s.bite !== 'gone') {
          const p = Math.min(1, (s.t - s.approach.t0) / Math.max(0.1, s.approach.t1 - s.approach.t0));
          shadow.setAttribute('opacity', (0.45 * Math.min(1, p * 3)).toFixed(2));
          shadowInner.setAttribute('transform', 'scale(-0.9,0.9)');
          const sx = s.bx + 40 + 170 * (1 - p);
          shadow.setAttribute('transform', `translate(${sx.toFixed(1)},${(useBobber ? WATER + 45 : s.by).toFixed(1)}) rotate(${Math.sin(s.t * 6) * 3})`);
        } else if (s.phase === 'wait') {
          shadow.setAttribute('opacity', '0');
        }
      } else if (s.phase === 'reel') {
        if (s.t >= s.nextSwitch) setStruggle(!s.struggling);
        s.bend = s.struggling ? 0.3 : 0.14;
        if (s.struggling) {
          s.dist = Math.min(100, s.dist + dt * 4);
          s.tension = Math.max(0, s.tension - dt * 18);
          if (Math.random() < dt * 3) ripple(s.bx);
        } else {
          s.tension = Math.max(0, s.tension - dt * 45);
        }
        const wig = s.struggling ? Math.sin(s.t * 22) * 7 : Math.sin(s.t * 4) * 2;
        const fxX = PIER + 25 + (s.reelStart - PIER - 25) * Math.max(0, s.dist) / 100;
        shadow.setAttribute('transform', `translate(${(fxX + wig).toFixed(1)},${WATER + 40 + (s.struggling ? 6 : 0)}) rotate(${wig})`);
        s.bx = fxX + wig * 0.5;
        s.by = useBobber ? WATER + 8 + (s.struggling ? 10 : 0) : WATER + 36;
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
    const icon = id => Art.icon(ITEM_BY_ID[id]);

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
    const factEl = wrap.querySelector('.caught-fact');

    const finish = text => {
      if (Loadout.has('towel')) text += '\nさいごに タオルで てを ふいて おしまい!';
      App.say(text, 'wow');
      if (first) {
        wrap.appendChild(h('<div class="medal">🏅 はじめての つり せいこう!<br>きみは つり めいじん!</div>'));
      }
      App.setControls(
        App.btn('🎣 もういちど つる', { cls: 'big pulse green', onClick: () => App.go('bait') }),
        App.btn('🏪 どうぐを かえる', { cls: '', onClick: () => App.go('method') }),
        App.btn('📖 ずかん', { cls: 'blue', onClick: () => App.go('zukan') }),
        App.btn('🏠', { cls: 'gray', onClick: () => App.go('title') }),
      );
    };

    // つった あとの あつかい（もっている どうぐで かわる）
    const handling = () => {
      const notes = [];
      if (fish.spiky) {
        notes.push(Loadout.has('grip')
          ? { ico: icon('grip'), text: 'フィッシュグリップで、とげに さわらずに つかめたね。' }
          : { ico: '<span class="emoji">⚠️</span>', text: `${fish.name}は とげや はが あるよ。フィッシュグリップが あると あんしん。` });
      } else {
        notes.push(Loadout.has('bucket')
          ? { ico: icon('bucket'), text: 'バケツの みずで てを ぬらしてから、やさしく さわろうね。' }
          : { ico: '<span class="emoji">🤲</span>', text: 'てを みずで ぬらしてから、やさしく さわろうね。' });
      }
      notes.push(Loadout.has('plier')
        ? { ico: icon('plier'), text: 'プライヤーで はりを はずせたね。' }
        : { ico: '<span class="emoji">🙋</span>', text: 'はりは おとなに はずしてもらおう。プライヤーが あると べんりだよ。' });

      wrap.classList.add('handling');
      factEl.replaceWith(h(`<ul class="notes">${notes.map(n => `<li><span class="n-ico">${n.ico}</span>${n.text}</li>`).join('')}</ul>`));
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
        App.btn('🧊 もってかえる', {
          onClick: () => {
            if (!Loadout.has('cooler')) {
              Sfx.oops();
              App.say('クーラーボックスが ないと、さかなが いたんじゃうよ。\nきょうは うみに かえしてあげよう。', 'think');
              return;
            }
            fishEl.classList.add('to-bucket');
            Sfx.pop();
            finish('クーラーボックスに いれよう。'
              + (Loadout.has('ice') ? 'こおりで ひえひえ!' : 'こおりも あると もっと いいね。')
              + '\nたべる ぶんだけ もってかえろうね。');
          },
        }),
      );
    };

    App.setControls(App.btn('つぎへ ▶', { cls: 'big pulse', onClick: handling }));
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
      const where = METHODS.filter(m => m.fish.includes(f.id)).map(m => m.name).join('・');
      const card = h(`
        <button class="zcard ${n ? '' : 'unknown'}">
          ${f.rare ? '<span class="zrare">レア</span>' : ''}
          ${Art.fish(f, { silhouette: !n })}
          <span class="zname">${n ? f.name : '？？？'}</span>
          <span class="zcount">${n ? `${n}ひき` : where}</span>
        </button>`);
      card.addEventListener('click', () => {
        if (n) { Sfx.pop(); App.say(`${f.name}。\n${f.fact}`); }
        else {
          Sfx.click();
          App.say(`まだ つれていない さかなだよ。\n${where}で つれるかも!${f.rare ? '\nどうぐが ぜんぶ ぴったりだと でてくる、めずらしい さかなだよ。' : ''}`, 'think');
        }
      });
      grid.appendChild(card);
    });
    App.stage.appendChild(wrap);

    App.setControls(
      App.btn('🎣 つりに いく', {
        cls: 'big green',
        onClick: () => (Loadout.ready() ? App.go('bait') : App.go('method')),
      }),
      App.btn('🏠 もどる', { cls: 'gray', onClick: () => App.go('title') }),
    );
  },
};

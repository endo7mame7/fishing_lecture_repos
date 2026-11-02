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
      ? App.btn('🎣 おなじ どうぐで つる', { cls: 'green', onClick: () => App.go('travel') })
      : null;
    App.setControls(
      App.btn('🏪 つりぐやさんへ', { cls: 'big pulse', onClick: () => App.go('shop') }),
      ...(again ? [again] : []),
      App.btn('📖 ずかん', { cls: 'blue', onClick: () => App.go('zukan') }),
    );
  },
};

/* ───────── 1. つりぐやさん（さお・しかけ・エサを えらぶ） ─────────
   opts.shelf: ひらく たな / opts.fix: レジから なおしに きた / opts.hint: おすすめの どうぐ */
Scenes.shop = {
  step: 0,
  clerk: true,
  enter(opts) {
    let idx = opts.shelf || 0;
    let firstVisit = !opts.fix;

    const render = () => {
      const sh = SHELVES[idx];
      const wrap = h(`
        <div class="shop">
          <div class="shop-tabs">
            ${SHELVES.map((s, i) => `<span class="tab ${i === idx ? 'now' : ''} ${Loadout.gear[s.id] && i !== idx ? 'done' : ''}">${i + 1}. ${s.title}</span>`).join('')}
          </div>
          <div class="shop-head">🏪 ${sh.title}</div>
          <div class="shelf shelf-few"></div>
        </div>`);
      const shelf = wrap.querySelector('.shelf');
      const cards = [];

      sh.items.forEach(it => {
        const card = h(`
          <button class="gcard ${Loadout.gear[sh.id] === it.id ? 'selected' : ''} ${opts.fix && opts.hint === it.id ? 'hint' : ''}">
            <span class="g-ico">${Art.icon(it)}</span>
            <span class="g-name">${it.name}</span>
            <span class="badge good">${Loadout.gear[sh.id] === it.id ? '✔' : ''}</span>
          </button>`);
        card.addEventListener('click', () => {
          Loadout.gear[sh.id] = it.id;
          cards.forEach(c => { c.classList.remove('selected'); c.querySelector('.badge').textContent = ''; });
          card.classList.add('selected');
          card.querySelector('.badge').textContent = '✔';
          Sfx.pop();
          App.say(it.say);
          next.classList.add('pulse');
        });
        cards.push(card);
        shelf.appendChild(card);
      });
      App.stage.replaceChildren(wrap);

      if (opts.fix) {
        App.say(`${sh.title}を えらびなおそう。\nおすすめは「${ITEM_BY_ID[opts.hint].name}」だよ。`);
      } else {
        App.say((firstVisit ? 'いらっしゃい! ここは つりぐやさん。\nさお・しかけ・エサの 3つを えらんで、レジに もってきてね。\n' : '') + `${idx + 1}つめは ${sh.title}。`);
      }
      firstVisit = false;

      const last = idx === SHELVES.length - 1;
      const next = App.btn(opts.fix || last ? '🧾 レジに もっていく ▶' : 'つぎの たな ▶', {
        cls: 'big green' + (Loadout.gear[sh.id] ? ' pulse' : ''),
        onClick: () => {
          if (!Loadout.gear[sh.id]) { App.say('どれか 1つ えらんでね。', 'think'); return; }
          if (opts.fix || last) App.go('check');
          else { idx++; render(); }
        },
      });
      const back = App.btn('◀', {
        cls: 'gray',
        onClick: () => {
          if (opts.fix) App.go('check');
          else if (idx === 0) App.go('title');
          else { idx--; render(); }
        },
      });
      App.setControls(back, next);
    };

    render();
  },
};

/* ───────── 1-b. レジ（てんいんさんが くみあわせを チェック） ───────── */
Scenes.check = {
  step: 0,
  clerk: true,
  enter() {
    if (!Loadout.picked()) { App.go('shop'); return; }
    const { method: M, wrong } = Loadout.check();
    const ok = wrong.length === 0;

    const rows = SHELVES.map((s, i) => {
      const it = ITEM_BY_ID[Loadout.gear[s.id]];
      const w = wrong.find(x => x.shelf.id === s.id);
      return `
        <li class="${w ? 'ng' : 'ok'}" data-i="${i}">
          <span class="r-ico">${Art.icon(it)}</span>
          <span class="r-txt"><small>${s.title}</small>${it.name}${w ? `<em>→「${w.best.name}」に しよう</em>` : ''}</span>
          ${w ? '<button class="fix-btn">なおす</button>' : '<span class="r-mark">⭕</span>'}
        </li>`;
    }).join('');

    const wrap = h(`
      <div class="receipt">
        <div class="shop-head">🧾 レジ</div>
        <ul class="r-list">${rows}</ul>
        ${ok ? `<div class="r-ok">これは <b>${M.name}</b> の どうぐ!</div>` : ''}
      </div>`);
    wrap.querySelectorAll('.fix-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Sfx.click();
        const i = +btn.closest('li').dataset.i;
        const w = wrong.find(x => x.shelf.id === SHELVES[i].id);
        App.go('shop', { shelf: i, fix: true, hint: w.best.id });
      });
    });
    App.stage.appendChild(wrap);

    if (ok) {
      Loadout.method = M.id;
      Loadout.save();
      Sfx.fanfare();
      confetti(App.stage);
      App.say(`ばっちり! これは「${M.name}」の どうぐだね。\n${M.desc}\nいってらっしゃい!`, 'wow');
      App.setControls(
        App.btn('◀ えらびなおす', { cls: 'gray', onClick: () => App.go('shop') }),
        App.btn('🌊 うみへ しゅっぱつ ▶', { cls: 'big green pulse', onClick: () => App.go('travel') }),
      );
    } else {
      Sfx.oops();
      const rig = ITEM_BY_ID[Loadout.gear.rig];
      const fixes = wrong.map(w => `${w.shelf.title}は「${w.best.name}」が ぴったりだよ。`).join('\n');
      const lead = Loadout.gear.rig === M.gear.rig
        ? `${rig.name}は「${M.name}」の しかけだね。`
        : `この くみあわせなら「${M.name}」が できるよ。`;
      App.say(`ちょっと まって! ${lead}\n${fixes}\n「なおす」を おしてね。`, 'think');
      // なおす ところが 1つなら、ボタンでも すぐ なおしに いける
      const first = wrong[0];
      App.setControls(App.btn(`🔧 ${first.shelf.title}を なおす`, {
        cls: 'big pulse',
        onClick: () => App.go('shop', { shelf: SHELVES.indexOf(first.shelf), fix: true, hint: first.best.id }),
      }));
    }
  },
};

/* ───────── うみへ いどう（まめちしき） ───────── */
Scenes.travel = {
  step: 1,
  enter() {
    const DUR = 10;
    const { type, item } = pickTip();
    let body;
    if (type === 'quiz') {
      body = `
        <div class="tip-q">${item.q}</div>
        <div class="tip-choices">
          ${shuffle([{ ...item.a, ok: true }, { ...item.b, ok: false }]).map(o =>
            `<button class="tip-choice" data-ok="${o.ok}"><span class="ico">${o.icon}</span><span>${o.label}</span><span class="mark"></span></button>`).join('')}
        </div>`;
    } else {
      body = `
        <div class="tip-body">
          <div class="tip-ico">${Art.icon(item)}</div>
          <div><div class="tip-name">${item.name}</div><div class="tip-text">${item.say}</div></div>
        </div>`;
    }
    const wrap = h(`
      <div class="travel">
        <div class="road">
          <div class="road-fill"></div>
          <span class="car">🚗</span>
          <span class="goal">🌊</span>
        </div>
        <div class="travel-lbl">うみへ いどうちゅう…</div>
        <div class="tip tip-${type}">
          <div class="tip-tag">${TIP_TAGS[type]}</div>
          ${body}
        </div>
      </div>`);
    App.stage.appendChild(wrap);
    const fill = wrap.querySelector('.road-fill');
    const car = wrap.querySelector('.car');
    const lbl = wrap.querySelector('.travel-lbl');

    let endAt = DUR;
    let answered = false;
    const reveal = picked => {
      answered = true;
      wrap.querySelectorAll('.tip-choice').forEach(b => {
        b.disabled = true;
        const ok = b.dataset.ok === 'true';
        if (ok) { b.classList.add('yes'); b.querySelector('.mark').textContent = '⭕'; }
        else if (b === picked) { b.classList.add('no'); b.querySelector('.mark').textContent = '❌'; }
      });
    };

    if (type === 'quiz') {
      App.say(`あんぜん クイズ!\n${item.q}`);
      wrap.querySelectorAll('.tip-choice').forEach(b => {
        b.addEventListener('click', () => {
          if (answered) return;
          const ok = b.dataset.ok === 'true';
          reveal(b);
          if (ok) { Sfx.good(); App.say('せいかい! ' + item.a.say, 'wow'); }
          else { Sfx.oops(); App.say(item.b.say, 'think'); }
          endAt = Math.max(endAt, t + 5); // せつめいを きく じかん
        });
      });
    } else {
      App.say(`${TIP_TAGS[type]}。${item.name}。\n${item.say}`);
    }

    let t = 0;
    App.loop(dt => {
      t += dt;
      if (type === 'quiz' && !answered && t > 6.5) {
        reveal(null);
        App.say(`こたえは「${item.a.label}」。\n${item.a.say}`);
        endAt = Math.max(endAt, t + 4.5);
      }
      const p = Math.min(1, t / endAt);
      fill.style.width = (p * 100) + '%';
      car.style.left = (p * 100) + '%';
      if (p > 0.85) lbl.textContent = 'もうすぐ つくよ!';
      if (t >= endAt) {
        App.go('prep');
        return false;
      }
    });
  },
};

/* ───────── 4〜6. なげる・まつ・まく ───────── */
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
      bite: 'idle', round: 0,
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
      App.setStep(2);
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
      App.say(msg + '\n' + how, 'wow');
      wait(true);
    };

    /* フェーズ: アタリを まつ */
    const wait = first => {
      s.phase = 'wait';
      s.bite = 'idle';
      s.dip = 0;
      s.bend = 0;
      App.setStep(3);
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
      App.setStep(4);
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
  step: 5,
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
    const factEl = wrap.querySelector('.caught-fact');

    const finish = text => {
      App.say(text, 'wow');
      if (first) {
        wrap.appendChild(h('<div class="medal">🏅 はじめての つり せいこう!<br>きみは つり めいじん!</div>'));
      }
      App.setControls(
        App.btn('🎣 もういちど つる', { cls: 'big pulse green', onClick: () => App.go('prep', { only: 'bait' }) }),
        App.btn('🏪 どうぐを かえる', { cls: '', onClick: () => App.go('shop') }),
        App.btn('📖 ずかん', { cls: 'blue', onClick: () => App.go('zukan') }),
        App.btn('🏠', { cls: 'gray', onClick: () => App.go('title') }),
      );
    };

    // つった あとの あつかい
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
          App.say(`まだ つれていない さかなだよ。\n${where}で つれるかも!${f.rare ? '\nめったに つれない、めずらしい さかなだよ。' : ''}`, 'think');
        }
      });
      grid.appendChild(card);
    });
    App.stage.appendChild(wrap);

    App.setControls(
      App.btn('🎣 つりに いく', {
        cls: 'big green',
        onClick: () => (Loadout.ready() ? App.go('travel') : App.go('shop')),
      }),
      App.btn('🏠 もどる', { cls: 'gray', onClick: () => App.go('title') }),
    );
  },
};

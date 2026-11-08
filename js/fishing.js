/* つり と つれた ばめん

   ながれ（どの つりかたも おなじ）
   1. なげる（さんにんしょう）: うしろから つりびとを みる。うしろを ひとが とおるので、いない ときに なげる
      ① リールを よこから みて、ベールを したに スワイプして おろす
      ② うえに スワイプして なげる（サビキ・さぐりは したに スワイプして あしもとに おとす）
   2. しずむ（てもと＋ワイプ）: しかけは ねらいの たなまで じどうで しずむ。ワイプで うみの なかが みえる
      たなに ついたら、ベールを うえに スワイプして もどす
   3. まつ（てもと＋ワイプ）: さかなが よってきて「つんつん」と つつく（かいすうは まいかい ちがう）
      「ぱくっ!」と たべた しゅんかんに、うえに スワイプか ボタンで あわせる
      はやすぎ（つんつんの とちゅう）でも、おそすぎても にげる
   4. やりとり（てもと＋ワイプ）: リールの ハンドルを ゆびで ぐるぐる まわして まく
      さかなが あばれたら まわすのを やめて まつ。あばれている ときに まくと いとが きれる
   5. とりこみ: ちいさい さかなは ぬきあげ、おおきい さかなは タモで すくう
*/

/* ───────── てもと してん ─────────
   d: きょり（0=あしもと 1=おき）、lat: よこ（-1=ひだり 1=みぎ） */
const FP = {
  pos(d, lat = 0) {
    const t = 1 - Math.max(0, Math.min(1, d));
    return { x: 400 + lat * (40 + 380 * t * t), y: 150 + 285 * t * t, k: 0.15 + 0.85 * t * t };
  },
  svg() {
    let waves = '';
    for (let i = 0; i < 18; i++) {
      const d = (i % 6) / 6 + 0.05, lat = ((i * 37) % 19) / 9.5 - 1;
      const p = FP.pos(d, lat), w = 24 * p.k + 4;
      waves += `<path d="M${(p.x - w).toFixed(0)} ${p.y.toFixed(0)} q${(w / 2).toFixed(0)} ${(-4 * p.k - 1).toFixed(1)} ${w.toFixed(0)} 0 t${w.toFixed(0)} 0"/>`;
    }
    return `
<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet" class="fp-svg view-svg">
  <defs>
    <linearGradient id="fpSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8f7"/><stop offset="1" stop-color="#e3f6ff"/></linearGradient>
    <linearGradient id="fpSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4aa6dc"/><stop offset="1" stop-color="#16609f"/></linearGradient>
    <linearGradient id="fpRodG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f6fb0"/><stop offset="1" stop-color="#1d4a78"/></linearGradient>
  </defs>
  <rect x="-2000" width="4800" height="152" fill="url(#fpSky)"/>
  <circle cx="120" cy="60" r="30" fill="#ffd54a"/><circle cx="120" cy="60" r="44" fill="#ffd54a" opacity=".25"/>
  <g fill="#fff" opacity=".9" class="cloud"><ellipse cx="560" cy="60" rx="50" ry="15"/><ellipse cx="590" cy="48" rx="28" ry="16"/></g>
  <path d="M600 152 Q640 128 690 152 Z" fill="#7cc58a"/><path d="M660 152 Q690 136 730 152 Z" fill="#62b072"/>
  <rect x="-2000" y="150" width="4800" height="300" fill="url(#fpSea)"/>
  <g class="fp-waves" stroke="#fff" stroke-opacity=".45" stroke-width="2" fill="none" stroke-linecap="round">${waves}</g>
  <g id="fpSpot"></g>
  <g id="fpTarget"></g>
  <g id="fpJump"></g>
  <g id="fpLand"></g>
  <path id="fpLine" fill="none" stroke="#f4f4f4" stroke-width="1.6" opacity=".95"/>
  <rect x="-2000" y="418" width="4800" height="400" fill="#a8743f"/>
  <path d="M-2000 418 H2800" stroke="#8a5c30" stroke-width="4"/>
  <path d="M120 418 L60 450 M320 418 L300 450 M520 418 L540 450" stroke="#8a5c30" stroke-width="2"/>
  <path id="fpRodLine" fill="none" stroke="#f4f4f4" stroke-width="1.4" opacity=".9"/>
  <path id="fpRod" fill="none" stroke="url(#fpRodG)" stroke-width="7" stroke-linecap="round"/>
  <path id="fpRodTip" fill="none" stroke="#1d4a78" stroke-width="3.5" stroke-linecap="round"/>
  <g transform="translate(640 392)">
    <path d="M10 -26 L22 -48" stroke="#555" stroke-width="7" stroke-linecap="round"/>
    <circle r="32" fill="#4a4f57"/><circle r="14" fill="#6b7078"/>
    <ellipse cx="-36" cy="-6" rx="13" ry="25" fill="#7fd88a" stroke="#3b7d4a" stroke-width="2"/>
    <path d="M28 8 h24" stroke="#333" stroke-width="6" stroke-linecap="round"/><circle cx="56" cy="8" r="8" fill="#333"/>
    <path id="fpBail" fill="none" stroke="#d6dbe0" stroke-width="5" stroke-linecap="round"/>
  </g>
  <path d="M700 470 Q660 420 700 395 Q750 380 790 420 L800 470 Z" fill="#f2c49b"/>
  <g id="fpNet"></g>
  <g id="fpFx"></g>
</svg>`;
  },
};

/* ───────── さんにんしょう（なげる ところ） ───────── */
const TP = {
  pos(d, lat = 0) {
    const t = 1 - Math.max(0, Math.min(1, d));
    return { x: 400 + lat * (60 + 300 * t * t), y: 178 + 150 * t * t, k: 0.2 + 0.8 * t * t };
  },
  svg() {
    return `
<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet" class="tp-svg view-svg">
  <defs>
    <linearGradient id="tpSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc8f7"/><stop offset="1" stop-color="#e3f6ff"/></linearGradient>
    <linearGradient id="tpSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4aa6dc"/><stop offset="1" stop-color="#1d6fb8"/></linearGradient>
  </defs>
  <rect x="-2000" width="4800" height="180" fill="url(#tpSky)"/>
  <circle cx="660" cy="70" r="30" fill="#ffd54a"/>
  <g fill="#fff" opacity=".9" class="cloud"><ellipse cx="220" cy="70" rx="50" ry="15"/><ellipse cx="250" cy="58" rx="28" ry="16"/></g>
  <path d="M80 178 Q130 150 190 178 Z" fill="#7cc58a"/>
  <rect x="-2000" y="176" width="4800" height="170" fill="url(#tpSea)"/>
  <g stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none" stroke-linecap="round">
    <path d="M300 200 q8 -4 16 0 t16 0"/><path d="M520 215 q10 -5 20 0 t20 0"/><path d="M180 240 q12 -6 24 0 t24 0"/>
    <path d="M620 260 q14 -6 28 0 t28 0"/><path d="M360 285 q16 -7 32 0 t32 0"/>
  </g>
  <g id="tpSpot"></g>
  <g id="tpFly"></g>
  <path d="M-2000 330 L2800 330 L2800 800 L-2000 800 Z" fill="#b98451"/>
  <path d="M-2000 330 H2800" stroke="#8a5c30" stroke-width="5"/>
  <path d="M-2000 380 H2800 M-2000 430 H2800" stroke="#a5713f" stroke-width="2"/>
  <path d="M250 330 L180 450 M400 330 L400 450 M550 330 L620 450" stroke="#a5713f" stroke-width="2"/>
  <g id="tpKid">
    <ellipse cx="400" cy="338" rx="38" ry="7" fill="#00000022"/>
    <rect x="382" y="292" width="13" height="46" rx="6" fill="#3b5ba5"/><rect x="405" y="292" width="13" height="46" rx="6" fill="#3b5ba5"/>
    <rect x="368" y="232" width="64" height="70" rx="20" fill="#ff8a3d"/>
    <path d="M380 236 V296 M420 236 V296" stroke="#ffd54a" stroke-width="5"/>
    <circle cx="400" cy="212" r="24" fill="#6b4a2e"/>
    <path d="M374 210 Q400 176 426 210 Z" fill="#4caf7a"/><rect x="370" y="205" width="60" height="9" rx="4" fill="#3d9466"/>
    <path d="M428 248 L446 262" stroke="#ff8a3d" stroke-width="14" stroke-linecap="round"/>
    <path d="M372 248 L420 266" stroke="#ff8a3d" stroke-width="14" stroke-linecap="round"/>
  </g>
  <g id="tpRod">
    <path d="M446 266 L560 120" stroke="#2f6fb0" stroke-width="6" stroke-linecap="round"/>
    <path d="M560 120 L590 82" stroke="#1d4a78" stroke-width="3" stroke-linecap="round"/>
    <circle cx="452" cy="276" r="11" fill="#4a4f57"/>
  </g>
  <path id="tpLine" fill="none" stroke="#f4f4f4" stroke-width="1.5"/>
  <circle cx="446" cy="264" r="9" fill="#f2c49b"/>
  <g id="tpPeople"></g>
  <g id="tpFx"></g>
</svg>`;
  },
  // とおる ひと（つりびとの うしろを あるくので おおきく みえる）
  person(v, walk, surprised) {
    const leg = Math.sin(walk) * 16;
    const c = v === 0 ? { body: '#8e6ccf', hat: '#e53935', skin: '#f6d2b0' } : { body: '#43a5a0', hat: '#ffd54a', skin: '#e9b88f' };
    const arms = surprised
      ? `<path d="M-24 -100 L-44 -142 M24 -100 L44 -142" stroke="${c.body}" stroke-width="13" stroke-linecap="round"/>`
      : `<path d="M-24 -100 L${(-30 + leg * 0.4).toFixed(1)} -56 M24 -100 L${(30 - leg * 0.4).toFixed(1)} -56" stroke="${c.body}" stroke-width="13" stroke-linecap="round"/>`;
    const face = surprised
      ? '<circle cx="6" cy="-150" r="3" fill="#222"/><circle cx="18" cy="-150" r="3" fill="#222"/><ellipse cx="12" cy="-137" rx="4" ry="6" fill="#7a2e2e"/>'
      : '<circle cx="10" cy="-150" r="3" fill="#222"/><path d="M4 -138 q6 4 12 0" stroke="#222" stroke-width="2" fill="none"/>';
    return `
      <ellipse cx="0" cy="2" rx="34" ry="7" fill="#00000026"/>
      <path d="M-8 -50 L${(-8 - leg).toFixed(1)} 0 M8 -50 L${(8 + leg).toFixed(1)} 0" stroke="#3a3a46" stroke-width="15" stroke-linecap="round"/>
      <rect x="-28" y="-118" width="56" height="74" rx="18" fill="${c.body}"/>
      ${arms}
      <circle cx="0" cy="-146" r="24" fill="${c.skin}"/>
      <path d="M-26 -152 Q0 -186 26 -152 Z" fill="${c.hat}"/>
      ${face}`;
  },
};

/* リールを よこから みた え（ベールを スワイプで うごかす） */
const REEL_PANEL = `
<svg viewBox="0 0 320 210" class="reel-svg">
  <rect x="0" y="0" width="320" height="210" rx="20" fill="#fffaf0"/>
  <path d="M10 40 H310" stroke="#2f6fb0" stroke-width="12" stroke-linecap="round"/>
  <path d="M10 40 H80" stroke="#c9a26b" stroke-width="16" stroke-linecap="round"/>
  <path d="M150 46 V82" stroke="#555" stroke-width="10"/>
  <circle cx="150" cy="122" r="46" fill="#4a4f57"/><circle cx="150" cy="122" r="18" fill="#6b7078"/>
  <path d="M106 122 h-26" stroke="#333" stroke-width="8" stroke-linecap="round"/><circle cx="76" cy="122" r="10" fill="#333"/>
  <rect x="196" y="92" width="34" height="62" rx="10" fill="#7fd88a" stroke="#3b7d4a" stroke-width="3"/>
  <path d="M200 104 H226 M200 116 H226 M200 128 H226 M200 140 H226" stroke="#3b7d4a" stroke-width="1.5"/>
  <path d="M226 100 L300 42" stroke="#9aa4ad" stroke-width="2"/>
  <g class="bail"><path d="M200 154 Q275 122 200 88" stroke="#9aa4ad" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="200" cy="154" r="7" fill="#8a949d"/><circle cx="200" cy="88" r="7" fill="#8a949d"/></g>
  <text x="250" y="196" text-anchor="middle" class="svg-lbl">ベール</text>
</svg>
<div class="reel-hint"><span class="reel-arrow"></span><span class="reel-txt"></span></div>`;

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
    st.innerHTML = `
      <div class="fp-layer">${FP.svg()}<div class="fp-flash"></div><div class="run-hint" hidden></div></div>
      <div class="tp-layer">${TP.svg()}</div>
      <div class="wipe" hidden><div class="wipe-in">${Art.seaScene()}</div><span class="wipe-lbl">🔍 うみの なか</span><span class="wipe-depth"></span></div>
      <div class="reel-panel" hidden>${REEL_PANEL}</div>
      <div class="cast-steps"></div>
      <div class="sea-hud">きょう 🐟 ${Today.fish}ひき${Today.junk ? ` ・ 🗑️ ${Today.junk}こ` : ''}</div>`;

    const NS = 'http://www.w3.org/2000/svg';
    const q$ = sel => st.querySelector(sel);
    const fpLayer = q$('.fp-layer'), tpLayer = q$('.tp-layer'), wipe = q$('.wipe'), panel = q$('.reel-panel');
    const fpSvg = fpLayer.querySelector('svg'), tpSvg = tpLayer.querySelector('svg');
    const wSvg = wipe.querySelector('svg');
    const stepsEl = q$('.cast-steps'), depthEl = q$('.wipe-depth');

    /* ── うみの なかの いち: x = ていぼうからの きょり、y = ふかさ ── */
    const WATER = 240, PIER = 218, BOTTOM = 362, FAR = 760, SPAN = FAR - PIER;
    const toD = x => Math.max(0, Math.min(1, (x - PIER) / SPAN));
    const depthM = y => Math.max(0, Math.round((y - WATER) / 30));

    // がめんの おおきさに あわせて みえる はばを かえる
    const fit = () => {
      const W = st.clientWidth, H = st.clientHeight;
      if (!W || !H) return;
      const vw = Math.max(800, 450 * W / H);
      [fpSvg, tpSvg].forEach(v => v.setAttribute('viewBox', `${(400 - vw / 2).toFixed(1)} 0 ${vw.toFixed(1)} 450`));
    };
    fit();
    window.addEventListener('resize', fit);

    /* ── ワイプ（うみの なか）の じゅんび ── */
    const W$ = id => wSvg.querySelector('#' + id);
    ['kid', 'rod', 'aim'].forEach(id => { const e = W$(id); if (e) e.style.display = 'none'; });
    wSvg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    const wLine = W$('line'), wBob = W$('bobber'), weight = W$('weight'), hookedG = W$('fishShadow'), hookedIn = W$('fishShadowInner');
    const schoolG = W$('school'), wFx = W$('fx');
    weight.insertAdjacentHTML('beforeend', `
      <g class="w-basket"><rect x="-9" y="-11" width="18" height="20" rx="3" fill="#ff9f43" stroke="#d07a20" stroke-width="2"/>
        <path d="M0 9 V40" stroke="#555" stroke-width="1"/><circle cx="-6" cy="18" r="2.5" fill="#ff7eb6"/><circle cx="6" cy="27" r="2.5" fill="#ff7eb6"/><circle cx="-6" cy="36" r="2.5" fill="#ff7eb6"/></g>
      <g class="w-bait"><path d="M0 -6 v8 q0 6 -5 6 q-5 0 -5 -5" stroke="#8a949d" stroke-width="2" fill="none"/><circle cx="-2" cy="6" r="5" fill="${Loadout.gear.bait === 'okiami' ? '#f48a9c' : '#b5533c'}"/></g>`);
    const showWeight = kind => {
      ['w-sinker', 'w-lure', 'w-basket', 'w-bait'].forEach(c => { weight.querySelector('.' + c).style.display = 'none'; });
      const on = { sinker: ['w-sinker', 'w-bait'], burakuri: ['w-sinker', 'w-bait'], lure: ['w-lure'], basket: ['w-basket'], bait: ['w-bait'] }[kind];
      on.forEach(c => { weight.querySelector('.' + c).style.display = ''; });
      weight.querySelector('.w-sinker').setAttribute('fill', kind === 'burakuri' ? '#e53935' : '#6b6f76');
    };
    showWeight({ choinage: 'sinker', lure: 'lure', sabiki: 'basket', saguri: 'burakuri', uki: 'bait' }[MODE]);
    weight.setAttribute('opacity', '1');
    wBob.style.display = useBobber ? '' : 'none';
    const leader = document.createElementNS(NS, 'path');
    leader.setAttribute('stroke', '#3c3c3c'); leader.setAttribute('stroke-width', '1.2'); leader.setAttribute('fill', 'none');
    wLine.parentNode.insertBefore(leader, wLine);

    /* ── つりばの せってい ── */
    const spotD = isDrop ? 0.08 : 0.4 + Math.random() * 0.45;
    const spotLat = isDrop ? 0 : (Math.random() - 0.5) * 1.1;
    const spotX = isDrop ? PIER + 80 : PIER + spotD * SPAN;
    let tana;
    if (MODE === 'sabiki' || MODE === 'lure') tana = WATER + 40 + Math.random() * 70;
    else if (MODE === 'uki') tana = WATER + 55;
    else tana = BOTTOM - 14;

    const rocks = MODE === 'choinage'
      ? [spotX - 80 - Math.random() * 50, spotX + 60 + Math.random() * 50].filter(x => x > PIER + 100 && x < 770)
      : [];
    const holes = MODE === 'saguri' ? [PIER + 30, PIER + 72, PIER + 114].map(x => ({ x, fish: false })) : [];
    if (holes.length) {
      const k = Math.floor(Math.random() * 3);
      holes[k].fish = true;
      if (Math.random() < 0.4) holes[(k + 1 + Math.floor(Math.random() * 2)) % 3].fish = true;
    }

    // うみの そこ・いわ・あな（さかなが いる あなは めが ひかる）・たなの せん
    const bed = document.createElementNS(NS, 'g');
    bed.innerHTML = `<path d="M0 ${BOTTOM + 8} Q200 ${BOTTOM} 400 ${BOTTOM + 6} T800 ${BOTTOM + 4} V450 H0 Z" fill="#d9c38f"/>`
      + rocks.map(x => `<ellipse cx="${x}" cy="${BOTTOM + 4}" rx="24" ry="14" fill="#6d6a62"/><ellipse cx="${x - 6}" cy="${BOTTOM}" rx="8" ry="4" fill="#8a877e"/>`).join('')
      + (MODE === 'saguri' ? [PIER + 9, PIER + 51, PIER + 93, PIER + 135].map(x => `<rect x="${x - 15}" y="${BOTTOM - 40}" width="30" height="50" rx="8" fill="#7d7a70"/>`).join('')
        + holes.map(hh => (hh.fish ? `<g class="hole-eye"><circle cx="${hh.x + 3}" cy="${BOTTOM - 4}" r="3" fill="#fff"/><circle cx="${hh.x + 3}" cy="${BOTTOM - 4}" r="1.6" fill="#222"/></g>` : '')).join('') : '')
      + (MODE === 'sabiki' || MODE === 'lure' ? `<path d="M0 ${tana} H800" stroke="#ffd54a" stroke-width="1.5" stroke-dasharray="6 5" opacity=".8"/><text x="${PIER + 6}" y="${tana - 4}" class="svg-lbl tana-lbl">たな</text>` : '');
    schoolG.parentNode.insertBefore(bed, schoolG);

    // ちいさい さかな（ワイプよう、みぎむき）
    const fishMini = k => {
      const f = FISH_BY_ID[M.fish[0]] || FISH[0];
      return `<g transform="scale(${(0.19 * k).toFixed(3)})"><svg x="-107" y="-68" width="214" height="136" viewBox="0 0 214 136">${Art.fish(f).replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, '')}</svg></g>`;
    };
    const school = (MODE === 'saguri' ? [] : [0, 1, 2]).map(i => {
      const g = document.createElementNS(NS, 'g');
      g.innerHTML = fishMini(i === 0 ? 1 : 0.8);
      schoolG.appendChild(g);
      return { g, ph: Math.random() * 6, dy: (i - 1) * 10 };
    });
    // さぐりづり: たべに でてくる さかな
    const holeFish = document.createElementNS(NS, 'g');
    if (MODE === 'saguri') { holeFish.innerHTML = fishMini(1); holeFish.setAttribute('opacity', '0'); schoolG.appendChild(holeFish); }
    const chumG = document.createElementNS(NS, 'g');
    schoolG.appendChild(chumG);

    /* ── じょうたい ── */
    const s = {
      phase: 'tp', sub: '', t: 0, first: true,
      bx: PIER, by: WATER, baitY: WATER, lat: 0, landD: 0.5, q: 0, taut: true, fallTo: tana,
      dip: 0, dipCur: 0, bend: 0, bendCur: 0, shakeUntil: 0, hold: false, bailOpen: false,
      bite: 'idle', round: 0, sinkT: 0, nice: false, eat: null, hookBtn: null,
      interest: 0, need: 3, idleT: 0, hinted: {},
      lastTwitch: -9, chum: 5, hole: 0, lastChon: -9, chons: 0, snagFails: 0, restY: WATER,
      dist: 100, struggling: false, nextSwitch: 0, strugCount: 0, tension: 0, holding: false, breakT: 0, warnT: 0, baraDone: false,
      catch: null, ui: null, cam: { x: spotX, y: WATER - 20 }, fly: 0, swing: 0,
      people: [], nextPerson: 1.0,
    };

    /* ── こうか ── */
    const fpFx = fpSvg.querySelector('#fpFx'), tpFx = tpSvg.querySelector('#tpFx');
    const addText = (layer, text, x, y, cls = '') => {
      const tx = document.createElementNS(NS, 'text');
      tx.setAttribute('x', x); tx.setAttribute('y', y);
      tx.setAttribute('text-anchor', 'middle');
      tx.setAttribute('class', 'float-text ' + cls);
      tx.textContent = text;
      layer.appendChild(tx);
      setTimeout(() => tx.remove(), 1600);
    };
    const fpText = (t, x, y, c) => addText(fpFx, t, x, y, c);
    const wText = (t, x, y, c) => addText(wFx, t, x, y, (c || '') + ' wipe-text');
    const ring = (layer, x, y, rx, ry) => {
      const e = document.createElementNS(NS, 'ellipse');
      e.setAttribute('cx', x); e.setAttribute('cy', y); e.setAttribute('rx', rx); e.setAttribute('ry', ry);
      e.setAttribute('class', 'ripple');
      layer.appendChild(e);
      setTimeout(() => e.remove(), 1200);
    };
    const entry = () => FP.pos(toD(s.bx), s.lat + (s.phase === 'reel' ? (s.runCur || 0) * 0.35 : 0));
    const fpRipple = big => { const p = entry(); ring(fpFx, p.x, p.y, (big ? 40 : 22) * p.k + 4, (big ? 10 : 6) * p.k + 1.5); };
    const fpSplash = n => {
      const p = entry();
      for (let i = 0; i < n; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', (3 + Math.random() * 3) * (0.5 + p.k));
        c.setAttribute('class', 'drop');
        c.style.setProperty('--dx', ((Math.random() - 0.5) * 90 * p.k) + 'px');
        c.style.setProperty('--dy', ((-25 - Math.random() * 50) * p.k) + 'px');
        fpFx.appendChild(c);
        setTimeout(() => c.remove(), 900);
      }
    };
    const chumBurst = (x, y) => {
      for (let i = 0; i < 12; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', x); c.setAttribute('cy', y);
        c.setAttribute('r', 1.5 + Math.random() * 2);
        c.setAttribute('class', 'chum');
        c.style.setProperty('--dx', ((Math.random() - 0.5) * 60) + 'px');
        c.style.setProperty('--dy', ((Math.random() - 0.3) * 36) + 'px');
        chumG.appendChild(c);
        setTimeout(() => c.remove(), 2600);
      }
    };
    const hintOnce = (key, text, mood = 'think') => {
      if (s.hinted[key]) return;
      s.hinted[key] = true;
      App.say(text, mood);
    };
    const setSteps = (list, now) => {
      stepsEl.innerHTML = list ? list.map((t, i) => `<span class="${i < now ? 'done' : i === now ? 'now' : ''}">${t}</span>`).join('') : '';
    };
    const view = v => {
      tpLayer.classList.toggle('off', v !== 'tp');
      fpLayer.classList.toggle('off', v !== 'fp');
      wipe.hidden = v !== 'fp';
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

    // スワイプ（dy < 0 が うえ）
    const onSwipe = (el, fn) => {
      let g = null;
      el.addEventListener('pointerdown', e => { g = { x: e.clientX, y: e.clientY, t: performance.now() }; try { el.setPointerCapture(e.pointerId); } catch (err) {} });
      el.addEventListener('pointerup', e => {
        if (!g) return;
        const dx = e.clientX - g.x, dy = e.clientY - g.y, dt = Math.max(16, performance.now() - g.t);
        g = null;
        fn({ dx, dy, dt });
      });
      el.addEventListener('pointercancel', () => { g = null; });
    };

    /* ═════ リールの ベール（よこから みて スワイプ） ═════ */
    let panelCb = null, panelDir = null;
    const reelPanel = (dir, cb) => {
      panelDir = dir;
      panelCb = cb;
      panel.hidden = false;
      panel.classList.toggle('open', dir === 'up'); // up = いま ひらいているので もどす
      panel.querySelector('.reel-arrow').className = 'reel-arrow ' + dir;
      panel.querySelector('.reel-txt').textContent = dir === 'down' ? 'ベールを したに スワイプして おろそう' : 'ベールを うえに スワイプして もどそう';
    };
    onSwipe(panel, ({ dy }) => {
      if (!panelDir) return;
      const want = panelDir;
      if ((want === 'down' && dy > 30) || (want === 'up' && dy < -30)) {
        panel.classList.toggle('open', want === 'down');
        s.bailOpen = want === 'down';
        Sfx.click();
        panelDir = null;
        const cb = panelCb;
        App.after(450, () => { panel.hidden = true; cb(); });
      } else if (Math.abs(dy) > 30) {
        Sfx.oops();
        App.say(want === 'down' ? 'ぎゃくだよ! ベールは したに スワイプして おろすよ。' : 'ぎゃくだよ! ベールは うえに スワイプして もどすよ。', 'think');
      }
    });

    /* ═════ なげる（さんにんしょう） ═════ */
    const peopleG = tpSvg.querySelector('#tpPeople');
    const tpRod = tpSvg.querySelector('#tpRod'), tpLine = tpSvg.querySelector('#tpLine'), tpFly = tpSvg.querySelector('#tpFly');
    const PIV = { x: 446, y: 266 };
    const tpTip = () => {
      const a = s.swing * Math.PI / 180, dx = 590 - PIV.x, dy = 82 - PIV.y;
      return { x: PIV.x + dx * Math.cos(a) - dy * Math.sin(a), y: PIV.y + dx * Math.sin(a) + dy * Math.cos(a) };
    };
    const danger = () => s.people.some(p => Math.abs(p.x - 400) < 150);
    if (!isDrop) {
      const p = TP.pos(spotD, spotLat);
      tpSvg.querySelector('#tpSpot').innerHTML = `
        <ellipse cx="${p.x.toFixed(0)}" cy="${p.y.toFixed(0)}" rx="${(30 * p.k + 12).toFixed(0)}" ry="${(6 * p.k + 3).toFixed(0)}" fill="#fff" opacity=".3"/>
        <g transform="translate(${p.x.toFixed(0)} ${(p.y - 40).toFixed(0)})">
          <path class="bird b1" d="M-24 0 q8 -8 16 0 q8 -8 16 0" stroke="#4a4f57" stroke-width="2.5" fill="none"/>
          <path class="bird b2" d="M4 -14 q6 -6 12 0 q6 -6 12 0" stroke="#4a4f57" stroke-width="2.5" fill="none"/>
        </g>`;
      const fp = FP.pos(spotD, spotLat);
      fpSvg.querySelector('#fpSpot').innerHTML = `
        <g transform="translate(${fp.x.toFixed(0)} ${(fp.y - 70 * fp.k - 30).toFixed(0)}) scale(${(0.6 + fp.k).toFixed(2)})">
          <path class="bird b1" d="M-30 0 q10 -10 20 0 q10 -10 20 0" stroke="#4a4f57" stroke-width="3" fill="none"/>
          <path class="bird b2" d="M6 -18 q8 -8 16 0 q8 -8 16 0" stroke="#4a4f57" stroke-width="3" fill="none"/>
        </g>`;
    }

    const updatePeople = dt => {
      s.nextPerson -= dt;
      if (s.nextPerson <= 0 && s.people.length < 1) {
        const dir = Math.random() < 0.5 ? 1 : -1;
        s.people.push({ x: dir > 0 ? -220 : 1020, dir, v: Math.floor(Math.random() * 2), walk: 0, stop: 0, speed: 110 + Math.random() * 40 });
        s.nextPerson = 5 + Math.random() * 5;
      }
      s.people.forEach(p => {
        if (p.stop > 0) p.stop -= dt;
        else { p.x += p.dir * p.speed * dt; p.walk += dt * 9; }
      });
      s.people = s.people.filter(p => p.x > -300 && p.x < 1100);
      // びっくりさせた ひとが とおりすぎたら、もういちど なげるように いう
      if (s.waitClear && !danger() && s.phase === 'tp-cast') {
        s.waitClear = false;
        App.say('ひとが とおりすぎたね! いまなら なげられるよ。\nうしろを みて、うえに シュッと スワイプ!', 'wow');
      }
      peopleG.innerHTML = s.people.map(p => `<g transform="translate(${p.x.toFixed(1)} 446) scale(${p.dir} 1)">${TP.person(p.v, p.walk, p.stop > 0)}</g>`
        + (p.stop > 0 ? `<text x="${p.x.toFixed(1)}" y="250" text-anchor="middle" class="tp-surprise">わっ!</text>` : '')).join('');
    };

    const tpPhase = () => {
      s.phase = 'tp-bail';
      s.round++;
      s.sub = '';
      s.bend = 0;
      s.eat = null;
      s.swing = 0;
      s.bailOpen = false;
      s.taut = true;
      s.dip = 0;
      hookedG.setAttribute('opacity', '0');
      weight.setAttribute('opacity', '1');
      if (useBobber) wBob.style.display = '';
      App.setStep(2);
      view('tp');
      App.setControls();
      const steps = isDrop ? ['① ベールを おろす', '② したに スワイプで おとす'] : ['① ベールを おろす', '② うしろを みて なげる'];
      setSteps(steps, 0);
      App.say(s.first
        ? 'まずは リールの ベール（はりがね）を おろそう。\nリールの えを したに スワイプしてね。'
        : 'もういちど なげよう! まずは ベールを おろしてね。', 'wow');
      reelPanel('down', () => {
        s.phase = 'tp-cast';
        setSteps(steps, 1);
        App.say(isDrop
          ? (MODE === 'sabiki' ? 'ベールを おろしたよ。がめんを したに スワイプして、あしもとに カゴを おとそう!' : 'ベールを おろしたよ。がめんを したに スワイプして、ブロックの あなに おとそう!')
          : 'つぎは なげるよ! うしろを ひとが とおっていないか よく みてね。\nとりの いる ポイントへ むけて、がめんを うえに シュッと スワイプ!', 'wow');
      });
    };

    onSwipe(tpLayer, ({ dx, dy, dt }) => {
      if (s.phase !== 'tp-cast') return;
      if (isDrop) {
        if (dy < 30) { App.say('したに スワイプして そっと おとそう。', 'think'); return; }
        s.lat = 0;
        s.bx = MODE === 'saguri' ? holes[s.hole].x : PIER + 55;
        s.landD = toD(s.bx);
        s.q = 1;
        s.phase = 'tp-fly';
        s.fly = 0;
        setSteps(null);
        Sfx.pop();
        return;
      }
      const up = -dy;
      if (up < 50) { App.say('うえに シュッと スワイプして なげよう!', 'think'); return; }
      // うしろに ひとが いたら びっくり!
      if (danger()) {
        s.people.forEach(p => { if (Math.abs(p.x - 400) < 150) p.stop = 1.4; });
        s.waitClear = true;
        s.swing = -25;
        App.after(300, () => { s.swing = 0; });
        Sfx.oops();
        App.say('わっ! うしろに ひとが いたよ! びっくりさせちゃったね。\nはりが ささると たいへん。ひとが とおりすぎてから なげよう。', 'think');
        return;
      }
      const H = st.clientHeight || 400, W = st.clientWidth || 800;
      const power = Math.max(0.05, Math.min(1, 0.6 * up / (H * 0.6) + 0.4 * (up / dt) / 2.2));
      s.lat = Math.max(-1, Math.min(1, dx / (W * 0.3)));
      s.landD = 0.12 + 0.86 * power;
      s.bx = PIER + s.landD * SPAN;
      s.q = Math.max(0, Math.min(1, 1 - Math.hypot((s.landD - spotD) * 2.5, (s.lat - spotLat) * 1.4)));
      s.phase = 'tp-fly';
      s.fly = 0;
      setSteps(null);
      Sfx.whoosh();
    });

    const drawTP = dt => {
      updatePeople(dt);
      if (s.phase === 'tp-fly') {
        s.fly = Math.min(1, s.fly + dt / (isDrop ? 0.5 : 1.0));
        if (!isDrop) s.swing = s.fly < 0.25 ? -70 * (s.fly / 0.25) : -70 + 85 * Math.min(1, (s.fly - 0.25) / 0.2);
        if (s.fly >= 1) { s.phase = 'tp-landed'; landed(); }
      }
      tpRod.setAttribute('transform', `rotate(${s.swing.toFixed(1)} ${PIV.x} ${PIV.y})`);
      const tip = tpTip();
      let p;
      if ((s.phase === 'tp-fly' && s.fly > 0.35) || s.phase === 'tp-landed') {
        const u = s.phase === 'tp-landed' ? 1 : (s.fly - 0.35) / 0.65;
        const end = isDrop ? { x: 520, y: 336 } : TP.pos(s.landD * u, s.lat * u);
        p = { x: tip.x + (end.x - tip.x) * u, y: tip.y + (end.y - tip.y) * u - Math.sin(Math.PI * u) * (isDrop ? 0 : 140) };
      } else {
        p = { x: tip.x, y: tip.y + 40 };
      }
      tpFly.innerHTML = `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${useBobber ? '#e53935' : '#6b6f76'}"/>`;
      tpLine.setAttribute('d', `M${tip.x.toFixed(1)} ${tip.y.toFixed(1)} Q${((tip.x + p.x) / 2).toFixed(1)} ${(Math.max(tip.y, p.y) + 10).toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
    };

    /* ═════ しずむ（てもと＋ワイプ） ═════ */
    const landed = () => {
      Sfx.splash();
      const tp = isDrop ? { x: 520, y: 336 } : TP.pos(s.landD, s.lat);
      ring(tpFx, tp.x, tp.y, 30, 7);
      let msg = '';
      if (!isDrop) {
        if (s.q > 0.75) { msg = 'どんぴしゃ! ポイントに はいったよ!'; Sfx.good(); addText(tpFx, 'どんぴしゃ!', tp.x, tp.y - 40, 'big'); }
        else {
          // どっちに ずれたか おしえる
          const tips = [];
          if (s.landD > spotD + 0.08) tips.push('とおすぎたよ。すこし みじかく スワイプしよう');
          else if (s.landD < spotD - 0.08) tips.push('ちかすぎたよ。もっと ながく シュッと スワイプしよう');
          if (s.lat > spotLat + 0.25) tips.push('みぎに ずれたよ');
          else if (s.lat < spotLat - 0.25) tips.push('ひだりに ずれたよ');
          msg = (s.q > 0.35 ? 'おしい! ポイントの ちかくだよ。' : 'ポイントから はなれちゃった。') + (tips.length ? '\n' + tips.join('。') + '。' : '');
        }
      }
      s.first = false;
      App.after(isDrop ? 300 : 800, () => startFall(msg));
    };

    const fallTarget = () => (MODE === 'saguri' ? BOTTOM - 14 : MODE === 'choinage' ? BOTTOM : tana);
    const startFall = msg => {
      s.phase = 'fall';
      s.by = WATER;
      s.baitY = WATER;
      s.taut = false;
      s.bailOpen = true;
      s.fallTo = fallTarget();
      s.cam = { x: Math.max(PIER + 120, Math.min(FAR - 110, s.bx)), y: WATER - 30 };
      view('fp');
      setSteps(null);
      App.setStep(3);
      App.setControls();
      fpRipple(true);
      fpSplash(6);
      App.say((msg ? msg + '\n' : '') + (MODE === 'choinage' || MODE === 'saguri'
        ? 'しかけが そこまで しずんでいくよ。ワイプで うみの なかを みてね。'
        : `しかけが ねらいの たな（${depthM(tana)}m）まで しずんでいくよ。ワイプで みてね。`), 'wow');
    };

    const updateFall = dt => {
      const y = useBobber ? s.baitY : s.by;
      const ny = Math.min(s.fallTo, y + 45 * dt);
      if (useBobber) { s.baitY = ny; s.by = WATER; } else s.by = ny;
      if (ny >= s.fallTo) {
        s.phase = 'bail-close';
        wText('とうちゃく!', s.bx, ny - 16, 'small');
        App.say(MODE === 'choinage' || MODE === 'saguri'
          ? 'そこに ついたよ! ベールを もどして いとを とめよう。\nリールの えを うえに スワイプ!'
          : 'たなに ついたよ! ベールを もどして いとを とめよう。\nリールの えを うえに スワイプ!', 'wow');
        reelPanel('up', () => { s.taut = true; startMode(s.firstMode !== false); s.firstMode = false; });
      }
    };


    // もういちど なげる
    const recast = msg => {
      s.round++;
      s.phase = 'wait-recast';
      s.eat = null;
      if (msg) App.say(msg);
      App.setControls();
      App.after(msg ? 1800 : 0, tpPhase);
    };

    /* ═════ アタリ: つんつんの かずは まいかい ちがう。ぱくっと たべた しゅんかんに あわせる ═════
       つんつんの とちゅうで あわせると「はやすぎ」、ぱくっの あと おくれると「おそい」で にげる */
    const HOOK_WINDOW = 1.2; // ぱくっ から この びょうすう いないに あわせる
    const NICE_WINDOW = 0.45; // これより はやいと ナイス あわせ
    const baitPos = () => ({ x: s.bx, y: useBobber ? s.baitY : s.by });
    const biteSeq = () => {
      s.phase = 'bite';
      s.bite = 'idle';
      s.fishSt = 'near';
      const r = ++s.round;
      s.eat = { mode: 'near', t0: s.t };
      const n = 1 + Math.floor(Math.random() * 4); // つんつんは 1〜4かい
      let tt = 500 + Math.random() * 600;
      for (let i = 0; i < n; i++) {
        App.after(tt, () => { if (s.round === r) nibble(); });
        tt += 700 + Math.random() * 900;
      }
      App.after(tt, () => { if (s.round === r) sink(r); });
    };

    const nibble = () => {
      s.bite = 'nibble';
      s.eat = { mode: 'peck', t0: s.t };
      Sfx.nibble();
      const b = baitPos();
      wText('つんつん', b.x, b.y - 18, 'small');
      if (useBobber) {
        s.dip = 9;
        fpRipple();
        App.after(200, () => { if (s.bite === 'nibble') s.dip = 0; });
        fpText('ちょん', entry().x + 40, entry().y - 30, 'small');
      } else {
        s.shakeUntil = s.t + 0.45;
        fpText('ぷるぷる', 470, 80, 'small');
      }
      App.after(450, () => { if (s.bite === 'nibble' && s.eat && s.eat.mode === 'peck') s.eat = { mode: 'near', t0: s.t }; });
    };

    const sink = r => {
      s.bite = 'sink';
      s.sinkT = s.t;
      s.eat = { mode: 'bite', t0: s.t };
      Sfx.sink();
      const b = baitPos();
      wText('ぱくっ!', b.x, b.y - 20, 'big');
      if (useBobber) {
        s.dip = 30;
        fpRipple(true);
        fpText('ぐぐーっ!', entry().x, entry().y - 50, 'big');
      } else {
        s.bend = 0.32;
        fpText('ぐいーっ!', 520, 120, 'big');
      }
      if (s.hookBtn) { s.hookBtn.classList.add('now'); s.hookBtn.innerHTML = '✊ いまだ! あわせる! <small>うえに シュッ</small>'; }
      const fl = fpLayer.querySelector('.fp-flash');
      fl.classList.add('on');
      App.after(500, () => fl.classList.remove('on'));
      App.after(HOOK_WINDOW * 1000, () => { if (s.round === r && s.phase === 'bite') fishFlee('late'); });
    };

    const resetHookBtn = () => {
      if (!s.hookBtn) return;
      s.hookBtn.classList.remove('now');
      s.hookBtn.innerHTML = '✊ あわせる! <small>うえに シュッ</small>';
    };

    // あわせる タイミングを まちがえると にげる
    const fishFlee = why => {
      s.round++;
      s.phase = 'mode';
      s.bite = 'idle';
      s.dip = 0;
      s.bend = 0;
      s.fishSt = 'leaving';
      s.eat = null;
      resetHookBtn();
      Sfx.oops();
      wText(why === 'early' ? 'びっくり!' : 'ごちそうさま', s.tgtPos.x, s.tgtPos.y - 18, 'small');
      App.say(why === 'early'
        ? 'はやすぎ! まだ「つんつん」だったよ。\nさかなが びっくりして にげちゃった。ぱくっと たべるまで まとう!'
        : 'おそい! エサだけ とられちゃった。\nぱくっと たべたら すぐ あわせよう!', 'think');
      App.after(1200, () => { if (s.phase === 'mode' && s.fishSt === 'leaving') newTarget(2.5); });
    };

    const onHook = () => {
      if (s.phase === 'bite') {
        if (s.bite === 'sink') hooked();
        else fishFlee('early');
      } else if (s.phase === 'mode' && !s.sub) {
        Sfx.oops();
        App.say('まだ さかなが きていないよ。\nワイプを みて まってね。', 'think');
      }
    };
    // てもと がめんを うえに スワイプで アワセ
    onSwipe(fpLayer, ({ dy }) => {
      if (dy < -40 && (s.phase === 'bite' || s.phase === 'mode')) {
        fpText('くいっ!', 430, 90, 'small');
        onHook();
      }
    });

    /* ── いとが きれる・バレる ── */
    const lineBreak = why => {
      s.round++;
      s.phase = 'broken';
      s.bend = 0;
      s.hold = false;
      Sfx.strain();
      Sfx.oops();
      fpText('ぷつん!', 430, 140, 'big');
      hookedG.setAttribute('opacity', '0');
      weight.setAttribute('opacity', '0');
      wBob.style.display = 'none';
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
      hookedG.setAttribute('opacity', '0');
      fpText('バレた…', 430, 140, 'big');
      fpSplash(8);
      App.setControls();
      App.say('あっ! はりが はずれて にげちゃった（バレた）…\nすぐに あわせると がっちり かかって バレにくいよ。', 'think');
      App.after(2600, () => recast());
    };

    /* ═════ まつ: さかなが よってきて、エサを つつく ═════ */
    const tgt = document.createElementNS(NS, 'g');
    const tgtImg = document.createElementNS(NS, 'g');
    tgt.appendChild(tgtImg);
    tgt.setAttribute('opacity', '0');
    schoolG.appendChild(tgt);
    s.tgtPos = { x: spotX + 140, y: tana };

    const newTarget = delay => {
      s.target = pickFish();
      s.fishSt = 'away';
      s.side = Math.random() < 0.5 ? -1 : 1;
      s.approachT = s.t + (delay + Math.random() * 2) * (1.4 - 0.7 * s.q);
      s.tgtPos = { x: s.bx + 150 * s.side, y: baitPos().y + 10 };
      const f = s.target, k = 0.13 + (f.size[1] / 400);
      tgtImg.innerHTML = `<g transform="scale(${k.toFixed(3)})"><svg x="-107" y="-68" width="214" height="136" viewBox="0 0 214 136">${Art.fish(f).replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, '')}</svg></g>`;
    };
    const fishAllowed = () => {
      if (MODE === 'saguri') return holes[s.hole].fish;
      if (MODE === 'lure' || MODE === 'choinage') return Math.abs(s.bx - spotX) < 170;
      return true;
    };

    const modeControls = () => {
      const hookBtn = App.btn('✊ あわせる! <small>うえに シュッ</small>', { cls: 'big hook-btn', onClick: () => onHook() });
      s.hookBtn = hookBtn;
      const btns = [hookBtn];
      if (MODE === 'saguri') btns.push(App.btn('➡️ となりの あなへ', { cls: 'gray', onClick: saguriNext }));
      if (!isDrop) btns.push(App.btn('↩️ なげなおす', { cls: 'gray', onClick: () => { if ((s.phase === 'mode' || s.phase === 'bite') && !s.sub) recast('しかけを まいて かいしゅう! もういちど なげよう。'); } }));
      App.setControls(...btns);
    };

    const startMode = first => {
      s.phase = 'mode';
      s.sub = '';
      App.setStep(3);
      s.taut = true;
      s.restY = useBobber ? s.baitY : s.by;
      s.bounce = 0;
      s.hinted.far = false; // なげるたびに「とおい」ヒントを だせるように
      newTarget(first ? 2 : 1.2);
      modeControls();
      if (first) {
        App.say('ワイプを みていてね。さかなが よってきて「つんつん」と つつくよ。\nそのあと「ぱくっ!」と たべた しゅんかんに あわせよう! はやすぎても おそすぎても にげちゃうよ。', 'wow');
      }
    };

    const updateMode = dt => {
      // しかけの うごき
      s.bounce *= Math.exp(-dt * (isDrop ? 3 : 6));
      if (MODE === 'lure') s.restY += (tana - s.restY) * Math.min(1, dt * 0.5);
      if (MODE === 'saguri') s.restY += (BOTTOM - 14 - s.restY) * Math.min(1, dt * 2);
      const y = s.restY - s.bounce;
      if (useBobber) s.baitY = y; else s.by = y;
      if (s.sub === 'move') { updateSaguriMove(dt); return; }
      // サビキ: カゴから ときどき エサが でて さかなを よぶ
      if (MODE === 'sabiki' && s.t > (s.nextChum || 0)) { chumBurst(s.bx, s.by); s.nextChum = s.t + 2.5; }

      // さかなが よってくる → つつきはじめる
      if (s.fishSt === 'away' && s.t >= s.approachT) {
        if (fishAllowed()) { s.fishSt = 'coming'; s.comeT = s.t; }
        else if (!isDrop) hintOnce('far', 'ポイントから はなれているみたい。\n「なげなおす」で、とりの いる ところを ねらって なげよう!');
      } else if (s.fishSt === 'coming' && s.t - s.comeT > 1.4) {
        biteSeq();
      }
    };

    // さぐりづり: となりの あなへ
    const saguriNext = () => {
      if ((s.phase !== 'mode' && s.phase !== 'bite') || s.sub) return;
      s.round++;
      s.phase = 'mode';
      s.bite = 'idle';
      s.eat = null;
      s.hole = (s.hole + 1) % holes.length;
      s.bx = holes[s.hole].x;
      s.restY = WATER + 10;
      s.by = s.restY;
      s.sub = 'move';
      s.fishSt = 'away';
      App.setControls();
      Sfx.pop();
    };
    const updateSaguriMove = dt => {
      s.restY = Math.min(BOTTOM - 14, s.restY + 80 * dt);
      s.by = s.restY;
      if (s.restY >= BOTTOM - 14) {
        s.sub = '';
        App.say(holes[s.hole].fish
          ? `${s.hole + 1}ばんめの あなに ついたよ。ワイプを みて まってね。`
          : `${s.hole + 1}ばんめの あなに ついたよ。…さかなの めが みえないね。となりも さがしてみよう。`);
        newTarget(1);
        modeControls();
      }
    };

    /* ═════ やりとり: くるくる まく。あばれたら てを とめる ═════ */
    const decideCatch = () => {
      if (Save.total() > 0 && Math.random() < 0.08) return { junk: JUNK[Math.floor(Math.random() * JUNK.length)] };
      const fish = s.target || pickFish();
      const [lo, hi] = fish.size;
      const bonus = s.q * 0.15 + (s.nice ? 0.12 : 0);
      const raw = lo + (hi - lo) * Math.pow(Math.random(), 1.4);
      const size = Math.min(hi, Math.round(raw * (1 + bonus)));
      const multi = MODE === 'sabiki' ? 1 + (Math.random() < 0.4 ? 1 : 0) + (Math.random() < 0.15 ? 1 : 0) : 1;
      return { fish, size, multi };
    };

    const runHint = fpLayer.querySelector('.run-hint');
    const fightControls = () => {
      const ui = h(`
        <div class="fight-ui">
          <div class="reel-status calm">ぐるぐる まわして まこう!</div>
          <div class="fight-row"><span>いと</span><div class="tbar"><div class="tzone"></div><div class="tfill"></div></div></div>
          <div class="fight-row"><span>きょり</span><div class="dbar"><span class="d-fish">🐟</span><span class="d-me">🧒</span></div></div>
        </div>`);
      s.ui = { status: ui.querySelector('.reel-status'), fill: ui.querySelector('.tfill'), bar: ui.querySelector('.tbar'), dfish: ui.querySelector('.d-fish') };
      // リールの ハンドルを ゆびで まわす
      const crank = h(`
        <div class="crank">
          <svg viewBox="-60 -60 120 120">
            <circle r="54" class="crank-ring"/>
            <circle r="12" fill="#555"/>
            <g class="crank-arm"><path d="M0 0 L36 0" stroke="#333" stroke-width="10" stroke-linecap="round"/><circle cx="38" cy="0" r="15" class="crank-knob"/></g>
          </svg>
          <span class="crank-lbl">↻ ぐるぐる</span>
        </div>`);
      const arm = crank.querySelector('.crank-arm');
      let last = null;
      const ang = e => { const r = crank.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)); };
      crank.addEventListener('pointerdown', e => { last = ang(e); try { crank.setPointerCapture(e.pointerId); } catch (err) {} });
      crank.addEventListener('pointermove', e => {
        if (last === null) return;
        const a = ang(e);
        let d = a - last;
        if (d > Math.PI) d -= 2 * Math.PI;
        if (d < -Math.PI) d += 2 * Math.PI;
        last = a;
        s.crankAcc += d;
        s.crankAng += d;
        arm.setAttribute('transform', `rotate(${(s.crankAng * 180 / Math.PI).toFixed(1)})`);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => crank.addEventListener(ev, () => { last = null; }));
      App.setControls(ui, crank);
    };

    const hooked = () => {
      s.nice = s.t - s.sinkT < NICE_WINDOW;
      s.round++;
      s.phase = 'reel';
      s.eat = null;
      s.hold = false;
      s.hookBtn = null;
      App.setStep(4);
      s.catch = decideCatch();
      s.dist = 100;
      s.tension = 0;
      s.breakT = 0;
      s.baraDone = false;
      s.run = 0;
      s.runCur = 0;
      s.strugCount = 0;
      s.nextSwitch = s.t + calmTime();
      s.reelStart = s.bx;
      s.reelDepth = useBobber ? s.baitY : s.by;
      s.dip = 0;
      s.crankAcc = 0;
      s.crankV = 0;
      s.crankAng = 0;
      tgt.setAttribute('opacity', '0');
      const f = s.catch.fish;
      const sz = (s.catch.size || 20) * (s.catch.multi || 1) ** 0.5;
      s.power = f ? 0.8 + sz / (sz + 30) + (f.rare ? 0.3 : 0) : 1.3;
      const sc = f ? 0.2 + sz / 160 : 0.5;
      hookedIn.innerHTML = f
        ? `<g transform="scale(${sc.toFixed(2)})"><svg x="-190" y="-68" width="214" height="136" viewBox="0 0 214 136">${Art.fish(f).replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, '')}</svg></g>`
        : `<text x="0" y="10" text-anchor="middle" font-size="30">${s.catch.junk.icon}</text>`;
      hookedIn.removeAttribute('transform');
      hookedG.setAttribute('opacity', '1');
      holeFish.setAttribute('opacity', '0');
      Sfx.good();
      fpText(s.nice ? 'ナイス あわせ!' : 'かかった!', 430, 110, 'big');
      fpSplash(8);
      App.say((s.nice ? 'ナイス あわせ!\n' : 'かかった!\n')
        + 'リールの ハンドルを ゆびで ぐるぐる まわして まこう!\nさかなが あばれたら、まわすのを やめて まってね!', 'wow');
      fightControls();
    };

    // つぎに あばれるまでの じかんは ランダム。ときどき すぐ また あばれる
    const calmTime = () => (Math.random() < 0.2 ? 0.5 + Math.random() * 0.6 : 1.2 + Math.random() * 3.3);
    const setRun = on => {
      if (on) {
        s.run = Math.random() < 0.5 ? -1 : 1;
        s.strugCount++;
        // あばれる ながさも ランダム（おおきい さかなほど ながめ）
        s.nextSwitch = s.t + (0.8 + Math.random() * 1.6) * Math.min(1.3, s.power);
        if (s.strugCount <= 2) App.say('さかなが あばれてる!\nハンドルを まわすのを やめて、おとなしく なるまで まとう!', 'think');
        Sfx.splash();
        fpSplash(6);
        if (!s.baraDone && s.strugCount >= 2) {
          s.baraDone = true;
          if (Math.random() < (s.nice ? 0.08 : 0.2)) { App.after(500, () => { if (s.phase === 'reel') barashi(); }); return; }
        }
        if (s.catch.fish && s.dist < 85 && Math.random() < 0.45) jump();
      } else {
        s.run = 0;
        s.nextSwitch = s.t + calmTime();
        if (s.strugCount <= 2) App.say('おとなしく なったよ。いまだ! ぐるぐる まこう!');
      }
    };

    // さかなが みずから とびだす（てもと がめん）
    const jump = () => {
      const f = s.catch.fish;
      const p0 = entry();
      const g = document.createElementNS(NS, 'g');
      const w = 60 + 120 * p0.k;
      g.innerHTML = `<svg x="${(-w / 2).toFixed(1)}" y="${(-w * 0.32).toFixed(1)}" width="${w.toFixed(1)}" height="${(w * 0.64).toFixed(1)}" viewBox="0 0 214 136">${Art.fish(f).replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, '')}</svg>`;
      fpSvg.querySelector('#fpJump').appendChild(g);
      fpText('ばしゃっ!', p0.x, p0.y - 100 * p0.k - 40, 'big');
      let t = 0;
      App.loop(dt => {
        t += dt / 0.8;
        const y = p0.y - Math.sin(Math.PI * Math.min(1, t)) * (60 + 120 * p0.k);
        g.setAttribute('transform', `translate(${p0.x.toFixed(1)},${y.toFixed(1)}) rotate(${(-40 + t * 80).toFixed(1)})`);
        if (t >= 1) { g.remove(); fpSplash(9); Sfx.splash(); return false; }
      });
    };

    const reelUpdate = dt => {
      if (s.t >= s.nextSwitch && !s.catch.junk) setRun(s.run === 0);
      if (s.phase !== 'reel') return;
      // ハンドルの まわる はやさ（とけいまわりだけ）
      const v = s.crankAcc / Math.max(dt, 0.001);
      s.crankAcc = 0;
      s.crankV += (v - s.crankV) * Math.min(1, dt * 6);
      if (s.crankV < -3) hintOnce('ccw', 'ぎゃくまわしだよ! とけいの はりと おなじ むきに まわそう。');
      const r = Math.max(0, Math.min(1.6, s.crankV / 10));
      if (r > 0.1 && Math.random() < dt * 8 * r) Sfx.reel();
      s.runCur += (s.run - s.runCur) * Math.min(1, dt * 3);

      const running = s.run !== 0;
      const waiting = running && r <= 0.1; // あばれている ときに てを とめて まっている
      if (running) {
        s.dist += 3 * dt; // さかなが ひっぱる
        if (waiting) s.tension -= 30 * dt;
        else s.tension += 85 * r * dt; // あばれている ときに まくと いとが はる
      } else {
        s.dist -= (16 / Math.sqrt(s.power)) * r * dt;
        s.tension += (20 + 8 * s.power) * r * dt;
        if (r < 0.1) s.tension -= 55 * dt;
      }
      s.tension = Math.min(100, Math.max(0, s.tension));
      s.dist = Math.min(100, s.dist);
      if (s.tension >= 100) {
        s.breakT += dt;
        if (s.breakT > 0.9) { runHint.hidden = true; lineBreak('fight'); return; }
      } else {
        s.breakT = Math.max(0, s.breakT - dt);
      }
      if (s.tension > 85 && s.t - s.warnT > 2) {
        s.warnT = s.t;
        Sfx.strain();
        s.ui.bar.classList.remove('flash'); void s.ui.bar.offsetWidth; s.ui.bar.classList.add('flash');
        fpText('きれそう!', 430, 130, 'small');
      }
      s.bend = 0.1 + s.tension / 400 + (running ? 0.08 : 0);

      s.ui.fill.style.width = s.tension + '%';
      s.ui.fill.classList.toggle('danger', s.tension > 70);
      s.ui.dfish.style.left = (s.dist * 0.88) + '%';
      let msg, cls;
      if (s.tension > 85) { msg = 'きれちゃう! まわすのを やめて!'; cls = 'fight'; }
      else if (running && waiting) { msg = 'そのまま まって…'; cls = 'calm'; }
      else if (running) { msg = 'あばれてる! まわすのを やめて!'; cls = 'fight'; }
      else { msg = r > 0.1 ? 'いいぞ! まいてる!' : 'ぐるぐる まわして まこう!'; cls = 'calm'; }
      if (s.ui.status.textContent !== msg) { s.ui.status.textContent = msg; s.ui.status.className = 'reel-status ' + cls; }
      runHint.hidden = !running;
      if (running) runHint.textContent = waiting ? '✋ そのまま まって…' : '✋ ストップ! まわさないで!';
      runHint.classList.toggle('ok', waiting);

      // さかなが ちかづいて、あさく なってくる
      const k = Math.max(0, s.dist) / 100;
      const wig = running ? Math.sin(s.t * 22) * 6 : Math.sin(s.t * 4) * 2;
      s.bx = PIER + 25 + (s.reelStart - PIER - 25) * k + wig * 0.5 + s.runCur * 20;
      s.by = WATER + 25 + (s.reelDepth - WATER - 25) * k + (running ? 6 : 0);
      if (useBobber) s.baitY = s.by;
      hookedG.setAttribute('transform', `translate(${s.bx.toFixed(1)},${s.by.toFixed(1)}) rotate(${(wig * 2).toFixed(1)}) scale(${s.runCur < -0.2 ? -1 : 1},1)`);
      if (running && Math.random() < dt * 3) fpRipple();
      if (s.dist <= 0) { runHint.hidden = true; startLand(); }
    };

    /* ═════ とりこみ: ぬきあげ か タモ ═════ */
    const fpLand = fpSvg.querySelector('#fpLand'), fpNet = fpSvg.querySelector('#fpNet');
    const landFishPos = () => ({ x: 400 + Math.sin(s.t * 0.9) * 150, y: 372 + Math.sin(s.t * 1.7) * 10 });
    const startLand = () => {
      s.phase = 'land';
      s.bend = 0.18;
      s.net = null;
      hookedG.setAttribute('opacity', '0');
      const f = s.catch.fish;
      const w = f ? 70 + s.catch.size * 3 : 70;
      fpLand.innerHTML = f
        ? `<g class="land-fish"><svg x="${(-w / 2).toFixed(0)}" y="${(-w * 0.32).toFixed(0)}" width="${w.toFixed(0)}" height="${(w * 0.64).toFixed(0)}" viewBox="0 0 214 136">${Art.fish(f).replace(/^\s*<svg[^>]*>|<\/svg>\s*$/g, '')}</svg></g>`
        : `<g class="land-fish"><text x="0" y="16" text-anchor="middle" font-size="56">${s.catch.junk.icon}</text></g>`;
      fpSplash(8);
      const small = !f || s.catch.size <= 25;
      App.say(`${f ? `${s.catch.size}センチくらいの ${f.name}` : 'なにか'}が あしもとまで きたよ!\nちいさい さかなは「ぬきあげ」、おおきい さかなは「タモ」で すくおう。${small ? '' : '\nこれは おおきいよ!'}`, 'wow');
      App.setControls(
        App.btn('🎣 ぬきあげる', { cls: 'big', onClick: nuki }),
        App.btn('🥅 タモで すくう', { cls: 'big blue', onClick: tamo }),
      );
    };
    const nuki = () => {
      if (s.phase !== 'land') return;
      const small = !s.catch.fish || s.catch.size <= 25;
      if (small || Math.random() < 0.4) { landed2(small ? 'ぬきあげ せいこう!' : 'セーフ! でも おおきい さかなは タモが あんしんだよ。'); return; }
      // おおきい さかなを ぬきあげると おちる
      Sfx.oops();
      fpLand.innerHTML = '';
      fpSplash(12);
      fpText('ぼちゃん!', 400, 320, 'big');
      App.say('おもくて おちちゃった! まだ はりに かかっているよ。\nおおきい さかなは タモで すくおうね。', 'think');
      s.phase = 'reel';
      s.dist = 25;
      s.tension = 30;
      s.run = 0;
      hookedG.setAttribute('opacity', '1');
      fightControls();
    };
    const tamo = () => {
      if (s.phase !== 'land') return;
      s.phase = 'net';
      s.net = { x: 220, y: 400 };
      App.setControls();
      App.say('タモを ゆびで うごかして、さかなに かぶせよう!\nさかなの ところで ゆびを はなすと すくえるよ。', 'wow');
    };
    const toSvg = e => {
      const pt = fpSvg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      return pt.matrixTransform(fpSvg.getScreenCTM().inverse());
    };
    fpLayer.addEventListener('pointerdown', e => { if (s.phase === 'net') { const p = toSvg(e); s.net = { x: p.x, y: p.y, drag: true }; } });
    fpLayer.addEventListener('pointermove', e => { if (s.phase === 'net' && s.net && s.net.drag) { const p = toSvg(e); s.net.x = p.x; s.net.y = p.y; } });
    fpLayer.addEventListener('pointerup', () => {
      if (s.phase !== 'net' || !s.net) return;
      s.net.drag = false;
      const fp = landFishPos();
      if (Math.hypot(s.net.x - fp.x, s.net.y - fp.y) < 70) landed2('すくえた! タモいれ せいこう!');
      else { Sfx.oops(); fpText('おしい!', s.net.x, s.net.y - 40, 'small'); }
    });
    const landed2 = msg => {
      s.phase = 'landed';
      s.net = null;
      fpNet.innerHTML = '';
      Sfx.fanfare();
      fpText(msg.split('!')[0] + '!', 400, 250, 'big');
      App.say(msg, 'wow');
      fpLand.querySelector('.land-fish')?.classList.add('lift');
      App.setControls();
      Save.data.tutorialDone = true;
      Save.write();
      App.after(1300, () => App.go('caught', s.catch));
    };

    /* ═════ えがく ═════ */
    const fpLine = fpSvg.querySelector('#fpLine'), fpRod = fpSvg.querySelector('#fpRod'), fpRodTip = fpSvg.querySelector('#fpRodTip');
    const fpRodLine = fpSvg.querySelector('#fpRodLine'), fpBail = fpSvg.querySelector('#fpBail'), fpTarget = fpSvg.querySelector('#fpTarget');
    const drawFP = () => {
      let b = s.bendCur;
      if (s.t < s.shakeUntil) b += Math.sin(s.t * 45) * 0.05;
      const lean = 0;
      const tip = { x: 430 + b * 160 + lean, y: 110 + b * 330 + Math.abs(lean) * 0.2 };
      const mx = (705 + tip.x) / 2 + 10, my = (460 + tip.y) / 2 - 20 + b * 80;
      fpRod.setAttribute('d', `M705 460 Q${(620 + b * 40 + lean * 0.3).toFixed(1)} ${(330 + b * 60).toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`);
      fpRodTip.setAttribute('d', `M${mx.toFixed(1)} ${my.toFixed(1)} Q${((tip.x + 560) / 2).toFixed(1)} ${(tip.y + 70 + b * 40).toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`);
      fpRodLine.setAttribute('d', `M604 388 L${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`);
      fpBail.setAttribute('d', s.bailOpen ? 'M-50 -6 Q-30 44 -4 26' : 'M-50 -6 Q-36 -46 -4 -30');

      if (s.phase === 'land' || s.phase === 'net' || s.phase === 'landed') {
        const fp = landFishPos();
        const g = fpLand.querySelector('.land-fish');
        if (g && s.phase !== 'landed') g.setAttribute('transform', `translate(${fp.x.toFixed(1)},${fp.y.toFixed(1)}) rotate(${(Math.sin(s.t * 6) * 8).toFixed(1)})`);
        fpTarget.innerHTML = '';
        fpLine.setAttribute('d', `M${tip.x.toFixed(1)} ${tip.y.toFixed(1)} L${fp.x.toFixed(1)} ${(fp.y - 10).toFixed(1)}`);
        fpNet.innerHTML = s.net
          ? `<path d="M${(s.net.x - 160).toFixed(1)} 470 L${(s.net.x - 30).toFixed(1)} ${(s.net.y + 10).toFixed(1)}" stroke="#c9a26b" stroke-width="9" stroke-linecap="round"/>
             <ellipse cx="${s.net.x.toFixed(1)}" cy="${s.net.y.toFixed(1)}" rx="56" ry="26" fill="rgba(255,255,255,.25)" stroke="#555" stroke-width="5"/>
             <path d="M${(s.net.x - 50).toFixed(1)} ${s.net.y.toFixed(1)} Q${s.net.x.toFixed(1)} ${(s.net.y + 70).toFixed(1)} ${(s.net.x + 50).toFixed(1)} ${s.net.y.toFixed(1)}" stroke="#777" stroke-width="2" fill="none" stroke-dasharray="4 4"/>`
          : '';
        return;
      }
      const p = entry();
      const lying = s.phase === 'fall' && s.baitY < s.fallTo - 4; // エサが しずむまで ウキは ねている
      if (useBobber && s.phase !== 'reel') {
        const yy = p.y + s.dipCur * p.k * 0.9 + Math.sin(s.t * 2.2) * 1.5 * p.k;
        fpTarget.innerHTML = `<g transform="translate(${p.x.toFixed(1)} ${yy.toFixed(1)}) scale(${(p.k * 1.4).toFixed(2)}) rotate(${lying ? 80 : 0})" opacity="${s.dipCur > 20 ? 0.35 : 1}">
            <rect x="-2" y="-24" width="4" height="13" fill="#e53935"/><path d="M-10 0 A10 10 0 0 1 10 0 Z" fill="#e53935"/><path d="M-10 0 A10 10 0 0 0 10 0 Z" fill="#fff" opacity=".5"/></g>
          <ellipse cx="${p.x.toFixed(1)}" cy="${(p.y + 2).toFixed(1)}" rx="${(16 * p.k + 3).toFixed(1)}" ry="${(4 * p.k + 1).toFixed(1)}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>`;
      } else {
        fpTarget.innerHTML = `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${(14 * p.k + 3).toFixed(1)}" ry="${(3.5 * p.k + 1).toFixed(1)}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>`;
      }
      const endY = useBobber && s.phase !== 'reel' ? p.y - 24 * p.k * 1.4 + s.dipCur * p.k * 0.9 : p.y;
      const sag = s.phase === 'reel' ? (s.tension > 60 ? 0 : 14) : (s.taut || useBobber ? 18 : 60);
      fpLine.setAttribute('d', `M${tip.x.toFixed(1)} ${tip.y.toFixed(1)} Q${((tip.x + p.x) / 2).toFixed(1)} ${(Math.max(tip.y, endY) + sag).toFixed(1)} ${p.x.toFixed(1)} ${endY.toFixed(1)}`);
      fpLine.classList.toggle('taut', s.phase === 'reel' && s.tension > 70);
    };

    const drawWipe = dt => {
      const bait = baitPos();
      // カメラは しかけを おいかける
      const tx = Math.max(PIER + 90, Math.min(FAR - 90, bait.x));
      const ty = Math.max(WATER - 30, Math.min(BOTTOM + 30 - 140, bait.y - 78));
      s.cam.x += (tx - s.cam.x) * Math.min(1, dt * 3);
      s.cam.y += (ty - s.cam.y) * Math.min(1, dt * 3);
      wSvg.setAttribute('viewBox', `${(s.cam.x - 110).toFixed(1)} ${s.cam.y.toFixed(1)} 220 140`);

      const lying = s.phase === 'fall' && s.baitY < s.fallTo - 4;
      if (useBobber) {
        wBob.setAttribute('transform', `translate(${s.bx.toFixed(1)},${(WATER + s.dipCur * 0.6).toFixed(1)}) rotate(${lying ? 80 : 0})`);
        leader.setAttribute('d', s.phase === 'reel' ? '' : `M${s.bx.toFixed(1)} ${(WATER + 8 + s.dipCur * 0.6).toFixed(1)} L${bait.x.toFixed(1)} ${(bait.y - 6).toFixed(1)}`);
        wLine.setAttribute('d', s.phase === 'reel'
          ? `M${(bait.x - 120).toFixed(1)} ${WATER - 90} L${bait.x.toFixed(1)} ${bait.y.toFixed(1)}`
          : `M${(s.bx - 120).toFixed(1)} ${WATER - 90} Q${(s.bx - 40).toFixed(1)} ${WATER - 30} ${s.bx.toFixed(1)} ${(WATER - 22).toFixed(1)}`);
        wBob.style.display = s.phase === 'reel' ? 'none' : '';
      } else {
        leader.setAttribute('d', '');
        const topY = MODE === 'sabiki' ? bait.y - 11 : bait.y - 6;
        wLine.setAttribute('d', `M${(bait.x - 120).toFixed(1)} ${WATER - 90} Q${(bait.x - 20).toFixed(1)} ${(s.taut ? WATER : WATER + 30).toFixed(1)} ${bait.x.toFixed(1)} ${topY.toFixed(1)}`);
      }
      weight.setAttribute('transform', `translate(${bait.x.toFixed(1)},${bait.y.toFixed(1)})`);
      if (s.phase === 'reel') weight.setAttribute('opacity', s.catch && s.catch.fish ? '0' : '1');
      wLine.classList.toggle('taut', s.phase === 'reel' && s.tension > 70);

      // むれ（かざり）
      school.forEach(f => {
        const cx = MODE === 'sabiki' ? PIER + 90 : spotX;
        const x = cx + Math.sin(s.t * 0.6 + f.ph) * (MODE === 'sabiki' ? 45 : 60);
        const y = (MODE === 'choinage' ? BOTTOM - 12 + f.dy * 0.3 : tana + f.dy) + Math.sin(s.t * 1.3 + f.ph) * 4;
        const dir = Math.cos(s.t * 0.6 + f.ph) >= 0 ? 1 : -1;
        f.g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${dir},1)`);
        f.g.setAttribute('opacity', s.phase === 'reel' || s.phase === 'land' || s.phase === 'net' || s.phase === 'landed' ? '0' : '0.55');
      });

      // ねらう さかな: よってくる・ふきだし・つつく・たべる
      const side = s.side || 1;
      let vis = 0;
      if (s.phase === 'mode' || s.phase === 'bite' || s.phase === 'snag') {
        const near = { x: bait.x + side * 18, y: bait.y + 1 };
        let d;
        if (s.phase === 'bite' && s.eat) {
          const e = s.eat, u = Math.min(1, (s.t - e.t0) / 0.9);
          if (e.mode === 'peck') d = { x: near.x - side * Math.abs(Math.sin((s.t - e.t0) * 9)) * 7, y: near.y };
          else if (e.mode === 'bite') d = { x: bait.x + side * 7, y: bait.y + 2 };
          else if (e.mode === 'leave') d = { x: near.x + side * 90 * u, y: near.y + 10 * u };
          else d = near;
          vis = e.mode === 'leave' ? 1 - u : 1;
          s.tgtPos = d;
        } else if (s.fishSt === 'coming' || s.fishSt === 'near') {
          d = { x: near.x + Math.sin(s.t * 3) * 3, y: near.y + Math.sin(s.t * 2) * 2 };
          if (s.t - s.flinchT < 0.5) d.x += side * 28; // びっくりして さがる
          vis = 1;
          s.tgtPos.x += (d.x - s.tgtPos.x) * Math.min(1, dt * 3);
          s.tgtPos.y += (d.y - s.tgtPos.y) * Math.min(1, dt * 3);
        } else {
          d = { x: bait.x + side * 150, y: bait.y + 10 };
          s.tgtPos.x += (d.x - s.tgtPos.x) * Math.min(1, dt * 1.5);
          s.tgtPos.y += (d.y - s.tgtPos.y) * Math.min(1, dt * 1.5);
          vis = Math.max(0, 1 - Math.abs(s.tgtPos.x - bait.x) / 150);
        }
      }
      const dir = bait.x >= s.tgtPos.x ? 1 : -1;
      tgt.setAttribute('transform', `translate(${s.tgtPos.x.toFixed(1)},${s.tgtPos.y.toFixed(1)}) scale(${dir},1)`);
      tgt.setAttribute('opacity', vis.toFixed(2));
      depthEl.textContent = `ふかさ ${depthM(bait.y)}m`;
    };

    /* ═════ まいフレーム ═════ */
    App.loop(dt => {
      s.t += dt;
      s.bendCur += (s.bend - s.bendCur) * Math.min(1, dt * 10);
      s.dipCur += (s.dip - s.dipCur) * Math.min(1, dt * 14);
      if (s.phase.startsWith('tp') || s.phase === 'wait-recast') drawTP(dt);
      if (s.phase === 'fall') updateFall(dt);
      else if (s.phase === 'mode') updateMode(dt);
      else if (s.phase === 'reel') reelUpdate(dt);
      if (!fpLayer.classList.contains('off')) { drawFP(); drawWipe(dt); }
    });

    tpPhase();
    return () => {
      window.removeEventListener('resize', fit);
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

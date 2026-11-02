/* え（SVG）を つくる */

const Art = (() => {
  let uid = 0;

  function bear(mood = 'happy') {
    let mouth;
    if (mood === 'wow') {
      mouth = '<ellipse cx="60" cy="90" rx="8" ry="9" fill="#7a2e2e"/><ellipse cx="60" cy="94" rx="5" ry="4" fill="#ff8a8a"/>';
    } else if (mood === 'think') {
      mouth = '<path d="M53 89 Q60 86 67 89" stroke="#3a2a1e" stroke-width="3" fill="none" stroke-linecap="round"/>';
    } else {
      mouth = '<path d="M50 86 Q60 96 70 86" stroke="#3a2a1e" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    }
    const brows = mood === 'think'
      ? '<path d="M36 52 L50 48" stroke="#3a2a1e" stroke-width="3" stroke-linecap="round"/><path d="M84 52 L70 48" stroke="#3a2a1e" stroke-width="3" stroke-linecap="round"/>'
      : '';
    return `
<svg viewBox="0 0 120 120" class="bear" aria-label="クマせんせい">
  <circle cx="24" cy="36" r="15" fill="#a0673a"/><circle cx="24" cy="36" r="7" fill="#e8b98a"/>
  <circle cx="96" cy="36" r="15" fill="#a0673a"/><circle cx="96" cy="36" r="7" fill="#e8b98a"/>
  <circle cx="60" cy="68" r="44" fill="#b5784a"/>
  <path d="M22 40 Q60 2 98 40 Z" fill="#4caf7a"/>
  <rect x="14" y="36" width="92" height="9" rx="4.5" fill="#3d9466"/>
  <circle cx="84" cy="30" r="6" fill="#ffd54a"/>
  <ellipse cx="60" cy="84" rx="22" ry="17" fill="#f1d1ad"/>
  <circle cx="44" cy="62" r="5.5" fill="#3a2a1e"/><circle cx="76" cy="62" r="5.5" fill="#3a2a1e"/>
  <circle cx="46" cy="60" r="1.8" fill="#fff"/><circle cx="78" cy="60" r="1.8" fill="#fff"/>
  ${brows}
  <ellipse cx="60" cy="76" rx="7" ry="5" fill="#3a2a1e"/>
  <circle cx="32" cy="80" r="6" fill="#ff9e9e" opacity=".55"/><circle cx="88" cy="80" r="6" fill="#ff9e9e" opacity=".55"/>
  ${mouth}
</svg>`;
  }

  function bobberIcon() {
    return `
<svg viewBox="-16 -30 32 52" class="bobber-icon" aria-hidden="true">
  <rect x="-2" y="-28" width="4" height="16" rx="2" fill="#e53935"/>
  <path d="M-13 0 A13 13 0 0 1 13 0 Z" fill="#e53935"/>
  <path d="M-13 0 A13 13 0 0 0 13 0 Z" fill="#fff" stroke="#ddd"/>
  <rect x="-1.5" y="12" width="3" height="8" fill="#777"/>
</svg>`;
  }

  // さかな（みぎむき）
  function fish(f, opt = {}) {
    const id = 'fclip' + (++uid);
    const sil = !!opt.silhouette;
    const cx = 112, cy = 68;
    const rx = 62 * f.len, ry = 34 * f.h;
    const body = sil ? '#b9c4cf' : f.body;
    const belly = sil ? '#b9c4cf' : f.belly;
    const fin = sil ? '#a5b1bd' : f.fin;
    const tailX = cx - rx + 6;

    const tail = `<path d="M${tailX} ${cy} L${tailX - 34} ${cy - 26} Q${tailX - 22} ${cy} ${tailX - 34} ${cy + 26} Z" fill="${fin}"/>`;

    let dorsal;
    if (f.spines) {
      let p = `M${cx - rx * 0.62} ${cy - ry * 0.75}`;
      const n = 6;
      for (let i = 0; i < n; i++) {
        const x0 = cx - rx * 0.62 + (rx * 0.95 / n) * i;
        const x1 = x0 + (rx * 0.95 / n);
        p += ` L${(x0 + x1) / 2} ${cy - ry - 18} L${x1} ${cy - ry * 0.8}`;
      }
      dorsal = `<path d="${p} Z" fill="${fin}"/>`;
    } else {
      dorsal = `<path d="M${cx - rx * 0.55} ${cy - ry * 0.8} Q${cx - rx * 0.15} ${cy - ry - 22} ${cx + rx * 0.3} ${cy - ry * 0.88} Z" fill="${fin}"/>`;
    }
    const belFin = `<path d="M${cx - rx * 0.2} ${cy + ry * 0.85} Q${cx - rx * 0.05} ${cy + ry + 14} ${cx + rx * 0.2} ${cy + ry * 0.9} Z" fill="${fin}"/>`;
    const pec = `<path d="M${cx + rx * 0.18} ${cy + ry * 0.12} q-24 4 -28 22 q18 -2 28 -14 z" fill="${fin}" opacity=".9"/>`;

    let pat = '';
    if (!sil) {
      if (f.pattern === 'line') {
        pat = `<path d="M${cx - rx} ${cy + 3} Q${cx} ${cy - 6} ${cx + rx} ${cy + 1}" stroke="${f.patColor}" stroke-width="5" fill="none"/>`;
      } else if (f.pattern === 'stripes') {
        for (let i = 0; i < 6; i++) {
          const x = cx - rx * 0.7 + i * rx * 0.22;
          pat += `<path d="M${x} ${cy - ry} q9 ${ry * 0.35} 0 ${ry * 0.75}" stroke="${f.patColor}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
        }
      } else if (f.pattern === 'spots') {
        const pts = [[-0.5, -0.4], [-0.25, -0.55], [0, -0.35], [0.2, -0.6], [-0.35, -0.1], [-0.05, -0.05], [0.3, -0.25], [-0.6, -0.15]];
        pat = pts.map(([px, py]) => `<circle cx="${cx + px * rx}" cy="${cy + py * ry}" r="3.6" fill="${f.patColor}"/>`).join('');
      } else if (f.pattern === 'dots') {
        for (let i = 0; i < 6; i++) {
          pat += `<circle cx="${cx - rx * 0.1 + i * rx * 0.13}" cy="${cy - ry * 0.05}" r="3.2" fill="${f.patColor}"/>`;
        }
      } else if (f.pattern === 'blotch') {
        pat = `<ellipse cx="${cx - rx * 0.35}" cy="${cy - ry * 0.3}" rx="14" ry="9" fill="${f.patColor}" opacity=".6"/>
               <ellipse cx="${cx + rx * 0.05}" cy="${cy - ry * 0.45}" rx="12" ry="8" fill="${f.patColor}" opacity=".6"/>
               <ellipse cx="${cx - rx * 0.1}" cy="${cy + ry * 0.05}" rx="10" ry="7" fill="${f.patColor}" opacity=".5"/>`;
      }
    }

    const er = f.eyeBig ? 11 : 8;
    const ex = cx + rx * 0.58, ey = cy - ry * 0.22;
    const eye = sil ? '' : `<circle cx="${ex}" cy="${ey}" r="${er}" fill="#fff"/><circle cx="${ex + 1}" cy="${ey}" r="${er * 0.62}" fill="#222"/><circle cx="${ex + 3}" cy="${ey - 3}" r="${er * 0.22}" fill="#fff"/>`;
    const gill = `<path d="M${cx + rx * 0.33} ${cy - ry * 0.55} Q${cx + rx * 0.18} ${cy} ${cx + rx * 0.33} ${cy + ry * 0.55}" stroke="#00000030" stroke-width="3" fill="none"/>`;
    const mouth = sil ? '' : `<path d="M${cx + rx - 1} ${cy + 7} q-6 4 -13 2" stroke="#00000066" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    const q = sil ? `<text x="${cx}" y="${cy + 15}" font-size="42" text-anchor="middle" fill="#fff" font-weight="800">?</text>` : '';

    return `
<svg viewBox="0 0 214 136" class="fish-svg" aria-hidden="true">
  <defs><clipPath id="${id}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/></clipPath></defs>
  ${tail}${dorsal}${belFin}
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${body}"/>
  <g clip-path="url(#${id})">
    <ellipse cx="${cx}" cy="${cy + ry * 0.75}" rx="${rx * 1.05}" ry="${ry * 0.7}" fill="${belly}"/>
    ${pat}
  </g>
  ${pec}${gill}${eye}${mouth}${q}
</svg>`;
  }

  function worm() {
    return `
<svg viewBox="0 0 130 60" class="worm-svg" aria-hidden="true">
  <path d="M12 38 q15 -26 30 0 t30 0 t30 0" stroke="#f48fb1" stroke-width="15" fill="none" stroke-linecap="round"/>
  <path d="M12 38 q15 -26 30 0 t30 0 t30 0" stroke="#f8bbd0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7" transform="translate(0,-3)"/>
  <circle cx="104" cy="34" r="2.6" fill="#333"/>
</svg>`;
  }

  function hook() {
    return `
<svg viewBox="0 0 120 230" class="hook-svg" aria-hidden="true">
  <line x1="70" y1="0" x2="70" y2="112" stroke="#555" stroke-width="2"/>
  <path d="M70 110 L70 172 Q70 204 45 204 Q20 204 20 178 L20 168" stroke="#9aa4ad" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M20 166 L31 179" stroke="#9aa4ad" stroke-width="6" stroke-linecap="round"/>
  <circle cx="70" cy="110" r="5" fill="#9aa4ad"/>
  <g class="hook-worm">
    <path d="M70 124 q16 10 0 20 q-16 10 0 20 q16 10 0 20 q-6 18 -30 18" stroke="#f48fb1" stroke-width="13" fill="none" stroke-linecap="round"/>
    <circle cx="38" cy="201" r="2.4" fill="#333"/>
  </g>
</svg>`;
  }


  // つりぐやさんの どうぐ（100x100）
  function gear(id) {
    const S = c => `<svg viewBox="0 0 100 100" class="gear-svg" aria-hidden="true">${c}</svg>`;
    const reel = (x, y, c = '#555') => `<circle cx="${x}" cy="${y}" r="10" fill="${c}"/><circle cx="${x}" cy="${y}" r="4" fill="#ddd"/><path d="M${x} ${y} l11 7" stroke="#333" stroke-width="3" stroke-linecap="round"/><circle cx="${x + 12}" cy="${y + 8}" r="3.5" fill="#333"/>`;
    const rod = (x1, y1, x2, y2, c, w) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/><path d="M${x1} ${y1} L${x1 + (x2 - x1) * 0.22} ${y1 + (y2 - y1) * 0.22}" stroke="#3a2a1e" stroke-width="${w + 3}" stroke-linecap="round"/>`;
    const spool = (c, label, stripes = null) => {
      let band = `<rect x="28" y="30" width="44" height="40" fill="${c}"/>`;
      if (stripes) band = stripes.map((sc, i) => `<rect x="28" y="${30 + i * 40 / stripes.length}" width="44" height="${40 / stripes.length + 0.5}" fill="${sc}"/>`).join('');
      return S(`${band}<path d="M28 38 H72 M28 46 H72 M28 54 H72 M28 62 H72" stroke="#00000018" stroke-width="2"/>
        <rect x="20" y="22" width="60" height="9" rx="4" fill="#555"/><rect x="20" y="69" width="60" height="9" rx="4" fill="#555"/>
        <text x="50" y="94" text-anchor="middle" font-size="15" font-weight="800" fill="#3a2e26">${label}</text>`);
    };
    const hookAt = (x, y, s = 1) => `<path d="M${x} ${y} v${10 * s} q0 ${7 * s} ${-6 * s} ${7 * s} q${-6 * s} 0 ${-6 * s} ${-6 * s}" stroke="#8a949d" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    const bobber = (x, y, r = 9) => `<rect x="${x - 1.5}" y="${y - r - 9}" width="3" height="10" fill="#e53935"/><path d="M${x - r} ${y} A${r} ${r} 0 0 1 ${x + r} ${y} Z" fill="#e53935"/><path d="M${x - r} ${y} A${r} ${r} 0 0 0 ${x + r} ${y} Z" fill="#fff" stroke="#ccc"/>`;
    switch (id) {
      case 'choinage_rod': return S(rod(16, 88, 84, 16, '#2f7cc0', 4) + reel(30, 76));
      case 'iso_rod':      return S(rod(10, 94, 94, 4, '#c0392b', 3) + reel(24, 82));
      case 'lure_rod':     return S(rod(16, 88, 82, 20, '#222', 4) + `<circle cx="60" cy="43" r="2.5" fill="#d4af37"/><circle cx="72" cy="31" r="2" fill="#d4af37"/>` + reel(30, 76, '#c9a227'));
      case 'ana_rod':      return S(rod(28, 82, 70, 40, '#3d9466', 5) + reel(40, 72));
      case 'nylon3': return spool('#8fe0a0', '3ごう');
      case 'nylon2': return spool('#c8f2cf', '2ごう');
      case 'pe':     return spool('', 'PE', ['#ff6fa8', '#ffd54a', '#4fc3f7', '#7ddc6f', '#b388ff']);
      case 'tenbin': return S(`<path d="M50 6 V26" stroke="#555" stroke-width="2"/><path d="M28 28 H72 V52" stroke="#9aa4ad" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M72 52 Q80 64 72 78 Q64 64 72 52 Z" fill="#6b6f76"/><path d="M28 28 V72" stroke="#555" stroke-width="1.5"/>${hookAt(28, 72)}`);
      case 'sabiki': {
        let c = `<rect x="38" y="4" width="24" height="18" rx="4" fill="#ff9f43" stroke="#d07a20" stroke-width="2"/><path d="M42 8 V18 M50 8 V18 M58 8 V18" stroke="#d07a20"/><path d="M50 22 V84" stroke="#555" stroke-width="1.5"/>`;
        [32, 46, 60, 74].forEach((y, i) => {
          const d = i % 2 ? 1 : -1;
          c += `<path d="M50 ${y} l${14 * d} 4" stroke="#555" stroke-width="1.2"/><path d="M${50 + 14 * d} ${y + 4} q${3 * d} 6 0 9" stroke="#8a949d" stroke-width="2" fill="none"/><circle cx="${50 + 14 * d}" cy="${y + 5}" r="3.2" fill="#ff7eb6"/>`;
        });
        return S(c + `<path d="M50 84 Q57 92 50 98 Q43 92 50 84 Z" fill="#6b6f76"/>`);
      }
      case 'uki_shikake': return S(`<path d="M50 4 V24" stroke="#555" stroke-width="1.5"/>${bobber(50, 32, 11)}<path d="M50 43 V72" stroke="#555" stroke-width="1.5"/><circle cx="50" cy="60" r="3.5" fill="#6b6f76"/>${hookAt(50, 72, 1.2)}`);
      case 'leader': return S(`<path d="M50 4 V30" stroke="#ff6fa8" stroke-width="2.5"/><path d="M50 30 V62" stroke="#b7e3f7" stroke-width="3"/>
        <path d="M50 62 q-9 2 -9 12 q0 12 9 14 q9 -2 9 -14 q0 -10 -9 -12" stroke="#8a949d" stroke-width="3" fill="none"/>`);
      case 'burakuri': return S(`<path d="M50 6 V40" stroke="#555" stroke-width="1.5"/><path d="M50 38 Q66 54 50 70 Q34 54 50 38 Z" fill="#e53935"/><circle cx="46" cy="50" r="3" fill="#fff" opacity=".6"/>${hookAt(50, 70, 1.4)}`);
      case 'aoisome': return S(`<path d="M14 64 q12 -26 24 0 t24 0 t24 -6" stroke="#b5533c" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M14 64 q12 -26 24 0 t24 0 t24 -6" stroke="#e08b6c" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="2 5"/>`);
      case 'amiebi': {
        let c = `<rect x="16" y="28" width="68" height="48" rx="8" fill="#f7b6c2" stroke="#e48a9c" stroke-width="2"/>`;
        for (let i = 0; i < 14; i++) c += `<path d="M${24 + (i % 5) * 13} ${38 + Math.floor(i / 5) * 13} q4 -5 8 0" stroke="#d35d76" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
        return S(c);
      }
      case 'okiami': return S(`<path d="M24 60 Q30 30 62 32 Q80 34 78 50 Q76 64 58 62" stroke="#f48a9c" stroke-width="14" fill="none" stroke-linecap="round"/>
        <path d="M58 62 l-6 12 M58 62 l6 12" stroke="#f48a9c" stroke-width="4" stroke-linecap="round"/><circle cx="30" cy="54" r="3" fill="#222"/><path d="M24 52 l-14 -12 M26 50 l-10 -16" stroke="#f48a9c" stroke-width="1.5"/>`);
      case 'jig': return S(`<defs><linearGradient id="jigG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f7fd0"/><stop offset=".5" stop-color="#d9e6f2"/><stop offset="1" stop-color="#9fb4c8"/></linearGradient></defs>
        <path d="M14 50 Q40 28 80 46 Q86 50 80 54 Q40 72 14 50 Z" fill="url(#jigG)" stroke="#5c7a96" stroke-width="2"/><circle cx="72" cy="48" r="3" fill="#222"/>
        <circle cx="86" cy="50" r="3" fill="none" stroke="#8a949d" stroke-width="2"/>${hookAt(14, 54, 1)}`);
      case 'cooler': return S(`<rect x="14" y="36" width="72" height="48" rx="6" fill="#2f7cc0"/><rect x="10" y="26" width="80" height="14" rx="5" fill="#f4f6f8" stroke="#cfd6dd" stroke-width="2"/>
        <rect x="40" y="18" width="20" height="8" rx="3" fill="#cfd6dd"/><rect x="24" y="50" width="52" height="6" rx="3" fill="#ffffff55"/>`);
      case 'grip': return S(`<rect x="44" y="40" width="12" height="50" rx="6" fill="#ff8a3d"/><path d="M44 42 L38 14 Q50 8 50 22 M56 42 L62 14 Q50 8 50 22" stroke="#8a949d" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="50" cy="44" r="5" fill="#555"/><path d="M50 90 q-14 4 -10 -6" stroke="#555" stroke-width="2" fill="none"/>`);
      case 'plier': return S(`<path d="M50 50 L28 90 M50 50 L72 90" stroke="#e53935" stroke-width="9" stroke-linecap="round"/><path d="M50 50 L44 12 M50 50 L56 12" stroke="#8a949d" stroke-width="6" stroke-linecap="round"/><circle cx="50" cy="50" r="5" fill="#555"/>`);
      case 'towel': return S(`<rect x="18" y="24" width="64" height="56" rx="6" fill="#fff6d6" stroke="#e6cf8a" stroke-width="2"/><path d="M18 36 H82 M18 68 H82" stroke="#4fa3e8" stroke-width="5"/><path d="M18 44 H82" stroke="#ff8a3d" stroke-width="3"/>`);
      case 'bobber': return S(bobber(50, 56, 20));
    }
    return S('');
  }

  // たなの どうぐ・つりかたの アイコン
  function icon(item) {
    return item.art ? gear(item.art) : `<span class="emoji">${item.icon}</span>`;
  }

  function seaScene() {
    return `
<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid meet" class="sea-svg">
  <defs>
    <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#dff5ff"/></linearGradient>
    <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#55b8ec"/><stop offset="1" stop-color="#1a68b0"/></linearGradient>
  </defs>
  <rect width="800" height="242" fill="url(#skyG)"/>
  <g class="sun"><circle cx="700" cy="70" r="38" fill="#ffd54a"/><circle cx="700" cy="70" r="52" fill="#ffd54a" opacity=".25"/></g>
  <g class="cloud c1" fill="#fff" opacity=".95"><ellipse cx="400" cy="72" rx="52" ry="18"/><ellipse cx="428" cy="58" rx="30" ry="20"/><ellipse cx="380" cy="62" rx="22" ry="15"/></g>
  <g class="cloud c2" fill="#fff" opacity=".85"><ellipse cx="560" cy="130" rx="40" ry="13"/><ellipse cx="580" cy="120" rx="22" ry="14"/></g>
  <path d="M560 242 Q605 196 650 242 Z" fill="#7cc58a"/>
  <path d="M630 242 Q660 214 700 242 Z" fill="#62b072"/>
  <rect y="240" width="800" height="210" fill="url(#seaG)"/>

  <g id="fishShadow" opacity="0" transform="translate(500,280)">
    <g id="fishShadowInner">
      <ellipse cx="0" cy="0" rx="34" ry="13" fill="#0b2a44" opacity=".6"/>
      <path d="M-30 0 L-54 -14 L-54 14 Z" fill="#0b2a44" opacity=".6"/>
    </g>
  </g>

  <g id="bobber" transform="translate(262,112)">
    <rect x="-2" y="-24" width="4" height="13" rx="2" fill="#e53935"/>
    <path d="M-10 0 A10 10 0 0 1 10 0 Z" fill="#e53935"/>
    <path d="M-10 0 A10 10 0 0 0 10 0 Z" fill="#fff"/>
  </g>

  <g id="weight" opacity="0" transform="translate(500,300)">
    <path class="w-sinker" d="M0 -9 Q8 0 0 9 Q-8 0 0 -9 Z" fill="#6b6f76"/>
    <g class="w-lure"><path d="M-14 0 Q-2 -8 12 0 Q-2 8 -14 0 Z" fill="#9fc4e6" stroke="#5c7a96" stroke-width="1.5"/><circle cx="7" cy="-1" r="1.6" fill="#223"/></g>
  </g>

  <g id="school"></g>
  <rect id="overlay" y="243" width="800" height="207" fill="#1f78c4" opacity=".55"/>
  <g id="spot"></g>
  <g id="aim" opacity="0"><ellipse cx="0" cy="0" rx="26" ry="8" fill="none" stroke="#ffd54a" stroke-width="4"/><path d="M0 -14 L-8 -30 H8 Z" fill="#ffd54a"/></g>
  <g class="waves" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round">
    <path d="M300 275 q10 -6 20 0 t20 0"/>
    <path d="M520 300 q10 -6 20 0 t20 0"/>
    <path d="M680 270 q10 -6 20 0 t20 0"/>
    <path d="M400 350 q10 -6 20 0 t20 0"/>
    <path d="M620 390 q10 -6 20 0 t20 0"/>
  </g>

  <path id="line" d="" stroke="#3c3c3c" stroke-width="1.6" fill="none" opacity=".85"/>
  <g id="fx"></g>
  <g id="jumper"></g>

  <rect x="40" y="232" width="14" height="140" fill="#6b4529"/>
  <rect x="150" y="232" width="14" height="140" fill="#6b4529"/>
  <rect x="0" y="218" width="218" height="20" rx="4" fill="#a8743f"/>
  <path d="M50 218 V238 M100 218 V238 M150 218 V238 M200 218 V238" stroke="#8a5c30" stroke-width="2"/>

  <g id="kid">
    <rect x="138" y="190" width="10" height="30" rx="4" fill="#3b5ba5"/>
    <rect x="153" y="190" width="10" height="30" rx="4" fill="#3b5ba5"/>
    <rect x="133" y="146" width="34" height="50" rx="13" fill="#ff8a3d"/>
    <rect x="146" y="148" width="8" height="46" fill="#ffd54a"/>
    <path d="M160 160 L170 175" stroke="#f2c49b" stroke-width="9" stroke-linecap="round"/>
    <circle cx="150" cy="126" r="23" fill="#f6d2b0"/>
    <path d="M125 122 Q150 88 175 122 Z" fill="#4caf7a"/>
    <rect x="121" y="118" width="58" height="8" rx="4" fill="#3d9466"/>
    <circle cx="146" cy="130" r="2.8" fill="#333"/><circle cx="159" cy="130" r="2.8" fill="#333"/>
    <circle cx="166" cy="138" r="3.8" fill="#ff9e9e" opacity=".7"/>
    <path d="M150 139 q5 4 10 0" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>
  <path id="rod" d="M166 178 L262 112" stroke="#5d4037" stroke-width="5" stroke-linecap="round" fill="none"/>
</svg>`;
  }

  return { bear, bobberIcon, fish, worm, hook, gear, icon, seaScene };
})();

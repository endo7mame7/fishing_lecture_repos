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
    const cx = 105, cy = 62;
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
<svg viewBox="0 0 200 124" class="fish-svg" aria-hidden="true">
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

  <rect y="243" width="800" height="207" fill="#1f78c4" opacity=".55"/>
  <g class="waves" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round">
    <path d="M300 275 q10 -6 20 0 t20 0"/>
    <path d="M520 300 q10 -6 20 0 t20 0"/>
    <path d="M680 270 q10 -6 20 0 t20 0"/>
    <path d="M400 350 q10 -6 20 0 t20 0"/>
    <path d="M620 390 q10 -6 20 0 t20 0"/>
  </g>

  <path id="line" d="" stroke="#3c3c3c" stroke-width="1.6" fill="none" opacity=".85"/>
  <g id="fx"></g>

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
  <path id="rod" d="M166 178 L262 112" stroke="#5d4037" stroke-width="5" stroke-linecap="round"/>
</svg>`;
  }

  return { bear, bobberIcon, fish, worm, hook, seaScene };
})();

/* ゲームの ないよう（ここを かえると セリフ・どうぐ・さかなを かえられます） */

// すすみぐあい バー
const STEPS = [
  { icon: '🏪', label: 'つりぐや' },
  { icon: '🪝', label: 'じゅんび' },
  { icon: '🎣', label: 'なげる' },
  { icon: '👀', label: 'まつ' },
  { icon: '🔄', label: 'まく' },
];

/* ───────── つりかた ─────────
   cast:      throw = とおくへ なげる / drop = あしもとに おとす
   indicator: bobber = ウキで アタリを みる / rodtip = さおさきで アタリを みる
   gear:      それぞれの たなで いちばん ぴったりな どうぐ
*/
const METHODS = [
  {
    id: 'choinage', name: 'ちょいなげ', art: 'tenbin',
    desc: 'おもりの ついた しかけを かるく なげて、すなの そこに いる さかなを ねらうよ。',
    cast: 'throw', indicator: 'rodtip',
    fish: ['kisu', 'haze', 'karei', 'tai'],
    gear: { rod: 'choinage_rod', rig: 'tenbin', bait: 'aoisome' },
  },
  {
    id: 'sabiki', name: 'サビキづり', art: 'sabiki',
    desc: 'ちいさな はりが たくさん ついた しかけを あしもとに おとして、むれで およぐ さかなを いっぺんに つるよ。',
    cast: 'drop', indicator: 'rodtip',
    fish: ['aji', 'iwashi', 'saba'],
    gear: { rod: 'iso_rod', rig: 'sabiki', bait: 'amiebi' },
  },
  {
    id: 'uki', name: 'ウキづり', art: 'uki_shikake',
    desc: 'ウキを うかべて まつよ。ウキが ぐーっと しずんだら さかなの あいず!',
    cast: 'throw', indicator: 'bobber',
    fish: ['mebaru', 'aji', 'kurodai', 'tai'],
    gear: { rod: 'iso_rod', rig: 'uki_shikake', bait: 'okiami' },
  },
  {
    id: 'lure', name: 'ルアーづり', art: 'jig',
    desc: 'えさの かわりに さかなの かたちの ルアーを なげて、まきながら さかなを さそうよ。',
    cast: 'throw', indicator: 'rodtip',
    fish: ['kamasu', 'saba', 'suzuki'],
    gear: { rod: 'lure_rod', rig: 'leader', bait: 'jig' },
  },
  {
    id: 'saguri', name: 'さぐりづり', art: 'burakuri',
    desc: 'あしもとの いわや ブロックの すきまに しかけを そっと おとして、かくれている さかなを ねらうよ。',
    cast: 'drop', indicator: 'rodtip',
    fish: ['kasago', 'mebaru', 'ainame'],
    gear: { rod: 'ana_rod', rig: 'burakuri', bait: 'aoisome' },
  },
];
const METHOD_BY_ID = Object.fromEntries(METHODS.map(m => [m.id, m]));

/* ───────── つりぐやさんの たな ─────────
   さお・しかけ・エサの 3つを えらぶ。くみあわせは レジで てんいんさんが チェックする
   art が あれば え（SVG）、なければ icon（えもじ）を つかう
*/
const SHELVES = [
  {
    id: 'rod', title: 'ロッド・リール', type: 'one',
    say: 'まずは さお。リールが ついた さおを 1ぽん えらんでね。',
    items: [
      { id: 'choinage_rod', art: 'choinage_rod', name: 'ちょいなげロッド', say: 'ちょいなげロッド。ふつうの ながさで、おもりを かるく なげるのに ちょうど いい さおだよ。' },
      { id: 'iso_rod', art: 'iso_rod', name: 'いそざお', say: 'いそざお。ながくて やわらかい さお。ウキづりや サビキづりに つかうよ。' },
      { id: 'lure_rod', art: 'lure_rod', name: 'ルアーロッド', say: 'ルアーロッド。かるくて シャキッとした さお。ルアーを とおくへ なげられるよ。' },
      { id: 'ana_rod', art: 'ana_rod', name: 'あなづりロッド', say: 'あなづりロッド。みじかい さお。あしもとの すきまに しかけを おとしやすいよ。' },
    ],
  },
  {
    id: 'rig', title: 'しかけ', type: 'one',
    say: 'つぎは しかけ。いとの さきに つける ものだよ。',
    items: [
      { id: 'tenbin', art: 'tenbin', name: 'てんびん しかけ', say: 'てんびん しかけ。おもりで とおくへ とばして、すなの うえで えさを まつよ。ちょいなげ よう。' },
      { id: 'sabiki', art: 'sabiki', name: 'サビキ しかけ', say: 'サビキ しかけ。ちいさな はりが たくさん。むれの さかなが いっぺんに かかるよ。' },
      { id: 'uki_shikake', art: 'uki_shikake', name: 'ウキ しかけ', say: 'ウキ しかけ。ウキで えさを みずの なかに ぷかぷか させて まつよ。' },
      { id: 'leader', art: 'leader', name: 'リーダーと スナップ', say: 'リーダーと スナップ。ルアーを つけかえる ための いとと かなぐだよ。' },
      { id: 'burakuri', art: 'burakuri', name: 'ブラクリ', say: 'ブラクリ。おもりと はりが いっしょに なっていて、いわの すきまに すとんと おとせるよ。' },
    ],
  },
  {
    id: 'bait', title: 'エサ・ルアー', type: 'one',
    say: 'さいごに エサか ルアーを えらぼう。さかなの ごはんだね。',
    items: [
      { id: 'aoisome', art: 'aoisome', name: 'アオイソメ', say: 'アオイソメ。にょろにょろの うみの むし。すなや いわの さかなが だいすきだよ。' },
      { id: 'amiebi', art: 'amiebi', name: 'アミエビ', say: 'アミエビ。ちいさな えびの かたまり。まくと さかなが あつまってくるよ。サビキづり よう。' },
      { id: 'okiami', art: 'okiami', name: 'オキアミ', say: 'オキアミ。ピンクいろの えび。ウキづりの ていばん エサだよ。' },
      { id: 'jig', art: 'jig', name: 'メタルジグ', say: 'メタルジグ。きらきら ひかる きんぞくの ルアー。さかなが ちいさな さかなと まちがえて たべにくるよ。' },
    ],
  },
];
const ITEM_BY_ID = Object.fromEntries(SHELVES.flatMap(s => s.items.map(i => [i.id, i])));

/* ───────── さかな ─────────
   weight が おおきいほど つれやすい / rare は めったに つれない
   spiky: とげや はが あって さわるとき ちゅうい
*/
const FISH = [
  { id: 'haze',   name: 'ハゼ',   body: '#b89a6a', belly: '#efe2c4', fin: '#9c7f52', pattern: 'spots',   patColor: '#7a5f3a', len: 0.85, h: 0.8,  weight: 30,
    fact: 'すなの うえで じっとしている ちいさな さかな。まんまるの めが かわいいね。' },
  { id: 'kisu',   name: 'キス',   body: '#e7cdb8', belly: '#fbf3ec', fin: '#d9b79c', pattern: 'none',    patColor: '',        len: 1.15, h: 0.6,  weight: 25,
    fact: 'すなはまに いる、すきとおった きれいな さかな。' },
  { id: 'karei',  name: 'カレイ', body: '#8a6d4a', belly: '#f2ead8', fin: '#76593a', pattern: 'spots',   patColor: '#5e4630', len: 0.95, h: 1.25, weight: 10,
    fact: 'からだが ひらべったくて、すなに かくれるのが じょうず。めが かたほうに よっているよ。' },
  { id: 'aji',    name: 'アジ',   body: '#7f9fb8', belly: '#e9f0f5', fin: '#c9b95a', pattern: 'line',    patColor: '#e6c84a', len: 1.0,  h: 0.8,  weight: 30,
    fact: 'みんなで むれを つくって およぐよ。ぎんいろに ぴかぴか ひかるね。' },
  { id: 'iwashi', name: 'イワシ', body: '#5a7fa8', belly: '#eef3f8', fin: '#7d97b3', pattern: 'dots',    patColor: '#1f2a38', len: 0.95, h: 0.6,  weight: 30,
    fact: 'おおきな むれで およぐ ちいさな さかな。よこに くろい てんてんが ならんでいるよ。' },
  { id: 'saba',   name: 'サバ',   body: '#3f8a8c', belly: '#eef4f2', fin: '#2f6d70', pattern: 'stripes', patColor: '#1e4f55', len: 1.1,  h: 0.75, weight: 20,
    fact: 'せなかの しましま もようが めじるし。とっても はやく およぐよ。' },
  { id: 'mebaru', name: 'メバル', body: '#5a4a52', belly: '#cdb8b0', fin: '#4a3a42', pattern: 'none',    patColor: '',        len: 0.9,  h: 0.95, weight: 20, eyeBig: true,
    fact: 'めが とっても おおきいから「メバル」って いうんだよ。' },
  { id: 'kasago', name: 'カサゴ', body: '#d0573f', belly: '#f3c9a8', fin: '#b8432f', pattern: 'blotch',  patColor: '#9c3322', len: 0.9,  h: 1.0,  weight: 25, spines: true, spiky: true,
    fact: 'いわの すきまに かくれているよ。とげとげが あるから、さわるときは きをつけてね。' },
  { id: 'kamasu', name: 'カマス', body: '#9a9a7a', belly: '#f0efe6', fin: '#c9b65a', pattern: 'none',    patColor: '',        len: 1.35, h: 0.45, weight: 30, spiky: true,
    fact: 'ほそながくて、くちに するどい はが あるよ。さわるときは きをつけてね。' },
  { id: 'ainame', name: 'アイナメ', body: '#8a5a3a', belly: '#e6c9a8', fin: '#6e4429', pattern: 'blotch', patColor: '#5a3520', len: 1.1,  h: 0.8,  weight: 8, rare: true,
    fact: 'いわの あいだに すんでいるよ。からだの いろを まわりに あわせて かえられるんだ。' },
  { id: 'kurodai', name: 'クロダイ', body: '#4d5560', belly: '#b9bec5', fin: '#3a4049', pattern: 'none',  patColor: '',        len: 1.05, h: 1.1,  weight: 6, rare: true, spiky: true,
    fact: 'かしこくて なかなか つれない さかな。つれたら すごいよ!' },
  { id: 'suzuki', name: 'スズキ', body: '#8fa2b0', belly: '#eef2f5', fin: '#6f8494', pattern: 'none',    patColor: '',        len: 1.3,  h: 0.75, weight: 6, rare: true, spiky: true,
    fact: 'おおきく なると なまえが かわる「しゅっせうお」。こどもの ころは セイゴって いうよ。' },
  { id: 'tai',    name: 'マダイ', body: '#ec6f84', belly: '#fbd6dc', fin: '#d95870', pattern: 'spots',   patColor: '#7fd3ff', len: 1.0,  h: 1.05, weight: 4, rare: true,
    fact: '「めでたい」の タイ! おいわいの ひに たべる さかなだよ。すごい!' },
];
const FISH_BY_ID = Object.fromEntries(FISH.map(f => [f.id, f]));

/* ───────── いまの どうぐ ───────── */
const Loadout = {
  method: null,
  gear: { rod: null, rig: null, bait: null },

  get m() { return METHOD_BY_ID[this.method]; },
  picked() { return SHELVES.every(s => this.gear[s.id]); },

  // えらんだ どうぐに いちばん ちかい つりかたと、ちがっている どうぐを しらべる
  check() {
    let best = null;
    for (const m of METHODS) {
      const score = SHELVES.filter(s => this.gear[s.id] === m.gear[s.id]).length
        + (this.gear.rig === m.gear.rig ? 0.5 : 0); // しかけが あっている つりかたを ゆうせん
      if (!best || score > best.score) best = { m, score };
    }
    const wrong = SHELVES
      .filter(s => this.gear[s.id] !== best.m.gear[s.id])
      .map(s => ({ shelf: s, picked: ITEM_BY_ID[this.gear[s.id]], best: ITEM_BY_ID[best.m.gear[s.id]] }));
    return { method: best.m, wrong };
  },
  ready() {
    return !!(this.m && this.picked() && this.check().wrong.length === 0);
  },
  save() {
    Save.data.loadout = { method: this.method, gear: this.gear };
    Save.write();
  },
  load() {
    const l = Save.data.loadout;
    if (!l || !l.gear) return;
    SHELVES.forEach(s => { if (ITEM_BY_ID[l.gear[s.id]]) this.gear[s.id] = l.gear[s.id]; });
    if (METHOD_BY_ID[l.method]) this.method = l.method;
  },
};

function pickFish() {
  const pool = (Loadout.m || METHODS[0]).fish.map(id => FISH_BY_ID[id]);
  const total = pool.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for (const f of pool) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return pool[0];
}

// つった きろく（ブラウザに ほぞん）
const Save = {
  KEY: 'fishing-lecture-save-v1',
  data: { caught: {}, tutorialDone: false, loadout: null },
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) this.data = Object.assign(this.data, JSON.parse(raw));
    } catch (e) { /* ほぞん できない かんきょう */ }
  },
  write() {
    try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch (e) {}
  },
  addFish(id) {
    this.data.caught[id] = (this.data.caught[id] || 0) + 1;
    this.write();
  },
  total() {
    return Object.values(this.data.caught).reduce((s, n) => s + n, 0);
  },
  kinds() {
    return Object.keys(this.data.caught).length;
  },
};
Save.load();
Loadout.load();

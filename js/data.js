/* ゲームの ないよう（ここを かえると セリフ・どうぐ・さかなを かえられます） */

// すすみぐあい バー
const STEPS = [
  { icon: '🏪', label: 'つりぐや' },
  { icon: '🤝', label: 'やくそく' },
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
    gear: { rod: 'choinage_rod', line: 'nylon3', rig: 'tenbin', bait: 'aoisome' },
  },
  {
    id: 'sabiki', name: 'サビキづり', art: 'sabiki',
    desc: 'ちいさな はりが たくさん ついた しかけを あしもとに おとして、むれで およぐ さかなを いっぺんに つるよ。',
    cast: 'drop', indicator: 'rodtip',
    fish: ['aji', 'iwashi', 'saba'],
    gear: { rod: 'iso_rod', line: 'nylon3', rig: 'sabiki', bait: 'amiebi' },
  },
  {
    id: 'uki', name: 'ウキづり', art: 'uki_shikake',
    desc: 'ウキを うかべて まつよ。ウキが ぐーっと しずんだら さかなの あいず!',
    cast: 'throw', indicator: 'bobber',
    fish: ['mebaru', 'aji', 'kurodai', 'tai'],
    gear: { rod: 'iso_rod', line: 'nylon2', rig: 'uki_shikake', bait: 'okiami' },
  },
  {
    id: 'lure', name: 'ルアーづり', art: 'jig',
    desc: 'えさの かわりに さかなの かたちの ルアーを なげて、まきながら さかなを さそうよ。',
    cast: 'throw', indicator: 'rodtip',
    fish: ['kamasu', 'saba', 'suzuki'],
    gear: { rod: 'lure_rod', line: 'pe', rig: 'leader', bait: 'jig' },
  },
  {
    id: 'saguri', name: 'さぐりづり', art: 'burakuri',
    desc: 'あしもとの いわや ブロックの すきまに しかけを そっと おとして、かくれている さかなを ねらうよ。',
    cast: 'drop', indicator: 'rodtip',
    fish: ['kasago', 'mebaru', 'ainame'],
    gear: { rod: 'ana_rod', line: 'nylon3', rig: 'burakuri', bait: 'aoisome' },
  },
];
const METHOD_BY_ID = Object.fromEntries(METHODS.map(m => [m.id, m]));

/* ───────── つりぐやさんの たな ─────────
   type: one  = 1つ えらぶ（つりかたに あうか チェック）
         must = ok の ものを ぜんぶ えらぶ
         free = すきなだけ えらぶ（えらばなくても いい）
   art が あれば え（SVG）、なければ icon（えもじ）を つかう
*/
const SHELVES = [
  {
    id: 'rod', title: 'ロッド・リール', type: 'one',
    say: 'まずは さおと リール。つりかたに あう さおを えらんでね。',
    items: [
      { id: 'choinage_rod', art: 'choinage_rod', name: 'ちょいなげロッド', say: 'ちょいなげロッド。ふつうの ながさで、おもりを かるく なげるのに ちょうど いい さおだよ。' },
      { id: 'iso_rod', art: 'iso_rod', name: 'いそざお', say: 'いそざお。ながくて やわらかい さお。ウキづりや サビキづりに つかうよ。' },
      { id: 'lure_rod', art: 'lure_rod', name: 'ルアーロッド', say: 'ルアーロッド。かるくて シャキッとした さお。ルアーを とおくへ なげられるよ。' },
      { id: 'ana_rod', art: 'ana_rod', name: 'あなづりロッド', say: 'あなづりロッド。みじかい さお。あしもとの すきまに しかけを おとしやすいよ。' },
    ],
  },
  {
    id: 'line', title: 'ライン（いと）', type: 'one',
    say: 'つぎは リールに まく いと、ラインだよ。',
    items: [
      { id: 'nylon3', art: 'nylon3', name: 'ナイロン 3ごう', say: 'ナイロンライン 3ごう。やわらかくて つかいやすい、ふつうの ふとさの いと。いろんな つりに つかえるよ。' },
      { id: 'nylon2', art: 'nylon2', name: 'ナイロン 2ごう', say: 'ナイロンライン 2ごう。ほそめの いと。ウキが しずみやすくて、さかなに きづかれにくいよ。' },
      { id: 'pe', art: 'pe', name: 'PEライン', say: 'PEライン。ほそいのに とっても つよい いと。ルアーを とおくまで とばせるよ。' },
    ],
  },
  {
    id: 'rig', title: 'しかけ', type: 'one',
    say: 'こんどは しかけ。いとの さきに つける ものだよ。',
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
  {
    id: 'safety', title: 'みを まもる もの', type: 'must',
    say: 'みを まもる どうぐも わすれずに! ひつような ものを ぜんぶ えらんでね。',
    items: [
      { id: 'jacket', icon: '🦺', name: 'ライフジャケット', ok: true, say: 'ライフジャケット! みずに おちても からだが うくよ。つりでは かならず きようね。' },
      { id: 'hat', icon: '🧢', name: 'ぼうし', ok: true, say: 'ぼうし! おひさまから あたまを まもるよ。なげた しかけが あたっても あんしん。' },
      { id: 'ukiwa', icon: '🛟', name: 'うきわ', ok: false, say: 'うきわは なみで ながされちゃうし、すぐ ぬげちゃう。ライフジャケットの かわりには ならないよ。' },
    ],
  },
  {
    id: 'extra', title: 'あると べんりな もの', type: 'free',
    say: 'あると べんりな ものだよ。ほしい ものを えらんでね。えらばなくても だいじょうぶ。',
    items: [
      { id: 'cooler', art: 'cooler', name: 'クーラーボックス', say: 'クーラーボックス。つった さかなを つめたい まま もってかえれるよ。' },
      { id: 'ice', icon: '🧊', name: 'こおり', say: 'こおり。クーラーボックスに いれて、さかなを ひやすよ。' },
      { id: 'grip', art: 'grip', name: 'フィッシュグリップ', say: 'フィッシュグリップ。とげの ある さかなも、てを けがせずに つかめるよ。' },
      { id: 'scissors', icon: '✂️', name: 'ハサミ', say: 'ハサミ。からまった いとを きるときに つかうよ。' },
      { id: 'plier', art: 'plier', name: 'プライヤー', say: 'プライヤー。さかなの くちから はりを はずすときに つかうよ。' },
      { id: 'bucket', icon: '🪣', name: 'みずくみバケツ', say: 'みずくみバケツ。うみの みずを くんで、てを ぬらしたり さかなを いれたりするよ。' },
      { id: 'towel', art: 'towel', name: 'タオル', say: 'タオル。ぬれた てを ふくよ。' },
      { id: 'glasses', icon: '🕶️', name: 'へんこう サングラス', say: 'へんこう サングラス。みずの ぎらぎらが きえて、みずの なかが よく みえるよ。めも まもってくれる。' },
      { id: 'game', icon: '🎮', name: 'ゲームき', ok: false, say: 'ゲームは おやすみ。つりの ときは しかけを みていようね。' },
    ],
  },
];
const ITEM_BY_ID = Object.fromEntries(SHELVES.flatMap(s => s.items.map(i => [i.id, i])));

// ステップ2: あんぜんの やくそく（a が せいかい）
const SAFETY = [
  {
    q: 'つりには だれと いく?',
    a: { icon: '👪', label: 'おとなと いっしょ', say: 'せいかい! つりは かならず おとなの ひとと いっしょに いこうね。' },
    b: { icon: '🧒', label: 'こどもだけ', say: 'こどもだけは あぶないよ。みずの ちかくには おとなと いっしょに いこうね。' },
  },
  {
    q: 'みずの ちかくでは どうする?',
    a: { icon: '🚶', label: 'ゆっくり あるく', say: 'せいかい! みずの ちかくは すべりやすいから、ゆっくり あるこうね。' },
    b: { icon: '🏃', label: 'はしる', say: 'はしると すべって、みずに おちちゃうかも。ゆっくり あるこうね。' },
  },
  {
    q: 'みずの ちかくで きるものは?',
    a: { icon: '🦺', label: 'ライフジャケット', say: 'せいかい! ライフジャケットを きていれば、みずに おちても からだが うくよ。' },
    b: { icon: '👕', label: 'Tシャツだけ', say: 'Tシャツだけだと、みずに おちたとき あぶないよ。ライフジャケットを きようね。' },
  },
  {
    q: 'とがった「はり」は どうする?',
    a: { icon: '🙋', label: 'おとなに たのむ', say: 'せいかい! はりは とがっていて あぶないから、おとなの ひとに たのもうね。' },
    b: { icon: '✊', label: 'ぎゅっと にぎる', say: 'いたたた! はりは とがっているよ。にぎっちゃ だめだよ。' },
  },
  {
    q: 'さおを なげる まえに どうする?',
    a: { icon: '👀', label: 'うしろを みる', say: 'せいかい! うしろに ひとが いないか、かならず みてから なげようね。' },
    b: { icon: '💨', label: 'すぐ なげる', say: 'うしろに ひとが いたら、はりが ささっちゃうかも。まず うしろを みようね。' },
  },
];

/* ───────── さかな ─────────
   weight が おおきいほど つれやすい / rare は どうぐが ぜんぶ ぴったりの ときだけ
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
  gear: { rod: null, line: null, rig: null, bait: null },
  safety: [],
  extra: [],

  reset(methodId) {
    this.method = methodId;
    this.gear = { rod: null, line: null, rig: null, bait: null };
    this.safety = [];
    this.extra = [];
  },
  get m() { return METHOD_BY_ID[this.method]; },
  has(id) { return this.extra.includes(id); },
  // ぴったりな どうぐの かず（0〜4）
  matchCount() {
    if (!this.m) return 0;
    return Object.keys(this.m.gear).filter(k => this.gear[k] === this.m.gear[k]).length;
  },
  ready() {
    return !!(this.method && Object.values(this.gear).every(Boolean));
  },
  save() {
    Save.data.loadout = { method: this.method, gear: this.gear, safety: this.safety, extra: this.extra };
    Save.write();
  },
  load() {
    const l = Save.data.loadout;
    if (l && METHOD_BY_ID[l.method]) Object.assign(this, JSON.parse(JSON.stringify(l)));
  },
};

// どうぐの ぴったりさで つれる さかなが かわる
function pickFish() {
  const m = Loadout.m || METHODS[0];
  const perfect = Loadout.matchCount() === 4;
  let pool = m.fish.map(id => FISH_BY_ID[id]).filter(f => perfect || !f.rare);
  if (Loadout.matchCount() <= 1) {
    // どうぐが あっていないと、いちばん つれやすい さかなだけ
    pool = [pool.reduce((a, b) => (b.weight > a.weight ? b : a))];
  }
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
  data: { caught: {}, tutorialDone: false, safetyDone: false, loadout: null },
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

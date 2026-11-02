/* ゲームの ないよう（ここを かえると セリフや さかなを ふやせます） */

// すすみぐあい バー
const STEPS = [
  { icon: '🧰', label: 'どうぐ' },
  { icon: '🤝', label: 'やくそく' },
  { icon: '🪱', label: 'えさ' },
  { icon: '🎣', label: 'なげる' },
  { icon: '👀', label: 'まつ' },
  { icon: '🔄', label: 'まく' },
];

// ステップ1: どうぐ あつめ（ok: true が ひつような もの）
const TOOLS = [
  { id: 'rod',    icon: '🎣', name: 'つりざお', ok: true,  say: 'つりざお! さかなを つる ながい ぼうだよ。' },
  { id: 'bobber', icon: 'BOBBER', name: 'うき', ok: true,  say: 'うき! ぷかぷか うかんで、さかなが きたら おしえてくれるよ。' },
  { id: 'bait',   icon: '🪱', name: 'えさ', ok: true,      say: 'えさ! さかなの ごはんだよ。' },
  { id: 'jacket', icon: '🦺', name: 'ライフジャケット', ok: true, say: 'ライフジャケット! みずに おちても からだが うくから あんしんだよ。' },
  { id: 'bucket', icon: '🪣', name: 'バケツ', ok: true,    say: 'バケツ! つれた さかなを いれるよ。' },
  { id: 'hat',    icon: '🧢', name: 'ぼうし', ok: true,    say: 'ぼうし! おひさまから あたまを まもるよ。' },
  { id: 'ice',    icon: '🍦', name: 'アイス', ok: false,   say: 'アイスは とけちゃうよ〜。つりには いらないね。' },
  { id: 'game',   icon: '🎮', name: 'ゲームき', ok: false, say: 'ゲームは おやすみ。つりの ときは うきを みていようね。' },
  { id: 'bear',   icon: '🧸', name: 'ぬいぐるみ', ok: false, say: 'ぬいぐるみは ぬれちゃうから、おうちで まっていてもらおう。' },
];

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

// つれる さかな（weight が おおきいほど つれやすい）
const FISH = [
  { id: 'haze',   name: 'ハゼ',   body: '#b89a6a', belly: '#efe2c4', fin: '#9c7f52', pattern: 'spots',   patColor: '#7a5f3a', len: 0.85, h: 0.8,  weight: 30,
    fact: 'すなの うえで じっとしている ちいさな さかな。まんまるの めが かわいいね。' },
  { id: 'aji',    name: 'アジ',   body: '#7f9fb8', belly: '#e9f0f5', fin: '#c9b95a', pattern: 'line',    patColor: '#e6c84a', len: 1.0,  h: 0.8,  weight: 30,
    fact: 'みんなで むれを つくって およぐよ。ぎんいろに ぴかぴか ひかるね。' },
  { id: 'saba',   name: 'サバ',   body: '#3f8a8c', belly: '#eef4f2', fin: '#2f6d70', pattern: 'stripes', patColor: '#1e4f55', len: 1.1,  h: 0.75, weight: 20,
    fact: 'せなかの しましま もようが めじるし。とっても はやく およぐよ。' },
  { id: 'mebaru', name: 'メバル', body: '#5a4a52', belly: '#cdb8b0', fin: '#4a3a42', pattern: 'none',    patColor: '',        len: 0.9,  h: 0.95, weight: 15, eyeBig: true,
    fact: 'めが とっても おおきいから「メバル」って いうんだよ。' },
  { id: 'kasago', name: 'カサゴ', body: '#d0573f', belly: '#f3c9a8', fin: '#b8432f', pattern: 'blotch',  patColor: '#9c3322', len: 0.9,  h: 1.0,  weight: 12, spines: true,
    fact: 'いわの すきまに かくれているよ。とげとげが あるから、さわるときは きをつけてね。' },
  { id: 'kisu',   name: 'キス',   body: '#e7cdb8', belly: '#fbf3ec', fin: '#d9b79c', pattern: 'none',    patColor: '',        len: 1.15, h: 0.6,  weight: 10,
    fact: 'すなはまに いる、すきとおった きれいな さかな。' },
  { id: 'tai',    name: 'マダイ', body: '#ec6f84', belly: '#fbd6dc', fin: '#d95870', pattern: 'spots',   patColor: '#7fd3ff', len: 1.0,  h: 1.05, weight: 4, rare: true,
    fact: '「めでたい」の タイ! おいわいの ひに たべる さかなだよ。すごい!' },
];

const FISH_BY_ID = Object.fromEntries(FISH.map(f => [f.id, f]));

function pickFish() {
  const total = FISH.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for (const f of FISH) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return FISH[0];
}

// つった きろく（ブラウザに ほぞん）
const Save = {
  KEY: 'fishing-lecture-save-v1',
  data: { caught: {}, tutorialDone: false },
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

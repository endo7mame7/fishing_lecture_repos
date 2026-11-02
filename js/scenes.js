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

/* ───────── ずかん ───────── */
Scenes.zukan = {
  step: -1,
  enter() {
    const kinds = Save.kinds();
    App.say(kinds === 0
      ? 'これは さかな ずかん。\nつった さかなが ここに のるよ。つりに いってみよう!'
      : `いままでに ${kinds}しゅるいの さかなを つったよ!\nさかなを タッチすると おはなし するよ。`);

    const junk = Save.data.junk || 0;
    const wrap = h(`<div class="zukan"><div class="zukan-head">📖 さかな ずかん <b>${kinds} / ${FISH.length}</b>${junk ? ` <span class="zjunk">🗑️ ごみ ひろい ${junk}こ</span>` : ''}</div><div class="zukan-grid"></div></div>`);
    const grid = wrap.querySelector('.zukan-grid');
    FISH.forEach(f => {
      const n = Save.data.caught[f.id] || 0;
      const best = (Save.data.best || {})[f.id] || 0;
      const where = METHODS.filter(m => m.fish.includes(f.id)).map(m => m.name).join('・');
      const card = h(`
        <button class="zcard ${n ? '' : 'unknown'}">
          ${f.rare ? '<span class="zrare">レア</span>' : ''}
          ${Art.fish(f, { silhouette: !n })}
          <span class="zname">${n ? f.name : '？？？'}</span>
          <span class="zcount">${n ? `${n}ひき${best ? ` ・ さいだい ${best}センチ` : ''}` : where}</span>
        </button>`);
      card.addEventListener('click', () => {
        if (n) { Sfx.pop(); App.say(`${f.name}。${best ? `いちばん おおきいのは ${best}センチ。` : ''}\n${f.fact}`); }
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

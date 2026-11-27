// Plank Emoji Wrapped 2026 — vanilla, data-driven from emoji.json

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DUR = 7000;
const HEADCOUNT = 25; // Plank, for the Emoji Coefficient
// Tiers from Liam Galvin's "Company Culture = Slack Emoji ÷ √Headcount"
const CULTURE_TIERS = [
  { min: 0,  label: 'Poor',       note: 'Default emoji and a stale party parrot.' },
  { min: 5,  label: 'Healthy',    note: 'Functional. Nobody is worried.' },
  { min: 20, label: 'Thriving',   note: ':this-is-fine: in #incidents, daily.' },
  { min: 50, label: 'Late-stage', note: 'Emoji now reference other emoji. HR has asked for a glossary.' },
];
const CULTURE_SRC = 'https://lia.mg/posts/measuring-company-culture-with-slack-emoji/';

// Tokens that would form a "family" but aren't one.
const STOP = new Set(['the','of','a','and','is','my','in','on','to','it','that','this','with','out','no','yes','hi','up','e']);
// Merge spellings into one squad.
const ALIAS = { nessie: 'nessy', kitty: 'cat', meow: 'cat', cats: 'cat', blobs: 'blob', frogs: 'frog', froggy: 'frog', hearts: 'heart' };

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const img = (e, cls = '') => e.file
  ? `<img class="${cls}" src="${esc(e.file)}" alt=":${esc(e.name)}:" data-name="${esc(e.name)}" data-added="${esc(e.added)}" decoding="async">`
  : '';
const fmtDate = iso => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${MONTHS_LONG[m - 1]} ${d}`;
};

function stats(all) {
  const list = all.filter(e => e.file);
  const byMonth = Array.from({ length: 12 }, () => []);
  const byDay = new Map();
  for (const e of list) {
    byMonth[Number(e.added.slice(5, 7)) - 1].push(e);
    const day = e.added.slice(0, 10);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(e);
  }
  const lastMonth = byMonth.reduce((acc, m, i) => (m.length ? i : acc), 0);
  const [bigDay, bigDayList] = [...byDay].sort((a, b) => b[1].length - a[1].length)[0];

  // Squads: shared name tokens
  const fam = new Map();
  for (const e of list) {
    const toks = new Set(e.name.toLowerCase().split(/[-_]+/).map(t => ALIAS[t] || t)
      .filter(t => t.length > 2 && !STOP.has(t) && !/^\d+$/.test(t)));
    for (const t of toks) { if (!fam.has(t)) fam.set(t, []); fam.get(t).push(e); }
  }
  const squads = [...fam].filter(([, v]) => v.length >= 3)
    .sort((a, b) => b[1].length - a[1].length).slice(0, 5);

  const longest = [...list].sort((a, b) => b.name.length - a.name.length)[0];
  const animated = list.filter(e => e.animated);
  const cats = list.filter(e => e.pet === 'cat');
  const dogs = list.filter(e => e.pet === 'dog');
  const culture = Math.round(list.length / Math.sqrt(HEADCOUNT) * 10) / 10;
  const tierIdx = CULTURE_TIERS.reduce((t, x, i) => (culture >= x.min ? i : t), 0);

  return { all, list, byMonth, lastMonth, bigDay, bigDayList, squads, longest, animated, cats, dogs, culture, tierIdx,
    first: list[0], latest: list[list.length - 1], busiestMonth: byMonth.reduce((b, m, i) => (m.length > byMonth[b].length ? i : b), 0) };
}

function rain(list, n = 36) {
  const pick = shuffle(list).slice(0, n);
  return `<div class="rain" aria-hidden="true">${pick.map(e => {
    const s = 28 + Math.random() * 44;
    return `<img src="${esc(e.file)}" alt="" style="left:${Math.random() * 100}%;--s:${s}px;--t:${5 + Math.random() * 6}s;--delay:${-Math.random() * 10}s;--r:${(Math.random() * 720 - 360) | 0}deg">`;
  }).join('')}</div>`;
}

function buildSlides(S) {
  const slides = [];

  slides.push({ cls: 'bg-intro', html: `
    ${rain(S.list, 40)}
    <div class="stack">
      <p class="kicker rise">Plank · #new-emoji</p>
      <h1 class="big rise d1">2026<br>Wrapped</h1>
      <p class="sub rise d2">A year of reacting, unwrapped. Tap to continue →</p>
    </div>` });

  slides.push({ cls: 'bg-total', html: `
    ${rain(S.list, 28)}
    <div class="stack">
      <p class="kicker rise">This year, Plank added</p>
      <p class="big rise d1"><span data-count="${S.list.length}">0</span></p>
      <p class="h rise d2">custom emoji</p>
      <p class="sub rise d3">That's about ${Math.round(S.list.length / ((new Date(S.latest.added) - new Date('2026-01-01')) / 6048e5))} a week, every week.</p>
    </div>` });

  slides.push({ cls: 'bg-first', html: `
    <div class="stack">
      <p class="kicker rise">It all started on ${fmtDate(S.first.added)}</p>
      ${img(S.first, 'hero')}
      <p class="h rise d2" style="max-width:none;font-size:clamp(22px,6vw,64px)"><span class="mono">:${esc(S.first.name)}:</span></p>
      <p class="sub rise d3">The first emoji of 2026. A humble beginning.</p>
    </div>` });

  let stagger = 0;
  slides.push({ cls: 'bg-months', html: `
    <div class="stack" style="width:100%">
      <p class="kicker rise">Month by month</p>
      <p class="h rise d1" style="margin-inline:auto">${MONTHS_LONG[S.busiestMonth]} went off</p>
      <div class="bars">
        ${S.byMonth.slice(0, S.lastMonth + 1).map((m, i) => `
          <div class="bar ${i === S.busiestMonth ? 'top' : ''}">
            <span class="n" style="animation-delay:${1 + i * .12}s">${m.length}</span>
            <div class="col">${m.map(e => img(e)).map(h => h.replace('<img ', `<img style="animation-delay:${(0.6 + (stagger++) * Math.min(0.02, 2.5 / S.list.length)).toFixed(2)}s" `)).join('')}</div>
            <b>${MONTHS[i]}</b>
          </div>`).join('')}
      </div>
      <p class="sub rise d5" style="margin-inline:auto">${S.byMonth[S.busiestMonth].length} new emoji in ${MONTHS_LONG[S.busiestMonth]} alone.</p>
    </div>` });

  slides.push({ cls: 'bg-day', html: `
    <div class="stack">
      <p class="kicker rise">The biggest single day</p>
      <p class="h rise d1" style="margin-inline:auto">${fmtDate(S.bigDay)}</p>
      <p class="sub rise d2" style="margin-inline:auto">${S.bigDayList.length} emoji dropped in one day. Someone had a mission.</p>
      <div class="burst">${S.bigDayList.map((e, i) => img(e).replace('<img ', `<img style="animation-delay:${(1 + i * .08).toFixed(2)}s" `)).join('')}</div>
    </div>` });

  if (S.squads.length) slides.push({ cls: 'bg-squads', html: `
    <div class="stack" style="width:100%">
      <p class="kicker rise">Top squads</p>
      <p class="h rise d1" style="margin-inline:auto">Emoji travel in packs</p>
      <div class="squads" style="margin-inline:auto">
        ${S.squads.map(([name, v], i) => `
          <div class="squad rise" style="animation-delay:${.6 + i * .35}s">
            <div>
              <h3>${esc(name[0].toUpperCase() + name.slice(1))}<small>${v.length}</small></h3>
              <div class="row">${v.slice(0, 14).map(e => img(e)).join('')}</div>
            </div>
            <span class="rank">#${i + 1}</span>
          </div>`).join('')}
      </div>
    </div>` });

  if (S.cats.length + S.dogs.length) {
    const catsWin = S.cats.length >= S.dogs.length;
    const [hi, lo] = catsWin ? [S.cats.length, S.dogs.length] : [S.dogs.length, S.cats.length];
    const ratio = lo ? Math.round(hi / lo * 10) / 10 : hi;
    const side = (label, arr, d) => `
      <div class="team ${arr.length === hi && hi !== lo ? 'win' : ''}">
        <p class="kicker rise" style="animation-delay:${d}s">${label}</p>
        <p class="big rise" style="animation-delay:${d + .15}s"><span data-count="${arr.length}">0</span></p>
        <div class="pile">${arr.map((e, i) => img(e).replace('<img ', `<img style="animation-delay:${(d + .6 + i * .06).toFixed(2)}s" `)).join('')}</div>
      </div>`;
    slides.push({ cls: 'bg-pets', html: `
    <div class="stack" style="width:100%">
      <p class="kicker rise">The age-old question</p>
      <p class="h rise d1">Cats or dogs?</p>
      <div class="versus">
        ${side('Cats', S.cats, .5)}
        <span class="vs rise d3">vs</span>
        ${side('Dogs', S.dogs, .9)}
      </div>
      <p class="sub rise d5">${catsWin ? 'Plank is a cat company' : 'Plank is a dog company'}, ${ratio} to 1. ${Math.round((S.cats.length + S.dogs.length) / S.list.length * 100)}% of everything we added this year was a pet.</p>
    </div>` });
  }

  if (S.animated.length) slides.push({ cls: 'bg-moving', html: `
    <div class="stack">
      <p class="kicker rise">Still images are for quitters</p>
      <p class="big rise d1">${S.animated.length}</p>
      <p class="sub rise d2" style="margin-inline:auto">of them move. ${Math.round(S.animated.length / S.list.length * 100)}% of the year was animated.</p>
      <div class="wall">${shuffle(S.animated).slice(0, 40).map((e, i) => img(e).replace('<img ', `<img style="animation-delay:${(1 + i * .05).toFixed(2)}s" `)).join('')}</div>
    </div>` });

  slides.push({ cls: 'bg-name', html: `
    <div class="stack">
      <p class="kicker rise">Longest name award</p>
      ${img(S.longest, 'hero')}
      <p class="h rise d2" style="max-width:none;font-size:clamp(20px,4.4vw,54px)"><span class="mono">:${esc(S.longest.name)}:</span></p>
      <p class="sub rise d3" style="margin-inline:auto">${S.longest.name.length + 2} characters. Autocomplete was invented for this.</p>
    </div>` });

  {
    const tier = CULTURE_TIERS[S.tierIdx];
    // Four equal-width tiers; place the pin proportionally inside its tier (top tier tops out at 100)
    const lo = tier.min, hi = CULTURE_TIERS[S.tierIdx + 1]?.min ?? 100;
    const pos = Math.min(98, (S.tierIdx + Math.min(1, (S.culture - lo) / (hi - lo))) * 25);
    slides.push({ cls: 'bg-culture', html: `
    <div class="stack" style="width:100%">
      <p class="kicker rise">Peer-reviewed by nobody</p>
      <p class="h rise d1">Our culture, scientifically measured</p>
      <p class="formula rise d2">
        <span><i>C</i> = </span><span class="frac"><span>${S.list.length} <small>emoji</small></span><span>√${HEADCOUNT} <small>Plankers</small></span></span>
        <span> = <b data-count-dec="${S.culture}">0</b></span>
      </p>
      <div class="meter rise d3" style="--pos:${pos}%">
        ${CULTURE_TIERS.map((t, i) => `<span class="${i === S.tierIdx ? 'here' : ''}" style="--from:${i * 25}%;--to:${(i + 1) * 25}%">${t.label}</span>`).join('')}
        <i class="pin" aria-hidden="true"></i>
      </div>
      <p class="sub rise d4"><b>${tier.label} culture.</b> ${tier.note} And that's only counting 2026.</p>
      <p class="cite rise d5">Method: Liam Galvin, <a href="${CULTURE_SRC}" target="_blank" rel="noopener">“Company Culture = Slack Emoji ÷ √Headcount”</a> (Nov 2026). No values posters were harmed.</p>
    </div>` });
  }

  slides.push({ cls: 'bg-latest', html: `
    ${rain(S.list, 20)}
    <div class="stack">
      <p class="kicker rise">Freshest drop · ${fmtDate(S.latest.added)}</p>
      ${img(S.latest, 'hero')}
      <p class="h rise d2" style="margin-inline:auto;max-width:none;font-size:clamp(22px,6vw,64px)"><span class="mono">:${esc(S.latest.name)}:</span></p>
      <p class="sub rise d3" style="margin-inline:auto">And 2026 isn't over yet.</p>
    </div>` });

  slides.push({ cls: 'bg-finale', final: true, html: `
    <div class="finale-head">
      <p class="kicker rise">The whole collection</p>
      <p class="h rise d1" style="margin-inline:auto;max-width:none">All ${S.list.length} of 2026</p>
      <p class="sub rise d2" style="margin-inline:auto">Hover or tap any emoji. Click to copy its name.</p>
    </div>
    <div class="grid">${S.list.map((e, i) =>
      `<button type="button" data-name="${esc(e.name)}" data-added="${esc(e.added)}" style="animation-delay:${(0.8 + i * Math.min(.012, 3 / S.list.length)).toFixed(3)}s">${img(e)}</button>`).join('')}</div>
    <button class="replay" type="button" data-replay>↺ Watch again</button>` });

  return slides;
}

function countUp(el) {
  const dec = el.dataset.countDec != null;
  const target = Number(dec ? el.dataset.countDec : el.dataset.count);
  const t0 = performance.now(), d = 1600;
  const tick = t => {
    const p = Math.min(1, (t - t0) / d);
    const v = target * (1 - Math.pow(1 - p, 3));
    el.textContent = dec ? v.toFixed(1) : Math.round(v);
    if (p < 1) requestAnimationFrame(tick);
  };
  setTimeout(() => requestAnimationFrame(tick), 400);
}

async function main() {
  const stage = $('#stage'), progress = $('#progress'), app = $('#app'), tip = $('#tooltip');
  stage.innerHTML = '<div class="slide bg-intro"><p class="loading">Unwrapping…</p></div>';

  const data = Array.isArray(window.EMOJI) ? [...window.EMOJI] : [];
  if (!data.length) {
    stage.innerHTML = '<div class="slide bg-intro"><p class="loading">Couldn’t load the emoji data</p></div>';
    return;
  }
  data.sort((a, b) => a.added.localeCompare(b.added));
  const S = stats(data);
  const slides = buildSlides(S);

  progress.innerHTML = slides.map(() => '<span><i></i></span>').join('');
  const bars = [...progress.children];
  let idx = -1, timer = null, paused = false, remaining = DUR, startedAt = 0;

  function schedule(ms) {
    clearTimeout(timer);
    if (slides[idx].final || paused) return;
    startedAt = performance.now(); remaining = ms;
    timer = setTimeout(() => go(idx + 1), ms);
  }

  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === idx) return;
    const old = stage.querySelector('.slide:not(.out)');
    if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 400); }
    idx = n;
    const el = document.createElement('section');
    el.className = `slide ${slides[n].cls}`;
    el.setAttribute('aria-label', `Slide ${n + 1} of ${slides.length}`);
    el.innerHTML = slides[n].html;
    stage.appendChild(el);
    el.querySelectorAll('[data-count], [data-count-dec]').forEach(countUp);

    bars.forEach((b, i) => {
      b.className = i < n ? 'done' : '';
      const fresh = b.firstElementChild.cloneNode(); b.replaceChild(fresh, b.firstElementChild);
    });
    void bars[n].offsetWidth;
    bars[n].className = slides[n].final ? 'done' : 'active';
    app.classList.toggle('final', !!slides[n].final);
    schedule(DUR);
  }

  function togglePause(force) {
    paused = force ?? !paused;
    app.classList.toggle('paused', paused);
    $('#pause').textContent = paused ? '▶' : '❚❚';
    $('#pause').setAttribute('aria-label', paused ? 'Play' : 'Pause');
    if (paused) { clearTimeout(timer); remaining -= performance.now() - startedAt; }
    else schedule(Math.max(300, remaining));
  }

  $('#next').addEventListener('click', () => go(idx + 1));
  $('#prev').addEventListener('click', () => go(idx - 1));
  $('#pause').addEventListener('click', () => togglePause());
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(idx + 1);
    else if (e.key === 'ArrowLeft') go(idx - 1);
    else if (e.key === ' ') { e.preventDefault(); togglePause(); }
  });

  // Tooltip + copy + replay (delegated)
  let tipHost = null;
  const showTip = target => {
    const host = target.closest('.grid button') || target.closest('[data-name]');
    if (host === tipHost) return; // moving between a button and its own image
    tipHost = host;
    if (!host) return tip.classList.remove('on');
    const r = host.getBoundingClientRect();
    tip.innerHTML = `:${esc(host.dataset.name)}:<small>added ${fmtDate(host.dataset.added)}</small>`;
    tip.style.left = `${Math.min(innerWidth - 90, Math.max(90, r.left + r.width / 2))}px`;
    tip.style.top = `${r.top}px`;
    tip.classList.add('on');
  };
  stage.addEventListener('pointerover', e => showTip(e.target));
  stage.addEventListener('pointerout', e => { if (!e.relatedTarget?.closest?.('[data-name]')) { tipHost = null; tip.classList.remove('on'); } });
  stage.addEventListener('animationend', e => { if (e.animationName === 'wave') e.target.classList.add('in'); });
  stage.addEventListener('focusin', e => showTip(e.target));
  stage.addEventListener('click', async e => {
    if (e.target.closest('[data-replay]')) return go(0);
    const b = e.target.closest('.grid button');
    if (!b) return;
    try { await navigator.clipboard.writeText(`:${b.dataset.name}:`); tip.innerHTML = `Copied :${esc(b.dataset.name)}:`; } catch {}
  });
  // Retry a failed image once (busy connection), then hide it if it is really missing
  stage.addEventListener('error', e => {
    const im = e.target;
    if (im.tagName !== 'IMG') return;
    if (!im.dataset.retried) {
      im.dataset.retried = '1';
      const src = im.getAttribute('src');
      setTimeout(() => { im.src = `${src}${src.includes('?') ? '&' : '?'}r=1`; }, 400 + Math.random() * 800);
      return;
    }
    (im.closest('.grid button') || im).remove();
  }, true);
  stage.addEventListener('scroll', () => { tipHost = null; tip.classList.remove('on'); }, true);

  go(0);
}

main();

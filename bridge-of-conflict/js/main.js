/* Bridge of Conflict — отрисовка страницы из window.content.
   Тексты правятся в js/content.js, здесь только логика. */
(function () {
  'use strict';
  var c = window.content;
  if (!c) return;

  /* ---------- помощники ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // Экранирует текст, подставляет {client}/{server}, `код` и подсвечивает <ЗАПОЛНИТЬ: ...>
  function fmt(s) {
    var t = String(s == null ? '' : s)
      .replace(/\{client\}/g, c.links.client)
      .replace(/\{server\}/g, c.links.server);
    return esc(t)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/&lt;ЗАПОЛНИТЬ[^&]*&gt;(:&lt;[^&]*&gt;)?/g, '<mark class="todo">$&</mark>');
  }
  function isTodo(url) { return !url || /^\s*</.test(url); }
  function linkAttrs(url) {
    if (isTodo(url)) return 'href="#" data-todo title="' + esc(c.ui.todoLink) + '"';
    return 'href="' + esc(url) + '" target="_blank" rel="noopener"';
  }
  // Заглушка под картинку: исчезает сама, когда файл появляется в img/
  function ph(image, cls, eager) {
    if (!image) return '';
    return '<figure class="ph ' + (cls || '') + '">' +
      '<img src="' + esc(image.src) + '" alt="' + esc(image.note) + '" loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async">' +
      '<figcaption><span class="ph__label">' + esc(c.ui.placeholder) + '</span>' +
      '<code>' + esc(image.src) + '</code> — ' + esc(image.note) + '</figcaption></figure>';
  }
  var ORNAMENT = '<div class="ornament" aria-hidden="true"><span></span><i></i><span></span></div>';
  function head(o, id) {
    return '<div class="section__head reveal"><h2 id="' + id + '-title">' + esc(o.title) + '</h2>' + ORNAMENT +
      (o.lead ? '<p class="section__lead">' + fmt(o.lead) + '</p>' : '') + '</div>';
  }
  function section(id, cls, inner) {
    return '<section class="section ' + cls + '" id="' + id + '" aria-labelledby="' + id + '-title"><div class="wrap">' + inner + '</div></section>';
  }
  function list(arr, fn) { return arr.map(fn).join(''); }

  /* ---------- шапка ---------- */
  var h = c.header;
  document.getElementById('header').innerHTML =
    '<div class="wrap header__in">' +
      '<a class="logo" href="#top">' + esc(h.logo) + '</a>' +
      '<nav class="nav" id="nav" aria-label="Основное меню">' +
        list(h.menu, function (m) { return '<a href="' + esc(m.href) + '">' + esc(m.text) + '</a>'; }) +
        '<a class="nav__discord" ' + linkAttrs(c.links.discord) + '>' + esc(h.discord) + '</a>' +
      '</nav>' +
      '<div class="header__cta">' +
        '<a class="btn btn--fire btn--sm" href="#start">' + esc(h.play) + '</a>' +
        '<a class="btn btn--ghost btn--sm header__discord" ' + linkAttrs(c.links.discord) + '>' + esc(h.discord) + '</a>' +
        '<button class="burger" id="burger" aria-controls="nav" aria-expanded="false" aria-label="' + esc(c.ui.menuOpen) + '"><span></span><span></span><span></span></button>' +
      '</div>' +
    '</div>';

  /* ---------- секции ---------- */
  var html = '';

  // Hero
  var b = c.battle;
  html += '<section class="hero" id="top">' +
    ph(c.hero.image, 'ph--hero', true) +
    '<div class="hero__glow" aria-hidden="true"><i></i><i></i></div>' +
    '<div class="wrap hero__in">' +
      '<p class="eyebrow">' + esc(c.hero.eyebrow) + '</p>' +
      '<h1>' + esc(c.hero.title) + '</h1>' + ORNAMENT +
      '<p class="hero__sub">' + fmt(c.hero.subtitle) + '</p>' +
      '<div class="hero__btns">' +
        '<a class="btn btn--fire" href="#start">' + esc(c.hero.btnPlay) + '</a>' +
        '<a class="btn btn--ghost" ' + linkAttrs(c.links.discord) + '>' + esc(c.hero.btnDiscord) + '</a>' +
      '</div>' +
      '<div class="timer" id="timer" role="timer" aria-live="off">' +
        '<p class="timer__label" id="timer-label">' + esc(b.labelNext) + '</p>' +
        '<div class="timer__digits">' +
          list([0, 1, 2], function (i) {
            return '<div class="timer__cell"><b id="t' + i + '">--</b><span>' + esc(b.units[i]) + '</span></div>';
          }) +
        '</div>' +
        '<p class="timer__note">' + esc(b.schedule) + '<span id="timer-local"></span></p>' +
      '</div>' +
    '</div></section>';

  // О сервере
  html += section('about', '', head(c.about, 'about') +
    '<div class="grid grid--4">' + list(c.about.items, function (it) {
      return '<article class="slab tile reveal"><div class="medal" aria-hidden="true">' + it.icon + '</div>' +
        '<h3>' + esc(it.title) + '</h3><p>' + fmt(it.text) + '</p></article>';
    }) + '</div>');

  // Фракции
  var f = c.factions;
  html += section('factions', 'section--alt', head(f, 'factions') +
    '<div class="grid grid--3">' + list(f.items, function (it) {
      return '<article class="slab faction faction--' + esc(it.id) + ' reveal">' +
        ph(it.image, 'ph--card') +
        '<div class="faction__body">' +
          '<h3><span aria-hidden="true">' + it.icon + '</span> ' + esc(it.name) + '</h3>' +
          '<p>' + fmt(it.text) + '</p>' +
          '<dl>' +
            '<div><dt>' + esc(f.labels.base) + '</dt><dd>' + fmt(it.base) + '</dd></div>' +
            '<div><dt>' + esc(f.labels.classes) + '</dt><dd class="chips">' + list(it.classes, function (x) { return '<span>' + esc(x) + '</span>'; }) + '</dd></div>' +
            '<div><dt>' + esc(f.labels.enemy) + '</dt><dd><strong>' + esc(it.enemy) + '</strong></dd></div>' +
          '</dl>' +
          (it.extra ? '<p class="faction__extra">' + fmt(it.extra) + '</p>' : '') +
        '</div></article>';
    }) + '</div>' +
    '<div class="balance slab reveal">' +
      '<h3>' + esc(f.balanceTitle) + '</h3>' +
      '<div class="balance__bar" aria-hidden="true">' + list(f.shares, function (s) {
        return '<span class="bg-' + esc(s.id) + '" style="flex:' + Number(s.value) + '"><b>' + esc(s.name) + '</b> ' + esc(s.label) + '</span>';
      }) + '</div>' +
      '<p>' + fmt(f.balance) + '</p>' +
    '</div>');

  // Классы
  var k = c.classes;
  html += section('classes', '', head(k, 'classes') +
    '<p class="swipe-hint" aria-hidden="true">' + esc(k.labels.swipe) + '</p>' +
    '<div class="classes" tabindex="0" aria-label="' + esc(k.title) + '">' + list(k.items, function (it) {
      var out = it.factions.length === 1 && it.factions[0] === 'outcasts';
      return '<article class="slab class ' + (out ? 'class--outcasts' : '') + ' reveal">' +
        '<header><div class="medal" aria-hidden="true">' + it.icon + '</div>' +
          '<div><h3>' + esc(it.name) + '</h3><p class="class__role">' + esc(it.role) + '</p></div></header>' +
        '<p class="tags">' + list(it.factions, function (id) {
          return '<span class="tag tag--' + esc(id) + '">' + esc(k.factionNames[id]) + '</span>';
        }) + '</p>' +
        '<ul class="stats">' + list(Object.keys(it.stats), function (s) {
          return '<li><span>' + esc(s) + '</span><i><u style="width:' + Math.min(100, it.stats[s] / k.statMax * 100) + '%"></u></i><b>' + esc(it.stats[s]) + '</b></li>';
        }) + '</ul>' +
        '<h4>' + esc(k.labels.skills) + '</h4>' +
        '<p class="chips chips--skills">' + list(it.skills, function (s) { return '<span>' + esc(s) + '</span>'; }) + '</p>' +
        '<ul class="proscons">' +
          list(it.pros, function (p) { return '<li class="pro">' + fmt(p) + '</li>'; }) +
          list(it.cons, function (p) { return '<li class="con">' + fmt(p) + '</li>'; }) +
        '</ul></article>';
    }) + '</div>' +
    '<p class="note reveal">' + fmt(k.note) + '</p>');

  // События
  html += section('events', 'section--alt', head(c.events, 'events') +
    '<div class="grid grid--4 events">' + list(c.events.items, function (it) {
      return '<article class="slab event ' + (it.featured ? 'event--featured ' : '') + (it.wide ? 'event--wide ' : '') + 'reveal">' +
        (it.image ? ph(it.image, 'ph--card') : '') +
        '<div class="event__body">' +
          '<div class="event__top"><div class="medal" aria-hidden="true">' + it.icon + '</div>' +
          '<div><h3>' + esc(it.name) + '</h3><p class="event__when">' + esc(it.when) + '</p></div></div>' +
          '<p>' + fmt(it.text) + '</p>' +
          (it.points ? '<ul class="bullets">' + list(it.points, function (p) { return '<li>' + fmt(p) + '</li>'; }) + '</ul>' : '') +
        '</div></article>';
    }) + '</div>');

  // Смерть и долг
  html += section('death', '', '<div class="parchment reveal">' +
    '<p class="parchment__kicker">' + esc(c.death.kicker) + '</p>' +
    '<h2 id="death-title">' + esc(c.death.title) + '</h2>' +
    '<ul>' + list(c.death.items, function (t) { return '<li>' + fmt(t) + '</li>'; }) + '</ul></div>');

  // Праздники
  var hol = c.holidays;
  html += section('holidays', 'section--alt', head(hol, 'holidays') +
    '<ol class="calendar reveal" id="calendar" tabindex="0" aria-label="' + esc(hol.title) + '">' + list(hol.items, function (it, i) {
      return '<li class="slab holiday" data-i="' + i + '"><span class="holiday__badge"></span>' +
        '<div class="holiday__icon" aria-hidden="true">' + it.icon + '</div>' +
        '<h3>' + esc(it.name) + '</h3><p>' + fmt(it.when) + '</p></li>';
    }) + '</ol>' +
    '<p class="note reveal">' + fmt(hol.note) + '</p><p class="note note--dim reveal">❄ ' + fmt(hol.weather) + '</p>');

  // Ветераны
  var v = c.veterans;
  html += section('veterans', '', '<div class="veterans">' +
    '<div class="reveal">' + '<h2 id="veterans-title">' + esc(v.title) + '</h2>' + ORNAMENT +
      '<p>' + fmt(v.text) + '</p>' +
      '<h4>' + esc(v.milestonesLabel) + '</h4>' +
      '<p class="chips chips--gold">' + list(v.milestones, function (m) { return '<span>' + esc(m) + '</span>'; }) + '</p>' +
      '<p class="note note--left">' + fmt(v.note) + '</p></div>' +
    '<div class="reveal">' + ph(v.image, 'ph--box') + '</div></div>');

  // Как начать
  var s = c.start;
  html += section('start', 'section--alt', head(s, 'start') +
    '<div class="start">' +
      '<ol class="steps">' + list(s.steps, function (st, i) {
        return '<li class="slab step reveal"><span class="step__n" aria-hidden="true">' + (i + 1) + '</span>' +
          '<div><h3>' + esc(st.title) + '</h3><p>' + fmt(st.text) + '</p>' +
          (i === 0 && !isTodo(c.links.client) ? '<p><a class="btn btn--ghost btn--sm" ' + linkAttrs(c.links.client) + '>' + esc(c.footer.client) + '</a></p>' : '') +
          '</div></li>';
      }) + '</ol>' +
      '<aside class="slab commands reveal"><h3>' + esc(s.commandsTitle) + '</h3>' +
        '<dl>' + list(s.commands, function (x) {
          return '<div><dt><code>' + esc(x.cmd) + '</code></dt><dd>' + fmt(x.text) + '</dd></div>';
        }) + '</dl>' +
        '<h4>' + esc(s.chatTitle) + '</h4><p>' + fmt(s.chatTip) + '</p></aside>' +
    '</div>');

  // Правила
  html += section('rules', '', head(c.rules, 'rules') +
    '<div class="accordion reveal">' + list(c.rules.items, function (r, i) {
      return '<details class="slab"><summary><span class="acc__n">' + (i + 1) + '</span>' + esc(r.title) + '</summary><p>' + fmt(r.text) + '</p></details>';
    }) + '</div>');

  // FAQ
  html += section('faq', 'section--alt', head(c.faq, 'faq') +
    '<div class="accordion reveal">' + list(c.faq.items, function (q) {
      return '<details class="slab"><summary>' + esc(q.q) + '</summary><p>' + fmt(q.a) + '</p></details>';
    }) + '</div>');

  document.getElementById('main').innerHTML = html;

  // Подвал
  var ft = c.footer;
  document.getElementById('footer').innerHTML = '<div class="wrap">' +
    '<a class="logo" href="#top">' + esc(h.logo) + '</a>' + ORNAMENT +
    '<p class="footer__links">' +
      '<a ' + linkAttrs(c.links.discord) + '>' + esc(ft.discord) + '</a>' +
      '<a ' + linkAttrs(c.links.client) + '>' + esc(ft.client) + '</a>' +
      '<a href="#top">' + esc(c.ui.toTop) + ' ↑</a></p>' +
    '<p>' + esc(ft.time) + '. ' + esc(ft.timeNow) + ' <b id="server-time">--:--</b></p>' +
    '<p class="footer__legal">' + fmt(ft.legal) + '</p></div>';

  /* ---------- картинки-заглушки ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.ph img'), function (img) {
    function ok() { if (img.naturalWidth > 0) img.parentNode.classList.add('ph--loaded'); }
    function fail() { if (img.parentNode) img.parentNode.removeChild(img); }
    if (img.complete) { img.naturalWidth > 0 ? ok() : fail(); }
    else { img.addEventListener('load', ok); img.addEventListener('error', fail); }
  });

  /* ---------- незаполненные ссылки ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-todo]');
    if (a) e.preventDefault();
  });

  /* ---------- мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var header = document.getElementById('header');
  function setMenu(open) {
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  burger.addEventListener('click', function () { setMenu(!header.classList.contains('is-open')); });
  document.getElementById('nav').addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- появление блоков ---------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  }

  /* ---------- время в часовом поясе сервера ---------- */
  var TZ = b.timeZone, dtf;
  function makeDtf(tz) {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'
    });
  }
  try { dtf = makeDtf(TZ); }
  catch (e) { try { dtf = makeDtf('Europe/Kiev'); } catch (e2) { dtf = null; } } // старые браузеры
  // Дата и время «на стене» в поясе сервера
  function zoned(ms) {
    var o = {};
    if (!dtf) { // запасной вариант: UTC+2
      var d = new Date(ms + 2 * 3600e3);
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate(), hour: d.getUTCHours(), minute: d.getUTCMinutes(), second: d.getUTCSeconds() };
    }
    dtf.formatToParts(new Date(ms)).forEach(function (p) { if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10); });
    o.hour = o.hour % 24;
    return o;
  }
  function offset(ms) { // смещение пояса сервера от UTC в мс
    var p = zoned(ms);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(ms / 1000) * 1000;
  }
  function zonedToUtc(y, m, d, hh, mm) { // момент UTC для времени «на стене» сервера
    var guess = Date.UTC(y, m - 1, d, hh, mm);
    return guess - offset(guess - offset(guess));
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- таймер Битвы за мост ---------- */
  var timer = document.getElementById('timer');
  var tLabel = document.getElementById('timer-label');
  var tLocal = document.getElementById('timer-local');
  var tCells = [0, 1, 2].map(function (i) { return document.getElementById('t' + i); });
  var serverTime = document.getElementById('server-time');
  var localShown = false;

  function tick() {
    var now = Date.now();
    var p = zoned(now);
    var start = zonedToUtc(p.year, p.month, p.day, b.hour, b.minute);
    var end = start + b.durationMin * 60e3;
    var live = now >= start && now < end;
    var target;
    if (live) target = end;
    else if (now < start) target = start;
    else { // сегодня битва прошла — считаем до завтрашней
      var t = new Date(Date.UTC(p.year, p.month - 1, p.day + 1));
      target = zonedToUtc(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), b.hour, b.minute);
    }
    var left = Math.max(0, Math.ceil((target - now) / 1000));
    tCells[0].textContent = pad(Math.floor(left / 3600));
    tCells[1].textContent = pad(Math.floor(left % 3600 / 60));
    tCells[2].textContent = pad(left % 60);
    timer.classList.toggle('is-live', live);
    tLabel.textContent = live ? b.labelLive + ' ' + b.labelLiveSub + ':' : b.labelNext;
    serverTime.textContent = pad(p.hour) + ':' + pad(p.minute);

    if (!localShown) { // показать время битвы по часам посетителя, если оно отличается
      localShown = true;
      var d = new Date(live ? start : target);
      if (d.getHours() !== b.hour || d.getMinutes() !== b.minute) {
        tLocal.textContent = ' · ' + b.localPrefix + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
      }
    }
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- ближайший праздник ---------- */
  function easter(year, kind) { // [месяц, день] по григорианскому календарю
    if (kind === 'western') {
      var a = year % 19, b1 = Math.floor(year / 100), c1 = year % 100, d = Math.floor(b1 / 4), e = b1 % 4,
        f1 = Math.floor((b1 + 8) / 25), g = Math.floor((b1 - f1 + 1) / 3), h1 = (19 * a + b1 - d - g + 15) % 30,
        i = Math.floor(c1 / 4), k1 = c1 % 4, l = (32 + 2 * e + 2 * i - h1 - k1) % 7,
        m = Math.floor((a + 11 * h1 + 22 * l) / 451), mo = Math.floor((h1 + l - 7 * m + 114) / 31),
        da = (h1 + l - 7 * m + 114) % 31 + 1;
      return [mo, da];
    }
    var a2 = year % 4, b2 = year % 7, c2 = year % 19, d2 = (19 * c2 + 15) % 30, e2 = (2 * a2 + 4 * b2 - d2 + 34) % 7;
    var jm = Math.floor((d2 + e2 + 114) / 31), jd = (d2 + e2 + 114) % 31 + 1;
    var dt = new Date(Date.UTC(year, jm - 1, jd + 13)); // юлианский → григорианский (1900–2099)
    return [dt.getUTCMonth() + 1, dt.getUTCDate()];
  }
  (function () {
    var p = zoned(Date.now());
    var today = Date.UTC(p.year, p.month - 1, p.day);
    var best = null;
    hol.items.forEach(function (it, i) {
      for (var y = p.year; y <= p.year + 1; y++) {
        var st = it.easter ? easter(y, it.easter) : it.start;
        if (!st) return;
        var en = it.end || st;
        var sMs = Date.UTC(y, st[0] - 1, st[1]);
        var eMs = Date.UTC(en[0] < st[0] ? y + 1 : y, en[0] - 1, en[1]);
        if (eMs >= today) {
          if (!best || sMs < best.s) best = { i: i, s: sMs, now: sMs <= today };
          return;
        }
      }
    });
    if (!best) return;
    var cal = document.getElementById('calendar');
    var el = cal.querySelector('[data-i="' + best.i + '"]');
    el.classList.add('is-next');
    el.querySelector('.holiday__badge').textContent = best.now ? hol.badgeNow : hol.badgeNext;
    // прокрутить ленту к ближайшему празднику (только саму ленту, не страницу)
    cal.scrollLeft = Math.max(0, el.offsetLeft - cal.offsetLeft - (cal.clientWidth - el.offsetWidth) / 2);
  })();
})();

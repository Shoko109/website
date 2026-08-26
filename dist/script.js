/* スマホのメニューの開け閉め */
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('mobile-nav');
  if (!toggle || !nav) return;

  var label = toggle.querySelector('.menu-label');

  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (label) label.textContent = open ? 'とじる' : 'メニュー';
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // メニューの項目を押したら閉じる（ページ内リンクでも閉じるように）
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  // Esc キー、および画面をパソコン幅に広げたときも閉じる
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) setOpen(false);
  });
});

/* 上の帯（パソコン用）は、下にスクロールするにつれて
   背景のうすいピンクがだんだん濃くなります（急に切り替わらないように）。
   高さは変わらないので、ページの中身は動きません。 */
document.addEventListener('DOMContentLoaded', function () {
  var bar = document.querySelector('.topbar');
  if (!bar) return;

  var FADE_OVER = 160; // これだけスクロールしたら、いちばん濃くなります
  var ticking = false;

  function apply() {
    var p = Math.min(Math.max(window.scrollY, 0) / FADE_OVER, 1);
    document.documentElement.style.setProperty('--wash', p.toFixed(3));
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(apply);
  }, { passive: true });

  apply(); // 途中から開いたページ（#lesson など）にも合わせます
});

/* 上の帯の「まとめメニュー」（レッスン／教室について）の開け閉め。
   マウスを乗せても、キーボードで選んでも開きます。 */
document.addEventListener('DOMContentLoaded', function () {
  var groups = [].slice.call(document.querySelectorAll('.nav-group'));
  if (!groups.length) return;

  function setOpen(group, open) {
    var trigger = group.querySelector('.nav-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeAll(except) {
    groups.forEach(function (g) { if (g !== except) setOpen(g, false); });
  }

  groups.forEach(function (group) {
    var trigger = group.querySelector('.nav-trigger');
    var timer;

    group.addEventListener('mouseenter', function () {
      clearTimeout(timer);
      closeAll(group);
      setOpen(group, true);
    });
    // すこし待ってから閉じます（見出しからメニューへ動かす途中で消えないように）
    group.addEventListener('mouseleave', function () {
      timer = setTimeout(function () { setOpen(group, false); }, 140);
    });

    trigger.addEventListener('click', function () {
      var open = trigger.getAttribute('aria-expanded') === 'true';
      closeAll(group);
      setOpen(group, !open);
    });

    // キーボードで中に入ったら開き、外に出たら閉じます
    group.addEventListener('focusin', function () {
      clearTimeout(timer);
      closeAll(group);
      setOpen(group, true);
    });
    group.addEventListener('focusout', function () {
      setTimeout(function () {
        if (!group.contains(document.activeElement)) setOpen(group, false);
      }, 0);
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-group')) closeAll();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('.nav-trigger[aria-expanded="true"]');
    if (!open) return;
    closeAll();
    open.focus();
  });
});

/* スクロールに合わせて、各セクションをふわっと表示するための仕組みです。
   （このファイルを消してもサイトは普通に表示されます） */
document.addEventListener('DOMContentLoaded', function () {
  var targets = document.querySelectorAll(
    '.stitle, .block .body > *, .news-inner > *, .cta-band > *, ' +
    '.profile-grid > *, .contact-grid > *, .thanks > *'
  );

  // 同じ並びの要素は、少しずつ時間差をつけて表示する
  var counters = new Map();
  targets.forEach(function (el) {
    var parent = el.parentElement;
    var n = counters.get(parent) || 0;
    counters.set(parent, n + 1);
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(n * 100, 400) + 'ms';
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
});

/* ==========================================================================
   main.js — theme, nav, header, accordion, scroll-spy, skills filter, clock
   No dependencies. Every block guards on the element existing so this one
   file can be shared across all pages.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.remove('no-js');

  /* ---- theme toggle ----------------------------------------------------
     The stored preference is applied by an inline script in <head> before
     first paint; this only wires up the button. */
  var toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) {
    var sync = function () {
      var explicit = root.getAttribute('data-theme');
      var dark = explicit
        ? explicit === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      toggle.setAttribute('aria-pressed', String(dark));
      toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    };

    toggle.addEventListener('click', function () {
      var explicit = root.getAttribute('data-theme');
      var dark = explicit
        ? explicit === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      var next = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      sync();
    });

    // follow the OS while the user has expressed no explicit choice
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onMq = function () { if (!root.getAttribute('data-theme')) sync(); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
    else if (mq.addListener) mq.addListener(onMq);

    sync();
  }

  /* ---- mobile nav ------------------------------------------------------ */
  var menuBtn = document.querySelector('[data-menu-btn]');
  var nav = document.getElementById('primary-nav');
  if (menuBtn && nav) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };

    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (menuBtn.getAttribute('aria-expanded') !== 'true') return;
      if (!nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ---- sticky header + scroll progress --------------------------------- */
  var header = document.querySelector('.header');
  var progress = document.querySelector('.progress');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 40);

    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---- accordion -------------------------------------------------------- */
  var accItems = document.querySelectorAll('.acc__item');
  Array.prototype.forEach.call(accItems, function (item) {
    var trigger = item.querySelector('.acc__trigger');
    var panel = item.querySelector('.acc__panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', function () {
      var open = trigger.getAttribute('aria-expanded') === 'true';

      // single-open accordion within a group
      var group = item.closest('.accordion');
      if (group && !open) {
        Array.prototype.forEach.call(group.querySelectorAll('.acc__item.is-open'), function (other) {
          if (other === item) return;
          other.classList.remove('is-open');
          var t = other.querySelector('.acc__trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }

      trigger.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
    });
  });

  /* ---- services scroll-spy --------------------------------------------- */
  var spyLinks = document.querySelectorAll('[data-spy] a');
  if (spyLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    Array.prototype.forEach.call(spyLinks, function (a) {
      var id = a.getAttribute('href').slice(1);
      if (id) byId[id] = a;
    });

    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.forEach.call(spyLinks, function (a) { a.classList.remove('is-active'); });
        var active = byId[entry.target.id];
        if (active) active.classList.add('is-active');
      });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spyObserver.observe(section);
    });
  }

  /* ---- skills filter ---------------------------------------------------- */
  var tabs = document.querySelectorAll('[data-skill-tab]');
  if (tabs.length) {
    var chips = document.querySelectorAll('[data-skill-group]');

    Array.prototype.forEach.call(tabs, function (tab) {
      tab.addEventListener('click', function () {
        var want = tab.getAttribute('data-skill-tab');

        Array.prototype.forEach.call(tabs, function (t) {
          t.setAttribute('aria-selected', String(t === tab));
        });

        Array.prototype.forEach.call(chips, function (chip, i) {
          var show = want === 'all' || chip.getAttribute('data-skill-group') === want;
          chip.classList.toggle('is-hidden', !show);
          if (show && !reduced) {
            chip.style.animation = 'none';
            // force reflow so the animation restarts on every filter change
            void chip.offsetWidth;
            chip.style.animation = 'rise 380ms var(--ease-out) backwards';
            chip.style.animationDelay = Math.min(i * 22, 300) + 'ms';
          }
        });
      });
    });
  }

  /* ---- live Bangladesh clock ------------------------------------------- */
  var clock = document.querySelector('[data-clock]');
  if (clock) {
    var fmt = null;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (e) { /* environment without full ICU */ }

    var tick = function () {
      if (fmt) {
        clock.textContent = fmt.format(new Date());
      } else {
        // fall back to a fixed UTC+6 offset
        var d = new Date();
        var t = new Date(d.getTime() + (d.getTimezoneOffset() + 360) * 60000);
        clock.textContent =
          ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2);
      }
    };
    tick();
    setInterval(tick, 30000);
  }

  /* ---- current year ----------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---- lazily mount the Calendly embed ---------------------------------
     The widget script is ~90KB; loading it eagerly would hurt LCP. */
  var cal = document.querySelector('[data-calendly]');
  if (cal) {
    var mounted = false;
    var mount = function () {
      if (mounted) return;
      mounted = true;

      var s = document.createElement('script');
      s.src = 'https://assets.calendly.com/assets/external/widget.js';
      s.async = true;
      s.onerror = function () {
        var fb = cal.querySelector('[data-calendly-fallback]');
        var w = cal.querySelector('.calendly-inline-widget');
        if (w) w.style.display = 'none';
        if (fb) fb.hidden = false;
      };
      document.head.appendChild(s);

      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://assets.calendly.com/assets/external/widget.css';
      document.head.appendChild(link);
    };

    if ('IntersectionObserver' in window) {
      var calObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { mount(); calObs.disconnect(); }
      }, { rootMargin: '400px' });
      calObs.observe(cal);
    } else {
      mount();
    }
  }
})();

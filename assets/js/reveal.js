/* ==========================================================================
   reveal.js — scroll reveals, stat count-up, timeline progress
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* If motion is off or IO is unavailable, show everything immediately and
     print the final numbers. Nothing below should ever hide content. */
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
      el.classList.add('is-visible');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
      el.textContent = el.getAttribute('data-count');
    });
    Array.prototype.forEach.call(document.querySelectorAll('.process'), function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  /* ---- staggered reveals ------------------------------------------------ */
  var revealObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
    revealObserver.observe(el);
  });

  /* Apply a stagger to direct children of any [data-stagger] container. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-stagger]'), function (group) {
    var step = parseInt(group.getAttribute('data-stagger'), 10) || 60;
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (child.hasAttribute('data-reveal')) {
        child.style.setProperty('--reveal-delay', (i * step) + 'ms');
      }
    });
  });

  /* ---- process line ----------------------------------------------------- */
  var processObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  Array.prototype.forEach.call(document.querySelectorAll('.process'), function (el) {
    processObserver.observe(el);
  });

  /* ---- stat count-up ---------------------------------------------------- */
  function countUp(el) {
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    if (isNaN(target)) { el.textContent = raw; return; }

    var decimals = (raw.split('.')[1] || '').length;
    var duration = 1500;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      // ease-out cubic
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(frame);
  }

  var countObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
    el.textContent = '0';
    countObserver.observe(el);
  });

  /* ---- timeline progress line ------------------------------------------
     Scroll-linked: the gradient fills as the timeline passes the viewport
     midpoint. Uses rAF-throttled scroll rather than a scroll-timeline so it
     behaves identically across browsers. */
  var timeline = document.querySelector('.timeline');
  var fill = document.querySelector('.timeline__fill');

  if (timeline && fill) {
    var items = timeline.querySelectorAll('.tl-item');

    var itemObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.35 });
    Array.prototype.forEach.call(items, function (el) { itemObserver.observe(el); });

    var tlTicking = false;
    var updateFill = function () {
      var rect = timeline.getBoundingClientRect();
      var trackTop = rect.top + 12;
      var trackHeight = rect.height - 24;
      if (trackHeight <= 0) { tlTicking = false; return; }

      var anchor = window.innerHeight * 0.55;
      var p = (anchor - trackTop) / trackHeight;
      fill.style.height = trackHeight + 'px';
      fill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)) + ')';
      tlTicking = false;
    };

    window.addEventListener('scroll', function () {
      if (!tlTicking) { requestAnimationFrame(updateFill); tlTicking = true; }
    }, { passive: true });
    window.addEventListener('resize', updateFill);
    updateFill();
  }
})();

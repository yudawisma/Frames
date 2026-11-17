/* ===== Reel: public/js/reel.js (dimuat setelah frames.js) ===== */
(function () {
  var tpl = document.getElementById('reelTpl');
  var firstSet = document.querySelector('.fr-set');
  if (!tpl || !firstSet) return;

  // sisipkan setelah set foto pertama, sebelum catatan pertama
  firstSet.insertAdjacentHTML('afterend', tpl.innerHTML);
  var reel = document.querySelector('.fr-reel');
  var v = reel.querySelector('video');
  var btn = reel.querySelector('.fr-reel__sound');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var userPaused = false;

  function play() { var p = v.play(); if (p) p.catch(function () {}); }

  if (reduced) {
    v.controls = true;
    btn.hidden = true;
    reel.classList.add('is-in');
    return;
  }

  btn.addEventListener('click', function () {
    v.muted = !v.muted;
    btn.setAttribute('aria-pressed', String(!v.muted));
    btn.textContent = v.muted ? 'Nyalakan suara' : 'Matikan suara';
    if (!v.muted) { userPaused = false; play(); }
  });

  v.addEventListener('click', function () {
    if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          reel.classList.add('is-in');
          if (!userPaused) play();
        } else {
          v.pause();
          if (!v.muted) { v.muted = true; btn.setAttribute('aria-pressed', 'false'); btn.textContent = 'Nyalakan suara'; }
        }
      });
    }, { threshold: 0.45 }).observe(reel);
  } else {
    reel.classList.add('is-in');
    play();
  }
})();
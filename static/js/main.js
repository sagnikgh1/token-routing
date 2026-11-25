// Project page behaviour: the reel plays while it is on screen, the comparison player switches scenes, results tabs.
(function () {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const play = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };

  // reel and comparison video: play only while visible (and not with reduced motion)
  const cmp = document.getElementById('cmp');
  let cmpUserPaused = reduce;
  const watch = (els, ok) => {
    if (!('IntersectionObserver' in window)) { if (!reduce) els.forEach(play); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting && !reduce && ok(e.target)) play(e.target); else if (!e.isIntersecting) e.target.pause();
    }), { threshold: 0.25 });
    els.forEach((v) => io.observe(v));
  };
  watch([...document.querySelectorAll('#reel video')], () => true);
  if (cmp) watch([cmp], () => !cmpUserPaused);

  // comparison player: play/pause, time, scene picker
  const btn = document.getElementById('cmpPlay'), icon = document.getElementById('cmpIcon'), txt = document.getElementById('cmpPlayTxt'), time = document.getElementById('cmpTime');
  const PAUSE = 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z', PLAY = 'M8 5.5v13l10.5-6.5z';
  const sync = () => { const p = cmp.paused; icon.setAttribute('d', p ? PLAY : PAUSE); txt.textContent = p ? 'Play' : 'Pause'; btn.setAttribute('aria-label', p ? 'Play' : 'Pause'); };
  if (cmp) {
    cmp.addEventListener('play', sync); cmp.addEventListener('pause', sync);
    cmp.addEventListener('timeupdate', () => { const d = cmp.duration || 0; time.textContent = cmp.currentTime.toFixed(1) + ' / ' + d.toFixed(1) + ' s'; });
    cmp.addEventListener('loadedmetadata', () => { time.textContent = '0.0 / ' + cmp.duration.toFixed(1) + ' s'; });
    btn.addEventListener('click', () => { if (cmp.paused) { cmpUserPaused = false; play(cmp); } else { cmpUserPaused = true; cmp.pause(); } });
    cmp.addEventListener('click', () => btn.click());
    sync();
    document.querySelectorAll('#scenes .gal-card').forEach((c) => c.addEventListener('click', () => {
      document.querySelectorAll('#scenes .gal-card').forEach((x) => x.setAttribute('aria-selected', x === c ? 'true' : 'false'));
      const s = c.dataset.s;
      cmp.poster = 'static/images/cmp_poster' + s + '.jpg';
      cmp.src = 'static/videos/cmp_scene' + s + '.mp4';
      cmp.load();
      if (!cmpUserPaused) play(cmp);
    }));
  }

  // results tabs
  const tabs = [...document.querySelectorAll('#results .seg-b')];
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => {
      const on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false');
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  }));
})();

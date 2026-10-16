// Shared by Home and Services. No dependencies.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  // Sections fade in once, when the reader reaches them.
  const reveals = [...document.querySelectorAll('.reveal')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('seen'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e) => {
        e.target.classList.add('seen');
        io.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  // The flow diagram: steps light up in order. Without JS, or with reduced
  // motion, every step stays lit and the diagram reads as a static figure.
  const svg = document.querySelector('.flow-svg');
  if (!svg) return;

  const note = document.getElementById('flow-note');
  const toggle = document.getElementById('flow-toggle');
  const nodes = [...svg.querySelectorAll('.n[data-s]')];
  const parts = [...svg.querySelectorAll('[data-s]')];
  const lastStep = Math.max(...parts.map((p) => Number(p.dataset.s)));
  const defaultNote = note ? note.innerHTML : '';

  let step = -1;
  let timer = null;
  let paused = reduceMotion;
  let visible = true;

  const show = (target) => {
    step = target;
    parts.forEach((p) => {
      const s = Number(p.dataset.s);
      p.classList.toggle('off', s > step);
      if (p.classList.contains('c')) p.classList.toggle('live', s === step);
    });
    nodes.forEach((n) => n.classList.toggle('now', Number(n.dataset.s) === step));
  };

  const explain = (node) => {
    if (!note) return;
    note.innerHTML = '<b>' + node.dataset.title + '.</b> ' + node.dataset.text;
  };

  const tick = () => {
    const next = step >= lastStep ? 0 : step + 1;
    show(next);
    const current = nodes.find((n) => Number(n.dataset.s) === next);
    if (current) explain(current);
    const holdOnLast = next === lastStep ? 2600 : 1300;
    timer = setTimeout(tick, holdOnLast);
  };

  const stop = () => { clearTimeout(timer); timer = null; };
  const start = () => {
    if (paused || !visible || timer) return;
    timer = setTimeout(tick, 400);
  };

  const setPaused = (value) => {
    paused = value;
    if (toggle) {
      toggle.textContent = paused ? 'Play' : 'Pause';
      toggle.setAttribute('aria-pressed', String(paused));
    }
    if (paused) stop(); else start();
  };

  // Someone pointing at or tapping a step takes over from the sequence.
  const focusStep = (node) => {
    stop();
    paused = true;
    if (toggle) { toggle.textContent = 'Play'; toggle.setAttribute('aria-pressed', 'true'); }
    if (!reduceMotion) show(Number(node.dataset.s));
    nodes.forEach((n) => n.classList.toggle('now', n === node));
    explain(node);
  };

  nodes.forEach((node) => {
    node.addEventListener('click', () => focusStep(node));
    node.addEventListener('focus', () => focusStep(node));
    node.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); focusStep(node); }
    });
  });

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (paused && note) note.innerHTML = defaultNote;
      setPaused(!paused);
    });
  }

  if (reduceMotion) {
    if (toggle) toggle.hidden = true;
    return;
  }

  svg.classList.add('seq');
  show(0);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }, { threshold: 0.2 }).observe(svg);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
  start();
})();

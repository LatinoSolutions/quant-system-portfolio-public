// Shared by Home, Portfolio and Services. No dependencies.
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
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  // The diagrams animate in CSS. JS only adds a pause button (WCAG 2.2.2) and stops
  // the animation while a diagram is off screen. With reduced motion there is
  // nothing to pause: the diagrams are static and the buttons stay hidden.
  if (reduceMotion) return;
  const cards = [...document.querySelectorAll('.dg-card')];

  cards.forEach((card) => {
    const button = card.querySelector('.dg-pp');
    if (!button) return;
    button.hidden = false;
    button.addEventListener('click', () => {
      const paused = card.classList.toggle('paused');
      button.textContent = paused ? 'Play' : 'Pause';
      button.setAttribute('aria-label', paused ? 'Play the animation' : 'Pause the animation');
    });
  });

  if (!('IntersectionObserver' in window)) return;
  const onScreen = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('idle', !e.isIntersecting));
  });
  cards.forEach((card) => onScreen.observe(card));
})();

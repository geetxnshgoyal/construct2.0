// Small animation utilities: reveal on scroll, hero parallax, and accessible toggles
(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealOnScroll() {
    if (prefersReduced) return;
    const reveals = document.querySelectorAll('.reveal');
    const threshold = 0.12;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold });

    reveals.forEach((el) => io.observe(el));
  }

  function heroParallax() {
    if (prefersReduced) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    window.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1..1
      const y = (e.clientY / innerHeight - 0.5) * 2;
      hero.style.setProperty('--hero-tilt-x', `${x * 4}deg`);
      hero.style.setProperty('--hero-tilt-y', `${y * 6}px`);
    });
  }

  function initSkipLink() {
    const skip = document.querySelector('.skip-link');
    if (!skip) return;
    skip.addEventListener('click', (e) => {
      const target = document.querySelector(skip.getAttribute('href'));
      if (target) target.setAttribute('tabindex', '-1');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    revealOnScroll();
    heroParallax();
    initSkipLink();
  });
})();

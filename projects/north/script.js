const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('details[open]').forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

if (!reduceMotion && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  gsap.from('.nav', { y: -80, opacity: 0, duration: 1, ease: 'power3.out' });
  gsap.from('.hero h1', { y: 100, opacity: 0, filter: 'blur(12px)', duration: 1.25, delay: .2, ease: 'power4.out' });
  gsap.from('.hero .reveal, .hero-tag, .hero-index', { y: 24, opacity: 0, duration: .9, delay: .65, stagger: .1 });
  gsap.to('.hero-media', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', scrub: true } });

  gsap.utils.toArray('.split-dark, .split:not(.hero h1)').forEach((el) => {
    gsap.from(el, { y: 65, opacity: 0, filter: 'blur(8px)', duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.from(el, { y: 38, opacity: 0, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.utils.toArray('.reveal-card').forEach((el, i) => {
    gsap.from(el, { y: 60, scale: .97, opacity: 0, duration: .9, delay: (i % 3) * .07, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
  gsap.to('.panorama img', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.panorama', scrub: true } });

  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const state = { value: 0 };
    gsap.to(state, { value: target, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%' }, onUpdate: () => { el.textContent = `${Math.round(state.value)}`; } });
  });

  gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { scrub: .2, start: 0, end: 'max' } });

  const cursor = document.querySelector('.cursor');
  window.addEventListener('pointermove', (event) => gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: .18, ease: 'power2.out' }));
  document.querySelectorAll('a, button, summary').forEach((el) => {
    el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 3, duration: .2 }));
    el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, duration: .2 }));
  });

  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      gsap.to(el, { x: (event.clientX - rect.left - rect.width / 2) * .18, y: (event.clientY - rect.top - rect.height / 2) * .18, duration: .25 });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1, .35)' }));
  });
}

// Generic reveal — adds .in to .reveal-word once it enters the viewport, staggered.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initRevealMasks() {
  // Group reveal-words by their containing title
  document.querySelectorAll('.section__title').forEach((title) => {
    const words = title.querySelectorAll('.reveal-word');
    if (!words.length) return;
    ScrollTrigger.create({
      trigger: title,
      start: 'top 80%',
      onEnter: () => {
        words.forEach((w, i) => {
          gsap.delayedCall(i * 0.1, () => w.classList.add('in'));
        });
      }
    });
  });

  // Fade-in for section bodies + eyebrows
  document.querySelectorAll('.eyebrow, .section__body, .stat-list').forEach((el) => {
    gsap.from(el, {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });

  // Stat tiles fade up
  document.querySelectorAll('.stat').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });
}

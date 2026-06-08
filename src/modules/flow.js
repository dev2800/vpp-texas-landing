// Lights up the Sun → Battery → Home → Grid → Credits flow stage-by-stage on scroll
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initFlow() {
  const steps = document.querySelectorAll('.flow__step');
  if (!steps.length) return;

  steps.forEach((step, i) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 75%',
      onEnter: () => {
        gsap.delayedCall(i * 0.18, () => step.classList.add('active'));
      },
      onLeaveBack: () => step.classList.remove('active')
    });
  });
}

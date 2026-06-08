// Horizontal scroll inside the pinned section. Generates inline SVG icons for the cards.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const SVG = {
  install: `
    <svg viewBox="0 0 200 200" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#00d4ff"/>
          <stop offset="100%" stop-color="#0078a3"/>
        </linearGradient>
      </defs>
      <path d="M40 130 L100 80 L160 130 L160 170 L40 170 Z" fill="none" stroke="url(#g1)" stroke-width="3"/>
      <circle cx="100" cy="60" r="22" fill="url(#g1)" opacity="0.85">
        <animate attributeName="r" values="22;26;22" dur="2.4s" repeatCount="indefinite"/>
      </circle>
      <line x1="100" y1="82" x2="100" y2="80" stroke="#00d4ff" stroke-width="2"/>
    </svg>`,
  power: `
    <svg viewBox="0 0 200 200" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect x="60" y="50" width="80" height="120" rx="10" fill="none" stroke="#00d4ff" stroke-width="3"/>
      <rect x="60" y="170" width="80" height="6" rx="3" fill="#00d4ff" opacity="0.5">
        <animate attributeName="y" values="170;60;170" dur="2.6s" repeatCount="indefinite"/>
        <animate attributeName="height" values="6;120;6" dur="2.6s" repeatCount="indefinite"/>
      </rect>
      <path d="M85 110 L115 110 L100 90 L100 130" stroke="#ffaa00" stroke-width="3" fill="none"/>
    </svg>`,
  cash: `
    <svg viewBox="0 0 200 200" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="80" width="140" height="80" rx="6" fill="none" stroke="#00ff88" stroke-width="3"/>
      <circle cx="100" cy="120" r="22" fill="none" stroke="#00ff88" stroke-width="3"/>
      <text x="100" y="128" text-anchor="middle" font-family="JetBrains Mono" font-size="22" fill="#00ff88" font-weight="700">$</text>
      <circle cx="100" cy="60" r="4" fill="#00ff88">
        <animate attributeName="cy" values="60;30;60" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>`
};

export function initHowScroll() {
  const track = document.querySelector('.how__track');
  const section = document.querySelector('.section--how');
  if (!track || !section) return;

  // Inject SVG art
  document.querySelectorAll('[data-lottie]').forEach(el => {
    const key = el.dataset.lottie;
    if (SVG[key]) el.innerHTML = SVG[key];
  });

  const isMobile = window.matchMedia('(max-width: 880px)').matches;
  if (isMobile) {
    // On mobile, no horizontal scroll. Card reveals on scroll.
    document.querySelectorAll('.how__step').forEach((step, i) => {
      gsap.from(step, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        scrollTrigger: { trigger: step, start: 'top 80%' }
      });
    });
    return;
  }

  const getDistance = () => {
    return track.scrollWidth - window.innerWidth + 80;
  };

  ScrollTrigger.create({
    trigger: section,
    pin: '.how__pin',
    start: 'top top',
    end: () => '+=' + getDistance() * 1.4,
    scrub: 1.2,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const dist = getDistance();
      track.style.transform = `translateX(-${self.progress * dist}px)`;
    }
  });
}

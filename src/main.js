import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initLoader } from './modules/loader.js';
import { initCursor } from './modules/cursor.js';
import { initScrollProgress } from './modules/scrollProgress.js';
import { initHero } from './modules/hero.js';
import { initProblemGrid } from './modules/problemGrid.js';
import { initFlow } from './modules/flow.js';
import { initVortex } from './modules/vortex.js';
import { initHowScroll } from './modules/howScroll.js';
import { initVoronoi } from './modules/voronoi.js';
import { initBatteryExplode } from './modules/batteryExplode.js';
import { initFinalScene } from './modules/finalScene.js';
import { initRevealMasks } from './modules/reveal.js';
import { initCounters } from './modules/counters.js';
import { initAudio } from './modules/audio.js';
import { initAccentBreathing } from './modules/accentBreathing.js';
import { initModal } from './modules/modal.js';
import { initNavMenu } from './modules/navMenu.js';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

// LOADER: dismiss when fonts + critical assets are ready
initLoader().then(() => {
  if (!reducedMotion) {
    initAccentBreathing();
  }

  initScrollProgress();
  if (!reducedMotion) initCursor();

  // SCENES
  initHero({ reducedMotion });
  initProblemGrid({ reducedMotion });
  initFlow();
  initVortex({ reducedMotion });
  initHowScroll();
  initVoronoi({ reducedMotion });
  initBatteryExplode({ reducedMotion });
  initFinalScene({ reducedMotion });

  // GENERIC ANIMATIONS
  initRevealMasks();
  initCounters();
  initAudio();
  initModal();
  initNavMenu();

  // HERO HEADLINE WEIGHT MORPH on scroll
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => {
        heroTitle.classList.toggle('scrolled', self.progress > 0.05);
      }
    });
  }

  // Refresh after layout settles
  setTimeout(() => ScrollTrigger.refresh(), 200);
});

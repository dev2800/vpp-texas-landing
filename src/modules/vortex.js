// 3D testimonial vortex using CSS3D-style transforms (no THREE CSS3DRenderer needed —
// vanilla CSS3D transforms are lighter and animate fine via GSAP).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const TESTIMONIALS = [
  { name: 'Sarah M.', city: 'Austin, TX', quote: 'Saved $2,400 last year. The Sonnen kept us running during the storm.', savings: '$2,400', initial: 'S' },
  { name: 'Marcus T.', city: 'Houston, TX', quote: 'Bill dropped 78% in month one. I check my app every morning.', savings: '$3,100', initial: 'M' },
  { name: 'Priya R.', city: 'Dallas, TX', quote: 'Joined the VPP for the backup, stayed for the checks.', savings: '$2,650', initial: 'P' },
  { name: 'Jake D.', city: 'San Antonio', quote: 'My neighbors are still on candles when ERCOT trips. We never notice.', savings: '$2,890', initial: 'J' },
  { name: 'Elena V.', city: 'El Paso, TX', quote: 'Best decision we made for the new house. Zero regrets.', savings: '$2,210', initial: 'E' },
  { name: 'Wesley C.', city: 'Fort Worth', quote: 'The install crew was in and out in two days. Earning since day three.', savings: '$3,440', initial: 'W' },
  { name: 'Andrea B.', city: 'Lubbock, TX', quote: 'Wind blows out here. Doesn\'t matter — battery handles it.', savings: '$2,720', initial: 'A' },
  { name: 'Devon K.', city: 'Corpus Christi', quote: 'Hurricane Beryl? We didn\'t lose a single device.', savings: '$3,050', initial: 'D' }
];

export function initVortex({ reducedMotion }) {
  const container = document.getElementById('vortex');
  if (!container) return;

  // Build cards
  const cards = TESTIMONIALS.map((t, i) => {
    const card = document.createElement('div');
    card.className = 'vortex__card';
    card.innerHTML = `
      <div class="vortex__avatar">${t.initial}</div>
      <div class="vortex__name">${t.name}</div>
      <div class="vortex__city">${t.city}</div>
      <div class="vortex__quote">"${t.quote}"</div>
      <div class="vortex__savings">${t.savings}<span>Saved Last Year</span></div>
    `;
    container.appendChild(card);
    return card;
  });

  // Position in a slow rotating ring (perspective applied on container)
  const RADIUS = 360;
  const baseAngles = cards.map((_, i) => (i / cards.length) * Math.PI * 2);
  let rotation = 0;
  let hovered = -1;

  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => { hovered = i; });
    card.addEventListener('mouseleave', () => { hovered = -1; });
  });

  const step = () => {
    rotation += reducedMotion ? 0 : 0.0025;
    cards.forEach((card, i) => {
      const a = baseAngles[i] + rotation;
      const x = Math.cos(a) * RADIUS;
      const z = Math.sin(a) * RADIUS;
      const y = Math.sin(a * 1.3 + i) * 30;
      // Face camera, slight tilt
      const rotY = -a * (180 / Math.PI) - 90;
      const focusZ = hovered === i ? z + 240 : z;
      card.style.transform = `translate3d(${x}px, ${y}px, ${focusZ}px) rotateY(${rotY}deg)`;
      card.style.opacity = hovered === -1 || hovered === i ? '1' : '0.4';
      card.style.zIndex = Math.round(z + 1000);
    });
    requestAnimationFrame(step);
  };

  if (!reducedMotion) step();
  else {
    // Fallback: lay flat
    cards.forEach((card, i) => {
      card.style.transform = `translate3d(${(i - cards.length / 2) * 60}px, 0, 0)`;
      card.style.position = 'relative';
    });
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.gap = '20px';
    container.style.justifyContent = 'center';
  }

  // Parallax: tilt the whole ring slightly on scroll
  if (!reducedMotion) {
    ScrollTrigger.create({
      trigger: '#social',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        container.style.transform = `rotateX(${(self.progress - 0.5) * 18}deg)`;
      }
    });
  }
}

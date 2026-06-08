// Mobile hamburger nav + close-on-link-click
export function initNavMenu() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    links.classList.toggle('open', open);
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setOpen(false));
  });

  // Close when viewport grows past mobile breakpoint
  const mq = window.matchMedia('(min-width: 721px)');
  mq.addEventListener('change', (e) => { if (e.matches) setOpen(false); });
}

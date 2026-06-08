// Consult modal + open/close + form submission (front-end only — no backend)
export function initModal() {
  const modal = document.getElementById('consultModal');
  if (!modal) return;
  const panel = modal.querySelector('.modal__panel');
  const form = document.getElementById('consultForm');
  const stepForm = modal.querySelector('[data-step="form"]');
  const stepSuccess = modal.querySelector('[data-step="success"]');
  let lastFocus = null;

  const open = (trigger) => {
    lastFocus = trigger || document.activeElement;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Reset to form step
    stepForm.hidden = false;
    stepSuccess.hidden = true;
    form.reset();
    setTimeout(() => {
      const firstInput = form.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 60);
  };

  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  // Open from any [data-open-consult] trigger
  document.querySelectorAll('[data-open-consult]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open(btn);
    });
  });

  // Close from any [data-close] inside the modal
  modal.querySelectorAll('[data-close]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      close();
    });
  });

  // Esc closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });

  // Form submit — front-end only, no backend yet
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      // Persist to localStorage so we don't lose the lead if the user navigates
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        data.ts = new Date().toISOString();
        const leads = JSON.parse(localStorage.getItem('vpp_leads') || '[]');
        leads.push(data);
        localStorage.setItem('vpp_leads', JSON.stringify(leads));
      } catch (err) { /* ignore */ }
      stepForm.hidden = true;
      stepSuccess.hidden = false;
      const okBtn = stepSuccess.querySelector('[data-close]');
      if (okBtn) okBtn.focus();
    });
  }
}

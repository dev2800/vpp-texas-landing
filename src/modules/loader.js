export function initLoader() {
  return new Promise((resolve) => {
    const loader = document.getElementById('loader');
    const charge = loader.querySelector('.loader__charge');
    const pct = document.getElementById('loaderPct');

    let progress = 0;
    const start = performance.now();
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    let assetsReady = false;
    fontsReady.then(() => { assetsReady = true; });

    const tick = () => {
      const elapsed = performance.now() - start;
      // Charge to 75% over ~900ms regardless
      const fakeTarget = Math.min(75, (elapsed / 900) * 75);
      // Then snap to 100 once fonts are ready
      const target = assetsReady ? 100 : fakeTarget;
      progress += (target - progress) * 0.16;
      const pctVal = Math.round(progress);
      pct.textContent = pctVal;
      charge.style.height = pctVal + '%';
      if (progress >= 99.5 && assetsReady) {
        pct.textContent = 100;
        charge.style.height = '100%';
        loader.classList.add('loader--wipe');
        setTimeout(() => {
          loader.classList.add('loader--gone');
          setTimeout(() => loader.remove(), 700);
          resolve();
        }, 350);
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

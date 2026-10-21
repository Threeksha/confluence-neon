/* Concept section motion observer. */

(() => {
  const initConceptMotion = () => {
    const section = document.querySelector('.concept-section');
    if (!section || section.dataset.motionObserverReady === 'true') return;
    section.dataset.motionObserverReady = 'true';
    if (!('IntersectionObserver' in window)) { section.classList.add('concept-in-view'); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.remove('concept-in-view');
          void section.offsetWidth;
          section.classList.add('concept-in-view');
        } else {
          section.classList.remove('concept-in-view');
        }
      });
    }, { threshold: 0.22 });
    observer.observe(section);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initConceptMotion, { once: true });
  else initConceptMotion();
})();

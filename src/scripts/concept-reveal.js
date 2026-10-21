/* Concept-section reveal observer. */

(() => {
  const section = document.querySelector('.concept-section');
  if (!section || section.dataset.conceptObserver === 'ready') return;
  section.dataset.conceptObserver = 'ready';
  if (!('IntersectionObserver' in window)) {
    section.classList.add('concept-in-view');
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) section.classList.add('concept-in-view');
      else section.classList.remove('concept-in-view');
    });
  }, { threshold: 0.24 });
  observer.observe(section);
})();

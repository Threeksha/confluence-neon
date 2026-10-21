/* Viewport-aware theme-card video playback. */

// Real MP4 theme scenes: start only near the viewport, stay muted, and pause off-screen.
(() => {
  const videos = Array.from(document.querySelectorAll('.theme-video[data-video-src]'));
  if (!videos.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  if (reduceMotion || saveData || !('IntersectionObserver' in window)) return;

  const isNearViewport = (video) => {
    const rect = video.getBoundingClientRect();
    return rect.bottom > -160 && rect.top < window.innerHeight + 160;
  };

  const startVideo = (video) => {
    const card = video.closest('.theme-card');
    const play = video.play();
    if (play && typeof play.then === 'function') {
      play.then(() => card && card.classList.add('theme-video-playing'))
          .catch(() => card && card.classList.remove('theme-video-playing'));
    } else if (card) {
      card.classList.add('theme-video-playing');
    }
  };

  videos.forEach((video) => {
    video.addEventListener('error', () => {
      const card = video.closest('.theme-card');
      if (card) card.classList.remove('theme-video-playing');
    });

    video.addEventListener('canplay', () => {
      if (isNearViewport(video)) startVideo(video);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      const card = video.closest('.theme-card');

      if (entry.isIntersecting) {
        if (video.dataset.loaded !== 'true') {
          video.dataset.loaded = 'true';
          video.src = video.dataset.videoSrc;
          video.load();
        }
        if (video.readyState >= 2) startVideo(video);
      } else {
        video.pause();
        if (card) card.classList.remove('theme-video-playing');
      }
    });
  }, { threshold: 0.12, rootMargin: '140px 0px' });

  videos.forEach((video) => observer.observe(video));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      videos.forEach((video) => {
        video.pause();
        const card = video.closest('.theme-card');
        if (card) card.classList.remove('theme-video-playing');
      });
    } else {
      videos.forEach((video) => {
        if (video.dataset.loaded === 'true' && isNearViewport(video)) startVideo(video);
      });
    }
  });
})();

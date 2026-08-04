import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TARGET_SELECTOR = [
  '.page-hero',
  '.page-heading',
  '.glass-panel',
  '.glass-card',
  '.content-panel',
  '.recipe-list-item',
  '.meal-list-item',
  '.conversation-item',
  '.message'
].join(', ');

export default function RouteSceneAnimator() {
  const location = useLocation();

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll(TARGET_SELECTOR)).slice(0, 18);

    if (targets.length === 0) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      return;
    }

    targets.forEach((el, index) => {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = `route-entrance 0.86s cubic-bezier(0.215, 0.61, 0.355, 1) ${index * 0.05}s forwards`;
    });
  }, [location.pathname]);

  return null;
}

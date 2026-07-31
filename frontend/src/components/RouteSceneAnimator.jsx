import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

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
  // ponytail: removed .auth-card - forms should prioritize functionality over animations
].join(', ');

export default function RouteSceneAnimator() {
  const location = useLocation();

  useLayoutEffect(() => {
    const targets = gsap.utils.toArray(TARGET_SELECTOR).slice(0, 18);

    if (targets.length === 0) {
      return undefined;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      gsap.killTweensOf(targets);
      gsap.set(targets, {
        opacity: reducedMotion ? 1 : 0,
        y: reducedMotion ? 0 : 18,
        scale: reducedMotion ? 1 : 0.985,
        filter: reducedMotion ? 'none' : 'blur(10px)'
      });

      if (!reducedMotion) {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.86,
          stagger: 0.05,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'opacity,transform,filter'
        });
      }
    });

    return () => ctx.revert();
  }, [location.pathname]);

  return null;
}

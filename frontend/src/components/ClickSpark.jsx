import { useEffect, useRef, useState } from 'react';

const PARTICLE_COUNT = 10;

export default function ClickSpark({ children, className = '', disabled = false }) {
  const containerRef = useRef(null);
  const nextIdRef = useRef(0);
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    if (sparks.length === 0) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setSparks((current) => current.slice(1));
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [sparks]);

  const handlePointerDown = (event) => {
    if (disabled || !containerRef.current) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const particles = Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
      id: `${nextIdRef.current}-${index}`,
      x,
      y,
      angle: (360 / PARTICLE_COUNT) * index + Math.random() * 18,
      distance: 18 + Math.random() * 26,
      delay: Math.random() * 60,
      size: 7 + Math.random() * 6
    }));

    nextIdRef.current += 1;
    setSparks((current) => [...current, ...particles].slice(-60));
  };

  return (
    <div
      ref={containerRef}
      className={`spark-wrap ${className}`.trim()}
      onPointerDown={handlePointerDown}
    >
      {children}
      {!disabled && (
        <div className="spark-layer" aria-hidden="true">
          {sparks.map((spark) => (
            <span
              key={spark.id}
              className="spark-particle"
              style={{
                left: spark.x,
                top: spark.y,
                '--spark-angle': `${spark.angle}deg`,
                '--spark-distance': `${spark.distance}px`,
                '--spark-delay': `${spark.delay}ms`,
                '--spark-size': `${spark.size}px`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

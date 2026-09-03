import { useState, useEffect, useRef } from 'react';

export function useCountUp(end, duration = 1400) {
  const [count, setCount] = useState(0);
  const prevEnd = useRef(0);

  useEffect(() => {
    if (end === prevEnd.current) return;
    const startVal = prevEnd.current;
    prevEnd.current = end;
    if (end === 0 && startVal === 0) return;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + (end - startVal) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);

  return count;
}

export default function AnimatedNumber({ value, duration = 1400 }) {
  const display = useCountUp(value, duration);
  return <span className="tabular-nums">{display.toLocaleString('id-ID')}</span>;
}

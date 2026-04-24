import { useRef, useCallback } from 'react';

/**
 * Hook para animar los rayos de las ruedas del auto SVG.
 * Calcula posiciones trigonométricas por cada frame para simular rotación.
 */

const WHEEL_DATA = [
  { cx: 218, cy: 176, spokeIds: ['f1', 'f2', 'f3'] },
  { cx: 356, cy: 176, spokeIds: ['r1', 'r2', 'r3'] },
];

const BASE_ANGLES = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
const SPOKE_LENGTH = 16;

export function useWheelSpin() {
  const angleRef = useRef(0);
  const timerRef = useRef(null);

  const spin = useCallback((durationMs) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      if (Date.now() - startTime > durationMs) {
        clearInterval(timerRef.current);
        return;
      }

      angleRef.current += 0.11;

      WHEEL_DATA.forEach(({ cx, cy, spokeIds }) => {
        BASE_ANGLES.forEach((base, i) => {
          const angle = base + angleRef.current;
          const el = document.getElementById(spokeIds[i]);
          if (!el) return;
          el.setAttribute('x1', (cx - Math.sin(angle) * SPOKE_LENGTH).toFixed(1));
          el.setAttribute('y1', (cy - Math.cos(angle) * SPOKE_LENGTH).toFixed(1));
          el.setAttribute('x2', (cx + Math.sin(angle) * SPOKE_LENGTH).toFixed(1));
          el.setAttribute('y2', (cy + Math.cos(angle) * SPOKE_LENGTH).toFixed(1));
        });
      });
    }, 16); // ~60fps
  }, []);

  return { spin };
}

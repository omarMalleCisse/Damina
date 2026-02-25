import React, { useRef, useState, useEffect } from 'react';

/**
 * Conteneur qui mesure ses dimensions et les passe aux enfants.
 * Évite ResponsiveContainer de Recharts (source d'erreurs removeChild / Text).
 * Les enfants reçoivent { width, height } en render prop.
 */
export default function ChartContainer({ className = '', minHeight = 200, children }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      setSize((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ minHeight }}
    >
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  );
}

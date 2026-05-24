import { useMemo } from "react";

export default function Embers({ count = 26 }: { count?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const size = 4 + Math.random() * 10;
        const duration = 8 + Math.random() * 12;
        const delay = -Math.random() * 12;
        const hue = 18 + Math.random() * 30;
        return { i, left, size, duration, delay, hue };
      }),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((e) => (
        <span
          key={e.i}
          className="ember"
          style={{
            left: `${e.left}%`,
            width: `${e.size}px`,
            height: `${e.size}px`,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            background: `radial-gradient(circle, hsl(${e.hue}, 100%, 70%) 0%, hsl(${e.hue}, 100%, 50%) 50%, transparent 70%)`,
          }}
        />
      ))}
    </div>
  );
}

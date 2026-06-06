"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { label: "Members", value: 500, suffix: "+" },
  { label: "Events Held", value: 50, suffix: "+" },
  { label: "Years Active", value: 8, suffix: "" },
  { label: "Opportunities Posted", value: 100, suffix: "+" },
];

function useCountUp(target: number, duration = 1500, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);

  return count;
}

function StatItem({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCountUp(value, 1500, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-5xl md:text-6xl font-bold text-gold-400 mb-2">
        {count}{suffix}
      </div>
      <div className="text-white/70 text-sm font-medium tracking-wide uppercase">
        {label}
      </div>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="bg-navy-800 py-20">
      <div className="container-max section-padding">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {STATS.map((stat) => (
            <StatItem key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

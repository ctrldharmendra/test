"use client";

import { useEffect, useRef } from "react";

export default function WheelPicker({
  values,
  value,
  onChange,
  suffix = "",
}) {
  const containerRef = useRef(null);

  const ITEM_HEIGHT = 52;

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const index = values.indexOf(value);

    if (index === -1) return;

    container.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: "smooth",
    });
  }, [value, values]);

  const handleScroll = () => {
    const container = containerRef.current;

    if (!container) return;

    const index = Math.round(container.scrollTop / ITEM_HEIGHT);

    const safeIndex = Math.max(
      0,
      Math.min(index, values.length - 1)
    );

    const selectedValue = values[safeIndex];

    if (selectedValue !== value) {
      onChange(selectedValue);
    }
  };

  return (
    <div className="relative mx-auto h-[260px] w-full max-w-[280px]">

      {/* Top Fade */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 h-20 bg-gradient-to-b from-neutral-950 to-transparent" />

      {/* Bottom Fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-20 bg-gradient-to-t from-neutral-950 to-transparent" />

      {/* Selection Highlight */}
      <div
        className="
          pointer-events-none absolute
          left-0 right-0 top-1/2
          z-10
          h-[52px]
          -translate-y-1/2
          rounded-2xl
          border border-white/10
          bg-white/[0.06]
        "
      />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="
          no-scrollbar
          h-full
          snap-y snap-mandatory
          overflow-y-auto
          overscroll-contain
          py-[104px]
        "
        style={{
          scrollbarWidth: "none",
        }}
      >
        {values.map((item) => {
          const selected = item === value;

          return (
            <div
              key={item}
              className={`
                flex
                h-[52px]
                snap-center
                items-center
                justify-center
                text-center
                text-2xl
                font-semibold
                transition-all
                duration-200
                ${
                  selected
                    ? "scale-110 text-white"
                    : "scale-90 text-white/25"
                }
              `}
            >
              {item}
              {suffix && (
                <span className="ml-2 text-sm font-medium">
                  {suffix}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
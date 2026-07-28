"use client";

import { useEffect, useRef, useState } from "react";
import type { ApiMedia } from "@/lib/api";

const AUTO_ADVANCE_MS = 3500;

function seededOffset(index: number) {
  const seed = (index * 47) % 360;
  const rotate = ((seed % 17) - 8) * 1.4;
  const x = ((seed % 23) - 11) * 3;
  const y = ((seed % 13) - 6) * 3;
  return { rotate, x, y };
}

export default function PolaroidGallery({ images }: { images: ApiMedia[] }) {
  const [mode, setMode] = useState<"stack" | "spread">("stack");
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (mode !== "stack" || images.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, AUTO_ADVANCE_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, images.length]);

  function goTo(index: number) {
    setCurrent(((index % images.length) + images.length) % images.length);
    if (timerRef.current) clearInterval(timerRef.current);
    if (mode === "stack" && images.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, AUTO_ADVANCE_MS);
    }
  }

  if (images.length === 0) return null;

  if (mode === "spread") {
    return (
      <div className="relative">
        <button
          onClick={() => setMode("stack")}
          className="mb-6 font-mono text-xs uppercase tracking-wide text-ink/60 hover:text-rose-bold transition-colors"
        >
          ← Back to slideshow
        </button>
        <div className="flex flex-wrap justify-center gap-x-2 gap-y-8 py-8">
          {images.map((img, i) => {
            const { rotate, x, y } = seededOffset(i);
            return (
              <div
                key={img.ID}
                className="bg-white p-2 pb-6 shadow-sticky rounded-sm hover:z-10 hover:shadow-[3px_4px_14px_rgba(58,53,48,0.2)] transition-shadow"
                style={{ transform: `rotate(${rotate}deg) translate(${x}px, ${y}px)` }}
              >
                <img
                  src={img.URL}
                  alt={img.AltText}
                  className="w-40 h-40 object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => setMode("spread")}
        className="relative w-72 h-72 cursor-pointer"
        aria-label="Click to see all photos"
      >
        {images.length > 2 && (
          <div className="absolute inset-0 bg-white p-2 pb-8 shadow-sticky rounded-sm rotate-[6deg] translate-x-2" />
        )}
        {images.length > 1 && (
          <div className="absolute inset-0 bg-white p-2 pb-8 shadow-sticky rounded-sm -rotate-[4deg] -translate-x-1" />
        )}
        <div className="absolute inset-0 bg-white p-2 pb-8 shadow-sticky rounded-sm">
          <img
            src={images[current].URL}
            alt={images[current].AltText}
            className="w-full h-full object-cover"
          />
        </div>
      </button>

      {images.length > 1 && (
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              goTo(current - 1);
            }}
            aria-label="Previous photo"
            className="font-mono text-lg text-ink/50 hover:text-rose-bold transition-colors"
          >
            ←
          </button>
          <p className="font-mono text-xs text-ink/40">
            {current + 1} / {images.length}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goTo(current + 1);
            }}
            aria-label="Next photo"
            className="font-mono text-lg text-ink/50 hover:text-rose-bold transition-colors"
          >
            →
          </button>
        </div>
      )}
      <p className="font-handwritten text-lg text-rose-bold mt-2">click to see all photos</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMedia } from "@/lib/api";

const SLIDE_MS = 2800;

export default function CardImageSlider({
  owner,
}: {
  owner: { projectId?: number; experienceId?: number };
}) {
  const { data: images } = useQuery({
    queryKey: ["media", owner.projectId ?? owner.experienceId, owner.projectId ? "project" : "experience"],
    queryFn: () => getMedia(owner),
  });

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, SLIDE_MS);
    return () => clearInterval(timer);
  }, [images]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full aspect-video bg-white/40 border-b border-ink/10 overflow-hidden -m-5 mb-3 rounded-t-sm">
      {images.map((img, i) => (
        <img
          key={img.ID}
          src={img.URL}
          alt={img.AltText}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}

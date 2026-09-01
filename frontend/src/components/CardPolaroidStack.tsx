"use client";

import { useQuery } from "@tanstack/react-query";
import { getMedia } from "@/lib/api";

export default function CardPolaroidStack({
  owner,
}: {
  owner: { projectId?: number; experienceId?: number };
}) {
  const { data: images } = useQuery({
    queryKey: ["media", owner.projectId ?? owner.experienceId, owner.projectId ? "project" : "experience"],
    queryFn: () => getMedia(owner),
  });

  if (!images || images.length === 0) return null;

  const top = images[0];

  return (
    <div className="relative w-24 h-24 mx-auto mt-1 mb-3">
      {images.length > 2 && (
        <div className="absolute inset-0 bg-white p-1 pb-3 shadow-sticky rounded-sm rotate-[6deg] translate-x-1" />
      )}
      {images.length > 1 && (
        <div className="absolute inset-0 bg-white p-1 pb-3 shadow-sticky rounded-sm -rotate-[4deg] -translate-x-0.5" />
      )}
      <div className="absolute inset-0 bg-white p-1 pb-3 shadow-sticky rounded-sm">
        <img src={top.URL} alt={top.AltText} className="w-full h-full object-contain" />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMedia, uploadMedia, deleteMedia, ApiError } from "@/lib/api";
import PendingImagePicker, { type PendingImage } from "./PendingImagePicker";

type Owner = { projectId?: number; experienceId?: number };

export default function MediaManager({ owner }: { owner: Owner }) {
  const queryClient = useQueryClient();
  const queryKey = ["media", owner.projectId ?? owner.experienceId, owner.projectId ? "project" : "experience"];
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: media } = useQuery({
    queryKey,
    queryFn: () => getMedia(owner),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  async function handleUpload() {
    setError(null);
    if (pending.length === 0) return;
    if (pending.some((img) => !img.altText.trim())) {
      setError("Add alt text for every image before uploading (required for accessibility).");
      return;
    }

    setIsUploading(true);
    try {
      for (const img of pending) {
        await uploadMedia(owner, img.file, img.altText);
      }
      pending.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setPending([]);
      queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="border-t border-ink/10 pt-3 mt-3">
      <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-2">Images</p>

      {media && media.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
          {media.map((m) => (
            <div key={m.ID} className="relative group">
              <img src={m.URL} alt={m.AltText} className="w-full aspect-square object-cover rounded-sm border border-ink/10" />
              <button
                onClick={() => deleteMutation.mutate(m.ID)}
                className="absolute top-1 right-1 bg-white/90 text-rose-bold font-mono text-[10px] px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                delete
              </button>
            </div>
          ))}
        </div>
      )}

      <PendingImagePicker images={pending} onChange={setPending} disabled={isUploading} />
      {pending.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="mt-2 font-mono text-xs uppercase tracking-wide text-white bg-rose-bold px-3 py-1.5 rounded-sm disabled:opacity-50 self-start"
        >
          {isUploading ? "Uploading…" : `Upload ${pending.length} image${pending.length > 1 ? "s" : ""}`}
        </button>
      )}
      {error && <p className="font-mono text-xs text-rose-bold mt-1">{error}</p>}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMedia, uploadMedia, deleteMedia, ApiError } from "@/lib/api";

type Owner = { projectId?: number; experienceId?: number };

export default function MediaManager({ owner }: { owner: Owner }) {
  const queryClient = useQueryClient();
  const queryKey = ["media", owner.projectId ?? owner.experienceId, owner.projectId ? "project" : "experience"];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: media } = useQuery({
    queryKey,
    queryFn: () => getMedia(owner),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMedia(owner, file, altText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setAltText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Upload failed."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!altText.trim()) {
      setError("Add alt text before uploading (required for accessibility).");
      e.target.value = "";
      return;
    }
    uploadMutation.mutate(file);
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

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="alt text (required)"
          className="border-0 border-b-[1.5px] border-ink bg-transparent py-1 font-body text-sm focus:outline-none focus:border-rose-bold flex-1"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="font-mono text-xs"
        />
      </div>
      {error && <p className="font-mono text-xs text-rose-bold mt-1">{error}</p>}
      {uploadMutation.isPending && <p className="font-mono text-xs text-ink/50 mt-1">Uploading…</p>}
    </div>
  );
}

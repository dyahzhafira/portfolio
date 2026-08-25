"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useDragReorder } from "@/hooks/useDragReorder";
import {
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
  uploadMedia,
  attachTagToExperience,
  detachTagFromExperience,
  ApiError,
} from "@/lib/api";
import type { ApiExperience, ApiTag } from "@/lib/api";
import Button from "@/components/Button";
import MediaManager from "@/components/admin/MediaManager";
import AutoGrowTextarea from "@/components/admin/AutoGrowTextarea";
import TagPicker from "@/components/admin/TagPicker";
import PendingImagePicker, { type PendingImage } from "@/components/admin/PendingImagePicker";

const inputClass =
  "border-0 border-b-[1.5px] border-ink bg-transparent py-1 font-body focus:outline-none focus:border-rose-bold w-full";
const labelClass = "font-mono text-xs uppercase tracking-wide text-ink/70";

function toDateInput(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function EditExperienceForm({ exp, onDone }: { exp: ApiExperience; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [role, setRole] = useState(exp.Role);
  const [org, setOrg] = useState(exp.Org);
  const [periodStart, setPeriodStart] = useState(toDateInput(exp.PeriodStart));
  const [periodEnd, setPeriodEnd] = useState(toDateInput(exp.PeriodEnd));
  const [description, setDescription] = useState(exp.Description);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: updateExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience"] });
      onDone();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not update experience."),
  });

  const tagMutation = useMutation({
    mutationFn: ({ tag, selected }: { tag: ApiTag; selected: boolean }) =>
      selected
        ? attachTagToExperience({ experienceId: exp.ID, tagId: tag.ID })
        : detachTagFromExperience({ experienceId: exp.ID, tagId: tag.ID }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experience"] }),
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not update tech stack."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({
      id: exp.ID,
      payload: { role, org, period_start: periodStart, period_end: periodEnd || undefined, description },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-ink/10 flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Role</span>
          <input required value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Organization</span>
          <input required value={org} onChange={(e) => setOrg(e.target.value)} className={inputClass} />
        </label>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Period Start</span>
          <input required type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Period End (blank = Present)</span>
          <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className={inputClass} />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Description</span>
        <AutoGrowTextarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
      </label>
      <TagPicker
        selectedIds={exp.Tags.map((t) => t.ID)}
        disabled={tagMutation.isPending}
        onToggle={(tag, selected) => tagMutation.mutate({ tag, selected })}
      />
      {error && <p className="font-mono text-xs text-rose-bold">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit">{updateMutation.isPending ? "Saving…" : "Save"}</Button>
        <Button variant="secondary" onClick={onDone} type="button">
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function AdminExperiencePage() {
  const { isAuthenticated, isChecking } = useRequireAdmin();
  const queryClient = useQueryClient();
  const { data: experience } = useQuery({
    queryKey: ["experience"],
    queryFn: getExperience,
    enabled: isAuthenticated,
  });

  const [role, setRole] = useState("");
  const [org, setOrg] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [description, setDescription] = useState("");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [selectedTags, setSelectedTags] = useState<ApiTag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: createExperience,
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create experience."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experience"] }),
  });

  const reorderMutation = useMutation({
    mutationFn: updateExperience,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["experience"] }),
  });

  const { ordered, handleDragStart, handleDragOver, handleDrop } = useDragReorder(experience, (id, sortOrder) =>
    reorderMutation.mutate({ id, payload: { sort_order: sortOrder } })
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (pendingImages.some((img) => !img.altText.trim())) {
      setError("Add alt text for every image before uploading (required for accessibility).");
      return;
    }

    try {
      const exp = await createMutation.mutateAsync({
        role,
        org,
        period_start: periodStart,
        period_end: periodEnd || undefined,
        description,
      });

      if (pendingImages.length > 0) {
        setIsUploadingImage(true);
        for (const img of pendingImages) {
          await uploadMedia({ experienceId: exp.ID }, img.file, img.altText);
        }
        pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setIsUploadingImage(false);
      }

      await Promise.all(
        selectedTags.map((tag) => attachTagToExperience({ experienceId: exp.ID, tagId: tag.ID }))
      );

      queryClient.invalidateQueries({ queryKey: ["experience"] });
      setRole("");
      setOrg("");
      setPeriodStart("");
      setPeriodEnd("");
      setSelectedTags([]);
      setDescription("");
      setPendingImages([]);
    } catch (err) {
      setIsUploadingImage(false);
      setError(err instanceof ApiError ? err.message : "Could not create experience.");
    }
  }

  if (isChecking || !isAuthenticated) {
    return (
      <main className="flex-1 flex items-center justify-center py-32">
        <p className="font-mono text-sm text-ink/50">Checking session…</p>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-[900px] mx-auto px-6 md:px-16 py-16 w-full">
      <Link href="/admin" className="font-mono text-xs text-ink/50 hover:text-rose-bold transition-colors">
        ← Dashboard
      </Link>
      <h1 className="font-display text-3xl mt-2 mb-8">Experience</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sticky flex flex-col gap-4 mb-10">
        <h2 className="font-display text-xl">Add Experience</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Role</span>
            <input required value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Organization</span>
            <input required value={org} onChange={(e) => setOrg(e.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Period Start</span>
            <input
              required
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Period End (blank = Present)</span>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className={inputClass} />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Description</span>
          <AutoGrowTextarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
        </label>
        <TagPicker
          selectedIds={selectedTags.map((t) => t.ID)}
          onToggle={(tag, selected) =>
            setSelectedTags((prev) => (selected ? [...prev, tag] : prev.filter((t) => t.ID !== tag.ID)))
          }
        />
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Images (optional)</span>
          <PendingImagePicker images={pendingImages} onChange={setPendingImages} disabled={isUploadingImage} />
        </label>
        {error && <p className="font-mono text-xs text-rose-bold">{error}</p>}
        <Button type="submit">
          {createMutation.isPending || isUploadingImage
            ? isUploadingImage
              ? "Uploading images…"
              : "Adding…"
            : "Add Experience"}
        </Button>
      </form>

      {ordered.length > 1 && (
        <p className="font-mono text-xs text-ink/40 mb-2">Drag rows by the ⠿ handle to reorder.</p>
      )}
      <div className="flex flex-col gap-3">
        {ordered.map((exp, i) => (
          <div
            key={exp.ID}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={handleDrop}
            className="bg-white p-4 rounded-sm shadow-sticky cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-ink/30 select-none">⠿</span>
                <div>
                  <p className="font-display text-lg">{exp.Role}</p>
                  <p className="font-mono text-xs text-ink/50">
                    {exp.Org} · {exp.PeriodStart} — {exp.PeriodEnd ?? "Present"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEditingId(editingId === exp.ID ? null : exp.ID)}
                  className="font-mono text-xs text-ink/60 hover:underline"
                >
                  {editingId === exp.ID ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === exp.ID ? null : exp.ID)}
                  className="font-mono text-xs text-ink/60 hover:underline"
                >
                  {expandedId === exp.ID ? "Hide images" : "Manage images"}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(exp.ID)}
                  className="font-mono text-xs text-rose-bold hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            {editingId === exp.ID && <EditExperienceForm exp={exp} onDone={() => setEditingId(null)} />}
            {expandedId === exp.ID && <MediaManager owner={{ experienceId: exp.ID }} />}
          </div>
        ))}
        {ordered.length === 0 && <p className="font-mono text-sm text-ink/50">No experience yet.</p>}
      </div>
    </main>
  );
}

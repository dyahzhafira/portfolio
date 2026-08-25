"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { useDragReorder } from "@/hooks/useDragReorder";
import { getProjects, createProject, updateProject, deleteProject, uploadMedia, ApiError } from "@/lib/api";
import type { ApiProject } from "@/lib/api";
import Button from "@/components/Button";
import MediaManager from "@/components/admin/MediaManager";
import AutoGrowTextarea from "@/components/admin/AutoGrowTextarea";
import PendingImagePicker, { type PendingImage } from "@/components/admin/PendingImagePicker";

const inputClass =
  "border-0 border-b-[1.5px] border-ink bg-transparent py-1 font-body focus:outline-none focus:border-rose-bold w-full";
const labelClass = "font-mono text-xs uppercase tracking-wide text-ink/70";

function EditProjectForm({
  project,
  onDone,
}: {
  project: ApiProject;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(project.Title);
  const [description, setDescription] = useState(project.Description);
  const [learnings, setLearnings] = useState(project.Learnings);
  const [status, setStatus] = useState(project.Status);
  const [demoUrl, setDemoUrl] = useState(project.DemoURL);
  const [repoUrl, setRepoUrl] = useState(project.RepoURL);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onDone();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not update project."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({
      id: project.ID,
      payload: { title, description, learnings, status, demo_url: demoUrl, repo_url: repoUrl },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-ink/10 flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Title</span>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="in-progress">in-progress</option>
            <option value="completed">completed</option>
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Description</span>
        <AutoGrowTextarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Learnings</span>
        <AutoGrowTextarea value={learnings} onChange={(e) => setLearnings(e.target.value)} className={inputClass} />
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Demo URL</span>
          <input value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Repo URL</span>
          <input value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} className={inputClass} />
        </label>
      </div>
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

export default function AdminProjectsPage() {
  const { isAuthenticated, isChecking } = useRequireAdmin();
  const queryClient = useQueryClient();
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => getProjects(), enabled: isAuthenticated });

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("in-progress");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: createProject,
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create project."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const reorderMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const { ordered, handleDragStart, handleDragOver, handleDrop } = useDragReorder(projects, (id, sortOrder) =>
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
      const project = await createMutation.mutateAsync({ slug, title, description, status });

      if (pendingImages.length > 0) {
        setIsUploadingImage(true);
        for (const img of pendingImages) {
          await uploadMedia({ projectId: project.ID }, img.file, img.altText);
        }
        pendingImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
        setIsUploadingImage(false);
      }

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSlug("");
      setTitle("");
      setDescription("");
      setPendingImages([]);
    } catch (err) {
      setIsUploadingImage(false);
      setError(err instanceof ApiError ? err.message : "Could not create project.");
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
      <h1 className="font-display text-3xl mt-2 mb-8">Projects</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sticky flex flex-col gap-4 mb-10">
        <h2 className="font-display text-xl">Add Project</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Slug</span>
            <input required value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="my-project" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Title</span>
            <input required value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Description</span>
          <AutoGrowTextarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="in-progress">in-progress</option>
            <option value="completed">completed</option>
          </select>
        </label>
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
            : "Add Project"}
        </Button>
      </form>

      {ordered.length > 1 && (
        <p className="font-mono text-xs text-ink/40 mb-2">Drag rows by the ⠿ handle to reorder.</p>
      )}
      <div className="flex flex-col gap-3">
        {ordered.map((p, i) => (
          <div
            key={p.ID}
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
                  <p className="font-display text-lg">{p.Title}</p>
                  <p className="font-mono text-xs text-ink/50">
                    /{p.Slug} · {p.Status}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEditingId(editingId === p.ID ? null : p.ID)}
                  className="font-mono text-xs text-ink/60 hover:underline"
                >
                  {editingId === p.ID ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === p.ID ? null : p.ID)}
                  className="font-mono text-xs text-ink/60 hover:underline"
                >
                  {expandedId === p.ID ? "Hide images" : "Manage images"}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(p.ID)}
                  className="font-mono text-xs text-rose-bold hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            {editingId === p.ID && <EditProjectForm project={p} onDone={() => setEditingId(null)} />}
            {expandedId === p.ID && <MediaManager owner={{ projectId: p.ID }} />}
          </div>
        ))}
        {ordered.length === 0 && <p className="font-mono text-sm text-ink/50">No projects yet.</p>}
      </div>
    </main>
  );
}

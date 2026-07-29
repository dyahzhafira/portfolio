"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { getTags, createTag, updateTag, deleteTag, ApiError } from "@/lib/api";
import type { ApiTag } from "@/lib/api";
import Button from "@/components/Button";

const inputClass =
  "border-0 border-b-[1.5px] border-ink bg-transparent py-1 font-body focus:outline-none focus:border-rose-bold w-full";
const labelClass = "font-mono text-xs uppercase tracking-wide text-ink/70";
const colorOptions = ["rose", "lavender", "sky", "mint"];

function EditTagForm({ tag, onDone }: { tag: ApiTag; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(tag.Name);
  const [colorToken, setColorToken] = useState(tag.ColorToken);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      onDone();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not update tag."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({ id: tag.ID, payload: { name, color_token: colorToken } });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-ink/10 flex flex-col gap-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Color</span>
          <select value={colorToken} onChange={(e) => setColorToken(e.target.value)} className={inputClass}>
            {colorOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
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

export default function AdminTagsPage() {
  const { isAuthenticated, isChecking } = useRequireAdmin();
  const queryClient = useQueryClient();
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: getTags, enabled: isAuthenticated });

  const [name, setName] = useState("");
  const [colorToken, setColorToken] = useState(colorOptions[0]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setName("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create tag."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags"] }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ name, color_token: colorToken });
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
      <h1 className="font-display text-3xl mt-2 mb-8">Tags</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sticky flex flex-col gap-4 mb-10">
        <h2 className="font-display text-xl">Add Tag</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Go" />
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Color</span>
            <select value={colorToken} onChange={(e) => setColorToken(e.target.value)} className={inputClass}>
              {colorOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="font-mono text-xs text-rose-bold">{error}</p>}
        <Button type="submit">{createMutation.isPending ? "Adding…" : "Add Tag"}</Button>
      </form>

      <div className="flex flex-col gap-3">
        {tags?.map((t) => (
          <div key={t.ID} className="bg-white p-4 rounded-sm shadow-sticky">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg">{t.Name}</p>
                <p className="font-mono text-xs text-ink/50">{t.ColorToken}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEditingId(editingId === t.ID ? null : t.ID)}
                  className="font-mono text-xs text-ink/60 hover:underline"
                >
                  {editingId === t.ID ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(t.ID)}
                  className="font-mono text-xs text-rose-bold hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            {editingId === t.ID && <EditTagForm tag={t} onDone={() => setEditingId(null)} />}
          </div>
        ))}
        {tags?.length === 0 && <p className="font-mono text-sm text-ink/50">No tags yet.</p>}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { getSkills, createSkill, updateSkill, deleteSkill, ApiError } from "@/lib/api";
import type { ApiSkill } from "@/lib/api";
import { skillIconMap } from "@/lib/skill-icons";
import Button from "@/components/Button";

const inputClass =
  "border-0 border-b-[1.5px] border-ink bg-transparent py-1 font-body focus:outline-none focus:border-rose-bold w-full";
const labelClass = "font-mono text-xs uppercase tracking-wide text-ink/70";

const categories = ["backend", "devops", "ai-ml", "frontend"];
const iconSlugs = Object.keys(skillIconMap);

function EditSkillForm({ skill, onDone }: { skill: ApiSkill; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(skill.Name);
  const [category, setCategory] = useState(skill.Category);
  const [iconSlug, setIconSlug] = useState(skill.IconSlug);
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useMutation({
    mutationFn: updateSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      onDone();
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not update skill."),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({ id: skill.ID, payload: { name, category, icon_slug: iconSlug } });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-ink/10 flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className={labelClass}>Name</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Icon</span>
          <select value={iconSlug} onChange={(e) => setIconSlug(e.target.value)} className={inputClass}>
            {iconSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {slug}
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

export default function AdminSkillsPage() {
  const { isAuthenticated, isChecking } = useRequireAdmin();
  const queryClient = useQueryClient();
  const { data: skills } = useQuery({ queryKey: ["skills"], queryFn: getSkills, enabled: isAuthenticated });

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [iconSlug, setIconSlug] = useState(iconSlugs[0]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const createMutation = useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      setName("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create skill."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["skills"] }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ name, category, icon_slug: iconSlug });
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
      <h1 className="font-display text-3xl mt-2 mb-8">Skills</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-sm shadow-sticky flex flex-col gap-4 mb-10">
        <h2 className="font-display text-xl">Add Skill</h2>
        <label className="flex flex-col gap-1">
          <span className={labelClass}>Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Go" />
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className={labelClass}>Icon</span>
            <select value={iconSlug} onChange={(e) => setIconSlug(e.target.value)} className={inputClass}>
              {iconSlugs.map((slug) => (
                <option key={slug} value={slug}>
                  {slug}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="font-mono text-xs text-rose-bold">{error}</p>}
        <Button type="submit">{createMutation.isPending ? "Adding…" : "Add Skill"}</Button>
      </form>

      <div className="flex flex-col gap-3">
        {skills?.map((s) => (
          <div key={s.ID} className="bg-white p-4 rounded-sm shadow-sticky">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-lg">{s.Name}</p>
                <p className="font-mono text-xs text-ink/50">
                  {s.Category} · {s.IconSlug}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEditingId(editingId === s.ID ? null : s.ID)}
                  className="font-mono text-xs text-ink/60 hover:underline"
                >
                  {editingId === s.ID ? "Cancel" : "Edit"}
                </button>
                <button
                  onClick={() => deleteMutation.mutate(s.ID)}
                  className="font-mono text-xs text-rose-bold hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            {editingId === s.ID && <EditSkillForm skill={s} onDone={() => setEditingId(null)} />}
          </div>
        ))}
        {skills?.length === 0 && <p className="font-mono text-sm text-ink/50">No skills yet.</p>}
      </div>
    </main>
  );
}

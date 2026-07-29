"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/api";
import type { TagColor } from "./Tag";
import ProjectCard from "./ProjectCard";
import type { ProjectCardData } from "./ProjectCard";

const validColors: TagColor[] = ["rose", "lavender", "sky", "mint", "neutral"];

function toTagColor(token: string): TagColor {
  return (validColors as string[]).includes(token) ? (token as TagColor) : "neutral";
}

export default function ProjectsList() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  const allTags = useMemo(() => {
    if (!data) return [];
    const seen = new Map<string, string>();
    data.forEach((p) => p.Tags.forEach((t) => seen.set(t.Name, t.ColorToken)));
    return Array.from(seen.entries());
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => a.SortOrder - b.SortOrder);
    if (!activeTag) return sorted;
    return sorted.filter((p) => p.Tags.some((t) => t.Name === activeTag));
  }, [data, activeTag]);

  if (isLoading) {
    return <p className="font-mono text-sm text-ink/50">Loading projects…</p>;
  }

  if (isError || !data) {
    return <p className="font-mono text-sm text-ink/50">Could not load projects.</p>;
  }

  if (data.length === 0) {
    return <p className="font-mono text-sm text-ink/50">No projects yet.</p>;
  }

  return (
    <div>
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <span className="font-mono text-xs uppercase tracking-wide text-ink/50">Filter:</span>
          <button
            onClick={() => setActiveTag(null)}
            className={`px-3 py-1.5 font-mono text-xs uppercase rounded-[3px] border border-ink/20 transition-colors ${
              activeTag === null ? "bg-ink text-paper" : "bg-white text-ink hover:border-ink"
            }`}
          >
            All
          </button>
          {allTags.map(([name]) => (
            <button
              key={name}
              onClick={() => setActiveTag(name)}
              className={`px-3 py-1.5 font-mono text-xs uppercase rounded-[3px] border border-ink/20 transition-colors ${
                activeTag === name ? "bg-ink text-paper" : "bg-white text-ink hover:border-ink"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="font-mono text-sm text-ink/50">No projects match this filter.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((p, i) => {
            const primaryTag = p.Tags[0];
            const cardData: ProjectCardData = {
              id: p.ID,
              slug: p.Slug,
              title: p.Title,
              description: p.Description,
              category: primaryTag?.Name ?? p.Status,
              color: primaryTag ? toTagColor(primaryTag.ColorToken) : "neutral",
              tags: p.Tags.map((t) => t.Name),
              demoUrl: p.DemoURL || undefined,
              repoUrl: p.RepoURL || undefined,
            };
            return <ProjectCard key={p.ID} data={cardData} index={i} />;
          })}
        </div>
      )}
    </div>
  );
}

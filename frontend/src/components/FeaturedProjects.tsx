"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjects } from "@/lib/api";
import ProjectCard from "./ProjectCard";
import type { ProjectCardData } from "./ProjectCard";

export default function FeaturedProjects({ limit = 3 }: { limit?: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  if (isLoading) {
    return <p className="font-mono text-sm text-ink/50">Loading projects…</p>;
  }

  if (isError || !data || data.length === 0) {
    return <p className="font-mono text-sm text-ink/50">No projects yet.</p>;
  }

  const items = [...data].sort((a, b) => a.SortOrder - b.SortOrder).slice(0, limit);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {items.map((p, i) => {
        const primaryTag = p.Tags[0];
        const cardData: ProjectCardData = {
          id: p.ID,
          slug: p.Slug,
          title: p.Title,
          description: p.Description,
          category: primaryTag?.Name ?? p.Status,
          tags: p.Tags.map((t) => ({ name: t.Name, iconSlug: t.IconSlug })),
          demoUrl: p.DemoURL || undefined,
          repoUrl: p.RepoURL || undefined,
        };
        return <ProjectCard key={p.ID} data={cardData} index={i} />;
      })}
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { getExperience } from "@/lib/api";
import ExperienceItem from "./ExperienceItem";

function formatPeriod(start: string, end: string | null): string {
  const startYear = new Date(start).getFullYear();
  if (!end) return `${startYear} — Present`;
  const endYear = new Date(end).getFullYear();
  return startYear === endYear ? `${startYear}` : `${startYear} — ${endYear}`;
}

export default function ExperienceList({ limit }: { limit?: number }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["experience"],
    queryFn: getExperience,
  });

  if (isLoading) {
    return <p className="font-mono text-sm text-ink/50">Loading field notes…</p>;
  }

  if (isError || !data || data.length === 0) {
    return <p className="font-mono text-sm text-ink/50">No experience recorded yet.</p>;
  }

  const items = [...data]
    .sort((a, b) => a.SortOrder - b.SortOrder)
    .slice(0, limit ?? data.length);

  return (
    <div className="flex flex-col gap-10">
      {items.map((exp, i) => (
        <ExperienceItem
          key={exp.ID}
          align={i % 2 === 0 ? "right" : "left"}
          data={{
            id: exp.ID,
            role: exp.Role,
            org: exp.Org,
            period: formatPeriod(exp.PeriodStart, exp.PeriodEnd),
            description: exp.Description,
            tags: exp.Tags.map((t) => t.Name),
          }}
        />
      ))}
    </div>
  );
}

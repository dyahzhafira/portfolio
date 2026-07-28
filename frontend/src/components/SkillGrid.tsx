"use client";

import { useQuery } from "@tanstack/react-query";
import { FiServer, FiCloud, FiCpu, FiCode } from "react-icons/fi";
import { getSkills } from "@/lib/api";
import { skillIconMap } from "@/lib/skill-icons";
import type { TagColor } from "./Tag";
import SkillItem from "./SkillItem";

const categoryColor: Record<string, TagColor> = {
  backend: "rose",
  devops: "sky",
  "ai-ml": "lavender",
  frontend: "mint",
};

const categoryLabel: Record<string, string> = {
  backend: "Backend",
  devops: "DevOps",
  "ai-ml": "AI/ML",
  frontend: "Frontend",
};

const categoryIcon: Record<string, typeof FiServer> = {
  backend: FiServer,
  devops: FiCloud,
  "ai-ml": FiCpu,
  frontend: FiCode,
};

const bgMap: Record<TagColor, string> = {
  rose: "bg-rose",
  lavender: "bg-lavender",
  sky: "bg-sky",
  mint: "bg-mint",
  neutral: "bg-white",
};

const rotations = ["-rotate-1", "rotate-1", "-rotate-2", "rotate-2"];

export default function SkillGrid() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["skills"],
    queryFn: getSkills,
  });

  if (isLoading) {
    return <p className="font-mono text-sm text-ink/50">Loading inventory…</p>;
  }

  if (isError || !data || data.length === 0) {
    return <p className="font-mono text-sm text-ink/50">No skills recorded yet.</p>;
  }

  const categories = Array.from(new Set(data.map((s) => s.Category)));

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {categories.map((category, i) => {
        const color = categoryColor[category] ?? "neutral";
        const CategoryIcon = categoryIcon[category] ?? FiCode;
        const skills = data
          .filter((s) => s.Category === category)
          .sort((a, b) => a.SortOrder - b.SortOrder);

        return (
          <div
            key={category}
            className={`${bgMap[color]} p-5 rounded-sm shadow-sticky ${rotations[i % rotations.length]} hover:rotate-0 transition-transform duration-150`}
          >
            <div className="flex items-center gap-2 mb-3">
              <CategoryIcon className="w-4 h-4 text-ink/60" />
              <h4 className="font-display text-lg">{categoryLabel[category] ?? category}</h4>
            </div>
            <ul className="flex flex-col gap-2">
              {skills.map((skill) => {
                const Icon = skillIconMap[skill.IconSlug];
                if (!Icon) return null;
                return <SkillItem key={skill.ID} name={skill.Name} icon={Icon} />;
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

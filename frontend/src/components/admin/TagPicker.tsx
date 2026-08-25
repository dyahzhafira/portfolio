"use client";

import { useQuery } from "@tanstack/react-query";
import { getTags } from "@/lib/api";
import type { ApiTag } from "@/lib/api";

const labelClass = "font-mono text-xs uppercase tracking-wide text-ink/70";

export default function TagPicker({
  selectedIds,
  onToggle,
  disabled,
}: {
  selectedIds: number[];
  onToggle: (tag: ApiTag, selected: boolean) => void;
  disabled?: boolean;
}) {
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: getTags });

  if (!tags || tags.length === 0) {
    return (
      <p className="font-mono text-xs text-ink/40">
        No tech stack tags yet — add some on the Tags page first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={labelClass}>Tech Stack</span>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const selected = selectedIds.includes(tag.ID);
          return (
            <button
              key={tag.ID}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(tag, !selected)}
              className={`px-2.5 py-1 rounded-[3px] border-[0.5px] font-mono text-xs uppercase tracking-wide transition-colors disabled:opacity-50 ${
                selected
                  ? "bg-rose-bold text-white border-rose-bold"
                  : "bg-transparent text-ink/70 border-ink/20 hover:border-ink/40"
              }`}
            >
              {tag.Name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

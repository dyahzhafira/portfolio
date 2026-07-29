import type { ReactNode } from "react";

export type TagColor = "rose" | "lavender" | "sky" | "mint" | "neutral";

const colorMap: Record<TagColor, string> = {
  rose: "bg-rose",
  lavender: "bg-lavender",
  sky: "bg-sky",
  mint: "bg-mint",
  neutral: "bg-white",
};

type TagProps = {
  label: string;
  color?: TagColor;
  icon?: ReactNode;
};

export default function Tag({ label, color = "neutral", icon }: TagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] border-[0.5px] border-ink/20 font-mono text-xs uppercase tracking-wide text-ink ${colorMap[color]}`}
    >
      {icon && <span className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">{icon}</span>}
      {label}
    </span>
  );
}

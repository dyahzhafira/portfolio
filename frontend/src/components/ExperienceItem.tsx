import Tag from "./Tag";
import CardImageSlider from "./CardImageSlider";
import { skillIconMap } from "@/lib/skill-icons";

export type ExperienceData = {
  id?: number;
  role: string;
  org: string;
  period: string;
  description: string;
  tags: { name: string; iconSlug: string }[];
};

export default function ExperienceItem({
  data,
  align = "right",
}: {
  data: ExperienceData;
  align?: "left" | "right";
}) {
  const card = (
    <div className="bg-white p-5 rounded-sm shadow-sticky">
      {data.id !== undefined && <CardImageSlider owner={{ experienceId: data.id }} />}
      <h4 className="font-display text-xl">{data.role}</h4>
      <p className="font-handwritten text-lg text-rose-bold mb-2">@ {data.org}</p>
      <p className="font-body text-sm text-ink/80 mb-3">{data.description}</p>
      <div className="flex flex-wrap gap-2">
        {data.tags.map((tag) => {
          const Icon = skillIconMap[tag.iconSlug];
          return (
            <Tag key={tag.name} label={tag.name} color="sky" icon={Icon ? <Icon /> : undefined} />
          );
        })}
      </div>
    </div>
  );

  const periodLabel = (
    <p
      className={`font-mono text-sm text-ink/60 pt-2 ${
        align === "left" ? "text-right" : "text-left"
      }`}
    >
      {data.period}
    </p>
  );

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-6">
      <div>{align === "left" ? card : periodLabel}</div>
      <div className="w-2 h-2 rounded-full bg-rose-bold mt-3" />
      <div>{align === "right" ? card : periodLabel}</div>
    </div>
  );
}

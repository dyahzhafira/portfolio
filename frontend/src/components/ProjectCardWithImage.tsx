import Image from "next/image";
import type { TagColor } from "./Tag";
import Tag from "./Tag";
import type { ProjectCardData } from "./ProjectCard";

const rotations = ["-rotate-1", "rotate-1", "rotate-2", "-rotate-2"];

const bgMap: Record<TagColor, string> = {
  rose: "bg-rose",
  lavender: "bg-lavender",
  sky: "bg-sky",
  mint: "bg-mint",
  neutral: "bg-white",
};

export type ProjectCardWithImageData = ProjectCardData & {
  imageUrl: string;
  imageAlt: string;
};

export default function ProjectCardWithImage({
  data,
  index = 0,
}: {
  data: ProjectCardWithImageData;
  index?: number;
}) {
  const rotation = rotations[index % rotations.length];

  return (
    <a
      href={`/projects/${data.slug}`}
      className={`block ${bgMap[data.color]} rounded-sm shadow-sticky ${rotation} hover:rotate-0 hover:shadow-[3px_4px_10px_rgba(58,53,48,0.16)] transition-all duration-150 overflow-hidden`}
    >
      <div className="relative w-full aspect-video bg-white/40 border-b border-ink/10">
        <Image
          src={data.imageUrl}
          alt={data.imageAlt}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <p className="font-mono text-xs uppercase tracking-wide text-ink/70 mb-2">
          {data.category}
        </p>
        <h3 className="font-display text-2xl mb-2">{data.title}</h3>
        <p className="font-body text-sm text-ink/80 mb-4">{data.description}</p>
        <div className="flex flex-wrap gap-2">
          {data.tags.map((tag) => (
            <Tag key={tag} label={tag} color="neutral" />
          ))}
        </div>
      </div>
    </a>
  );
}

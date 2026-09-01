import { FiExternalLink, FiCode, FiFolder } from "react-icons/fi";
import Tag from "./Tag";
import CardPolaroidStack from "./CardPolaroidStack";
import { skillIconMap } from "@/lib/skill-icons";

export type ProjectCardData = {
  id?: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: { name: string; iconSlug: string }[];
  demoUrl?: string;
  repoUrl?: string;
};

const rotations = ["-rotate-1", "rotate-1", "rotate-2", "-rotate-2"];
const cardBackgrounds = ["bg-rose", "bg-lavender", "bg-sky", "bg-mint"];

export default function ProjectCard({
  data,
  index = 0,
}: {
  data: ProjectCardData;
  index?: number;
}) {
  const rotation = rotations[index % rotations.length];
  const background = cardBackgrounds[index % cardBackgrounds.length];
  const CornerIcon = data.demoUrl ? FiExternalLink : data.repoUrl ? FiCode : FiFolder;

  return (
    <a
      href={`/projects/${data.slug}`}
      className={`block p-5 ${background} rounded-sm shadow-sticky ${rotation} hover:rotate-0 hover:shadow-[3px_4px_10px_rgba(58,53,48,0.16)] transition-all duration-150`}
    >
      <div className="flex items-start justify-between mb-2">
        <p className="font-mono text-xs uppercase tracking-wide text-ink/70">{data.category}</p>
        <CornerIcon className="w-4 h-4 text-ink/50 shrink-0" />
      </div>
      {data.id !== undefined && <CardPolaroidStack owner={{ projectId: data.id }} />}
      <h3 className="font-display text-2xl mb-2">{data.title}</h3>
      <p className="font-body text-sm text-ink/80 mb-4 text-justify">{data.description}</p>
      <div className="border-t border-ink/15 pt-3 flex flex-wrap gap-2">
        {data.tags.map((tag) => {
          const Icon = skillIconMap[tag.iconSlug];
          return (
            <Tag key={tag.name} label={tag.name} color="neutral" icon={Icon ? <Icon /> : undefined} />
          );
        })}
      </div>
    </a>
  );
}

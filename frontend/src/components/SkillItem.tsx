import type { IconType } from "react-icons";

export type SkillItemData = {
  name: string;
  icon: IconType;
};

export default function SkillItem({ name, icon: Icon }: SkillItemData) {
  return (
    <li className="flex items-center gap-2 bg-white/70 border-[0.5px] border-ink/20 rounded-[3px] px-2.5 py-1.5 font-mono text-xs text-ink">
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {name}
    </li>
  );
}

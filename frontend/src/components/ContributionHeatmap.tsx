"use client";

import { useQuery } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const GITHUB_USERNAME = "dyahzhafira";

type ContributionDay = {
  date: string;
  level: number;
};

const levelClass = ["bg-white border border-ink/10", "bg-rose-bold/25", "bg-rose-bold/50", "bg-rose-bold/75", "bg-rose-bold"];

async function fetchContributions(): Promise<ContributionDay[]> {
  const res = await fetch(`${API_URL}/github/contributions?username=${GITHUB_USERNAME}`);
  if (!res.ok) throw new Error("Could not load contributions");
  const body = await res.json();
  return body.data as ContributionDay[];
}

export default function ContributionHeatmap() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["github-contributions"],
    queryFn: fetchContributions,
  });

  if (isLoading) {
    return <p className="font-mono text-sm text-ink/50">Loading contribution history…</p>;
  }

  if (isError || !data || data.length === 0) {
    return <p className="font-mono text-sm text-ink/50">Could not load contribution history.</p>;
  }

  const byDate = new Map(data.map((d) => [d.date, d.level]));
  const sortedDates = [...byDate.keys()].sort();
  const firstDate = new Date(sortedDates[0]);
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);

  const start = new Date(firstDate);
  start.setDate(start.getDate() - start.getDay());

  const weeks: { date: string; level: number }[][] = [];
  const cursor = new Date(start);
  while (cursor <= lastDate) {
    const week: { date: string; level: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const iso = cursor.toISOString().slice(0, 10);
      week.push({ date: iso, level: byDate.get(iso) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const totalContributions = data.filter((d) => d.level > 0).length;

  return (
    <div>
      <p className="font-mono text-xs text-ink/50 mb-3">{totalContributions} active days in the last year</p>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[3px] w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={day.date}
                  className={`w-[10px] h-[10px] rounded-[2px] ${levelClass[day.level]}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

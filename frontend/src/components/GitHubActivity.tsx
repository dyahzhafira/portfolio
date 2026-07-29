"use client";

import { useQuery } from "@tanstack/react-query";
import { SiGithub } from "react-icons/si";
import Tag from "./Tag";
import ContributionHeatmap from "./ContributionHeatmap";

const GITHUB_USERNAME = "dyahzhafira";

type GhRepo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
};

async function fetchGithub<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`);
  if (!res.ok) {
    throw new Error(`GitHub API request failed: ${res.status}`);
  }
  return res.json();
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export default function GitHubActivity() {
  const {
    data: repos,
    isLoading: reposLoading,
    isError: reposError,
  } = useQuery({
    queryKey: ["github-repos"],
    queryFn: () => fetchGithub<GhRepo[]>(`/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`),
  });

  if (reposLoading) {
    return <p className="font-mono text-sm text-ink/50">Loading GitHub activity…</p>;
  }

  if (reposError || !repos) {
    return <p className="font-mono text-sm text-ink/50">Could not load GitHub activity right now.</p>;
  }

  const languageCounts = repos
    .filter((r) => !r.fork && r.language)
    .reduce<Record<string, number>>((acc, r) => {
      acc[r.language as string] = (acc[r.language as string] ?? 0) + 1;
      return acc;
    }, {});
  const topLanguages = Object.entries(languageCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-12">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-4">Contribution activity</p>
        <ContributionHeatmap />
      </div>

      {topLanguages.length > 0 && (
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-3">Most used languages</p>
          <div className="flex flex-wrap gap-2">
            {topLanguages.map(([lang]) => (
              <Tag key={lang} label={lang} color="sky" />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-4">Recent repositories</p>
        <div className="grid md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white p-4 rounded-sm shadow-sticky hover:shadow-[3px_4px_10px_rgba(58,53,48,0.16)] transition-all duration-150"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-display text-lg">{repo.name}</p>
                <SiGithub className="w-4 h-4 text-ink/40 shrink-0" />
              </div>
              {repo.description && <p className="font-body text-sm text-ink/70 mb-2">{repo.description}</p>}
              <div className="flex items-center gap-3 font-mono text-xs text-ink/50">
                {repo.language && <span>{repo.language}</span>}
                <span>updated {timeAgo(repo.updated_at)}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Tag from "@/components/Tag";
import PolaroidGallery from "@/components/PolaroidGallery";
import { getProject, getMedia } from "@/lib/api";
import { skillIconMap } from "@/lib/skill-icons";

const GITHUB_URL = "https://github.com/dyahzhafira";
const LINKEDIN_URL = "https://www.linkedin.com/in/dyahzhafira/";

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project", slug],
    queryFn: () => getProject(slug),
  });

  const { data: media } = useQuery({
    queryKey: ["media", project?.ID, "project"],
    queryFn: () => getMedia({ projectId: project!.ID }),
    enabled: !!project,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-32">
          <p className="font-mono text-sm text-ink/50">Loading project…</p>
        </main>
      </>
    );
  }

  if (isError || !project) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="max-w-[1200px] mx-auto px-6 md:px-16 py-16">
          <p className="font-mono text-xs uppercase tracking-wide text-ink/50 mb-3">{project.Status}</p>
          <h1 className="font-display text-4xl md:text-5xl mb-4">{project.Title}</h1>

          {media && media.length > 0 && (
            <div className="mb-8">
              <PolaroidGallery images={media} />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6">
            {project.Tags.map((t) => {
              const Icon = skillIconMap[t.IconSlug];
              return (
                <Tag key={t.ID} label={t.Name} color="neutral" icon={Icon ? <Icon /> : undefined} />
              );
            })}
          </div>
          <p className="font-body text-lg text-ink/80 text-justify mb-8">{project.Description}</p>

          <div className="flex gap-4 mb-16">
            {project.DemoURL && <Button href={project.DemoURL}>View Demo</Button>}
            {project.RepoURL && (
              <Button href={project.RepoURL} variant="secondary">
                View Code
              </Button>
            )}
          </div>

          {project.Learnings && (
            <div className="bg-lavender p-6 rounded-sm shadow-sticky -rotate-1">
              <p className="font-handwritten text-xl text-rose-bold mb-3">What I learned</p>
              <p className="font-body text-sm text-ink/80 text-justify">{project.Learnings}</p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-ink/10 bg-white/40">
        <div className="max-w-[1200px] mx-auto px-6 md:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-handwritten text-lg text-rose-bold">© 2026 Dyah — Aspiring Software Engineer</p>
          <div className="flex gap-6 font-body text-sm text-ink/70">
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="hover:text-rose-bold transition-colors">
              LinkedIn
            </a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-rose-bold transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

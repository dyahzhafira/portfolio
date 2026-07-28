import Navbar from "@/components/Navbar";
import ProjectsList from "@/components/ProjectsList";

const GITHUB_URL = "https://github.com/dyahzhafira";
const LINKEDIN_URL = "https://www.linkedin.com/in/dyahzhafira/";

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="max-w-[1200px] mx-auto px-6 md:px-16 py-20">
          <h1 className="font-display text-4xl md:text-5xl mb-4">Selected Projects</h1>
          <p className="font-handwritten text-xl text-rose-bold mb-12">
            A collection of things I&apos;ve built and learned from.
          </p>
          <ProjectsList />
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

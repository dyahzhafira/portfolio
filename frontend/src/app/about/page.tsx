import Navbar from "@/components/Navbar";
import Tag from "@/components/Tag";
import ExperienceList from "@/components/ExperienceList";
import SkillGrid from "@/components/SkillGrid";

const GITHUB_URL = "https://github.com/dyahzhafira";
const LINKEDIN_URL = "https://www.linkedin.com/in/dyahzhafira/";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Intro */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-16 py-20">
          <h1 className="font-display text-4xl md:text-5xl mb-6">About Me</h1>
          <p className="font-body text-lg text-ink/80 max-w-2xl mb-4">
            I&apos;m <span className="highlight font-semibold">Dyah</span>, a second-year Computer Science student
            at Universitas Indonesia and an <span className="highlight font-semibold">aspiring software engineer</span>{" "}
            who learns by building. This portfolio is a collection of my projects, experiments, and lessons learned,
            where I explore how software works.
          </p>
          <p className="font-handwritten text-xl text-rose-bold">
            Welcome! Take a look around and see what I’ve been exploring and learning along the way.
          </p>
        </section>

        {/* Field Notes / Experience */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-16 py-16">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-display text-3xl">Field Notes</h2>
            <Tag label="Experience" color="rose" />
          </div>
          <ExperienceList />
        </section>

        {/* Inventory / Skills */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-16 py-16">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-3xl">Inventory</h2>
            <p className="font-handwritten text-lg text-ink/70">Tools of the trade</p>
          </div>
          <SkillGrid />
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

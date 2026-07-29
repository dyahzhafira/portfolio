import { SiGithub } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import Tag from "@/components/Tag";
import ExperienceList from "@/components/ExperienceList";
import FeaturedProjects from "@/components/FeaturedProjects";

const GITHUB_URL = "https://github.com/dyahzhafira";
const LINKEDIN_URL = "https://www.linkedin.com/in/dyahzhafira/";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-16 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-display text-4xl md:text-5xl mb-4">
              Hello, I&apos;m <span className="font-handwritten text-rose-bold text-5xl md:text-6xl">Dyah</span>
            </h1>
            <p className="font-body text-lg text-ink/80 mb-6">
              I&apos;m <span className="highlight font-semibold">Dyah</span>, a second-year Computer Science student
              at Universitas Indonesia and an <span className="highlight font-semibold">aspiring software engineer</span>{" "}
              who learns by building. This portfolio is a collection of my projects, experiments, and lessons learned,
              where I explore how software works.
            </p>
            <p className="font-handwritten text-xl text-rose-bold mb-8">
              Welcome! Take a look around and see what I’ve been exploring and learning along the way.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button href="/projects">View my projects</Button>
              <Button href="/about" variant="secondary">
                About me
              </Button>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-10 h-10 flex items-center justify-center border border-ink rounded-sm text-ink shadow-[2px_2px_0_var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150"
              >
                <SiGithub className="w-4 h-4" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 flex items-center justify-center border border-ink rounded-sm text-ink shadow-[2px_2px_0_var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px transition-all duration-150"
              >
                <FaLinkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="bg-rose p-3 rounded-sm shadow-sticky rotate-1 max-w-sm mx-auto">
            <div className="aspect-[4/5] bg-white/60 border border-ink/10 flex items-center justify-center">
              <img src="/dyah-profile.jpeg" alt="Portrait of Dyah" className="w-full h-full object-cover" />
            </div>
            <p className="font-handwritten text-lg text-ink/70 text-center mt-3">Dyah Zhafira</p>
          </div>
        </section>

        {/* Field Notes / Experience */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-16 py-16">
          <div className="flex items-center gap-4 mb-10">
            <h2 className="font-display text-3xl">Field Notes</h2>
            <Tag label="Experience" color="rose" />
          </div>
          <ExperienceList limit={2} />
        </section>

        {/* Selected Projects */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-16 py-16">
          <h2 className="font-display text-3xl mb-10">Selected Projects</h2>
          <FeaturedProjects limit={3} />
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

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-md text-center">
          <div className="inline-block bg-rose px-6 py-4 rounded-sm shadow-sticky -rotate-2 mb-8">
            <p className="font-display text-6xl">404</p>
          </div>
          <h1 className="font-display text-3xl mb-4">Page not found in the journal</h1>
          <p className="font-body text-ink/80 mb-2">
            This page seems to have been torn out or never written in the first place.
          </p>
          <p className="font-handwritten text-lg text-rose-bold mb-8">
            Let&apos;s get you back to a page that actually exists.
          </p>
          <Button href="/">Back to Home</Button>
          <p className="font-mono text-xs text-ink/40 mt-6">
            <Link href="/about" className="hover:text-rose-bold transition-colors">
              about
            </Link>
            {" · "}
            <Link href="/projects" className="hover:text-rose-bold transition-colors">
              projects
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

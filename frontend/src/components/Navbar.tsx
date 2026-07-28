"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Button from "./Button";

const CONTACT_EMAIL = "dyah.zhafira@ui.ac.id";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/github-activity", label: "GitHub" },
];

// hand-drawn pencil squiggle, repeated horizontally to fit any link width
const SQUIGGLE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='8' viewBox='0 0 20 8'%3E%3Cpath d='M0 4 Q 5 0, 10 4 T 20 4' stroke='%23E85D8A' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const activeEl = linkRefs.current[pathname];
    if (activeEl && navRef.current) {
      const navBox = navRef.current.getBoundingClientRect();
      const linkBox = activeEl.getBoundingClientRect();
      setIndicator({ left: linkBox.left - navBox.left, width: linkBox.width });
    } else {
      setIndicator(null);
    }
  }, [pathname, isScrolled]);

  return (
    <div className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "px-4 md:px-8 pt-2" : ""}`}>
      <header
        className={`transition-all duration-300 ${
          isScrolled
            ? "max-w-[1200px] mx-auto rounded-xl border border-ink/10 bg-paper/80 backdrop-blur-md shadow-[0_4px_16px_rgba(58,53,48,0.12)]"
            : "border-b border-transparent bg-paper"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 md:px-16 py-4 flex items-center justify-between">
          <Link href="/" className="font-handwritten text-3xl text-rose-bold" onClick={() => setIsOpen(false)}>
            Dyah
          </Link>

          <nav ref={navRef} className="hidden md:flex items-center gap-8 font-body text-sm relative">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => {
                  linkRefs.current[link.href] = el;
                }}
                className={`transition-colors pb-1 ${
                  pathname === link.href ? "text-rose-bold" : "text-ink hover:text-rose-bold"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {indicator && (
              <span
                className="absolute -bottom-1 h-2 transition-all duration-300 ease-out"
                style={{
                  left: indicator.left,
                  width: indicator.width,
                  backgroundImage: SQUIGGLE_BG,
                  backgroundRepeat: "repeat-x",
                  backgroundSize: "20px 8px",
                }}
              />
            )}
          </nav>

          <div className="hidden md:block">
            <Button href={`mailto:${CONTACT_EMAIL}`} variant="primary">
              Get in Touch
            </Button>
          </div>

          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="md:hidden flex flex-col gap-1.5 w-8 h-8 items-center justify-center"
          >
            <span className={`block w-5 h-[1.5px] bg-ink transition-transform ${isOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-ink transition-opacity ${isOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-[1.5px] bg-ink transition-transform ${isOpen ? "-rotate-45 -translate-y-[3px]" : ""}`} />
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-ink/10 bg-paper/95 backdrop-blur-md px-6 py-4 flex flex-col gap-4 rounded-b-xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`font-body text-sm transition-colors ${
                  pathname === link.href ? "text-rose-bold" : "text-ink hover:text-rose-bold"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button href={`mailto:${CONTACT_EMAIL}`} variant="primary">
              Get in Touch
            </Button>
          </div>
        )}
      </header>
    </div>
  );
}

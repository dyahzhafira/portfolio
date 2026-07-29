import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  type?: "button" | "submit";
};

export default function Button({
  children,
  href,
  variant = "primary",
  onClick,
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 px-5 py-2.5 font-mono text-sm rounded-sm transition-all duration-150";

  const styles =
    variant === "primary"
      ? "bg-rose-bold text-paper shadow-[2px_2px_0_var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px active:shadow-none active:translate-x-0 active:translate-y-0"
      : "bg-transparent text-ink border border-ink shadow-[2px_2px_0_var(--ink)] hover:shadow-[3px_3px_0_var(--ink)] hover:-translate-x-px hover:-translate-y-px active:shadow-none active:translate-x-0 active:translate-y-0";

  if (href) {
    const isExternalLike = href.startsWith("mailto:") || href.startsWith("http");
    if (isExternalLike) {
      return (
        <a href={href} className={`${base} ${styles}`}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={`${base} ${styles}`}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

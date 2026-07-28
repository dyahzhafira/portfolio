"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { logout } from "@/lib/api";
import Button from "@/components/Button";

const sections = [
  { title: "Projects", description: "Create, edit, and delete portfolio projects.", href: "/admin/projects" },
  { title: "Experience", description: "Manage Field Notes entries (orgs/jobs).", href: "/admin/experience" },
  { title: "Skills", description: "Manage the Inventory skill grid.", href: "/admin/skills" },
  { title: "Tags", description: "Manage shared tags used across projects and experience.", href: "/admin/tags" },
  { title: "Feedback", description: "View and manage visitor feedback.", href: "/admin/feedback" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, isChecking } = useRequireAdmin();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  if (isChecking || !isAuthenticated) {
    return (
      <main className="flex-1 flex items-center justify-center py-32">
        <p className="font-mono text-sm text-ink/50">Checking session…</p>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-[1200px] mx-auto px-6 md:px-16 py-16 w-full">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-display text-3xl">Admin Dashboard</h1>
          <p className="font-mono text-xs text-ink/50 mt-1">Welcome back, Dyah.</p>
        </div>
        <Button variant="secondary" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) =>
          section.href ? (
            <Link
              key={section.title}
              href={section.href}
              className="block bg-white p-5 rounded-sm shadow-sticky hover:shadow-[3px_4px_10px_rgba(58,53,48,0.16)] transition-all duration-150"
            >
              <h2 className="font-display text-xl mb-2">{section.title}</h2>
              <p className="font-body text-sm text-ink/70">{section.description}</p>
            </Link>
          ) : (
            <div key={section.title} className="bg-white p-5 rounded-sm shadow-sticky opacity-60">
              <h2 className="font-display text-xl mb-2">{section.title}</h2>
              <p className="font-body text-sm text-ink/70 mb-4">{section.description}</p>
              <p className="font-mono text-xs text-ink/40">Coming soon</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}

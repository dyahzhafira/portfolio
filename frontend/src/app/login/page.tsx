"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, ApiError } from "@/lib/api";
import Button from "@/components/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm bg-white p-8 rounded-sm shadow-sticky -rotate-1">
        <h1 className="font-display text-3xl mb-1">Admin Login</h1>
        <p className="font-mono text-xs text-ink/50 mb-6">for Dyah only</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wide text-ink/70">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-0 border-b-[1.5px] border-ink bg-transparent py-1 font-body focus:outline-none focus:border-rose-bold"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-xs uppercase tracking-wide text-ink/70">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-0 border-b-[1.5px] border-ink bg-transparent py-1 font-body focus:outline-none focus:border-rose-bold"
            />
          </label>

          {error && <p className="font-mono text-xs text-rose-bold">{error}</p>}

          <Button type="submit">{isSubmitting ? "Logging in…" : "Log In"}</Button>
        </form>
      </div>
    </main>
  );
}

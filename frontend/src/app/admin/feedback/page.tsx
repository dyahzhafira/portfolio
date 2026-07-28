"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { getFeedback, deleteFeedback } from "@/lib/api";

export default function AdminFeedbackPage() {
  const { isAuthenticated, isChecking } = useRequireAdmin();
  const queryClient = useQueryClient();
  const { data: feedback } = useQuery({ queryKey: ["feedback"], queryFn: getFeedback, enabled: isAuthenticated });

  const deleteMutation = useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feedback"] }),
  });

  if (isChecking || !isAuthenticated) {
    return (
      <main className="flex-1 flex items-center justify-center py-32">
        <p className="font-mono text-sm text-ink/50">Checking session…</p>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-[900px] mx-auto px-6 md:px-16 py-16 w-full">
      <Link href="/admin" className="font-mono text-xs text-ink/50 hover:text-rose-bold transition-colors">
        ← Dashboard
      </Link>
      <h1 className="font-display text-3xl mt-2 mb-8">Feedback</h1>

      <div className="flex flex-col gap-3">
        {feedback?.map((f) => (
          <div key={f.ID} className="bg-white p-4 rounded-sm shadow-sticky flex items-start justify-between gap-4">
            <div>
              <p className="font-body text-sm text-ink/90">{f.Message}</p>
              <p className="font-mono text-xs text-ink/40 mt-1">{new Date(f.CreatedAt).toLocaleString()}</p>
            </div>
            <button
              onClick={() => deleteMutation.mutate(f.ID)}
              className="font-mono text-xs text-rose-bold hover:underline shrink-0"
            >
              Delete
            </button>
          </div>
        ))}
        {feedback?.length === 0 && <p className="font-mono text-sm text-ink/50">No feedback yet.</p>}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminPing } from "@/lib/api";

export function useRequireAdmin() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    adminPing().then((ok) => {
      setIsChecking(false);
      if (ok) {
        setIsAuthenticated(true);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  return { isAuthenticated, isChecking };
}

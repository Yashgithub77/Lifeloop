"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // Not logged in → go to login
      router.push("/login");
    } else {
      // Logged in → check if they have goals set up
      checkSetupStatus();
    }
  }, [session, status, router]);

  const checkSetupStatus = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        // Has goals/tasks → go to dashboard
        router.push("/dashboard");
      } else {
        // No goals yet → go to setup
        router.push("/setup");
      }
    } catch {
      // If dashboard API fails, assume needs setup
      router.push("/setup");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
        />
        <p style={{ color: "var(--foreground)" }}>Loading LifeLoop...</p>
      </div>
    </div>
  );
}

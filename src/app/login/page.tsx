"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
            <div
                className="p-8 rounded-2xl shadow-lg max-w-md w-full mx-4"
                style={{ background: "var(--cardBg)", border: "1px solid var(--cardBorder)" }}
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
                        Welcome to LifeLoop
                    </h1>
                    <p style={{ color: "var(--foregroundMuted)" }}>
                        Sign in to sync your Google Calendar and get personalized planning
                    </p>
                </div>

                <button
                    onClick={() => signIn("google", { callbackUrl })}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all hover:scale-[1.02]"
                    style={{
                        background: "white",
                        color: "#1f2937",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Sign in with Google
                </button>

                <div className="mt-6 text-center">
                    <p className="text-sm" style={{ color: "var(--foregroundMuted)" }}>
                        By signing in, you allow LifeLoop to:
                    </p>
                    <ul className="mt-2 text-sm space-y-1" style={{ color: "var(--foregroundMuted)" }}>
                        <li>✓ View your calendar events</li>
                        <li>✓ Avoid scheduling during your meetings</li>
                        <li>✓ Create a personalized study plan</li>
                    </ul>
                </div>

                <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "var(--cardBorder)" }}>
                    <a
                        href="/"
                        className="text-sm hover:underline"
                        style={{ color: "var(--primary)" }}
                    >
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}

"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import ThemeSelector from "@/components/ThemeSelector";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div
          className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-30"
          style={{ background: "var(--primaryGradient)" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20"
          style={{ background: "var(--secondaryGradient)" }}
        />
        <div
          className="absolute top-[30%] right-[20%] w-[20%] h-[20%] rounded-full blur-[80px] opacity-20"
          style={{ background: "var(--accent)" }}
        />
      </div>

      {/* Theme Selector - Top Right */}
      <div className="absolute top-6 right-6">
        <ThemeSelector compact />
      </div>

      <div className="max-w-4xl text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 animate-fade-in-up">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: "var(--backgroundSecondary)",
              color: "var(--primary)",
              border: "1px solid var(--cardBorder)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "var(--success)" }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ background: "var(--success)" }}
              />
            </span>
            Agentic Life Planning System
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter" style={{ color: "var(--foreground)" }}>
            Life<span className="text-gradient">Loop</span>
          </h1>

          <p className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--foregroundMuted)" }}>
            Your <span className="font-semibold" style={{ color: "var(--foreground)" }}>AI-powered Co-Pilot</span> that understands your goals,
            adapts to your life, and evolves with you.
          </p>
        </div>

        {/* Feature Cards */}
        <div
          className="p-8 md:p-12 rounded-3xl shadow-xl animate-fade-in-up"
          style={{
            background: "var(--cardBg)",
            border: "1px solid var(--cardBorder)",
          }}
        >
          <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
            {[
              { icon: "🎯", title: "Multi-Goal Planning", desc: "Study, fitness, projects—all in one place", gradient: "from-indigo-500 to-violet-500" },
              { icon: "📅", title: "Google Calendar Sync", desc: "Auto-sync events & deadlines", gradient: "from-blue-500 to-cyan-500" },
              { icon: "💪", title: "Google Fit Integration", desc: "Real-time fitness tracking", gradient: "from-emerald-500 to-teal-500" },
              { icon: "🤖", title: "Voice Chatbot", desc: "Talk to manage your tasks", gradient: "from-amber-500 to-orange-500" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-105" style={{ background: "var(--backgroundSecondary)" }}>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: "var(--foregroundMuted)" }}>{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-6 border-t" style={{ borderColor: "var(--cardBorder)" }}>
            <p className="text-lg leading-relaxed mb-6" style={{ color: "var(--foreground)" }}>
              <span className="font-semibold">&ldquo;I want to finish ML syllabus in 4 weeks and walk 5,000 steps daily.&rdquo;</span>
              <br />
              <span className="text-sm mt-2 block" style={{ color: "var(--foregroundMuted)" }}>
                LifeLoop converts this into an adaptive schedule that evolves based on your progress.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/setup"
                className="btn-primary px-10 py-4 rounded-full text-lg text-center"
              >
                Start Planning →
              </Link>
              <Link
                href="/dashboard"
                className="btn-secondary px-10 py-4 rounded-full text-lg text-center"
              >
                View Demo Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Agent Loop Visualization */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "var(--cardBg)",
            border: "1px solid var(--cardBorder)",
          }}
        >
          <h3 className="text-sm font-bold uppercase tracking-wider mb-6" style={{ color: "var(--foregroundMuted)" }}>
            The Agentic Loop
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
            {[
              { icon: "🔍", label: "Understand", color: "from-blue-500 to-cyan-500" },
              { icon: "💡", label: "Propose", color: "from-amber-500 to-yellow-500" },
              { icon: "⚡", label: "Execute", color: "from-violet-500 to-purple-500" },
              { icon: "👁️", label: "Observe", color: "from-emerald-500 to-teal-500" },
              { icon: "✅", label: "Update", color: "from-indigo-500 to-blue-500" },
            ].map((step, idx) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center gap-2 group">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-lg`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs font-medium" style={{ color: "var(--foregroundMuted)" }}>
                    {step.label}
                  </span>
                </div>
                {idx < 4 && (
                  <div className="w-8 h-0.5 mx-2 hidden md:block" style={{ background: "var(--cardBorder)" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Features */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm pt-8 border-t"
          style={{ borderColor: "var(--cardBorder)", color: "var(--foregroundMuted)" }}
        >
          {[
            { icon: "📚", label: "Study Goals" },
            { icon: "💪", label: "Fitness Tracking" },
            { icon: "📅", label: "Calendar Sync" },
            { icon: "🤖", label: "AI Coach" },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 group cursor-pointer">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
              <span className="group-hover:text-foreground transition-colors">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

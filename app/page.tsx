"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { modules, CATEGORY_COLORS, type Module } from "@/lib/modules"
import { useCompletedModules } from "@/lib/completed-modules"
import {
  CheckCircle, Zap, Brain, BookOpen, MessageSquare,
  ChevronRight, Network, BarChart2, Clock, Filter,
} from "lucide-react"

const DURATIONS: Record<string, string> = {
  "transformer-internals":       "25 min",
  "advanced-fine-tuning":        "30 min",
  "production-rag-systems":      "35 min",
  "multi-agent-orchestration":   "30 min",
  "mcp-a2a-protocols":           "20 min",
  "knowledge-distillation":      "25 min",
  "vision-language-models":      "25 min",
  "speech-ai":                   "20 min",
  "mixture-of-experts":          "20 min",
  "synthetic-data-engineering":  "25 min",
  "ai-security-rbac":            "20 min",
  "llmops-observability":        "30 min",
}

// ─── Module Card ──────────────────────────────────────────────────────────────
function ModuleCard({
  module, isCompleted, index,
}: { module: Module; isCompleted: boolean; index: number }) {
  const color = CATEGORY_COLORS[module.category]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60 + index * 35)
    return () => clearTimeout(t)
  }, [index])

  return (
    <Link href={`/modules/${module.slug}`} className="block group" style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
    }}>
      <div className="module-card h-full flex flex-col relative overflow-hidden">

        {/* Accent top bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

        {/* Color wash on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
          style={{ background: `radial-gradient(ellipse at top left, ${color}0e 0%, transparent 65%)` }} />

        <div className="p-5 flex flex-col gap-3.5 relative z-10 flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between">
            <span className="text-2xl leading-none">{module.emoji}</span>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                  <CheckCircle size={10} /> Done
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="flex-1">
            <h3 className="font-bold mb-1.5 leading-snug"
              style={{ color: "var(--text-primary)", fontSize: "15px" }}>
              {module.title}
            </h3>
            <p className="leading-relaxed line-clamp-2"
              style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              {module.description}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2"
            style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}25` }}>
                {module.category}
              </span>
              <span className="flex items-center gap-1 text-xs"
                style={{ color: "var(--text-muted)" }}>
                <Clock size={10} />
                {DURATIONS[module.slug] ?? "20 min"}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color }}>
              Study <ChevronRight size={11} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const completedModules = useCompletedModules()
  const [heroVisible, setHeroVisible] = useState(false)
  const [activeCategory, setActiveCategory] = useState("All")

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const completionCount = completedModules.length
  const completionPct   = Math.round((completionCount / modules.length) * 100)

  // Category filter
  const categories = ["All", ...Array.from(new Set(modules.map(m => m.category)))]
  const filtered = activeCategory === "All"
    ? modules
    : modules.filter(m => m.category === activeCategory)

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-page)" }}>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "rgba(8,13,28,0.92)",
          borderColor: "var(--border-subtle)",
          backdropFilter: "blur(16px)",
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)" }}>
                <Brain size={14} className="text-white" />
              </div>
              <span className="font-bold text-gradient-brand" style={{ fontSize: "16px" }}>
                NeuralPath
              </span>
            </div>

            {/* Nav links + progress */}
            <div className="flex items-center gap-5">
              <Link href="/system-design"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white"
                style={{ color: "var(--text-secondary)" }}>
                <Network size={13} /> System Design
              </Link>

              {/* Progress pill */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                <BarChart2 size={13} style={{ color: "var(--indigo)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  {completionCount}/{modules.length}
                </span>
                <div className="w-20 h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${completionPct}%`, background: "linear-gradient(90deg,#6366f1,#22d3ee)" }} />
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {completionPct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}>

        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            linear-gradient(var(--border-subtle) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }} />

        {/* Ambient glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 65%)" }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 100% 120%, rgba(34,211,238,0.06) 0%, transparent 65%)" }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.65s ease, transform 0.65s ease",
          }}>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 text-xs font-bold tracking-widest"
            style={{
              backgroundColor: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "var(--indigo)",
            }}>
            <Zap size={11} /> AI/ML LEARNING PLATFORM
          </div>

          {/* Headline */}
          <h1 className="font-black tracking-tight mb-5 leading-none"
            style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
            <span className="text-gradient block">Master Modern AI</span>
            <span className="text-gradient-brand block">From First Principles</span>
          </h1>

          <p className="max-w-xl mx-auto leading-relaxed mb-10"
            style={{ color: "var(--text-secondary)", fontSize: "clamp(15px, 2vw, 18px)" }}>
            12 expert modules · Interactive quizzes · AI tutor per topic · System design diagrams.
            Built for engineers who want to actually understand AI — not just use it.
          </p>

          {/* Feature chips */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {[
              { icon: BookOpen,    label: "12 Deep-Dive Modules" },
              { icon: Zap,         label: "Interactive Quizzes" },
              { icon: MessageSquare, label: "AI Tutor" },
              { icon: Network,     label: "Architecture Diagrams" },
              { icon: CheckCircle, label: "Progress Tracking" },
            ].map(({ icon: Icon, label }) => (
              <div key={label}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                }}>
                <Icon size={13} style={{ color: "var(--indigo)" }} />
                {label}
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="flex justify-center gap-8 sm:gap-14 mb-10">
            {[
              { value: "12",  label: "Modules" },
              { value: "60+", label: "Quiz Questions" },
              { value: "15+", label: "Architecture Diagrams" },
              { value: "∞",   label: "AI Chats" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-black text-gradient-accent"
                  style={{ fontSize: "clamp(24px, 4vw, 36px)" }}>{value}</div>
                <div className="text-xs mt-1 font-medium" style={{ color: "var(--text-muted)" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* System Design CTA */}
          <Link href="/system-design"
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-medium transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.07))",
              border: "1px solid rgba(99,102,241,0.22)",
              color: "var(--text-primary)",
            }}>
            <Network size={16} style={{ color: "var(--indigo)" }} />
            <div className="text-left">
              <div className="font-semibold">Explore Architecture Gallery</div>
              <div className="text-xs font-normal mt-0.5" style={{ color: "var(--text-secondary)" }}>
                15+ interactive system diagrams — RAG, Agents, Transformers &amp; more
              </div>
            </div>
            <ChevronRight size={14} style={{ color: "var(--text-muted)" }}
              className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ── Tech marquee ───────────────────────────────────────────────────── */}
      <div className="border-b overflow-hidden py-2.5"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "rgba(255,255,255,0.015)" }}>
        <div className="flex gap-10 animate-marquee whitespace-nowrap">
          {[
            "LangChain","LangGraph","vLLM","Qdrant","HuggingFace TRL","PyTorch",
            "LlamaIndex","FastAPI","Whisper","ColPali","PEFT","Unsloth",
            "LangSmith","Docker","AWS EKS","NeMo Guardrails","Flash Attention",
            "LlamaGuard","Presidio","RAGAS","distilabel","DeepSeek","Ollama","SGLang","GRPO",
            "LangChain","LangGraph","vLLM","Qdrant","HuggingFace TRL","PyTorch",
          ].map((tech, i) => (
            <span key={i} className="text-xs font-mono flex-shrink-0"
              style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* ── Module Grid ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="font-bold mb-1" style={{ color: "var(--text-primary)", fontSize: "22px" }}>
              Learning Modules
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Each module: overview → flashcards → system design → quiz → AI tutor
            </p>
          </div>
          {completionCount > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold self-start sm:self-auto"
              style={{
                backgroundColor: "rgba(52,211,153,0.08)",
                border: "1px solid rgba(52,211,153,0.18)",
                color: "var(--emerald)",
              }}>
              <CheckCircle size={14} /> {completionPct}% complete
            </div>
          )}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Filter size={13} style={{ color: "var(--text-muted)", marginTop: "6px" }} />
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={
                activeCategory === cat
                  ? { backgroundColor: "var(--indigo)", color: "#fff", border: "1px solid transparent" }
                  : { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }
              }>
              {cat}
              {cat === "All" && (
                <span className="ml-1.5 opacity-60">{modules.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((module, i) => (
            <ModuleCard
              key={module.slug}
              module={module}
              isCompleted={completedModules.includes(module.slug)}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t py-10"
        style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#6366f1,#22d3ee)" }}>
              <Brain size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm text-gradient-brand">NeuralPath</span>
          </div>
          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            Interactive AI/ML learning — built for practitioners who want depth, not fluff.
          </p>
          <Link href="/system-design"
            className="text-sm flex items-center gap-1.5 transition-colors hover:text-white"
            style={{ color: "var(--text-muted)" }}>
            <Network size={13} /> Diagrams
          </Link>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { notFound } from "next/navigation"
import { use, useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import {
  getModuleBySlug, getAdjacentModules, CATEGORY_COLORS, modules, type Module,
} from "@/lib/modules"
import { QuizComponent }   from "@/components/quiz-component"
import { ChatInterface }   from "@/components/chat-interface"
import { TechStackGrid }   from "@/components/tech-stack-grid"
import { Flashcard }       from "@/components/flashcard"
import { SystemDiagram }   from "@/components/system-diagram"
import { getDiagramsForModule } from "@/lib/diagrams"
import {
  ArrowLeft, ArrowRight, CheckCircle, BookOpen, Zap,
  MessageSquare, Trophy, ChevronDown, ChevronUp,
  Layers, GraduationCap, Network, Clock, Brain,
} from "lucide-react"

// ─── Completed modules hook ────────────────────────────────────────────────────
function useCompletedModules() {
  const [completed, setCompleted] = useState<string[]>([])
  useEffect(() => {
    try { setCompleted(JSON.parse(localStorage.getItem("completedModules") || "[]")) }
    catch { setCompleted([]) }
  }, [])
  const markComplete = useCallback((slug: string) => {
    setCompleted(prev => {
      if (prev.includes(slug)) return prev
      const next = [...prev, slug]
      localStorage.setItem("completedModules", JSON.stringify(next))
      return next
    })
  }, [])
  return { completed, markComplete }
}

// ─── Section fade-in wrapper ──────────────────────────────────────────────────
function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(18px)",
      transition: `opacity 0.5s ease, transform 0.5s ease`,
    }}>{children}</div>
  )
}

// ─── Section header helper ────────────────────────────────────────────────────
function SectionHead({ icon, title, subtitle, accentColor }: {
  icon: React.ReactNode; title: string; subtitle?: string; accentColor: string
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${accentColor}18`, border: `1px solid ${accentColor}25` }}>
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <div>
        <h2 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "18px" }}>{title}</h2>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Concept accordion card ───────────────────────────────────────────────────
function ConceptCard({ title, body, index, accentColor }: {
  title: string; body: string; index: number; accentColor: string
}) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${open ? `${accentColor}28` : "var(--border-default)"}`,
        backgroundColor: open ? `${accentColor}06` : "var(--bg-card)",
      }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-3.5">
          <span className="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}18`, color: accentColor }}>
            {index + 1}
          </span>
          <span className="font-semibold" style={{ color: "var(--text-primary)", fontSize: "15px" }}>
            {title}
          </span>
        </div>
        {open
          ? <ChevronUp  size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
          : <ChevronDown size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div className="px-5 pb-5" style={{ borderTop: `1px solid ${accentColor}14` }}>
          <p className="pt-4 leading-relaxed" style={{
            color: "var(--text-body)", fontSize: "15px", lineHeight: "1.8",
          }}>{body}</p>
        </div>
      )}
    </div>
  )
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────
type Tab = "learn" | "quiz" | "chat"

function TabBar({ activeTab, onTabChange, quizScore, totalQuestions, accentColor }: {
  activeTab: Tab
  onTabChange: (t: Tab) => void
  quizScore: number | null
  totalQuestions: number
  accentColor: string
}) {
  const tabs = [
    { id: "learn" as Tab, label: "Learn",    icon: <BookOpen    size={14} /> },
    { id: "quiz"  as Tab, label: "Quiz",     icon: <Zap         size={14} /> },
    { id: "chat"  as Tab, label: "AI Tutor", icon: <MessageSquare size={14} /> },
  ]
  return (
    <div className="flex border-b mb-10"
      style={{ borderColor: "var(--border-subtle)" }}>
      {tabs.map(tab => {
        const active = activeTab === tab.id
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className="relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors"
            style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
            <span style={{ color: active ? accentColor : "var(--text-muted)" }}>{tab.icon}</span>
            {tab.label}
            {tab.id === "quiz" && quizScore !== null && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: "rgba(52,211,153,0.12)", color: "var(--emerald)" }}>
                {quizScore}/{totalQuestions}
              </span>
            )}
            {/* active underline */}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ backgroundColor: accentColor }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Learn tab ────────────────────────────────────────────────────────────────
function LearnTab({ module, accentColor, onStartQuiz }: {
  module: Module; accentColor: string; onStartQuiz: () => void
}) {
  const flashcards = module.keyConcepts.map(c => ({
    front: c.title, back: c.body, hint: "Click to reveal explanation",
  }))
  const diagrams = getDiagramsForModule(module.slug)

  return (
    <div className="space-y-14">

      {/* ── Overview ─── */}
      <FadeSection delay={50}>
        <section>
          <SectionHead icon={<BookOpen size={15} />} title="Overview" accentColor={accentColor} />
          <div className="rounded-2xl p-7"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              color: "var(--text-body)",
              fontSize: "16px",
              lineHeight: "1.9",
            }}>
            {module.overview}
          </div>
        </section>
      </FadeSection>

      {/* ── Flashcards ─── */}
      <FadeSection delay={120}>
        <section>
          <SectionHead
            icon={<Layers size={15} />} title="Concept Flashcards"
            subtitle={`${flashcards.length} cards — click to flip and test recall`}
            accentColor={accentColor}
          />
          <Flashcard cards={flashcards} accentColor={accentColor} />
        </section>
      </FadeSection>

      {/* ── System Design ─── */}
      {diagrams.length > 0 && (
        <FadeSection delay={190}>
          <section>
            <SectionHead
              icon={<Network size={15} />} title="System Architecture"
              subtitle={`${diagrams.length} interactive diagram${diagrams.length > 1 ? "s" : ""} — drag nodes · scroll to zoom · click for details`}
              accentColor={accentColor}
            />
            <div className="rounded-2xl p-5"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
              <SystemDiagram diagrams={diagrams} />
            </div>
          </section>
        </FadeSection>
      )}

      {/* ── Key Concepts ─── */}
      <FadeSection delay={260}>
        <section>
          <SectionHead
            icon={<GraduationCap size={15} />} title="Key Concepts"
            subtitle={`${module.keyConcepts.length} concepts — click to expand`}
            accentColor={accentColor}
          />
          <div className="space-y-2.5">
            {module.keyConcepts.map((c, i) => (
              <ConceptCard key={c.title} title={c.title} body={c.body}
                index={i} accentColor={accentColor} />
            ))}
          </div>
        </section>
      </FadeSection>

      {/* ── Tech Stack ─── */}
      <FadeSection delay={320}>
        <section>
          <SectionHead icon={<Brain size={15} />} title="Tech Stack" accentColor={accentColor} />
          <TechStackGrid tools={module.techStack} />
        </section>
      </FadeSection>

      {/* ── Quiz CTA ─── */}
      <FadeSection delay={380}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-7 rounded-2xl"
          style={{
            background: `linear-gradient(135deg, ${accentColor}0c, rgba(99,102,241,0.06))`,
            border: `1px solid ${accentColor}20`,
          }}>
          <div>
            <div className="font-bold mb-1.5" style={{ color: "var(--text-primary)", fontSize: "17px" }}>
              Ready to test yourself?
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              {module.quizQuestions.length} questions · score ≥ 60% to mark complete
            </div>
          </div>
          <button onClick={onStartQuiz}
            className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold transition-all hover:opacity-90 flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #6366f1)`,
              color: "white", fontSize: "14px",
              boxShadow: `0 4px 20px ${accentColor}30`,
            }}>
            <Zap size={14} /> Take Quiz
          </button>
        </div>
      </FadeSection>
    </div>
  )
}

// ─── Main module page ─────────────────────────────────────────────────────────
export default function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug }   = use(params)
  const module     = getModuleBySlug(slug)
  if (!module) notFound()

  const { prev, next } = getAdjacentModules(slug)
  const { completed, markComplete } = useCompletedModules()
  const isCompleted  = completed.includes(slug)
  const [activeTab, setActiveTab] = useState<Tab>("learn")
  const [quizScore, setQuizScore] = useState<number | null>(null)

  const accentColor = CATEGORY_COLORS[module.category]
  const moduleIndex = modules.findIndex(m => m.slug === slug)

  const handleQuizComplete = useCallback((score: number) => {
    setQuizScore(score)
    if (score >= Math.ceil(module.quizQuestions.length * 0.6)) markComplete(slug)
  }, [slug, markComplete, module.quizQuestions.length])

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-page)" }}>

      {/* ── Navbar ─── */}
      <nav className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "rgba(8,13,28,0.94)",
          borderColor: "var(--border-subtle)",
          backdropFilter: "blur(16px)",
        }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-white"
            style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft size={14} /> All Modules
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:block" style={{ color: "var(--text-muted)" }}>
              {moduleIndex + 1} / {modules.length}
            </span>
            {isCompleted && (
              <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "rgba(52,211,153,0.1)",
                  color: "var(--emerald)",
                  border: "1px solid rgba(52,211,153,0.2)",
                }}>
                <CheckCircle size={11} /> Completed
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Module header ─── */}
      <header className="border-b"
        style={{
          borderColor: "var(--border-subtle)",
          background: `linear-gradient(to bottom, ${accentColor}0a, transparent)`,
        }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start gap-5">
            {/* Emoji icon */}
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                backgroundColor: `${accentColor}14`,
                border: `1px solid ${accentColor}22`,
                boxShadow: `0 0 30px ${accentColor}15`,
              }}>
              {module.emoji}
            </div>

            <div className="flex-1 min-w-0">
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md tracking-wider uppercase"
                  style={{ backgroundColor: `${accentColor}16`, color: accentColor, border: `1px solid ${accentColor}28` }}>
                  {module.category}
                </span>
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  <Clock size={10} /> ~{Math.ceil(module.keyConcepts.length * 2 + module.quizQuestions.length * 0.5)} min
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {module.keyConcepts.length} concepts · {module.quizQuestions.length} quiz questions
                </span>
                {isCompleted && (
                  <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--emerald)" }}>
                    <Trophy size={11} /> Passed
                  </div>
                )}
              </div>

              <h1 className="font-black mb-2.5 leading-tight"
                style={{ color: "var(--text-primary)", fontSize: "clamp(22px,4vw,34px)" }}>
                {module.title}
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.65" }}>
                {module.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ─── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          quizScore={quizScore}
          totalQuestions={module.quizQuestions.length}
          accentColor={accentColor}
        />

        {/* Learn */}
        {activeTab === "learn" && (
          <LearnTab module={module} accentColor={accentColor} onStartQuiz={() => handleTabChange("quiz")} />
        )}

        {/* Quiz */}
        {activeTab === "quiz" && (
          <FadeSection>
            <div className="max-w-2xl">
              <div className="mb-8">
                <h2 className="font-bold mb-2" style={{ color: "var(--text-primary)", fontSize: "22px" }}>
                  Knowledge Check
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
                  {module.quizQuestions.length} questions · score ≥ 60% to complete this module
                </p>
              </div>
              <QuizComponent key={slug} questions={module.quizQuestions}
                moduleSlug={slug} onComplete={handleQuizComplete} />
            </div>
          </FadeSection>
        )}

        {/* Chat */}
        {activeTab === "chat" && (
          <FadeSection>
            <div>
              <div className="mb-6">
                <h2 className="font-bold mb-2" style={{ color: "var(--text-primary)", fontSize: "22px" }}>
                  AI Tutor
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
                  Ask anything about <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{module.title}</span>.
                  The model is primed as an expert on this specific topic.
                </p>
              </div>
              <ChatInterface moduleSlug={module.slug} moduleTitle={module.title} />
            </div>
          </FadeSection>
        )}

        {/* ── Prev / Next nav ─── */}
        <div className="flex items-center justify-between mt-16 pt-8 border-t"
          style={{ borderColor: "var(--border-subtle)" }}>
          {prev ? (
            <Link href={`/modules/${prev.slug}`}
              className="flex items-center gap-3 group max-w-[45%]">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors group-hover:bg-white/8"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                <ArrowLeft size={14} style={{ color: "var(--text-secondary)" }} />
              </div>
              <div className="hidden sm:block">
                <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Previous</div>
                <div className="font-semibold" style={{ color: "var(--text-primary)", fontSize: "14px" }}>
                  {prev.title}
                </div>
              </div>
            </Link>
          ) : <div />}

          {next ? (
            <Link href={`/modules/${next.slug}`}
              className="flex items-center gap-3 group max-w-[45%] text-right">
              <div className="hidden sm:block">
                <div className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>Next</div>
                <div className="font-semibold" style={{ color: "var(--text-primary)", fontSize: "14px" }}>
                  {next.title}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors group-hover:bg-white/8"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                <ArrowRight size={14} style={{ color: "var(--text-secondary)" }} />
              </div>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 text-sm transition-colors hover:text-white"
              style={{ color: "var(--text-secondary)" }}>
              All Modules <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}

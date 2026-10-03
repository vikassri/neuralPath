"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, RotateCcw, Lightbulb, BookOpen } from "lucide-react"

interface FlashcardProps {
  cards: { front: string; back: string; hint?: string }[]
  accentColor?: string
}

export function Flashcard({ cards, accentColor = "#6366f1" }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [direction, setDirection] = useState<"next" | "prev" | null>(null)
  const [animating, setAnimating] = useState(false)
  const [mastered, setMastered] = useState<Set<number>>(new Set())

  const card = cards[currentIndex]
  const isMastered = mastered.has(currentIndex)

  const navigate = (dir: "next" | "prev") => {
    if (animating) return
    const next = dir === "next" ? currentIndex + 1 : currentIndex - 1
    if (next < 0 || next >= cards.length) return
    setAnimating(true)
    setDirection(dir)
    setFlipped(false)
    setTimeout(() => {
      setCurrentIndex(next)
      setDirection(null)
      setAnimating(false)
    }, 280)
  }

  const toggleMastered = () => {
    setMastered(prev => {
      const next = new Set(prev)
      next.has(currentIndex) ? next.delete(currentIndex) : next.add(currentIndex)
      return next
    })
  }

  return (
    <div className="select-none">

      {/* ── Progress bar + count ──────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-5">
        <span className="text-sm font-medium tabular-nums" style={{ color: "var(--text-secondary)", minWidth: "6ch" }}>
          {currentIndex + 1} / {cards.length}
        </span>
        {/* Segmented progress */}
        <div className="flex-1 flex items-center gap-1">
          {cards.map((_, i) => (
            <button key={i} onClick={() => { if (!animating) { setFlipped(false); setCurrentIndex(i) } }}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  mastered.has(i)   ? accentColor :
                  i === currentIndex ? `${accentColor}90` :
                  i < currentIndex   ? "rgba(255,255,255,0.18)" :
                                       "rgba(255,255,255,0.06)",
                transform: i === currentIndex ? "scaleY(1.4)" : "scaleY(1)",
              }} />
          ))}
        </div>
        <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--emerald)" }}>
          {mastered.size}/{cards.length} mastered
        </span>
      </div>

      {/* ── Card ─────────────────────────────────────────────────── */}
      <div className="relative cursor-pointer" style={{ perspective: "1400px", height: "260px" }}
        onClick={() => !animating && setFlipped(f => !f)}>
        <div style={{
          position: "absolute", inset: 0,
          transformStyle: "preserve-3d",
          transition: "transform 0.5s cubic-bezier(0.35,0,0.15,1), opacity 0.28s ease",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          opacity: direction ? 0 : 1,
        }}>

          {/* Front — Question side */}
          <div className="absolute inset-0 rounded-2xl flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              backgroundColor: "var(--bg-card)",
              border: `1px solid ${isMastered ? `${accentColor}50` : "var(--border-default)"}`,
              boxShadow: isMastered
                ? `0 0 0 1px ${accentColor}30, 0 8px 32px rgba(0,0,0,0.25)`
                : "0 8px 32px rgba(0,0,0,0.2)",
              transition: "border-color 0.3s, box-shadow 0.3s",
            }}>
            {/* Top bar */}
            <div className="px-6 pt-5 pb-3 border-b flex items-center justify-between"
              style={{ borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}18` }}>
                  <BookOpen size={12} style={{ color: accentColor }} />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: accentColor }}>Concept</span>
              </div>
              {isMastered && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${accentColor}18`, color: accentColor }}>
                  ✓ Mastered
                </span>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-4 text-center">
              <p className="font-bold leading-snug mb-3"
                style={{ color: "var(--text-primary)", fontSize: "18px" }}>
                {card.front}
              </p>
              {card.hint && (
                <div className="flex items-center gap-1.5 text-xs mt-1"
                  style={{ color: "var(--text-muted)" }}>
                  <Lightbulb size={11} style={{ color: "var(--amber)" }} />
                  {card.hint}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t flex items-center justify-center gap-2"
              style={{ borderColor: "var(--border-subtle)" }}>
              <RotateCcw size={12} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Click to reveal answer</span>
            </div>
          </div>

          {/* Back — Answer side */}
          <div className="absolute inset-0 rounded-2xl flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              backgroundColor: `${accentColor}0c`,
              border: `1px solid ${accentColor}30`,
              boxShadow: `0 8px 40px ${accentColor}14`,
            }}>
            {/* Top bar */}
            <div className="px-6 pt-5 pb-3 border-b flex items-center justify-between"
              style={{ borderColor: `${accentColor}18` }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}25` }}>
                  <Lightbulb size={12} style={{ color: accentColor }} />
                </div>
                <span className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: accentColor }}>Explanation</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-5">
              <p className="leading-relaxed" style={{ color: "var(--text-body)", fontSize: "15px", lineHeight: "1.85" }}>
                {card.back}
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t flex items-center justify-center gap-2"
              style={{ borderColor: `${accentColor}18` }}>
              <RotateCcw size={12} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Click to flip back</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-5 gap-3">
        <button onClick={() => navigate("prev")} disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-25"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
          <ChevronLeft size={14} /> Prev
        </button>

        <div className="flex items-center gap-2">
          {/* Flip */}
          <button onClick={() => !animating && setFlipped(f => !f)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ backgroundColor: `${accentColor}14`, border: `1px solid ${accentColor}28`, color: accentColor }}>
            {flipped ? "See Concept" : "See Answer"}
          </button>
          {/* Mark mastered */}
          <button onClick={toggleMastered}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={
              isMastered
                ? { backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40`, color: accentColor }
                : { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-muted)" }
            }>
            {isMastered ? "✓ Mastered" : "Mark Mastered"}
          </button>
        </div>

        <button onClick={() => navigate("next")} disabled={currentIndex === cards.length - 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-25"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

"use client"

import { useState, useCallback, useEffect } from "react"
import { CheckCircle2, XCircle, Trophy, RotateCcw, ChevronRight } from "lucide-react"
import type { QuizQuestion } from "@/lib/modules"

interface QuizComponentProps {
  questions: QuizQuestion[]
  moduleSlug: string
  onComplete: (score: number) => void
}

type AnswerState = { selectedIndex: number; isCorrect: boolean }

export function QuizComponent({ questions, onComplete }: QuizComponentProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({})
  const [showResult, setShowResult] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [slideIn, setSlideIn] = useState(true)

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentQuestion?.id]
  const hasAnswered = Boolean(currentAnswer)

  // Animate in on question change
  useEffect(() => {
    setSlideIn(false)
    const t = setTimeout(() => setSlideIn(true), 30)
    return () => clearTimeout(t)
  }, [currentIndex])

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (hasAnswered) return
      const isCorrect = optionIndex === currentQuestion.correctIndex
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: { selectedIndex: optionIndex, isCorrect },
      }))
      setShowResult(true)
    },
    [currentQuestion, hasAnswered]
  )

  const handleNext = useCallback(() => {
    setShowResult(false)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      const allAnswers = {
        ...answers,
        [currentQuestion.id]: answers[currentQuestion.id],
      }
      const totalCorrect = Object.values(allAnswers).filter((a) => a.isCorrect).length
      setQuizComplete(true)
      onComplete(totalCorrect)
    }
  }, [currentIndex, questions.length, answers, currentQuestion, onComplete])

  const handleRestart = useCallback(() => {
    setCurrentIndex(0)
    setAnswers({})
    setShowResult(false)
    setQuizComplete(false)
  }, [])

  /* ── Results screen ── */
  if (quizComplete) {
    const correctCount = Object.values(answers).filter((a) => a.isCorrect).length
    const total = questions.length
    const pct = Math.round((correctCount / total) * 100)
    const grade =
      pct >= 80
        ? { label: "Excellent! 🎉", color: "var(--emerald)" }
        : pct >= 60
        ? { label: "Good Job! 👍", color: "var(--blue)" }
        : { label: "Keep Practicing 💪", color: "var(--amber)" }

    return (
      <div className="text-center py-12 px-4">
        {/* Animated score ring */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-subtle)" strokeWidth="7" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={grade.color} strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{pct}%</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>Score</div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-2" style={{ color: grade.color }}>{grade.label}</h3>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          {correctCount} of {total} correct
        </p>

        {/* Per-question breakdown */}
        <div className="text-left space-y-2 max-w-xl mx-auto mb-8">
          {questions.map((q, i) => {
            const ans = answers[q.id]
            return (
              <div key={q.id} className="flex items-start gap-3 p-4 rounded-xl"
                style={{
                  backgroundColor: ans?.isCorrect ? "rgba(52,211,153,0.06)" : "rgba(251,113,133,0.06)",
                  border: `1px solid ${ans?.isCorrect ? "rgba(52,211,153,0.18)" : "rgba(251,113,133,0.18)"}`,
                }}>
                {ans?.isCorrect
                  ? <CheckCircle2 size={16} style={{ color: "var(--emerald)", flexShrink: 0, marginTop: 2 }} />
                  : <XCircle     size={16} style={{ color: "var(--rose)",    flexShrink: 0, marginTop: 2 }} />
                }
                <div>
                  <span style={{ color: "var(--text-body)", fontSize: "14px" }}>
                    <strong style={{ color: "var(--text-primary)" }}>Q{i + 1}:</strong>{" "}
                    {q.question.slice(0, 80)}{q.question.length > 80 ? "…" : ""}
                  </span>
                  {!ans?.isCorrect && (
                    <div className="mt-1 text-xs font-medium" style={{ color: "var(--emerald)" }}>
                      ✓ {q.options[q.correctIndex]}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={handleRestart}
          className="flex items-center gap-2 mx-auto px-7 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-strong)", color: "var(--text-primary)", fontSize: "15px" }}>
          <RotateCcw size={14} /> Retake Quiz
        </button>
      </div>
    )
  }

  /* ── Question screen ── */
  return (
    <div style={{
      opacity: slideIn ? 1 : 0,
      transform: slideIn ? "translateX(0)" : "translateX(16px)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
    }}>
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium" style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          {Object.values(answers).filter(a => a.isCorrect).length} correct so far
        </span>
      </div>
      <div className="h-1 rounded-full mb-7 overflow-hidden" style={{ backgroundColor: "var(--border-subtle)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(currentIndex / questions.length) * 100}%`,
            background: "linear-gradient(90deg, var(--indigo), var(--cyan))",
          }} />
      </div>

      {/* Question text */}
      <div className="p-6 rounded-2xl mb-5"
        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
        <p className="font-semibold leading-relaxed" style={{ color: "var(--text-primary)", fontSize: "17px" }}>
          {currentQuestion.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5 mb-6">
        {currentQuestion.options.map((option, idx) => {
          const isCorrect = idx === currentQuestion.correctIndex
          const isSelected = idx === currentAnswer?.selectedIndex
          const isWrong = isSelected && !currentAnswer?.isCorrect

          let borderColor = "var(--border-default)"
          let bgColor = "var(--bg-card)"
          let textColor = "var(--text-body)"

          if (hasAnswered) {
            if (isCorrect)        { borderColor = "var(--emerald)"; bgColor = "rgba(52,211,153,0.07)"; textColor = "#86efac" }
            else if (isWrong)     { borderColor = "var(--rose)";    bgColor = "rgba(251,113,133,0.07)"; textColor = "#fca5a5" }
            else                  { textColor = "var(--text-muted)" }
          }

          return (
            <button key={idx} onClick={() => handleSelectOption(idx)} disabled={hasAnswered}
              className="w-full text-left px-4 py-3.5 rounded-xl border flex items-start gap-3.5 transition-all duration-150"
              style={{ borderColor, backgroundColor: bgColor, cursor: hasAnswered ? "default" : "pointer" }}
              onMouseEnter={e => { if (!hasAnswered) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)" }}
              onMouseLeave={e => { if (!hasAnswered) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)" }}>
              {/* Letter badge */}
              <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold mt-0.5"
                style={{
                  backgroundColor:
                    hasAnswered && isCorrect ? "var(--emerald)" :
                    hasAnswered && isWrong   ? "var(--rose)" :
                    "var(--bg-elevated)",
                  color: hasAnswered ? "white" : "var(--text-muted)",
                  fontSize: "11px",
                }}>
                {hasAnswered && isCorrect ? <CheckCircle2 size={12} /> :
                 hasAnswered && isWrong   ? <XCircle      size={12} /> :
                 String.fromCharCode(65 + idx)}
              </span>
              <span style={{ color: textColor, fontSize: "15px", lineHeight: "1.6" }}>{option}</span>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="p-5 rounded-2xl mb-6"
          style={{
            backgroundColor: currentAnswer?.isCorrect ? "rgba(52,211,153,0.06)" : "rgba(251,113,133,0.06)",
            border: `1px solid ${currentAnswer?.isCorrect ? "rgba(52,211,153,0.2)" : "rgba(251,113,133,0.2)"}`,
          }}>
          <div className="font-bold mb-2" style={{
            color: currentAnswer?.isCorrect ? "var(--emerald)" : "var(--rose)", fontSize: "14px",
          }}>
            {currentAnswer?.isCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </div>
          <div style={{ color: "var(--text-body)", fontSize: "15px", lineHeight: "1.75" }}>
            {currentQuestion.explanation}
          </div>
        </div>
      )}

      {/* Next button */}
      {hasAnswered && (
        <button onClick={handleNext}
          className="flex items-center gap-2 px-7 py-3 rounded-xl font-bold transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, var(--indigo), var(--cyan))", color: "white", fontSize: "15px" }}>
          {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  )
}

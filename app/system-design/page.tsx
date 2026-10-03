"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { SystemDiagram } from "@/components/system-diagram"
import { allModuleDiagrams, type Diagram } from "@/lib/diagrams"
import { modules, CATEGORY_COLORS } from "@/lib/modules"
import { ArrowLeft, Network, Search, X } from "lucide-react"

// ─── flat list of all diagrams with module context ───────────────────────────
interface FlatDiagram {
  diagram: Diagram
  moduleSlug: string
  moduleName: string
  moduleCategory: string
  accentColor: string
}

const ALL_FLAT: FlatDiagram[] = allModuleDiagrams.flatMap((m) => {
  const mod = modules.find((mo) => mo.slug === m.moduleSlug)
  return m.diagrams.map((d) => ({
    diagram: d,
    moduleSlug: m.moduleSlug,
    moduleName: mod?.title ?? m.moduleSlug,
    moduleCategory: mod?.category ?? "Unknown",
    accentColor: mod ? CATEGORY_COLORS[mod.category as keyof typeof CATEGORY_COLORS] ?? "#6b7280" : "#6b7280",
  }))
})

// all unique categories
const ALL_CATEGORIES = ["All", ...Array.from(new Set(ALL_FLAT.map((f) => f.moduleCategory)))]

export default function SystemDesignPage() {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [activeFlat, setActiveFlat] = useState<FlatDiagram | null>(null)
  const [visible, setVisible] = useState(false)
  const fullViewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Scroll the full-width expanded view into view whenever it opens
  useEffect(() => {
    if (activeFlat && fullViewRef.current) {
      setTimeout(() => {
        fullViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
    }
  }, [activeFlat])

  const filtered = ALL_FLAT.filter((f) => {
    const matchesCat = category === "All" || f.moduleCategory === category
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      f.diagram.title.toLowerCase().includes(q) ||
      f.diagram.description.toLowerCase().includes(q) ||
      f.moduleName.toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-page)", color: "var(--text-body)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b px-6 py-4 flex items-center gap-4"
        style={{
          backgroundColor: "rgba(8,13,28,0.94)",
          borderColor: "var(--border-subtle)",
          backdropFilter: "blur(16px)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-white"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft size={15} />
          Home
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <Network size={16} style={{ color: "var(--indigo)" }} />
          <span className="font-bold" style={{ color: "var(--text-primary)", fontSize: "16px" }}>Architecture Gallery</span>
        </div>
        <span
          className="ml-auto text-xs px-3 py-1.5 rounded-full font-semibold"
          style={{
            backgroundColor: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "var(--indigo)",
          }}
        >
          {ALL_FLAT.length} diagrams
        </span>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero */}
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }} className="mb-12">
          <h1 className="font-black mb-4 leading-tight text-gradient-brand"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            AI System Architecture Gallery
          </h1>
          <p className="text-base max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Interactive SVG diagrams for all major AI systems — RAG pipelines, agent patterns, training architectures, and more.
            Drag nodes · scroll to zoom · click for flow details.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-wrap gap-4 mb-10" style={{
          opacity: visible ? 1 : 0, transition: "opacity 0.5s ease 0.1s",
        }}>
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search diagrams…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm outline-none"
              style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
                <X size={13} style={{ color: "var(--text-muted)" }} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={category === cat
                  ? { backgroundColor: "var(--indigo)", color: "#fff", border: "1px solid transparent" }
                  : { backgroundColor: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }
                }>{cat}</button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {(search || category !== "All") && (
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {filtered.length} diagram{filtered.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Active full-screen diagram */}
        {activeFlat && (
          <div ref={fullViewRef} className="mb-12 rounded-2xl p-7 scroll-mt-24"
            style={{
              backgroundColor: "var(--bg-card)",
              border: `1px solid ${activeFlat.accentColor}30`,
              boxShadow: `0 0 50px ${activeFlat.accentColor}0e`,
            }}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold"
                    style={{ backgroundColor: `${activeFlat.accentColor}14`, border: `1px solid ${activeFlat.accentColor}28`, color: activeFlat.accentColor }}>
                    {activeFlat.moduleCategory}
                  </span>
                  <Link href={`/modules/${activeFlat.moduleSlug}`}
                    className="text-xs transition-colors hover:text-white"
                    style={{ color: "var(--text-muted)" }}>
                    → {activeFlat.moduleName}
                  </Link>
                </div>
                <h2 className="font-bold" style={{ color: "var(--text-primary)", fontSize: "20px" }}>
                  {activeFlat.diagram.title}
                </h2>
              </div>
              <button onClick={() => setActiveFlat(null)}
                className="p-2 rounded-xl transition-colors hover:bg-white/5"
                style={{ color: "var(--text-muted)", border: "1px solid var(--border-default)" }}>
                <X size={16} />
              </button>
            </div>
            <SystemDiagram diagrams={[activeFlat.diagram]} />
          </div>
        )}

        {/* Diagram grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24" style={{ color: "var(--text-muted)" }}>
            <Network size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No diagrams match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((flat, i) => (
              <DiagramCard
                key={`${flat.moduleSlug}-${flat.diagram.id}`}
                flat={flat}
                index={i}
                isActive={
                  activeFlat?.moduleSlug === flat.moduleSlug &&
                  activeFlat?.diagram.id === flat.diagram.id
                }
                onOpen={() =>
                  setActiveFlat((prev) =>
                    prev?.diagram.id === flat.diagram.id ? null : flat
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

// ─── Card component ───────────────────────────────────────────────────────────
function DiagramCard({
  flat,
  index,
  isActive,
  onOpen,
}: {
  flat: FlatDiagram
  index: number
  isActive: boolean
  onOpen: () => void
}) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100 + index * 50)
    return () => clearTimeout(t)
  }, [index])

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "opacity 0.45s ease, transform 0.45s ease, border-color 0.3s",
      backgroundColor: "var(--bg-card)",
      border: isActive ? `1px solid ${flat.accentColor}45` : "1px solid var(--border-default)",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: isActive ? `0 0 30px ${flat.accentColor}12` : undefined,
    }}>
      {/* Card header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-md font-semibold"
                style={{ backgroundColor: `${flat.accentColor}14`, border: `1px solid ${flat.accentColor}28`, color: flat.accentColor }}>
                {flat.moduleCategory}
              </span>
              <Link href={`/modules/${flat.moduleSlug}`}
                className="text-xs transition-colors hover:text-white"
                style={{ color: "var(--text-muted)" }}
                onClick={e => e.stopPropagation()}>
                → {flat.moduleName}
              </Link>
            </div>
            <h3 className="font-bold leading-snug mb-1" style={{ color: "var(--text-primary)", fontSize: "15px" }}>
              {flat.diagram.title}
            </h3>
            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--text-secondary)" }}>
              {flat.diagram.description}
            </p>
          </div>
        </div>

        <div className="flex gap-2.5 mt-4">
          <button onClick={() => setExpanded(v => !v)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={expanded
              ? { backgroundColor: `${flat.accentColor}14`, border: `1px solid ${flat.accentColor}28`, color: flat.accentColor }
              : { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
            {expanded ? "Collapse" : "View Diagram"}
          </button>
          <button onClick={onOpen}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={isActive
              ? { backgroundColor: `${flat.accentColor}18`, border: `1px solid ${flat.accentColor}38`, color: flat.accentColor }
              : { backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
            title={isActive ? "Close full-width view" : "Open full-width view"}>
            {isActive ? "⊠ Close" : "⤢ Maximize"}
          </button>
        </div>
      </div>

      {/* Expanded inline diagram */}
      {expanded && (
        <div className="px-5 pb-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="mt-4">
            <SystemDiagram diagrams={[flat.diagram]} />
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="px-5 py-2.5 flex items-center gap-3 text-xs"
        style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
        <span>{flat.diagram.nodes.length} nodes</span>
        <span>·</span>
        <span>{flat.diagram.edges.length} edges</span>
        {flat.diagram.legend && <><span>·</span><span>{flat.diagram.legend.length} legend items</span></>}
      </div>
    </div>
  )
}

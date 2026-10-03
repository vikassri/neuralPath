"use client"

import { useState, useRef, useId } from "react"
import type { Diagram, DiagramNode, DiagramEdge } from "@/lib/diagrams"

// ─────────────────────────────────────────────────────────────────────────────
// Constants & auto-sizing
// ─────────────────────────────────────────────────────────────────────────────
const CHAR_W = 7.6
const LINE_H = 16
const PAD_X  = 30
const PAD_Y  = 20
const MIN_W  = 110
const MIN_H  = 44
const VB_PAD = 50   // viewBox padding around all content

function resolveSize(node: DiagramNode): { w: number; h: number } {
  const lines  = node.label.split("\n")
  const maxLen = Math.max(...lines.map(l => l.length))
  return {
    w: Math.max(node.w ?? MIN_W, maxLen * CHAR_W + PAD_X),
    h: Math.max(node.h ?? MIN_H, lines.length * LINE_H + PAD_Y),
  }
}

function getNodeBox(node: DiagramNode, pos: { x: number; y: number }) {
  const { w, h } = resolveSize(node)
  return { x: pos.x - w / 2, y: pos.y - h / 2, w, h }
}

// ─────────────────────────────────────────────────────────────────────────────
// ViewBox computed from current positions
// ─────────────────────────────────────────────────────────────────────────────
function computeViewBox(
  nodes: DiagramNode[],
  positions: Record<string, { x: number; y: number }>
) {
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  nodes.forEach(n => {
    const { w, h } = resolveSize(n)
    const p = positions[n.id] ?? { x: n.x, y: n.y }
    minX = Math.min(minX, p.x - w / 2)
    maxX = Math.max(maxX, p.x + w / 2)
    minY = Math.min(minY, p.y - h / 2)
    maxY = Math.max(maxY, p.y + h / 2)
  })
  return { vx: minX - VB_PAD, vy: minY - VB_PAD, vw: maxX - minX + VB_PAD * 2, vh: maxY - minY + VB_PAD * 2 }
}

// ─────────────────────────────────────────────────────────────────────────────
// Edge geometry — uses current positions
// ─────────────────────────────────────────────────────────────────────────────
function edgePoint(node: DiagramNode, pos: { x: number; y: number }, toward: { x: number; y: number }) {
  const { w, h } = resolveSize(node)
  const dx = toward.x - pos.x, dy = toward.y - pos.y
  if (!dx && !dy) return pos
  const absDx = Math.abs(dx), absDy = Math.abs(dy)
  if (absDx / (w / 2) > absDy / (h / 2)) {
    return { x: pos.x + Math.sign(dx) * w / 2, y: pos.y + (dy / absDx) * (w / 2) }
  }
  return { x: pos.x + (dx / absDy) * (h / 2), y: pos.y + Math.sign(dy) * h / 2 }
}

function buildPath(
  fromNode: DiagramNode, fromPos: { x: number; y: number },
  toNode:   DiagramNode, toPos:   { x: number; y: number }
) {
  const p1 = edgePoint(fromNode, fromPos, toPos)
  const p2 = edgePoint(toNode, toPos, fromPos)
  const dx = p2.x - p1.x, dy = p2.y - p1.y
  return {
    d: `M ${p1.x} ${p1.y} C ${p1.x + dx*0.35} ${p1.y + dy*0.35}, ${p1.x + dx*0.65} ${p1.y + dy*0.65}, ${p2.x} ${p2.y}`,
    mx: (p1.x + p2.x) / 2,
    my: (p1.y + p2.y) / 2,
    len: Math.sqrt(dx * dx + dy * dy),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated edge component
// ─────────────────────────────────────────────────────────────────────────────
const ALL_COLORS = ["#6b7280","#3b82f6","#8b5cf6","#10b981","#06b6d4","#f59e0b","#ef4444","#ec4899","#6366f1","#84cc16","#f97316","#e2e8f0"]
const SPEEDS = [1.4, 1.7, 1.2, 1.9, 1.5, 1.3, 1.8, 1.6, 2.0, 1.25, 1.55, 1.85]
const DELAYS = [0, 0.7, 1.3, 0.4, 1.0, 1.6, 0.2, 0.9, 1.5, 0.6, 1.2, 0.3]

function FlowEdge({
  edge, fromNode, fromPos, toNode, toPos,
  pathId, markerId, isHighlighted, speed, delay,
}: {
  edge: DiagramEdge
  fromNode: DiagramNode; fromPos: { x: number; y: number }
  toNode: DiagramNode;   toPos:   { x: number; y: number }
  pathId: string; markerId: string
  isHighlighted: boolean; speed: number; delay: number
}) {
  const color = edge.color ?? "#6b7280"
  const { d, mx, my, len } = buildPath(fromNode, fromPos, toNode, toPos)
  const revPath = buildPath(toNode, toPos, fromNode, fromPos)
  const s = isHighlighted ? speed * 0.6 : speed
  const DASH = 10, GAP = 26, TOTAL = DASH + GAP

  return (
    <g>
      <path id={pathId} d={d} fill="none" stroke="none" />
      {/* base rail */}
      <path d={d} fill="none" stroke={color}
        strokeWidth={1.2} strokeOpacity={isHighlighted ? 0.5 : 0.2}
        strokeDasharray={edge.dashed ? "5 5" : undefined}
        markerEnd={`url(#${markerId})`}
        style={{ transition: "stroke-opacity 0.2s" }}
      />
      {/* flowing dash */}
      <path d={d} fill="none" stroke={color}
        strokeWidth={isHighlighted ? 2.2 : 1.6}
        strokeDasharray={`${DASH} ${GAP}`} strokeLinecap="round"
        strokeOpacity={isHighlighted ? 0.95 : 0.45}
        style={{ transition: "stroke-opacity 0.2s, stroke-width 0.2s" }}
      >
        <animate attributeName="stroke-dashoffset" from="0" to={`-${TOTAL}`}
          dur={`${s}s`} repeatCount="indefinite" />
      </path>
      {/* bidirectional */}
      {edge.bidirectional && (
        <>
          <path id={`${pathId}r`} d={revPath.d} fill="none" stroke="none" />
          <path d={revPath.d} fill="none" stroke={color}
            strokeWidth={0.9} strokeOpacity={isHighlighted ? 0.38 : 0.15}
            markerEnd={`url(#${markerId})`} />
          <path d={revPath.d} fill="none" stroke={color}
            strokeWidth={isHighlighted ? 1.8 : 1.3}
            strokeDasharray={`${DASH} ${GAP}`} strokeLinecap="round"
            strokeOpacity={isHighlighted ? 0.7 : 0.32}
          >
            <animate attributeName="stroke-dashoffset" from="0" to={`-${TOTAL}`}
              dur={`${s * 1.4}s`} repeatCount="indefinite" />
          </path>
        </>
      )}
      {/* packet glow */}
      {len > 50 && <>
        <circle r={isHighlighted ? 6 : 4} fill={color} opacity={isHighlighted ? 0.18 : 0.08}>
          <animateMotion dur={`${s * 2.4}s`} repeatCount="indefinite" begin={`${delay}s`}>
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
        <circle r={isHighlighted ? 3 : 2} fill={color} opacity={isHighlighted ? 0.95 : 0.55}>
          <animateMotion dur={`${s * 2.4}s`} repeatCount="indefinite" begin={`${delay}s`}>
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
        <circle r={isHighlighted ? 2.2 : 1.5} fill={color} opacity={isHighlighted ? 0.6 : 0.32}>
          <animateMotion dur={`${s * 2.4}s`} repeatCount="indefinite" begin={`${delay + s * 1.2}s`}>
            <mpath href={`#${pathId}`} />
          </animateMotion>
        </circle>
      </>}
      {/* label */}
      {edge.label && len > 55 && (
        <g>
          <rect x={mx - edge.label.length * 3.4 - 5} y={my - 9}
            width={edge.label.length * 6.8 + 10} height={18}
            rx={4} fill="#0a0a0a" fillOpacity={0.93}
            stroke={color} strokeOpacity={0.22} strokeWidth={0.7} />
          <text x={mx} y={my + 1.5} textAnchor="middle" dominantBaseline="middle"
            fill={color} fontSize="9.5" fontFamily="ui-monospace,'Geist Mono',monospace"
            opacity={isHighlighted ? 0.9 : 0.5}
          >{edge.label}</text>
        </g>
      )}
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Node shape component
// ─────────────────────────────────────────────────────────────────────────────
function NodeShape({
  node, pos, isHovered, isSelected,
  onPointerDown,
}: {
  node: DiagramNode
  pos: { x: number; y: number }
  isHovered: boolean
  isSelected: boolean
  onPointerDown: (e: React.PointerEvent) => void
}) {
  const { x, y, w, h } = getNodeBox(node, pos)
  const color = node.color
  const shape = node.shape ?? "rect"
  const lit   = isHovered || isSelected
  const sw    = lit ? 2.2 : 1.5
  const fill  = lit ? `${color}22` : `${color}0f`
  const glow  = lit ? `drop-shadow(0 0 16px ${color}55)` : `drop-shadow(0 0 6px ${color}22)`

  let shapeEl: React.ReactNode
  if (shape === "cylinder") {
    const ry = Math.min(11, h * 0.25)
    shapeEl = (
      <g style={{ filter: glow, transition: "filter 0.25s" }} onPointerDown={onPointerDown}>
        <rect x={x} y={y+ry} width={w} height={h-ry*2} fill={fill} stroke="none" />
        <ellipse cx={x+w/2} cy={y+h-ry} rx={w/2} ry={ry}
          fill={lit?`${color}28`:`${color}15`} stroke={color} strokeWidth={sw} />
        <ellipse cx={x+w/2} cy={y+ry} rx={w/2} ry={ry}
          fill={lit?`${color}35`:`${color}22`} stroke={color} strokeWidth={sw} />
        <rect x={x} y={y+ry} width={w} height={h-ry*2}
          fill="none" stroke={color} strokeWidth={sw} />
      </g>
    )
  } else if (shape === "diamond") {
    const cx2 = x+w/2, cy2 = y+h/2
    shapeEl = (
      <polygon
        points={`${cx2},${y} ${x+w},${cy2} ${cx2},${y+h} ${x},${cy2}`}
        fill={fill} stroke={color} strokeWidth={sw}
        style={{ filter: glow, transition:"all 0.25s", cursor:"grab" }}
        onPointerDown={onPointerDown}
      />
    )
  } else if (shape === "rounded") {
    shapeEl = (
      <rect x={x} y={y} width={w} height={h} rx={h/2} ry={h/2}
        fill={fill} stroke={color} strokeWidth={sw}
        style={{ filter: glow, transition:"all 0.25s", cursor:"grab" }}
        onPointerDown={onPointerDown}
      />
    )
  } else {
    shapeEl = (
      <rect x={x} y={y} width={w} height={h} rx={8} ry={8}
        fill={fill} stroke={color} strokeWidth={sw}
        style={{ filter: glow, transition:"all 0.25s", cursor:"grab" }}
        onPointerDown={onPointerDown}
      />
    )
  }

  // Pulsing ring
  const ringEl = (shape !== "diamond") ? (
    <rect x={x-3} y={y-3} width={w+6} height={h+6}
      rx={shape==="rounded" ? (h+6)/2 : 11}
      fill="none" stroke={color} strokeWidth={0.8}
      style={{ transition:"opacity 0.25s", pointerEvents:"none" }}
    >
      <animate attributeName="opacity"
        values={lit ? "0.45;0.72;0.45" : "0.08;0.16;0.08"}
        dur={lit ? "1.1s" : "3s"} repeatCount="indefinite" />
    </rect>
  ) : null

  const lines  = node.label.split("\n")
  const totalH = lines.length * LINE_H
  const startY = pos.y - totalH / 2 + LINE_H / 2

  return (
    <g style={{ cursor: "grab", userSelect: "none" }} onPointerDown={onPointerDown}>
      {ringEl}
      {shapeEl}
      {/* accent stripe */}
      {shape !== "diamond" && shape !== "cylinder" && (
        <rect x={x+1} y={y+1} width={w-2} height={3} rx={7}
          fill={color} opacity={lit ? 0.55 : 0.28}
          style={{ pointerEvents:"none", transition:"opacity 0.25s" }} />
      )}
      {lines.map((line, i) => (
        <text key={i}
          x={pos.x} y={startY + i * LINE_H}
          textAnchor="middle" dominantBaseline="middle"
          fill={lit ? "#ffffff" : "#d4d4d4"}
          fontSize={lines.length > 2 ? "10.5" : "11.5"}
          fontWeight={lit ? "700" : "600"}
          fontFamily="ui-monospace,'Geist Mono',monospace"
          style={{ pointerEvents:"none", transition:"fill 0.2s", letterSpacing:"-0.01em" }}
        >{line}</text>
      ))}
      {/* selected ring indicator */}
      {isSelected && (
        <rect x={x-5} y={y-5} width={w+10} height={h+10}
          rx={shape==="rounded" ? (h+10)/2 : 14}
          fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="4 3"
          opacity={0.7} style={{ pointerEvents:"none" }}
        />
      )}
    </g>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Drag state
// ─────────────────────────────────────────────────────────────────────────────
type DragMode =
  | { kind: "node"; id: string; ox: number; oy: number }   // ox/oy = offset in SVG coords
  | { kind: "pan";  ox: number; oy: number }                // ox/oy = SVG coords at start
  | null

// ─────────────────────────────────────────────────────────────────────────────
// Main SVG canvas component
// ─────────────────────────────────────────────────────────────────────────────
function DiagramCanvas({
  diagram,
  selectedId,
  onSelect,
}: {
  diagram: Diagram
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const uid = useId().replace(/:/g, "")
  const svgRef  = useRef<SVGSVGElement>(null)
  const dragRef = useRef<DragMode>(null)

  // Node positions (draggable)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(() =>
    Object.fromEntries(diagram.nodes.map(n => [n.id, { x: n.x, y: n.y }]))
  )

  // Pan state stored in the viewBox offset
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)

  const resetLayout = () => {
    setPositions(Object.fromEntries(diagram.nodes.map(n => [n.id, { x: n.x, y: n.y }])))
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }

  // Hover
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const nodeMap = Object.fromEntries(diagram.nodes.map(n => [n.id, n]))

  // Compute base viewBox from current positions
  const base = computeViewBox(diagram.nodes, positions)

  // Apply pan & zoom to viewBox
  const vx = base.vx + pan.x - (base.vw / zoom - base.vw) / 2
  const vy = base.vy + pan.y - (base.vh / zoom - base.vh) / 2
  const vw = base.vw / zoom
  const vh = base.vh / zoom

  // Convert client coords → SVG coords using current viewBox
  function clientToSVG(clientX: number, clientY: number) {
    const svg = svgRef.current!
    const rect = svg.getBoundingClientRect()
    const scaleX = vw / rect.width
    const scaleY = vh / rect.height
    return { x: vx + (clientX - rect.left) * scaleX, y: vy + (clientY - rect.top) * scaleY }
  }

  // ── Pointer down: start drag or pan ──────────────────────────────
  function onNodePointerDown(e: React.PointerEvent, nodeId: string) {
    e.preventDefault()
    e.stopPropagation()
    const svgPt = clientToSVG(e.clientX, e.clientY)
    const pos = positions[nodeId]
    dragRef.current = { kind: "node", id: nodeId, ox: svgPt.x - pos.x, oy: svgPt.y - pos.y }
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }

  function onSVGPointerDown(e: React.PointerEvent) {
    if ((e.target as Element).tagName === "svg" || (e.target as Element).tagName === "rect") {
      const svgPt = clientToSVG(e.clientX, e.clientY)
      dragRef.current = { kind: "pan", ox: svgPt.x, oy: svgPt.y }
      setIsPanning(true)
    }
  }

  // ── Pointer move ──────────────────────────────────────────────────
  function onSVGPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current
    if (!drag) return
    const svgPt = clientToSVG(e.clientX, e.clientY)
    if (drag.kind === "node") {
      setPositions(prev => ({
        ...prev,
        [drag.id]: { x: svgPt.x - drag.ox, y: svgPt.y - drag.oy },
      }))
    } else if (drag.kind === "pan") {
      const dx = (drag.ox - svgPt.x) 
      const dy = (drag.oy - svgPt.y)
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }))
      // update the reference point
      dragRef.current = { kind: "pan", ox: svgPt.x, oy: svgPt.y }
    }
  }

  // ── Pointer up ────────────────────────────────────────────────────
  function onSVGPointerUp() {
    dragRef.current = null
    setIsPanning(false)
  }

  // ── Wheel zoom ────────────────────────────────────────────────────
  function onWheel(e: React.WheelEvent) {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.12 : 0.89
    setZoom(z => Math.max(0.25, Math.min(4, z * factor)))
  }

  // Highlighted edges for hover
  const highlightedKeys = hoveredId
    ? new Set(diagram.edges.filter(e => e.from === hoveredId || e.to === hoveredId).map(e => `${e.from}-${e.to}`))
    : null

  // Selected edges for selection
  const selectedKeys = selectedId
    ? new Set(diagram.edges.filter(e => e.from === selectedId || e.to === selectedId).map(e => `${e.from}-${e.to}`))
    : null

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={resetLayout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ backgroundColor:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#888" }}
          title="Reset layout to default"
        >
          <span style={{ fontSize:"13px" }}>↺</span> Reset
        </button>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
          style={{ backgroundColor:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", color:"#555" }}>
          <span style={{ fontSize:"13px" }}>⊕</span>
          <span>Scroll to zoom · Drag nodes · Drag canvas to pan</span>
        </div>
        <div className="ml-auto text-xs font-mono px-2 py-1 rounded"
          style={{ backgroundColor:"rgba(255,255,255,0.04)", color:"#555" }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full rounded-2xl select-none"
        style={{
          backgroundColor: "#080808",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 0 80px rgba(0,0,0,0.35)",
          cursor: isPanning ? "grabbing" : "default",
          minHeight: "340px",
          touchAction: "none",
        }}
        onPointerDown={onSVGPointerDown}
        onPointerMove={onSVGPointerMove}
        onPointerUp={onSVGPointerUp}
        onPointerLeave={onSVGPointerUp}
        onWheel={onWheel}
        onClick={e => { if ((e.target as Element).tagName === "svg") onSelect(null) }}
      >
        <defs>
          {ALL_COLORS.map(color => {
            const id = `${uid}-${color.slice(1)}`
            return (
              <marker key={id} id={id} markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
                <path d="M0,0 L0,7 L9,3.5 z" fill={color} opacity="0.85" />
              </marker>
            )
          })}
          <radialGradient id={`${uid}-vig`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0f0f18" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
          </radialGradient>
        </defs>

        {/* dot grid */}
        <pattern id={`${uid}-dots`} x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.75" fill="rgba(255,255,255,0.05)" />
        </pattern>
        <rect x={vx} y={vy} width={vw} height={vh} fill={`url(#${uid}-dots)`} />
        <rect x={vx} y={vy} width={vw} height={vh} fill={`url(#${uid}-vig)`} />

        {/* Groups */}
        {diagram.groups?.map(grp => (
          <g key={grp.label}>
            <rect x={grp.x} y={grp.y} width={grp.w} height={grp.h} rx={12}
              fill={`${grp.color}06`} stroke={`${grp.color}1e`}
              strokeWidth={1.5} strokeDasharray="7 5" />
            <text x={grp.x+12} y={grp.y+18}
              fill={grp.color} fontSize="10.5" fontWeight="600"
              fontFamily="ui-monospace,'Geist Mono',monospace"
              opacity={0.45} letterSpacing="0.06em"
            >{grp.label.toUpperCase()}</text>
          </g>
        ))}

        {/* Edges */}
        {diagram.edges.map((edge, i) => {
          const from = nodeMap[edge.from], to = nodeMap[edge.to]
          if (!from || !to) return null
          const fromPos = positions[edge.from] ?? { x: from.x, y: from.y }
          const toPos   = positions[edge.to]   ?? { x: to.x,   y: to.y   }
          const color   = edge.color ?? "#6b7280"
          const key     = `${edge.from}-${edge.to}`
          const isHL    = !highlightedKeys && !selectedKeys
            ? true
            : (highlightedKeys?.has(key) || selectedKeys?.has(key)) ?? false
          return (
            <FlowEdge key={`${key}-${i}`}
              edge={edge}
              fromNode={from} fromPos={fromPos}
              toNode={to}   toPos={toPos}
              pathId={`${uid}-p${i}`}
              markerId={`${uid}-${color.slice(1)}`}
              isHighlighted={isHL}
              speed={SPEEDS[i % SPEEDS.length]}
              delay={DELAYS[i % DELAYS.length]}
            />
          )
        })}

        {/* Nodes */}
        {diagram.nodes.map(node => {
          const pos = positions[node.id] ?? { x: node.x, y: node.y }
          return (
            <g key={node.id}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={e => { e.stopPropagation(); onSelect(node.id === selectedId ? null : node.id) }}
            >
              <NodeShape
                node={node} pos={pos}
                isHovered={hoveredId === node.id}
                isSelected={selectedId === node.id}
                onPointerDown={e => onNodePointerDown(e, node.id)}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Flow panel — shown when a node is selected
// ─────────────────────────────────────────────────────────────────────────────
function FlowPanel({
  nodeId, diagram, onClose,
}: {
  nodeId: string
  diagram: Diagram
  onClose: () => void
}) {
  const nodeMap = Object.fromEntries(diagram.nodes.map(n => [n.id, n]))
  const node    = nodeMap[nodeId]
  if (!node) return null

  const incoming = diagram.edges.filter(e => e.to   === nodeId)
  const outgoing = diagram.edges.filter(e => e.from === nodeId)

  // Compute rough pipeline depth via BFS backwards
  function depth(id: string, visited = new Set<string>()): number {
    if (visited.has(id)) return 0
    visited.add(id)
    const preds = diagram.edges.filter(e => e.to === id).map(e => e.from)
    if (!preds.length) return 0
    return 1 + Math.max(...preds.map(p => depth(p, visited)))
  }
  const step   = depth(nodeId) + 1
  const total  = diagram.nodes.length

  return (
    <div
      className="mt-4 rounded-2xl overflow-hidden"
      style={{
        border: `1px solid ${node.color}35`,
        backgroundColor: "rgba(10,10,14,0.97)",
        boxShadow: `0 8px 40px rgba(0,0,0,0.5), 0 0 30px ${node.color}12`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4"
        style={{ borderBottom: `1px solid ${node.color}20` }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: node.color, boxShadow: `0 0 6px ${node.color}` }} />
            <span className="text-xs font-bold tracking-widest"
              style={{ color: node.color }}
            >{node.label.replace(/\n/g, " ").toUpperCase()}</span>
          </div>
          <span className="text-xs" style={{ color: "#444" }}>
            Pipeline step ≈ {step} of {total} nodes · {incoming.length} input{incoming.length !== 1 ? "s" : ""} · {outgoing.length} output{outgoing.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-sm"
          style={{ color: "#555", border:"1px solid rgba(255,255,255,0.08)" }}>
          ✕
        </button>
      </div>

      {/* Description */}
      {node.tooltip && (
        <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="leading-relaxed" style={{ color: "#bbb", fontSize: "13.5px", lineHeight: "1.7" }}>
            {node.tooltip}
          </p>
        </div>
      )}

      {/* Flow connections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>

        {/* Receives from */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">◀</span>
            <span className="text-xs font-bold tracking-widest"
              style={{ color: "#666" }}>RECEIVES FROM ({incoming.length})</span>
          </div>
          {incoming.length === 0 ? (
            <p className="text-xs italic" style={{ color: "#444" }}>Source node — no inputs</p>
          ) : (
            <div className="space-y-2">
              {incoming.map((edge, i) => {
                const src = nodeMap[edge.from]
                if (!src) return null
                const srcColor = edge.color ?? src.color
                return (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl"
                    style={{ backgroundColor: `${srcColor}0a`, border: `1px solid ${srcColor}18` }}>
                    <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: srcColor }} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: "#e2e8f0" }}>
                        {src.label.replace(/\n/g, " ")}
                      </div>
                      {edge.label && (
                        <div className="text-xs mt-0.5 font-mono"
                          style={{ color: srcColor, opacity: 0.85 }}>
                          via &quot;{edge.label}&quot;
                        </div>
                      )}
                      {edge.dashed && (
                        <div className="text-xs mt-0.5" style={{ color: "#444" }}>⋯ dashed / async</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sends to */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">▶</span>
            <span className="text-xs font-bold tracking-widest"
              style={{ color: "#666" }}>SENDS TO ({outgoing.length})</span>
          </div>
          {outgoing.length === 0 ? (
            <p className="text-xs italic" style={{ color: "#444" }}>Terminal node — no outputs</p>
          ) : (
            <div className="space-y-2">
              {outgoing.map((edge, i) => {
                const dst = nodeMap[edge.to]
                if (!dst) return null
                const dstColor = edge.color ?? dst.color
                return (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl"
                    style={{ backgroundColor: `${dstColor}0a`, border: `1px solid ${dstColor}18` }}>
                    <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: dstColor }} />
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: "#e2e8f0" }}>
                        {dst.label.replace(/\n/g, " ")}
                      </div>
                      {edge.label && (
                        <div className="text-xs mt-0.5 font-mono"
                          style={{ color: dstColor, opacity: 0.85 }}>
                          via &quot;{edge.label}&quot;
                        </div>
                      )}
                      {edge.bidirectional && (
                        <div className="text-xs mt-0.5" style={{ color: "#444" }}>⇄ bidirectional</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full pipeline text */}
      <div className="px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#444" }}>
          PIPELINE CONTEXT
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "#555", fontFamily: "ui-monospace,'Geist Mono',monospace" }}>
          {incoming.map(e => nodeMap[e.from]?.label.replace(/\n/g," ")).filter(Boolean).join(" + ")}
          {incoming.length > 0 && " → "}
          <span style={{ color: node.color, fontWeight: "700" }}>
            [{node.label.replace(/\n/g," ")}]
          </span>
          {outgoing.length > 0 && " → "}
          {outgoing.map(e => nodeMap[e.to]?.label.replace(/\n/g," ")).filter(Boolean).join(" + ")}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Public export: multi-diagram tab view
// ─────────────────────────────────────────────────────────────────────────────
export function SystemDiagram({ diagrams }: { diagrams: Diagram[] }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const diagram = diagrams[activeIdx]

  // Reset selection when switching diagrams
  const handleTabChange = (i: number) => {
    setActiveIdx(i)
    setSelectedId(null)
  }

  if (!diagrams.length) return null

  return (
    <div>
      {/* Tab selector */}
      {diagrams.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {diagrams.map((d, i) => (
            <button key={d.id} onClick={() => handleTabChange(i)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={
                activeIdx === i
                  ? { background:"linear-gradient(135deg,#3b82f618,#8b5cf618)", border:"1px solid rgba(139,92,246,0.4)", color:"#c4b5fd" }
                  : { backgroundColor:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"#777" }
              }
            >{d.title}</button>
          ))}
        </div>
      )}

      <p className="mb-4 leading-relaxed" style={{ color:"#777", fontSize:"13.5px" }}>
        {diagram.description}
      </p>

      {/* Canvas */}
      <DiagramCanvas
        key={`${activeIdx}-${diagram.id}`}
        diagram={diagram}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {/* Legend */}
      {diagram.legend && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
          {diagram.legend.map(item => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor:`${item.color}35`, border:`1.5px solid ${item.color}` }} />
              <span style={{ color:"#666", fontSize:"12px" }}>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Flow panel */}
      {selectedId && (
        <FlowPanel
          nodeId={selectedId}
          diagram={diagram}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  )
}

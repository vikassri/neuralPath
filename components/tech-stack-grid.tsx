"use client"

interface TechStackGridProps {
  tools: string[]
}

export function TechStackGrid({ tools }: TechStackGridProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {tools.map((tool) => (
        <span
          key={tool}
          className="font-mono px-4 py-2 rounded-lg border transition-all duration-200 hover:border-white/20 hover:bg-white/06 cursor-default"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            borderColor: "rgba(255,255,255,0.09)",
            color: "#aaaaaa",
            fontSize: "13px",
            letterSpacing: "0.01em",
          }}
        >
          {tool}
        </span>
      ))}
    </div>
  )
}

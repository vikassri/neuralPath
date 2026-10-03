import Link from "next/link"
import { Brain, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
    >
      <Brain size={48} className="text-blue-400 mb-6" />
      <h1 className="text-4xl font-bold text-white mb-3">404</h1>
      <p className="text-lg mb-2" style={{ color: "#888" }}>
        Module not found
      </p>
      <p className="text-sm mb-8" style={{ color: "#555" }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
        style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)" }}
      >
        <ArrowLeft size={14} />
        Back to Modules
      </Link>
    </div>
  )
}

export type NodeShape = "rect" | "rounded" | "diamond" | "cylinder" | "parallelogram" | "hexagon"

export interface DiagramNode {
  id: string
  label: string
  sublabel?: string
  x: number       // center x (0–900)
  y: number       // center y (0–500)
  w?: number      // width (default 140)
  h?: number      // height (default 44)
  color: string   // border + accent color
  shape?: NodeShape
  tooltip?: string
}

export interface DiagramEdge {
  from: string
  to: string
  label?: string
  dashed?: boolean
  color?: string
  bidirectional?: boolean
  // Optional manual bend points: array of {x,y} waypoints
  waypoints?: { x: number; y: number }[]
}

export interface DiagramGroup {
  label: string
  x: number
  y: number
  w: number
  h: number
  color: string
}

export interface Diagram {
  id: string
  title: string
  description: string
  viewH?: number  // viewBox height (default 480)
  nodes: DiagramNode[]
  edges: DiagramEdge[]
  groups?: DiagramGroup[]
  legend?: { color: string; label: string }[]
}

export interface ModuleDiagrams {
  moduleSlug: string
  diagrams: Diagram[]
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  blue:    "#3b82f6",
  purple:  "#8b5cf6",
  green:   "#10b981",
  teal:    "#06b6d4",
  amber:   "#f59e0b",
  red:     "#ef4444",
  pink:    "#ec4899",
  indigo:  "#6366f1",
  lime:    "#84cc16",
  orange:  "#f97316",
  gray:    "#6b7280",
  white:   "#e2e8f0",
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGRAMS BY MODULE
// ─────────────────────────────────────────────────────────────────────────────

export const allModuleDiagrams: ModuleDiagrams[] = [

  // ───────── PRODUCTION RAG SYSTEMS ─────────────────────────────────────────
  {
    moduleSlug: "production-rag-systems",
    diagrams: [
      {
        id: "naive-rag",
        title: "Naive RAG Pipeline",
        description: "The simplest RAG architecture: chunk documents, embed them, store in a vector DB, retrieve the top-k, and pass as context to the LLM.",
        viewH: 300,
        nodes: [
          { id: "docs",    label: "Documents",     x: 80,  y: 150, color: C.gray,   tooltip: "PDFs, web pages, databases — any text corpus" },
          { id: "chunk",   label: "Chunker",        x: 230, y: 150, color: C.amber,  tooltip: "Split docs into ~512 token chunks with overlap" },
          { id: "embed",   label: "Embedder",       x: 390, y: 150, color: C.blue,   tooltip: "e.g. text-embedding-3-small, BGE, E5" },
          { id: "vdb",     label: "Vector DB",      x: 560, y: 150, color: C.purple, shape: "cylinder", tooltip: "Qdrant / FAISS / Weaviate — stores embedding vectors" },
          { id: "query",   label: "User Query",     x: 390, y: 60,  color: C.green,  w: 120, h: 36 },
          { id: "retrieve",label: "Top-K Retrieve", x: 560, y: 260, color: C.teal,   tooltip: "ANN search returns k most similar chunks" },
          { id: "llm",     label: "LLM",            x: 720, y: 150, color: C.pink,   tooltip: "GPT-4o, Claude, Llama — generates answer from context" },
          { id: "answer",  label: "Answer",         x: 820, y: 260, color: C.green,  w: 100, h: 36 },
        ],
        edges: [
          { from: "docs",    to: "chunk",    label: "split" },
          { from: "chunk",   to: "embed",    label: "encode" },
          { from: "embed",   to: "vdb",      label: "store" },
          { from: "query",   to: "embed",    label: "embed query", color: C.green },
          { from: "vdb",     to: "retrieve", label: "ANN search" },
          { from: "retrieve",to: "llm",      label: "top-k context", color: C.teal },
          { from: "query",   to: "llm",      label: "user prompt", color: C.green },
          { from: "llm",     to: "answer",   label: "generate" },
        ],
        legend: [
          { color: C.gray,   label: "Data Source" },
          { color: C.blue,   label: "Embedding" },
          { color: C.purple, label: "Vector Store" },
          { color: C.pink,   label: "LLM" },
          { color: C.green,  label: "User I/O" },
        ],
      },

      {
        id: "advanced-rag",
        title: "Advanced RAG — Hybrid Search + Re-ranking",
        description: "Production RAG adds query rewriting, hybrid search (dense + sparse BM25), cross-encoder re-ranking, and HyDE for better retrieval quality.",
        viewH: 480,
        nodes: [
          { id: "user",     label: "User Query",    x: 450, y: 40,  color: C.green,  w: 130, h: 38 },
          { id: "rewrite",  label: "Query Rewriter", x: 450, y: 110, color: C.amber,  w: 150, h: 40, tooltip: "LLM rewrites query for better retrieval — Step-Back, HyDE" },
          { id: "hyde",     label: "HyDE",           x: 250, y: 110, color: C.orange, w: 100, h: 40, tooltip: "Hypothetical Document Embedding: generate fake doc → embed it" },
          { id: "dense",    label: "Dense Retrieval", x: 300, y: 210, color: C.blue,   w: 150, h: 44, tooltip: "Bi-encoder embeds query → ANN search in vector DB" },
          { id: "sparse",   label: "Sparse / BM25",  x: 600, y: 210, color: C.teal,   w: 150, h: 44, tooltip: "Keyword search — high precision on exact terms" },
          { id: "vdb",      label: "Vector DB",      x: 200, y: 300, color: C.purple, w: 130, h: 44, shape: "cylinder", tooltip: "Qdrant / OpenSearch dense index" },
          { id: "bm25db",   label: "BM25 Index",     x: 700, y: 300, color: C.indigo, w: 130, h: 44, shape: "cylinder", tooltip: "OpenSearch / Elasticsearch BM25" },
          { id: "rrf",      label: "RRF Fusion",      x: 450, y: 310, color: C.amber,  w: 130, h: 44, tooltip: "Reciprocal Rank Fusion merges dense + sparse rankings" },
          { id: "rerank",   label: "Cross-Encoder\nReranker", x: 450, y: 400, color: C.pink,   w: 160, h: 50, tooltip: "Cohere Rerank / BGE-Reranker: full attention query×doc scoring" },
          { id: "llm",      label: "LLM",            x: 680, y: 400, color: C.pink,   w: 110, h: 44, tooltip: "Generate grounded answer from top-5 reranked chunks" },
          { id: "answer",   label: "Answer",          x: 820, y: 400, color: C.green,  w: 110, h: 40 },
        ],
        edges: [
          { from: "user",    to: "rewrite",  label: "original" },
          { from: "user",    to: "hyde",     label: "alt", dashed: true },
          { from: "hyde",    to: "dense",    label: "hyp. doc", dashed: true, color: C.orange },
          { from: "rewrite", to: "dense",    label: "rewritten query" },
          { from: "rewrite", to: "sparse",   label: "rewritten query" },
          { from: "dense",   to: "vdb" },
          { from: "sparse",  to: "bm25db" },
          { from: "vdb",     to: "rrf",      label: "top-100" },
          { from: "bm25db",  to: "rrf",      label: "top-100" },
          { from: "rrf",     to: "rerank",   label: "top-50 fused" },
          { from: "rerank",  to: "llm",      label: "top-5 context", color: C.pink },
          { from: "user",    to: "llm",      label: "prompt", color: C.green, dashed: true },
          { from: "llm",     to: "answer" },
        ],
        legend: [
          { color: C.blue,   label: "Dense (Semantic)" },
          { color: C.teal,   label: "Sparse (BM25)" },
          { color: C.amber,  label: "Fusion / Rewrite" },
          { color: C.pink,   label: "LLM / Reranker" },
        ],
      },

      {
        id: "graphrag",
        title: "GraphRAG — Knowledge Graph Retrieval",
        description: "Microsoft GraphRAG builds a knowledge graph from documents. Community detection enables global reasoning across an entire corpus — impossible with chunk retrieval.",
        viewH: 440,
        nodes: [
          { id: "docs",     label: "Documents",      x: 100, y: 60,  color: C.gray,   w: 130 },
          { id: "extract",  label: "Entity Extractor", x: 290, y: 60, color: C.amber,  w: 160, h: 48, tooltip: "LLM extracts entities, relations, and claims from each chunk" },
          { id: "graph",    label: "Knowledge Graph",  x: 510, y: 60, color: C.blue,   w: 160, h: 48, tooltip: "Nodes = entities, Edges = relationships (Neo4j / NetworkX)" },
          { id: "community",label: "Community\nDetection", x: 700, y: 160, color: C.purple, w: 150, h: 54, tooltip: "Leiden algorithm: groups related entities into communities" },
          { id: "summary",  label: "Community\nSummaries", x: 700, y: 290, color: C.indigo, w: 150, h: 54, tooltip: "LLM generates a summary for each community of entities" },
          { id: "local",    label: "Local Retrieval",  x: 200, y: 250, color: C.teal,   w: 150, h: 48, tooltip: "Traditional chunk retrieval for specific entity queries" },
          { id: "global",   label: "Global Retrieval", x: 450, y: 310, color: C.orange, w: 150, h: 48, tooltip: "Map-reduce over community summaries for broad questions" },
          { id: "query",    label: "User Query",       x: 100, y: 380, color: C.green,  w: 120, h: 38 },
          { id: "router",   label: "Query Router",     x: 280, y: 380, color: C.amber,  w: 140, h: 44, tooltip: "LLM decides: local (entity-specific) vs global (corpus-wide)" },
          { id: "llm",      label: "LLM",              x: 620, y: 410, color: C.pink,   w: 100 },
          { id: "answer",   label: "Answer",           x: 800, y: 410, color: C.green,  w: 100, h: 36 },
        ],
        edges: [
          { from: "docs",      to: "extract",   label: "chunk + extract" },
          { from: "extract",   to: "graph",     label: "entities + rels" },
          { from: "graph",     to: "community", label: "graph structure" },
          { from: "community", to: "summary",   label: "LLM summarize" },
          { from: "query",     to: "router" },
          { from: "router",    to: "local",     label: "entity query", dashed: true },
          { from: "router",    to: "global",    label: "global query", dashed: true, color: C.orange },
          { from: "graph",     to: "local",     label: "subgraph" },
          { from: "summary",   to: "global",    label: "map-reduce", color: C.orange },
          { from: "local",     to: "llm",       label: "context" },
          { from: "global",    to: "llm",       label: "summaries", color: C.orange },
          { from: "llm",       to: "answer" },
        ],
        legend: [
          { color: C.blue,   label: "Knowledge Graph" },
          { color: C.purple, label: "Community Detection" },
          { color: C.orange, label: "Global Retrieval" },
          { color: C.teal,   label: "Local Retrieval" },
        ],
      },

      {
        id: "agentic-rag",
        title: "Agentic RAG — ReAct Loop",
        description: "Agentic RAG gives the LLM autonomy to decide when to retrieve, what to query, and whether to retrieve again — using the Reason-Act-Observe loop.",
        viewH: 420,
        nodes: [
          { id: "user",    label: "User Query",      x: 100, y: 210, color: C.green, w: 130, h: 40 },
          { id: "plan",    label: "Planner / LLM",   x: 310, y: 210, color: C.pink,  w: 160, h: 48, tooltip: "LLM decides: think, retrieve, answer, or ask for clarification" },
          { id: "thought", label: "💭 Thought",       x: 310, y: 100, color: C.amber, w: 140, h: 42, tooltip: "Chain-of-thought reasoning step — not sent to user" },
          { id: "tools",   label: "Tools",            x: 550, y: 130, color: C.blue,  w: 110, h: 42, tooltip: "retrieve(), search_web(), execute_code(), lookup_db()" },
          { id: "vdb",     label: "Vector DB",        x: 750, y: 80,  color: C.purple, w: 130, h: 42, shape: "cylinder" },
          { id: "web",     label: "Web Search",       x: 750, y: 160, color: C.teal,  w: 130, h: 42 },
          { id: "observe", label: "👁 Observation",   x: 550, y: 280, color: C.lime,  w: 150, h: 44, tooltip: "Tool result fed back to LLM as next context" },
          { id: "check",   label: "Answer Complete?", x: 310, y: 340, color: C.amber, w: 160, h: 44, shape: "diamond", tooltip: "LLM self-evaluates: is the answer sufficient?" },
          { id: "answer",  label: "Final Answer",     x: 100, y: 380, color: C.green, w: 140, h: 40 },
        ],
        edges: [
          { from: "user",    to: "plan",    label: "task" },
          { from: "plan",    to: "thought", label: "Reason" },
          { from: "thought", to: "tools",   label: "Act" },
          { from: "tools",   to: "vdb",     label: "retrieve()" },
          { from: "tools",   to: "web",     label: "search()" },
          { from: "vdb",     to: "observe", label: "chunks" },
          { from: "web",     to: "observe", label: "results" },
          { from: "observe", to: "check",   label: "Observe" },
          { from: "check",   to: "plan",    label: "No — loop", dashed: true, color: C.amber },
          { from: "check",   to: "answer",  label: "Yes — done", color: C.green },
        ],
        legend: [
          { color: C.pink,   label: "LLM / Planner" },
          { color: C.amber,  label: "Reason (Thought)" },
          { color: C.blue,   label: "Act (Tools)" },
          { color: C.lime,   label: "Observe" },
        ],
      },
    ],
  },

  // ───────── MULTI-AGENT ORCHESTRATION ──────────────────────────────────────
  {
    moduleSlug: "multi-agent-orchestration",
    diagrams: [
      {
        id: "supervisor-worker",
        title: "Supervisor-Worker Multi-Agent Pattern",
        description: "A supervisor LLM decomposes tasks and routes them to specialized worker agents. LangGraph implements this as a directed state graph with conditional edges.",
        viewH: 440,
        nodes: [
          { id: "user",      label: "User",             x: 80,  y: 220, color: C.green,  w: 90, h: 40 },
          { id: "super",     label: "Supervisor Agent",  x: 270, y: 220, color: C.pink,   w: 170, h: 54, tooltip: "LLM that decomposes tasks and routes to specialists" },
          { id: "state",     label: "Shared State",      x: 270, y: 100, color: C.amber,  w: 150, h: 44, tooltip: "TypedDict shared across all agents — message history, context, results" },
          { id: "researcher",label: "🔍 Researcher",     x: 500, y: 110, color: C.blue,   w: 140, h: 48, tooltip: "Web search, RAG retrieval, fact verification" },
          { id: "coder",     label: "💻 Coder",          x: 500, y: 220, color: C.teal,   w: 140, h: 48, tooltip: "Code generation, execution, testing" },
          { id: "critic",    label: "✏️ Critic",          x: 500, y: 330, color: C.orange, w: 140, h: 48, tooltip: "Quality check, factuality verification, refinement" },
          { id: "tools",     label: "Tool Registry",     x: 700, y: 220, color: C.indigo, w: 140, h: 48, tooltip: "search_web, run_code, retrieve, browse_url" },
          { id: "hitl",      label: "Human Approval",   x: 700, y: 360, color: C.purple, w: 150, h: 48, tooltip: "interrupt() pauses graph for human review at critical steps" },
          { id: "answer",    label: "Final Output",      x: 80,  y: 370, color: C.green,  w: 120, h: 40 },
        ],
        edges: [
          { from: "user",       to: "super",      label: "task" },
          { from: "super",      to: "state",      label: "update", bidirectional: true },
          { from: "super",      to: "researcher", label: "route: research" },
          { from: "super",      to: "coder",      label: "route: code" },
          { from: "super",      to: "critic",     label: "route: review" },
          { from: "researcher", to: "tools",      label: "search()" },
          { from: "coder",      to: "tools",      label: "execute()" },
          { from: "researcher", to: "super",      label: "result", dashed: true },
          { from: "coder",      to: "super",      label: "result", dashed: true },
          { from: "critic",     to: "super",      label: "feedback", dashed: true },
          { from: "super",      to: "hitl",       label: "needs approval", dashed: true, color: C.purple },
          { from: "hitl",       to: "super",      label: "resume", dashed: true, color: C.purple },
          { from: "super",      to: "answer",     label: "done" },
        ],
        legend: [
          { color: C.pink,   label: "Supervisor" },
          { color: C.blue,   label: "Research Agent" },
          { color: C.teal,   label: "Coder Agent" },
          { color: C.orange, label: "Critic Agent" },
          { color: C.purple, label: "Human-in-the-Loop" },
        ],
        groups: [
          { label: "Worker Agents", x: 460, y: 75, w: 190, h: 325, color: C.blue },
        ],
      },

      {
        id: "langgraph-state",
        title: "LangGraph State Machine Flow",
        description: "LangGraph models multi-agent systems as directed graphs. Nodes are agents/tools; edges are conditional on the LLM's decision. State persists across all nodes.",
        viewH: 380,
        nodes: [
          { id: "start",  label: "START",         x: 80,  y: 190, color: C.green,  w: 90, h: 38, shape: "rounded" },
          { id: "agent",  label: "Agent Node",    x: 260, y: 190, color: C.pink,   w: 150, h: 50, tooltip: "LLM call that reads state and produces tool_calls or final answer" },
          { id: "cond",   label: "Router",        x: 450, y: 190, color: C.amber,  w: 130, h: 46, shape: "diamond", tooltip: "Conditional edge: should_continue() checks if tool calls present" },
          { id: "tools",  label: "Tool Executor", x: 640, y: 100, color: C.blue,   w: 150, h: 50, tooltip: "Runs the actual tool function, returns observation to state" },
          { id: "end",    label: "END",           x: 640, y: 280, color: C.green,  w: 90, h: 38, shape: "rounded" },
          { id: "mem",    label: "Checkpointer",  x: 260, y: 60,  color: C.purple, w: 150, h: 46, tooltip: "Serializes state to DB — enables pause/resume and HITL" },
        ],
        edges: [
          { from: "start", to: "agent",  label: "invoke" },
          { from: "agent", to: "mem",    label: "save state", dashed: true, color: C.purple },
          { from: "agent", to: "cond",   label: "output" },
          { from: "cond",  to: "tools",  label: "tool_call", color: C.blue },
          { from: "cond",  to: "end",    label: "final_answer", color: C.green },
          { from: "tools", to: "agent",  label: "observation", dashed: true, color: C.blue },
        ],
      },
    ],
  },

  // ───────── MCP & A2A PROTOCOLS ────────────────────────────────────────────
  {
    moduleSlug: "mcp-a2a-protocols",
    diagrams: [
      {
        id: "mcp-architecture",
        title: "Model Context Protocol (MCP) Architecture",
        description: "MCP standardizes how LLMs connect to external tools and data. Clients (Cursor, Claude) connect to MCP Servers via stdio or HTTP+SSE transport using JSON-RPC 2.0.",
        viewH: 420,
        nodes: [
          { id: "cursor",  label: "MCP Client\n(Cursor / Claude)", x: 130, y: 210, color: C.blue,   w: 160, h: 60, tooltip: "Any AI host that speaks MCP: Cursor, Claude Desktop, your app" },
          { id: "host",    label: "LLM Host",        x: 130, y: 100, color: C.pink,   w: 140, h: 46, tooltip: "The LLM runtime embedded in the client" },
          { id: "proto",   label: "JSON-RPC 2.0",    x: 340, y: 210, color: C.gray,   w: 140, h: 44, tooltip: "stdio or HTTP+SSE transport layer" },
          { id: "srv1",    label: "📁 File Server",   x: 570, y: 100, color: C.amber,  w: 150, h: 48, tooltip: "MCP server exposing: Resources (files), Tools (read/write)" },
          { id: "srv2",    label: "🗄 DB Server",     x: 570, y: 210, color: C.teal,   w: 150, h: 48, tooltip: "MCP server: Resources (rows), Tools (SQL queries)" },
          { id: "srv3",    label: "🔍 Search Server", x: 570, y: 320, color: C.green,  w: 150, h: 48, tooltip: "MCP server: Tools (web_search, retrieve)" },
          { id: "res",     label: "Resources",       x: 770, y: 130, color: C.orange, w: 120, h: 40, tooltip: "Read-only data: files, DB rows, API responses" },
          { id: "tools",   label: "Tools",           x: 770, y: 210, color: C.orange, w: 120, h: 40, tooltip: "Executable functions the LLM can call" },
          { id: "prompts", label: "Prompts",         x: 770, y: 290, color: C.orange, w: 120, h: 40, tooltip: "Reusable prompt templates with parameters" },
        ],
        edges: [
          { from: "host",   to: "cursor",  label: "invokes tools" },
          { from: "cursor", to: "proto",   label: "MCP request", bidirectional: true },
          { from: "proto",  to: "srv1",    bidirectional: true },
          { from: "proto",  to: "srv2",    bidirectional: true },
          { from: "proto",  to: "srv3",    bidirectional: true },
          { from: "srv1",   to: "res",     dashed: true },
          { from: "srv2",   to: "tools",   dashed: true },
          { from: "srv3",   to: "prompts", dashed: true },
        ],
        groups: [
          { label: "MCP Primitives", x: 735, y: 105, w: 170, h: 250, color: C.orange },
        ],
        legend: [
          { color: C.blue,   label: "MCP Client" },
          { color: C.amber,  label: "MCP Server" },
          { color: C.orange, label: "Primitives" },
          { color: C.gray,   label: "Transport (JSON-RPC)" },
        ],
      },

      {
        id: "a2a-protocol",
        title: "A2A Protocol — Agent-to-Agent Communication",
        description: "Google's A2A protocol enables agents built on different frameworks to delegate tasks via HTTP. Agents advertise capabilities via AgentCards and communicate structured Tasks.",
        viewH: 380,
        nodes: [
          { id: "agent1",  label: "Orchestrator\nAgent (LangGraph)", x: 160, y: 190, color: C.blue,   w: 175, h: 60, tooltip: "Built on LangGraph — delegates sub-tasks to specialist agents" },
          { id: "card1",   label: "AgentCard", x: 160, y: 60,  color: C.gray,   w: 120, h: 40, tooltip: "/.well-known/agent.json — declares capabilities" },
          { id: "http",    label: "HTTP + SSE", x: 420, y: 190, color: C.amber,  w: 130, h: 44, tooltip: "REST + Server-Sent Events for streaming; OAuth2 auth" },
          { id: "agent2",  label: "Research Agent\n(CrewAI)", x: 640, y: 110, color: C.teal,   w: 160, h: 60, tooltip: "Built on CrewAI — different framework, same A2A interface" },
          { id: "agent3",  label: "Code Agent\n(AutoGen)", x: 640, y: 270, color: C.purple, w: 160, h: 60, tooltip: "Built on AutoGen — completely different framework" },
          { id: "card2",   label: "AgentCard",  x: 790, y: 80,  color: C.gray,   w: 110, h: 38 },
          { id: "card3",   label: "AgentCard",  x: 790, y: 310, color: C.gray,   w: 110, h: 38 },
          { id: "task",    label: "Task Object", x: 420, y: 70,  color: C.pink,   w: 130, h: 44, tooltip: "Structured task: id, message, streaming updates, artifacts" },
        ],
        edges: [
          { from: "agent1", to: "card1",  label: "publishes", dashed: true },
          { from: "agent1", to: "http",   label: "POST /tasks" },
          { from: "http",   to: "agent2", label: "delegate" },
          { from: "http",   to: "agent3", label: "delegate" },
          { from: "agent2", to: "card2",  dashed: true },
          { from: "agent3", to: "card3",  dashed: true },
          { from: "agent2", to: "http",   label: "stream result", dashed: true },
          { from: "agent3", to: "http",   label: "stream result", dashed: true },
          { from: "http",   to: "agent1", label: "artifact", dashed: true },
          { from: "task",   to: "http",   label: "schema" },
        ],
      },
    ],
  },

  // ───────── TRANSFORMER INTERNALS ──────────────────────────────────────────
  {
    moduleSlug: "transformer-internals",
    diagrams: [
      {
        id: "self-attention",
        title: "Scaled Dot-Product Self-Attention",
        description: "Each token attends to all others by computing Query·Key scores, scaling by √dₖ, applying softmax to get weights, then multiplying Values. This runs h times in parallel (Multi-Head).",
        viewH: 420,
        nodes: [
          { id: "input",  label: "Input Embeddings\n(+ Position)", x: 450, y: 50,  color: C.gray,   w: 200, h: 50, tooltip: "Token embeddings + RoPE or sinusoidal position encoding" },
          { id: "wq",     label: "Wq  (Query)",      x: 200, y: 155, color: C.blue,   w: 130, h: 42, tooltip: "Linear projection: X × Wq → Q ∈ ℝ^(n×dₖ)" },
          { id: "wk",     label: "Wk  (Key)",        x: 450, y: 155, color: C.teal,   w: 130, h: 42, tooltip: "Linear projection: X × Wk → K ∈ ℝ^(n×dₖ)" },
          { id: "wv",     label: "Wv  (Value)",      x: 700, y: 155, color: C.green,  w: 130, h: 42, tooltip: "Linear projection: X × Wv → V ∈ ℝ^(n×dv)" },
          { id: "qk",     label: "Q·Kᵀ / √dₖ",     x: 320, y: 255, color: C.amber,  w: 150, h: 48, tooltip: "Attention score matrix A ∈ ℝ^(n×n) — quadratic in n" },
          { id: "mask",   label: "Causal Mask",      x: 150, y: 255, color: C.red,    w: 130, h: 40, tooltip: "Sets upper triangle to -∞ so tokens can't attend to future" },
          { id: "softmax",label: "Softmax",           x: 290, y: 340, color: C.orange, w: 125, h: 44, tooltip: "Row-wise softmax → attention weights sum to 1" },
          { id: "av",     label: "Attn × V",         x: 490, y: 340, color: C.pink,   w: 130, h: 44, tooltip: "Weighted sum of values: O = softmax(QKᵀ/√dₖ) × V" },
          { id: "wo",     label: "Wo  (Output)",     x: 680, y: 340, color: C.purple, w: 130, h: 44, tooltip: "Final linear projection to model dimension d_model" },
          { id: "out",    label: "Attention Output", x: 450, y: 425, color: C.gray,   w: 190, h: 44, tooltip: "Passed to Feed-Forward Network + residual connection" },
        ],
        edges: [
          { from: "input",   to: "wq" },
          { from: "input",   to: "wk" },
          { from: "input",   to: "wv" },
          { from: "wq",      to: "qk",     label: "Q" },
          { from: "wk",      to: "qk",     label: "K" },
          { from: "mask",    to: "qk",     label: "mask", color: C.red, dashed: true },
          { from: "qk",      to: "softmax" },
          { from: "softmax", to: "av",     label: "weights" },
          { from: "wv",      to: "av",     label: "V" },
          { from: "av",      to: "wo" },
          { from: "wo",      to: "out" },
        ],
        legend: [
          { color: C.blue,   label: "Query (Q)" },
          { color: C.teal,   label: "Key (K)" },
          { color: C.green,  label: "Value (V)" },
          { color: C.amber,  label: "Score Matrix" },
          { color: C.orange, label: "Softmax" },
        ],
      },

      {
        id: "kv-cache",
        title: "KV Cache — Autoregressive Decoding",
        description: "During inference, keys and values for all past tokens are cached so only the new token's Q is computed each step — reducing decoding from O(n²) to O(n) per step.",
        viewH: 360,
        nodes: [
          { id: "t1",  label: "Token 1 (past)",   x: 120, y: 160, color: C.gray,   w: 150, h: 46 },
          { id: "t2",  label: "Token 2 (past)",   x: 320, y: 160, color: C.gray,   w: 150, h: 46 },
          { id: "tn",  label: "Token n (new)",    x: 550, y: 160, color: C.green,  w: 150, h: 46, tooltip: "Only the new token needs KV computed" },
          { id: "kv1", label: "K₁, V₁ cached",   x: 120, y: 280, color: C.purple, w: 150, h: 44, tooltip: "Stored in GPU memory — grows linearly with sequence length" },
          { id: "kv2", label: "K₂, V₂ cached",   x: 320, y: 280, color: C.purple, w: 150, h: 44 },
          { id: "kvn", label: "Kₙ, Vₙ  (new)",   x: 550, y: 280, color: C.teal,   w: 150, h: 44, tooltip: "Only new KV computed; cached for future steps" },
          { id: "attn",label: "Attention\n(new token only)", x: 720, y: 220, color: C.pink,   w: 160, h: 54, tooltip: "Qₙ attends to all K₁…Kₙ — O(n) not O(n²)" },
          { id: "out", label: "Next Token",       x: 850, y: 160, color: C.green,  w: 120, h: 40 },
        ],
        edges: [
          { from: "t1",  to: "kv1",  label: "precomputed", dashed: true },
          { from: "t2",  to: "kv2",  label: "precomputed", dashed: true },
          { from: "tn",  to: "kvn",  label: "compute now" },
          { from: "kv1", to: "attn", label: "K, V" },
          { from: "kv2", to: "attn", label: "K, V" },
          { from: "kvn", to: "attn", label: "K, V" },
          { from: "tn",  to: "attn", label: "Q only", color: C.green },
          { from: "attn",to: "out",  label: "predict" },
        ],
        groups: [
          { label: "KV Cache (GPU VRAM)", x: 75, y: 255, w: 640, h: 95, color: C.purple },
        ],
      },
    ],
  },

  // ───────── ADVANCED FINE-TUNING ───────────────────────────────────────────
  {
    moduleSlug: "advanced-fine-tuning",
    diagrams: [
      {
        id: "lora-architecture",
        title: "LoRA — Low-Rank Adaptation Architecture",
        description: "LoRA freezes the pre-trained weights W₀ and injects trainable low-rank matrices A (d×r) and B (r×d). Only A and B are updated, reducing trainable params by 10,000×.",
        viewH: 360,
        nodes: [
          { id: "input",  label: "Input x",           x: 100, y: 180, color: C.gray,   w: 110, h: 42 },
          { id: "w0",     label: "W₀ (frozen)\nd × d", x: 310, y: 120, color: C.gray,   w: 160, h: 54, tooltip: "Pre-trained weight matrix — FROZEN, not updated" },
          { id: "wa",     label: "A (trainable)\nd × r", x: 310, y: 240, color: C.blue,   w: 160, h: 54, tooltip: "Initialized randomly — rank r ≪ d" },
          { id: "wb",     label: "B (trainable)\nr × d", x: 510, y: 240, color: C.teal,   w: 160, h: 54, tooltip: "Initialized to zero — so ΔW=0 at training start" },
          { id: "h0",     label: "W₀x",               x: 510, y: 120, color: C.gray,   w: 110, h: 42, tooltip: "Original frozen forward pass" },
          { id: "delta",  label: "ΔW = BA·x\n(low-rank update)", x: 510, y: 310, color: C.purple, w: 180, h: 54, tooltip: "The learned adaptation — rank r ≪ d" },
          { id: "add",    label: "+ (merge)",          x: 670, y: 190, color: C.amber,  w: 110, h: 44, tooltip: "W₀x + α·BAx — α/r scales the adaptation" },
          { id: "out",    label: "Output h",           x: 820, y: 190, color: C.green,  w: 110, h: 42 },
        ],
        edges: [
          { from: "input", to: "w0",    label: "forward" },
          { from: "input", to: "wa",    label: "forward" },
          { from: "w0",    to: "h0",    label: "W₀x" },
          { from: "wa",    to: "wb",    label: "Ax" },
          { from: "wb",    to: "delta", label: "BAx" },
          { from: "h0",    to: "add",   label: "base" },
          { from: "delta", to: "add",   label: "α/r · ΔW", color: C.purple },
          { from: "add",   to: "out" },
        ],
        legend: [
          { color: C.gray,   label: "Frozen (pre-trained)" },
          { color: C.blue,   label: "Matrix A (trainable)" },
          { color: C.teal,   label: "Matrix B (trainable)" },
          { color: C.purple, label: "Low-rank update ΔW" },
        ],
      },

      {
        id: "dpo-pipeline",
        title: "DPO vs RLHF Post-Training Pipeline",
        description: "RLHF requires training a reward model then running PPO. DPO eliminates both by directly optimizing the LLM using preference pairs — fewer moving parts, more stable.",
        viewH: 400,
        nodes: [
          { id: "sft",     label: "SFT Model",         x: 80,  y: 210, color: C.blue,  w: 130, h: 48, tooltip: "Base: Supervised Fine-Tuning on (instruction, response) pairs" },

          // RLHF path (top lane)
          { id: "pref",    label: "Preference Data\n(chosen > rejected)", x: 310, y: 80, color: C.gray, w: 200, h: 54, tooltip: "Human annotators rank pairs: which response is better?" },
          { id: "rm",      label: "Reward Model",      x: 540, y: 80,  color: C.amber, w: 150, h: 48, tooltip: "RLHF: train RM on pairs → outputs scalar reward" },
          { id: "ppo",     label: "PPO Training",      x: 710, y: 80,  color: C.red,   w: 140, h: 48, tooltip: "Proximal Policy Optimization — complex, unstable" },
          { id: "rlhf",    label: "RLHF Model",        x: 860, y: 80,  color: C.green, w: 130, h: 44 },

          // DPO path (bottom lane)
          { id: "dpoloss", label: "DPO Loss\n-log σ(β·log π/πref)", x: 480, y: 270, color: C.purple, w: 200, h: 60, tooltip: "Implicit reward: reward(x,y) = β log (π_θ(y|x) / π_ref(y|x))" },
          { id: "ref",     label: "Reference Model\n(frozen SFT)", x: 250, y: 360, color: C.gray, w: 185, h: 54, tooltip: "KL constraint: keeps model from deviating too far from SFT" },
          { id: "dpo",     label: "DPO Model",         x: 730, y: 270, color: C.green, w: 130, h: 44 },
        ],
        edges: [
          { from: "sft",     to: "pref",    label: "train data" },
          { from: "pref",    to: "rm",      label: "RLHF →", color: C.amber },
          { from: "rm",      to: "ppo",     label: "reward signal" },
          { from: "ppo",     to: "rlhf",    label: "optimized" },
          { from: "pref",    to: "dpoloss", label: "DPO →", color: C.purple },
          { from: "sft",     to: "ref",     label: "copy (frozen)", dashed: true },
          { from: "ref",     to: "dpoloss", label: "π_ref", color: C.gray },
          { from: "sft",     to: "dpoloss", label: "π_θ (trained)", color: C.purple },
          { from: "dpoloss", to: "dpo",     label: "gradient update" },
        ],
        legend: [
          { color: C.amber,  label: "RLHF Reward Model" },
          { color: C.red,    label: "PPO (complex)" },
          { color: C.purple, label: "DPO (direct)" },
          { color: C.gray,   label: "Reference / Data" },
        ],
      },
    ],
  },

  // ───────── VISION-LANGUAGE MODELS ─────────────────────────────────────────
  {
    moduleSlug: "vision-language-models",
    diagrams: [
      {
        id: "llava-arch",
        title: "LLaVA VLM Architecture",
        description: "The standard VLM pattern: a frozen vision encoder (ViT-L) extracts patch tokens, a projection layer maps them to text embedding space, then the LLM generates conditioned on both.",
        viewH: 340,
        nodes: [
          { id: "img",    label: "Image\n(224×224)",   x: 90,  y: 170, color: C.gray,   w: 120, h: 54, tooltip: "Split into 14×14 = 196 patches (16×16 px each)" },
          { id: "vit",    label: "ViT Encoder\n(frozen)",      x: 270, y: 170, color: C.blue,   w: 155, h: 54, tooltip: "CLIP-ViT-L or SigLIP — converts patches to 257 tokens × 1024 dim" },
          { id: "proj",   label: "MLP Projector\n(trainable)", x: 470, y: 170, color: C.amber,  w: 165, h: 54, tooltip: "2-layer MLP: maps 1024-dim visual tokens → 4096-dim LLM space" },
          { id: "text",   label: "Text Tokens",               x: 470, y: 290, color: C.green,  w: 135, h: 44, tooltip: "User's text instruction tokenized normally" },
          { id: "concat", label: "Concat\n[visual | text]",   x: 670, y: 220, color: C.purple, w: 150, h: 54, tooltip: "Visual tokens prepended to text tokens in context window" },
          { id: "llm",    label: "LLM Decoder\n(Llama)",      x: 840, y: 170, color: C.pink,   w: 150, h: 54, tooltip: "Causal LM generates text conditioned on visual + text tokens" },
          { id: "out",    label: "Response",                  x: 840, y: 290, color: C.green,  w: 115, h: 40 },
        ],
        edges: [
          { from: "img",    to: "vit",    label: "196 patches" },
          { from: "vit",    to: "proj",   label: "visual tokens" },
          { from: "proj",   to: "concat", label: "projected tokens" },
          { from: "text",   to: "concat", label: "text tokens" },
          { from: "concat", to: "llm",    label: "full context" },
          { from: "llm",    to: "out",    label: "generate" },
        ],
        legend: [
          { color: C.blue,   label: "ViT Encoder (frozen)" },
          { color: C.amber,  label: "MLP Projector (trained)" },
          { color: C.pink,   label: "LLM Decoder" },
          { color: C.purple, label: "Token Merge" },
        ],
      },

      {
        id: "colpali",
        title: "ColPali — Multimodal Document RAG",
        description: "ColPali embeds document page images directly using a VLM (PaliGemma), producing multi-vector representations. MaxSim scoring retrieves visually-rich documents without any OCR.",
        viewH: 360,
        nodes: [
          { id: "pdfs",   label: "PDF / Docs",       x: 80,  y: 80,  color: C.gray,   w: 120, h: 44 },
          { id: "render", label: "Page Renderer",    x: 260, y: 80,  color: C.amber,  w: 150, h: 44, tooltip: "Render each page as a 448×448 image — no OCR needed" },
          { id: "vlm",    label: "PaliGemma VLM",    x: 460, y: 80,  color: C.blue,   w: 160, h: 48, tooltip: "Generates 1030 patch embeddings per page image" },
          { id: "idx",    label: "Multi-Vector\nIndex", x: 690, y: 80, color: C.purple, w: 150, h: 54, shape: "cylinder", tooltip: "Qdrant stores all 1030 vectors per page (not one per doc)" },
          { id: "query",  label: "User Query",       x: 80,  y: 280, color: C.green,  w: 120, h: 42 },
          { id: "qemb",   label: "Query Embedding",  x: 270, y: 280, color: C.teal,   w: 160, h: 44, tooltip: "Same VLM embeds the text query into the same space" },
          { id: "maxsim", label: "MaxSim Scoring",   x: 480, y: 280, color: C.orange, w: 160, h: 48, tooltip: "For each page: max cosine sim across all patch-query pairs" },
          { id: "vlm2",   label: "VLM (Answer)",     x: 690, y: 280, color: C.pink,   w: 150, h: 48, tooltip: "Top-k page images sent to VLM to generate the final answer" },
          { id: "out",    label: "Answer",           x: 840, y: 280, color: C.green,  w: 110, h: 40 },
        ],
        edges: [
          { from: "pdfs",   to: "render",  label: "each page" },
          { from: "render", to: "vlm",     label: "image" },
          { from: "vlm",    to: "idx",     label: "1030 vectors/page" },
          { from: "query",  to: "qemb" },
          { from: "qemb",   to: "maxsim",  label: "query vecs" },
          { from: "idx",    to: "maxsim",  label: "page vecs" },
          { from: "maxsim", to: "vlm2",    label: "top-k pages" },
          { from: "vlm2",   to: "out" },
        ],
      },
    ],
  },

  // ───────── MIXTURE OF EXPERTS ─────────────────────────────────────────────
  {
    moduleSlug: "mixture-of-experts",
    diagrams: [
      {
        id: "moe-routing",
        title: "MoE Expert Routing (Mixtral / DeepSeek Pattern)",
        description: "The router selects top-k experts for each token. Most parameters are inactive per token — giving N× more capacity at the same compute cost as a dense model.",
        viewH: 420,
        nodes: [
          { id: "token",  label: "Input Token x",   x: 100, y: 210, color: C.gray,   w: 150, h: 48 },
          { id: "attn",   label: "Attention Layer\n(shared)",  x: 280, y: 210, color: C.blue,  w: 170, h: 54, tooltip: "Standard multi-head attention — same for all tokens" },
          { id: "router", label: "Router\n(linear + top-k)",  x: 480, y: 210, color: C.amber, w: 170, h: 54, tooltip: "gate = softmax(Wx) → select k=2 highest scoring experts" },
          { id: "e1",     label: "Expert 1\n(FFN)",  x: 700, y: 80,  color: C.teal,   w: 140, h: 48, tooltip: "Standard FFN: Linear → GELU → Linear" },
          { id: "e2",     label: "Expert 2\n(FFN)",  x: 700, y: 160, color: C.teal,   w: 140, h: 48 },
          { id: "e3",     label: "Expert 3\n(FFN)",  x: 700, y: 240, color: C.gray,   w: 140, h: 48, tooltip: "NOT activated for this token" },
          { id: "e4",     label: "Expert 4\n(FFN)",  x: 700, y: 320, color: C.gray,   w: 140, h: 48 },
          { id: "e5",     label: "Expert 5\n(FFN)",  x: 700, y: 400, color: C.gray,   w: 140, h: 48 },
          { id: "topk",   label: "Weighted Sum\n(top-k only)", x: 840, y: 240, color: C.pink, w: 160, h: 54, tooltip: "Output = Σ gate_i × Expert_i(x) for top-k experts only" },
          { id: "out",    label: "Token Output",    x: 840, y: 370, color: C.green,  w: 140, h: 44 },
        ],
        edges: [
          { from: "token",  to: "attn" },
          { from: "attn",   to: "router" },
          { from: "router", to: "e1",   label: "gate₁=0.6", color: C.teal },
          { from: "router", to: "e2",   label: "gate₂=0.4", color: C.teal },
          { from: "router", to: "e3",   label: "dropped", dashed: true, color: C.gray },
          { from: "router", to: "e4",   label: "dropped", dashed: true, color: C.gray },
          { from: "router", to: "e5",   label: "dropped", dashed: true, color: C.gray },
          { from: "e1",     to: "topk", color: C.teal },
          { from: "e2",     to: "topk", color: C.teal },
          { from: "topk",   to: "out" },
        ],
        legend: [
          { color: C.teal,  label: "Active experts (top-k=2)" },
          { color: C.gray,  label: "Inactive experts" },
          { color: C.amber, label: "Router (gating)" },
          { color: C.pink,  label: "Weighted merge" },
        ],
        groups: [
          { label: "8 Experts (only 2 active per token)", x: 660, y: 55, w: 195, h: 370, color: C.teal },
        ],
      },
    ],
  },

  // ───────── SPEECH AI ──────────────────────────────────────────────────────
  {
    moduleSlug: "speech-ai",
    diagrams: [
      {
        id: "whisper-pipeline",
        title: "Whisper ASR Pipeline",
        description: "Whisper converts audio → log-Mel spectrogram → convolutional stem → encoder → autoregressive decoder with task conditioning tokens.",
        viewH: 360,
        nodes: [
          { id: "audio",   label: "Audio Waveform\n(16kHz)",   x: 90,  y: 180, color: C.gray,   w: 170, h: 54 },
          { id: "stft",    label: "STFT + Mel\nFilterbank",    x: 280, y: 180, color: C.amber,  w: 160, h: 54, tooltip: "25ms windows, hop 10ms → 80 Mel bands → log scale" },
          { id: "conv",    label: "Conv1D Stem\n(×2)",         x: 470, y: 180, color: C.blue,   w: 150, h: 54, tooltip: "2 × Conv1D with GELU — processes 3000 time frames" },
          { id: "enc",     label: "Transformer\nEncoder",      x: 660, y: 180, color: C.teal,   w: 160, h: 54, tooltip: "Standard bidirectional transformer on spectrogram" },
          { id: "tokens",  label: "Task Tokens\n<|en|><|transcribe|>", x: 280, y: 60, color: C.purple, w: 210, h: 54, tooltip: "Special tokens condition decoder on language and task" },
          { id: "dec",     label: "Transformer\nDecoder",      x: 820, y: 180, color: C.pink,   w: 160, h: 54, tooltip: "Cross-attends to encoder output — autoregressive generation" },
          { id: "text",    label: "Transcript",               x: 820, y: 310, color: C.green,  w: 140, h: 44 },
        ],
        edges: [
          { from: "audio",  to: "stft",   label: "raw PCM" },
          { from: "stft",   to: "conv",   label: "80×3000" },
          { from: "conv",   to: "enc",    label: "feature map" },
          { from: "enc",    to: "dec",    label: "cross-attention keys" },
          { from: "tokens", to: "dec",    label: "conditioning", color: C.purple },
          { from: "dec",    to: "text",   label: "tokens" },
        ],
        legend: [
          { color: C.amber, label: "Audio Processing" },
          { color: C.teal,  label: "Encoder" },
          { color: C.pink,  label: "Decoder" },
          { color: C.purple,"label": "Task Conditioning" },
        ],
      },
    ],
  },

  // ───────── KNOWLEDGE DISTILLATION ─────────────────────────────────────────
  {
    moduleSlug: "knowledge-distillation",
    diagrams: [
      {
        id: "distillation-pipeline",
        title: "Knowledge Distillation — Teacher-Student Training",
        description: "The student is trained on soft labels (temperature-scaled logits) from the teacher plus the hard ground-truth labels. This transfers the teacher's knowledge without its size.",
        viewH: 380,
        nodes: [
          { id: "data",    label: "Training Data",   x: 100, y: 190, color: C.gray,   w: 140, h: 48 },
          { id: "teacher", label: "Teacher Model\n(large, frozen)", x: 320, y: 100, color: C.blue,  w: 180, h: 56, tooltip: "e.g. LLaMA-70B — frozen, not updated, provides soft targets" },
          { id: "student", label: "Student Model\n(small, trained)", x: 320, y: 290, color: C.teal,  w: 180, h: 56, tooltip: "e.g. LLaMA-7B — trained on teacher's soft labels" },
          { id: "tlogits", label: "Soft Logits\n(Temp T=4)",  x: 540, y: 100, color: C.amber, w: 160, h: 54, tooltip: "Temperature T flattens distribution: reveals inter-class knowledge" },
          { id: "slogits", label: "Student Logits",           x: 540, y: 290, color: C.teal,  w: 150, h: 48 },
          { id: "hardlbl", label: "Ground Truth\n(one-hot)",  x: 540, y: 190, color: C.gray,  w: 150, h: 48 },
          { id: "kl",      label: "KL Divergence\nLoss",      x: 730, y: 100, color: C.orange, w: 150, h: 54, tooltip: "KL(T_soft || S_soft) — student learns teacher's uncertainty" },
          { id: "ce",      label: "Cross-Entropy\nLoss",      x: 730, y: 250, color: C.purple, w: 150, h: 48, tooltip: "CE(y_hard, S_logits) — standard task loss" },
          { id: "total",   label: "Total Loss\nα·KL + (1-α)·CE", x: 840, y: 200, color: C.pink, w: 170, h: 56, tooltip: "α≈0.7, balanced distillation + task objectives" },
        ],
        edges: [
          { from: "data",    to: "teacher",  label: "forward pass" },
          { from: "data",    to: "student",  label: "forward pass" },
          { from: "data",    to: "hardlbl" },
          { from: "teacher", to: "tlogits",  label: "÷T then softmax" },
          { from: "student", to: "slogits" },
          { from: "tlogits", to: "kl",       label: "teacher dist." },
          { from: "slogits", to: "kl",       label: "student dist." },
          { from: "slogits", to: "ce" },
          { from: "hardlbl", to: "ce" },
          { from: "kl",      to: "total",    label: "α ×" },
          { from: "ce",      to: "total",    label: "(1-α) ×" },
          { from: "total",   to: "student",  label: "backprop", color: C.pink, dashed: true },
        ],
      },
    ],
  },

  // ───────── AI SECURITY & RBAC ─────────────────────────────────────────────
  {
    moduleSlug: "ai-security-rbac",
    diagrams: [
      {
        id: "ai-security-stack",
        title: "Production AI Security Stack",
        description: "A layered defense for LLM APIs: input guardrails → authentication → RBAC → rate limiting → PII masking → LLM call → output guardrails → audit log.",
        viewH: 420,
        nodes: [
          { id: "user",    label: "User Request",    x: 80,  y: 210, color: C.green,  w: 130, h: 46 },
          { id: "jwt",     label: "JWT Auth\n+ RBAC",  x: 250, y: 210, color: C.blue,   w: 150, h: 54, tooltip: "Verify JWT signature → extract role → enforce access policy" },
          { id: "rate",    label: "Rate Limiter",    x: 420, y: 140, color: C.amber,  w: 140, h: 48, tooltip: "Per-user / per-tenant token and request limits" },
          { id: "ingrd",   label: "Input\nGuardrails",x: 420, y: 280, color: C.red,    w: 150, h: 54, tooltip: "Prompt injection detection, jailbreak classifier, topical rails" },
          { id: "pii",     label: "PII Masking\n(Presidio)", x: 600, y: 210, color: C.orange, w: 170, h: 54, tooltip: "Detect and anonymize: names, SSNs, emails, credit cards" },
          { id: "llm",     label: "LLM",             x: 780, y: 210, color: C.pink,   w: 110, h: 48 },
          { id: "outgrd",  label: "Output\nGuardrails",x: 780, y: 340, color: C.red,   w: 150, h: 54, tooltip: "LlamaGuard / NeMo: check response for PII, hallucination, toxicity" },
          { id: "audit",   label: "Audit Log",       x: 600, y: 370, color: C.purple, w: 140, h: 48, tooltip: "Immutable log: who queried what, when, with what context" },
          { id: "block",   label: "🚫 Block",         x: 250, y: 380, color: C.red,    w: 110, h: 40, shape: "rounded" },
          { id: "resp",    label: "Safe Response",   x: 780, y: 80,  color: C.green,  w: 140, h: 44 },
        ],
        edges: [
          { from: "user",   to: "jwt",    label: "request" },
          { from: "jwt",    to: "block",  label: "unauthorized", color: C.red, dashed: true },
          { from: "jwt",    to: "rate",   label: "authed" },
          { from: "jwt",    to: "ingrd",  label: "authed" },
          { from: "rate",   to: "block",  label: "exceeded", color: C.red, dashed: true },
          { from: "ingrd",  to: "block",  label: "injection detected", color: C.red, dashed: true },
          { from: "rate",   to: "pii",    label: "allowed" },
          { from: "ingrd",  to: "pii",    label: "safe" },
          { from: "pii",    to: "llm",    label: "masked input" },
          { from: "llm",    to: "outgrd", label: "raw output" },
          { from: "outgrd", to: "audit",  label: "log everything", color: C.purple },
          { from: "outgrd", to: "resp",   label: "safe output", color: C.green },
        ],
        legend: [
          { color: C.blue,   label: "Auth / RBAC" },
          { color: C.red,    label: "Guardrails / Block" },
          { color: C.orange, label: "PII Masking" },
          { color: C.purple, label: "Audit" },
        ],
      },
    ],
  },

  // ───────── LLMOPS & OBSERVABILITY ─────────────────────────────────────────
  {
    moduleSlug: "llmops-observability",
    diagrams: [
      {
        id: "llmops-cicd",
        title: "LLMOps CI/CD Pipeline",
        description: "LLM CI/CD extends standard DevOps with prompt regression tests, model evaluation, cost estimation, and container builds — gating on quality before deployment to EKS.",
        viewH: 400,
        nodes: [
          { id: "pr",     label: "Pull Request\n(prompt / code change)", x: 100, y: 200, color: C.gray,   w: 190, h: 56 },
          { id: "unit",   label: "Unit Tests",      x: 320, y: 120, color: C.blue,   w: 140, h: 48, tooltip: "Standard pytest: data validation, config checks, etc." },
          { id: "prompt", label: "Prompt Regression\nTests", x: 320, y: 220, color: C.amber, w: 180, h: 56, tooltip: "Golden examples run through new prompt — assert semantic quality ≥ threshold" },
          { id: "eval",   label: "LLM Evaluation\n(RAGAS / MT-Bench)", x: 320, y: 330, color: C.purple, w: 200, h: 56, tooltip: "Full benchmark evaluation — blocks deployment if score drops" },
          { id: "cost",   label: "Cost Estimation",x: 540, y: 200, color: C.orange, w: 160, h: 48, tooltip: "Estimate $ cost of new prompt on prod traffic before merging" },
          { id: "docker", label: "Docker Build\n+ ECR Push", x: 720, y: 120, color: C.teal,   w: 170, h: 54, tooltip: "Multi-stage build → push to AWS ECR" },
          { id: "eks",    label: "EKS Deploy\n(Rolling update)", x: 720, y: 250, color: C.blue,   w: 170, h: 54, tooltip: "kubectl apply → rolling update → health check → traffic cut" },
          { id: "trace",  label: "LangSmith\nTracing", x: 720, y: 370, color: C.pink,   w: 160, h: 48, tooltip: "Auto-trace all LLM calls — catch regressions in production" },
          { id: "gate",   label: "Quality Gate",   x: 540, y: 330, color: C.green,  w: 150, h: 48, shape: "diamond", tooltip: "All checks must pass: unit ✓, prompt ✓, eval ✓, cost ✓" },
          { id: "fail",   label: "🚫 Block Merge", x: 540, y: 60,  color: C.red,    w: 140, h: 40, shape: "rounded" },
        ],
        edges: [
          { from: "pr",     to: "unit",   label: "trigger" },
          { from: "pr",     to: "prompt", label: "trigger" },
          { from: "pr",     to: "eval",   label: "trigger" },
          { from: "unit",   to: "fail",   label: "FAIL", color: C.red, dashed: true },
          { from: "prompt", to: "fail",   label: "FAIL", color: C.red, dashed: true },
          { from: "unit",   to: "cost",   label: "pass", color: C.green },
          { from: "prompt", to: "cost",   label: "pass", color: C.green },
          { from: "eval",   to: "gate",   label: "score" },
          { from: "cost",   to: "gate",   label: "budget OK" },
          { from: "gate",   to: "docker", label: "PASS", color: C.green },
          { from: "gate",   to: "fail",   label: "FAIL", color: C.red, dashed: true },
          { from: "docker", to: "eks",    label: "deploy" },
          { from: "eks",    to: "trace",  label: "observe" },
        ],
        legend: [
          { color: C.amber,  label: "Prompt Testing" },
          { color: C.purple, label: "LLM Evaluation" },
          { color: C.orange, label: "Cost Check" },
          { color: C.teal,   label: "Build & Deploy" },
        ],
      },
    ],
  },

  // ───────── SYNTHETIC DATA ENGINEERING ────────────────────────────────────
  {
    moduleSlug: "synthetic-data-engineering",
    diagrams: [
      {
        id: "data-flywheel",
        title: "LLM Data Flywheel — Llama 3 Pattern",
        description: "Iterative self-improvement: SFT → generate responses → reward model scores → rejection sampling → better SFT data → repeat. Each iteration improves the model.",
        viewH: 380,
        nodes: [
          { id: "seed",    label: "Seed Data\n(human-written)", x: 100, y: 190, color: C.gray,   w: 170, h: 54, tooltip: "175 high-quality seed examples (Self-Instruct pattern)" },
          { id: "evol",    label: "Evol-Instruct\n(LLM generates more)", x: 310, y: 100, color: C.amber, w: 200, h: 56, tooltip: "LLM evolves seeds: add constraints, increase complexity, combine skills" },
          { id: "llmgen",  label: "LLM Generates\nResponses", x: 310, y: 250, color: C.blue,   w: 190, h: 54, tooltip: "Current best model generates N completions per prompt" },
          { id: "rm",      label: "Reward Model\n(scores quality)", x: 560, y: 175, color: C.purple, w: 180, h: 56, tooltip: "RM scores each completion 0-10 on helpfulness, accuracy, safety" },
          { id: "filter",  label: "Rejection Sampling\n(top 20-30%)", x: 760, y: 175, color: C.orange, w: 190, h: 56, tooltip: "Keep only high-reward completions — eliminates low-quality data" },
          { id: "dedup",   label: "Dedup + Filter\n(MinHash LSH)", x: 560, y: 320, color: C.teal,   w: 190, h: 54, tooltip: "Remove near-duplicates (Jaccard > 0.7) and apply quality filters" },
          { id: "sft",     label: "SFT Training\n(next iteration)", x: 760, y: 330, color: C.pink,   w: 190, h: 54, tooltip: "Train on filtered high-quality data → better model → better data" },
        ],
        edges: [
          { from: "seed",   to: "evol",   label: "expand" },
          { from: "seed",   to: "llmgen", label: "prompts" },
          { from: "evol",   to: "llmgen", label: "evolved prompts" },
          { from: "llmgen", to: "rm",     label: "candidates" },
          { from: "rm",     to: "filter", label: "scores" },
          { from: "filter", to: "dedup",  label: "top-k" },
          { from: "dedup",  to: "sft",    label: "clean data" },
          { from: "sft",    to: "llmgen", label: "better model →\nbetter data", color: C.pink, dashed: true },
        ],
        legend: [
          { color: C.amber,  label: "Instruction Generation" },
          { color: C.purple, label: "Reward Scoring" },
          { color: C.orange, label: "Rejection Sampling" },
          { color: C.pink,   label: "Iterative Training" },
        ],
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Helper: get diagrams for a given module slug
// ─────────────────────────────────────────────────────────────────────────────
export function getDiagramsForModule(slug: string): Diagram[] {
  return allModuleDiagrams.find((m) => m.moduleSlug === slug)?.diagrams ?? []
}

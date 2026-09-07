import type { ProductConfig } from "./types";

export const product: ProductConfig = {
  id: "atlas",
  name: "Atlas",
  category: "Service & Support",
  tagline: "A wiki whose search respects your permissions.",
  description: "A self-hosted knowledge base with nested spaces, versioned pages, review ownership, and permission-safe search.",
  repositoryUrl: "https://github.com/ConseilTek-Tektons/atlas",
  nav: [{ label: "Home" }, { label: "Spaces" }, { label: "Search" }, { label: "Reviews", badge: "27" }],
  demoUsers: [
    { id: "demo-admin", name: "Maya Chen", email: "maya@northstar.example", role: "admin", label: "Knowledge admin" },
    { id: "demo-manager", name: "Jon Bell", email: "jon@northstar.example", role: "editor", label: "Space editor" },
    { id: "demo-host", name: "Priya Rao", email: "priya@northstar.example", role: "reader", label: "Knowledge reader" },
  ],
  ai: {
    name: "Knowledge copilot",
    description: "Ask questions across pages you can read, with live permission filtering and citations.",
    systemPrompt: "You are Atlas's knowledge copilot. Answer only from approved pages that the current user is allowed to read. Cite page titles, reveal nothing about filtered candidates, and never alter content or permissions.",
    suggestedQuestions: ["What is the production rollback process?", "Which pages need review?", "How does permission-safe search work?"],
  },
};

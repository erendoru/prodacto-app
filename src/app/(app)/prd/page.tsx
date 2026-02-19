"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Plus, Loader2, Trash2, Clock, FolderKanban, Search } from "lucide-react";

interface PRDDoc {
  id: string;
  title: string;
  template_type: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  projects?: { name: string };
}

const templateLabels: Record<string, string> = {
  feature_prd: "Feature PRD",
  technical_spec: "Technical Spec",
  one_pager: "One-Pager",
  bug_fix: "Bug Fix PRD",
  experiment: "Experiment Brief",
};

export default function PRDListPage() {
  const [docs, setDocs] = useState<PRDDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/prd").then((r) => r.ok ? r.json() : []).then(setDocs).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    const res = await fetch(`/api/prd/${id}`, { method: "DELETE" });
    if (res.ok) setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const filtered = docs.filter((d) => !search || d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />PRD Generator
          </h1>
          <p className="mt-1 text-sm text-text-secondary">AI-powered product requirement documents</p>
        </div>
        <Link href="/prd/create"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
          <Plus className="h-4 w-4" />New PRD
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" placeholder="Search documents..." />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FileText className="mx-auto h-10 w-10 text-text-tertiary/50" />
          <p className="mt-4 text-sm font-medium text-text-secondary">No documents yet</p>
          <p className="mt-1 text-xs text-text-tertiary">Create your first PRD with AI assistance</p>
          <Link href="/prd/create"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-dark">
            <Plus className="h-3.5 w-3.5" />Create PRD
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-border-hover">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <Link href={`/prd/${doc.id}`} className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground hover:text-primary">{doc.title}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-text-tertiary">
                  <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{templateLabels[doc.template_type || ""] || doc.template_type}</span>
                  {doc.projects && <span className="flex items-center gap-1"><FolderKanban className="h-3 w-3" />{doc.projects.name}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(doc.updated_at).toLocaleDateString()}</span>
                  <span>v{doc.version}</span>
                </div>
              </Link>
              <button onClick={() => handleDelete(doc.id)}
                className="rounded-md p-1.5 text-text-tertiary hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

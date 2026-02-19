"use client";

import { useState, useEffect } from "react";
import {
  Shield, Loader2, Star, AlertTriangle, Lightbulb, ChevronDown, ChevronUp,
  FileText, ListChecks, Target,
} from "lucide-react";
import clsx from "clsx";

interface Project { id: string; name: string; }

interface ReviewCategory {
  score: number;
  feedback: string;
}

interface ReviewResult {
  overall_score: number;
  categories: Record<string, ReviewCategory>;
  missing_tasks?: string[];
  missing_sections?: string[];
  risk_flags?: string[];
  suggestions?: string[];
  cpo_verdict: string;
}

export default function AIReviewPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [contentType, setContentType] = useState<"backlog" | "prd" | "general">("backlog");
  const [customContent, setCustomContent] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.ok ? r.json() : []).then(setProjects);
  }, []);

  const handleReview = async () => {
    setReviewing(true);
    setReview(null);
    try {
      let content: string | object = customContent;

      if (contentType === "backlog" && selectedProject) {
        const res = await fetch(`/api/backlog?projectId=${selectedProject}`);
        if (res.ok) content = await res.json();
      } else if (contentType === "prd" && selectedProject) {
        const res = await fetch(`/api/prd?projectId=${selectedProject}`);
        if (res.ok) {
          const docs = await res.json();
          if (docs.length > 0) content = docs[0].content;
        }
      }

      const res = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject || undefined, contentType, content }),
      });
      if (res.ok) setReview(await res.json());
    } catch { /* ignore */ }
    setReviewing(false);
  };

  const getScoreColor = (score: number) =>
    score >= 7 ? "text-green-600 bg-green-50" : score >= 4 ? "text-amber-600 bg-amber-50" : "text-red-600 bg-red-50";
  const getBarColor = (score: number) =>
    score >= 7 ? "bg-green-500" : score >= 4 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />AI Review & Coaching
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Get CPO-level feedback on your backlog, PRD, or any product content</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Project</label>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Select project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-foreground">What to review</label>
            <div className="flex gap-2">
              {[
                { key: "backlog" as const, label: "Backlog Items", icon: ListChecks },
                { key: "prd" as const, label: "PRD", icon: FileText },
                { key: "general" as const, label: "Custom Content", icon: Target },
              ].map((t) => (
                <button key={t.key} onClick={() => setContentType(t.key)}
                  className={clsx("flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                    contentType === t.key ? "border-primary bg-primary/5 text-primary" : "border-border text-text-tertiary hover:border-border-hover")}>
                  <t.icon className="h-3.5 w-3.5" />{t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {contentType === "general" && (
          <textarea value={customContent} onChange={(e) => setCustomContent(e.target.value)} rows={6}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="Paste any product content here — user stories, feature specs, release notes, etc." />
        )}

        <button onClick={handleReview} disabled={reviewing || (!selectedProject && contentType !== "general") || (contentType === "general" && !customContent.trim())}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
          {reviewing ? <><Loader2 className="h-4 w-4 animate-spin" />Reviewing...</> : <><Shield className="h-4 w-4" />Start AI Review</>}
        </button>
      </div>

      {review && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5">
            <div className={clsx("flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black", getScoreColor(review.overall_score))}>
              {review.overall_score}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">CPO Verdict</h3>
              <p className="mt-1 text-sm text-text-secondary">{review.cpo_verdict}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5"><Star className="h-4 w-4 text-primary" />Category Scores</h3>
            {Object.entries(review.categories).map(([key, val]) => (
              <div key={key}>
                <button onClick={() => setExpandedCategory(expandedCategory === key ? null : key)} className="flex w-full items-center gap-3">
                  <span className="w-28 text-left text-xs font-medium text-text-secondary capitalize">{key.replace(/_/g, " ")}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div className={clsx("h-full rounded-full transition-all", getBarColor(val.score))} style={{ width: `${val.score * 10}%` }} />
                  </div>
                  <span className={clsx("w-10 text-right text-xs font-bold", val.score >= 7 ? "text-green-600" : val.score >= 4 ? "text-amber-600" : "text-red-600")}>
                    {val.score}/10
                  </span>
                  {expandedCategory === key ? <ChevronUp className="h-3.5 w-3.5 text-text-tertiary" /> : <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />}
                </button>
                {expandedCategory === key && <p className="mt-1 ml-32 text-xs text-text-tertiary">{val.feedback}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(review.risk_flags || []).length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <h4 className="mb-2 flex items-center gap-1 text-xs font-bold text-red-700"><AlertTriangle className="h-3.5 w-3.5" />Risk Flags</h4>
                <ul className="space-y-1">{review.risk_flags!.map((r, i) => <li key={i} className="text-xs text-red-700">• {r}</li>)}</ul>
              </div>
            )}
            {(review.suggestions || []).length > 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 flex items-center gap-1 text-xs font-bold text-blue-700"><Lightbulb className="h-3.5 w-3.5" />Suggestions</h4>
                <ul className="space-y-1">{review.suggestions!.map((s, i) => <li key={i} className="text-xs text-blue-700">• {s}</li>)}</ul>
              </div>
            )}
            {(review.missing_tasks || review.missing_sections || []).length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:col-span-2">
                <h4 className="mb-2 flex items-center gap-1 text-xs font-bold text-amber-700"><AlertTriangle className="h-3.5 w-3.5" />Missing Items</h4>
                <ul className="space-y-1">{(review.missing_tasks || review.missing_sections || []).map((m, i) => <li key={i} className="text-xs text-amber-700">• {m}</li>)}</ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

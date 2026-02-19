"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2, Pencil, Save, X, Sparkles, Star, AlertTriangle, CheckCircle2, Lightbulb, Clock } from "lucide-react";
import clsx from "clsx";

interface PRDDoc {
  id: string;
  title: string;
  content: string;
  template_type: string | null;
  ai_score: Record<string, unknown> | null;
  version: number;
  created_at: string;
  updated_at: string;
  projects?: { name: string };
}

interface ReviewResult {
  scores: Record<string, { score: number; feedback: string }>;
  overall_score: number;
  strengths: string[];
  gaps: { section: string; issue: string; suggestion: string }[];
  dev_perspective: string;
  quick_wins: string[];
}

export default function PRDDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<PRDDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);

  useEffect(() => {
    fetch(`/api/prd/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setDoc)
      .catch(() => router.push("/prd"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSave = async () => {
    if (!doc) return;
    setSaving(true);
    const res = await fetch(`/api/prd/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, content: editContent, _changeSummary: "Manual edit" }),
    });
    if (res.ok) { const updated = await res.json(); setDoc({ ...doc, ...updated }); setEditing(false); }
    setSaving(false);
  };

  const handleReview = async () => {
    if (!doc) return;
    setReviewing(true);
    try {
      const res = await fetch("/api/prd/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: doc.content, type: doc.template_type || "PRD" }),
      });
      if (res.ok) setReview(await res.json());
    } catch { /* ignore */ }
    setReviewing(false);
  };

  if (loading || !doc) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Link href="/prd" className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover"><ArrowLeft className="h-4 w-4" /></Link>
        <div className="flex-1">
          {editing ? (
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
              className="text-2xl font-bold text-foreground bg-transparent outline-none border-b border-primary w-full" />
          ) : (
            <h1 className="text-2xl font-bold text-foreground">{doc.title}</h1>
          )}
          <div className="mt-1 flex items-center gap-3 text-xs text-text-tertiary">
            {doc.projects && <span>{doc.projects.name}</span>}
            <span>v{doc.version}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(doc.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save
              </button>
              <button onClick={() => setEditing(false)} className="rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-surface-hover"><X className="h-4 w-4" /></button>
            </>
          ) : (
            <>
              <button onClick={() => { setEditContent(doc.content); setEditTitle(doc.title); setEditing(true); }}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-hover">
                <Pencil className="h-4 w-4" />Edit
              </button>
              <button onClick={handleReview} disabled={reviewing}
                className="flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
                {reviewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}AI Review
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className={clsx("space-y-4", review ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="rounded-xl border border-border bg-surface p-6">
            {editing ? (
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={30}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-mono outline-none focus:border-primary" />
            ) : (
              <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap">{doc.content}</div>
            )}
          </div>
        </div>

        {review && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">AI Review</h3>
                <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-bold",
                  review.overall_score >= 7 ? "bg-green-50 text-green-600" : review.overall_score >= 4 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600")}>
                  {review.overall_score}/10
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(review.scores).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-text-secondary capitalize">{key}</span>
                      <span className="font-bold text-foreground">{val.score}/10</span>
                    </div>
                    <div className="mt-0.5 h-1.5 w-full rounded-full bg-muted">
                      <div className={clsx("h-full rounded-full", val.score >= 7 ? "bg-green-500" : val.score >= 4 ? "bg-amber-500" : "bg-red-500")}
                        style={{ width: `${val.score * 10}%` }} />
                    </div>
                    <p className="mt-0.5 text-[10px] text-text-tertiary">{val.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {review.strengths.length > 0 && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <h4 className="mb-2 flex items-center gap-1 text-xs font-bold text-green-700"><CheckCircle2 className="h-3.5 w-3.5" />Strengths</h4>
                <ul className="space-y-1">{review.strengths.map((s, i) => <li key={i} className="text-xs text-green-700">{s}</li>)}</ul>
              </div>
            )}

            {review.gaps.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h4 className="mb-2 flex items-center gap-1 text-xs font-bold text-amber-700"><AlertTriangle className="h-3.5 w-3.5" />Gaps</h4>
                <div className="space-y-2">
                  {review.gaps.map((g, i) => (
                    <div key={i}><p className="text-xs font-medium text-amber-800">{g.section}: {g.issue}</p><p className="text-[10px] text-amber-600">Fix: {g.suggestion}</p></div>
                  ))}
                </div>
              </div>
            )}

            {review.quick_wins.length > 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 flex items-center gap-1 text-xs font-bold text-blue-700"><Lightbulb className="h-3.5 w-3.5" />Quick Wins</h4>
                <ul className="space-y-1">{review.quick_wins.map((w, i) => <li key={i} className="text-xs text-blue-700">{w}</li>)}</ul>
              </div>
            )}

            {review.dev_perspective && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <h4 className="mb-1 text-xs font-bold text-foreground">Developer Perspective</h4>
                <p className="text-xs text-text-secondary">{review.dev_perspective}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

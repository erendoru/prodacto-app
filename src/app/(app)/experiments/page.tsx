"use client";

import { useState, useEffect } from "react";
import {
  FlaskConical, Plus, Loader2, Trash2, Sparkles, Target, BarChart3,
  Clock, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle,
} from "lucide-react";
import clsx from "clsx";

interface Project { id: string; name: string; }
interface Metric { name: string; measurement?: string; }
interface Variant { name: string; description: string; }
interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  description: string | null;
  metrics: Metric[];
  variants: Variant[];
  sample_size: number | null;
  duration_days: number | null;
  status: string;
  results: Record<string, unknown> | null;
  ai_recommendations: Record<string, unknown> | null;
  created_at: string;
  projects?: { name: string };
}

interface AnalysisResult {
  improved_hypothesis: string;
  recommended_metrics: {
    primary: { name: string; measurement: string; expected_lift: string };
    guardrail: { name: string; threshold: string }[];
    secondary: { name: string; why: string }[];
  };
  sample_size: { recommended: number; reasoning: string; minimum_detectable_effect: string };
  duration: { recommended_days: number; reasoning: string };
  risks: string[];
  variant_suggestions: { name: string; change: string; expected_impact: string }[];
  analysis_plan: string;
  go_no_go: string;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  RUNNING: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
};

export default function ExperimentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [selectedProject, setSelectedProject] = useState("");
  const [title, setTitle] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [description, setDescription] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [expandedExp, setExpandedExp] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then((r) => r.ok ? r.json() : []),
      fetch("/api/experiments").then((r) => r.ok ? r.json() : []),
    ]).then(([p, e]) => { setProjects(p); setExperiments(e); setLoading(false); });
  }, []);

  const handleCreate = async () => {
    if (!selectedProject || !title || !hypothesis) return;
    setCreating(true);
    try {
      const res = await fetch("/api/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject, title, hypothesis, description: description || null }),
      });
      if (res.ok) {
        const exp = await res.json();
        setExperiments((prev) => [exp, ...prev]);
        setShowCreate(false);
        setTitle(""); setHypothesis(""); setDescription("");
      }
    } catch { /* ignore */ }
    setCreating(false);
  };

  const handleAnalyze = async () => {
    if (!hypothesis.trim()) return;
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/experiments/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hypothesis, description }),
      });
      if (res.ok) setAnalysis(await res.json());
    } catch { /* ignore */ }
    setAnalyzing(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this experiment?")) return;
    const res = await fetch(`/api/experiments/${id}`, { method: "DELETE" });
    if (res.ok) setExperiments((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><FlaskConical className="h-6 w-6 text-primary" />A/B Test Planner</h1>
          <p className="mt-1 text-sm text-text-secondary">Design rigorous experiments with AI-powered analysis</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
          <Plus className="h-4 w-4" />New Experiment
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-primary/30 bg-surface p-5 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Design New Experiment</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Project *</label>
              <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                <option value="">Select project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Experiment Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="e.g. CTA button color test" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-foreground">Hypothesis *</label>
              <textarea value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="If we [change], then [metric] will [increase/decrease] by [amount] because [reason]" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-foreground">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder="Additional context about the experiment..." />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleAnalyze} disabled={analyzing || !hypothesis.trim()}
              className="flex items-center gap-1.5 rounded-lg border border-primary bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 disabled:opacity-50">
              {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}AI Analyze
            </button>
            <button onClick={handleCreate} disabled={creating || !selectedProject || !title || !hypothesis}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}Create
            </button>
            <button onClick={() => { setShowCreate(false); setAnalysis(null); }}
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-hover">Cancel</button>
          </div>

          {analysis && (
            <div className="space-y-3 border-t border-border pt-4">
              <div className={clsx("rounded-lg p-3 text-xs font-semibold",
                analysis.go_no_go.startsWith("READY") ? "bg-green-50 text-green-700 border border-green-200" : analysis.go_no_go.startsWith("NOT") ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-700 border border-amber-200")}>
                {analysis.go_no_go}
              </div>
              {analysis.improved_hypothesis && (
                <div><p className="text-[10px] font-bold text-text-tertiary uppercase">Improved Hypothesis</p><p className="mt-0.5 text-xs text-text-secondary">{analysis.improved_hypothesis}</p></div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] font-bold text-text-tertiary uppercase flex items-center gap-1"><Target className="h-3 w-3" />Primary Metric</p>
                  <p className="mt-1 text-xs font-medium text-foreground">{analysis.recommended_metrics.primary.name}</p>
                  <p className="text-[10px] text-text-tertiary">Expected lift: {analysis.recommended_metrics.primary.expected_lift}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-[10px] font-bold text-text-tertiary uppercase flex items-center gap-1"><BarChart3 className="h-3 w-3" />Sample & Duration</p>
                  <p className="mt-1 text-xs font-medium text-foreground">{analysis.sample_size.recommended.toLocaleString()} users</p>
                  <p className="text-[10px] text-text-tertiary">{analysis.duration.recommended_days} days · MDE: {analysis.sample_size.minimum_detectable_effect}</p>
                </div>
              </div>
              {analysis.risks.length > 0 && (
                <div><p className="text-[10px] font-bold text-red-600 uppercase">Risks</p><ul className="mt-0.5 space-y-0.5">{analysis.risks.map((r, i) => <li key={i} className="text-xs text-red-600">• {r}</li>)}</ul></div>
              )}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : experiments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FlaskConical className="mx-auto h-10 w-10 text-text-tertiary/50" />
          <p className="mt-4 text-sm font-medium text-text-secondary">No experiments yet</p>
          <p className="mt-1 text-xs text-text-tertiary">Design your first A/B test with AI assistance</p>
        </div>
      ) : (
        <div className="space-y-2">
          {experiments.map((exp) => (
            <div key={exp.id} className="rounded-xl border border-border bg-surface transition-all hover:border-border-hover">
              <button onClick={() => setExpandedExp(expandedExp === exp.id ? null : exp.id)}
                className="flex w-full items-center gap-3 p-4 text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0"><FlaskConical className="h-5 w-5 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{exp.title}</h3>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-text-tertiary">
                    <span className={clsx("rounded-full px-2 py-0.5 font-medium", statusColors[exp.status] || statusColors.DRAFT)}>{exp.status}</span>
                    {exp.projects && <span>{exp.projects.name}</span>}
                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{new Date(exp.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                {expandedExp === exp.id ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
              </button>
              {expandedExp === exp.id && (
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                  <div><p className="text-[10px] font-bold text-text-tertiary uppercase">Hypothesis</p><p className="mt-0.5 text-xs text-text-secondary">{exp.hypothesis}</p></div>
                  {exp.description && <div><p className="text-[10px] font-bold text-text-tertiary uppercase">Description</p><p className="mt-0.5 text-xs text-text-secondary">{exp.description}</p></div>}
                  {exp.variants?.length > 0 && (
                    <div><p className="text-[10px] font-bold text-text-tertiary uppercase">Variants</p>
                      <div className="mt-1 flex flex-wrap gap-2">{exp.variants.map((v, i) => <span key={i} className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">{v.name}</span>)}</div>
                    </div>
                  )}
                  <button onClick={() => handleDelete(exp.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"><Trash2 className="h-3 w-3" />Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

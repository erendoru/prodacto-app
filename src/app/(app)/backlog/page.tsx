"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ListChecks, Loader2, Sparkles, Trash2, ChevronDown, ChevronUp, X,
  Pencil, Check, Save, Wand2, GitBranch, ExternalLink, ArrowRightLeft,
  AlertTriangle, TestTube2,
} from "lucide-react";
import clsx from "clsx";

interface ReadinessScore {
  frontend: number; backend: number; testing: number;
  security: number; performance: number; dependencies: number;
}

interface ScoreReason {
  dimension: string;
  score: number;
  reason: string;
  fix_suggestion: string;
}

interface SubTask {
  tag: string;
  task: string;
  done: boolean;
}

interface BacklogItem {
  id: string;
  title: string;
  description: string | null;
  acceptance_criteria: string[] | null;
  bdd_criteria?: string[] | null;
  readiness_score: ReadinessScore | null;
  score_reasons?: ScoreReason[] | null;
  sub_tasks?: SubTask[] | null;
  story_points: number | null;
  priority: string;
  status: string;
  technical_risks: string[] | null;
  test_scenarios: string[] | null;
  jira_key?: string | null;
  projects?: { name: string };
}

interface Project { id: string; name: string; }

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-blue-50 text-blue-600",
  HIGH: "bg-amber-50 text-amber-600",
  CRITICAL: "bg-red-50 text-red-600",
};

const statusColors: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  DONE: "bg-green-50 text-green-600",
};

const tagColors: Record<string, string> = {
  FE: "bg-blue-50 text-blue-700",
  BE: "bg-green-50 text-green-700",
  DevOps: "bg-purple-50 text-purple-700",
  QA: "bg-amber-50 text-amber-700",
  Design: "bg-pink-50 text-pink-700",
  DB: "bg-indigo-50 text-indigo-700",
};

function ScoreBadge({ score, label, reason: initialReason, fix: initialFix, onFix, itemTitle, itemDescription, dimension }: {
  score: number; label: string; reason?: string; fix?: string;
  onFix?: () => void; itemTitle?: string; itemDescription?: string; dimension?: string;
}) {
  const [showTip, setShowTip] = useState(false);
  const [reason, setReason] = useState(initialReason || "");
  const [fix, setFix] = useState(initialFix || "");
  const [loading, setLoading] = useState(false);
  const color = score >= 8 ? "bg-green-500" : score >= 5 ? "bg-amber-500" : "bg-red-500";
  const textColor = score >= 8 ? "text-green-700" : score >= 5 ? "text-amber-700" : "text-red-700";
  const bgColor = score >= 8 ? "bg-green-50" : score >= 5 ? "bg-amber-50" : "bg-red-50";

  const handleClick = async () => {
    if (showTip) { setShowTip(false); return; }
    setShowTip(true);
    if (reason) return;
    setLoading(true);
    try {
      const res = await fetch("/api/backlog/score-reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: itemTitle, description: itemDescription, dimension, score }),
      });
      if (res.ok) {
        const d = await res.json();
        setReason(d.reason || "");
        setFix(d.fix_suggestion || "");
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="relative">
      <button onClick={handleClick}
        className={clsx("flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold transition-all border", bgColor, textColor,
          score < 8 ? "border-current/20 cursor-pointer hover:shadow-sm" : "border-transparent")}>
        <div className={clsx("h-2 w-2 rounded-full", color)} />
        {label} {score}
        {score < 8 && <Wand2 className="h-2.5 w-2.5 ml-0.5 opacity-60" />}
      </button>
      {showTip && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-72 rounded-lg border border-border bg-surface p-3 shadow-lg">
          {loading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-primary"><Loader2 className="h-3 w-3 animate-spin" />Analyzing score...</div>
          ) : reason ? (
            <>
              <p className="text-xs text-text-secondary mb-2">{reason}</p>
              {fix && score < 8 && (
                <div className="border-t border-border pt-2">
                  <p className="text-[10px] text-text-tertiary mb-1.5">Suggested fix:</p>
                  <p className="text-xs text-foreground font-medium mb-2">{fix}</p>
                  {onFix && (
                    <button onClick={() => { onFix(); setShowTip(false); }}
                      className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-white hover:bg-primary-dark">
                      <Sparkles className="h-2.5 w-2.5" />Apply Fix
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-text-tertiary">Score is {score >= 8 ? "excellent" : "below target"}. {score >= 8 ? "No improvements needed." : "Click again to retry analysis."}</p>
          )}
          <button onClick={() => setShowTip(false)} className="absolute top-1.5 right-1.5 text-text-tertiary hover:text-foreground"><X className="h-3 w-3" /></button>
        </div>
      )}
    </div>
  );
}

function EditableBacklogItem({
  item, isExpanded, onToggleExpand, onSave, onDelete,
}: {
  item: BacklogItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSave: (id: string, updates: Partial<BacklogItem>) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editDescription, setEditDescription] = useState(item.description || "");
  const [editPriority, setEditPriority] = useState(item.priority);
  const [editStatus, setEditStatus] = useState(item.status);
  const [editSP, setEditSP] = useState(item.story_points ?? 0);
  const titleRef = useRef<HTMLInputElement>(null);

  const [acFormat, setAcFormat] = useState<"bullet" | "bdd">("bullet");
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);
  const [subtaskError, setSubtaskError] = useState<string | null>(null);
  const [subTasks, setSubTasks] = useState<SubTask[]>(item.sub_tasks || []);

  useEffect(() => {
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditPriority(item.priority);
    setEditStatus(item.status);
    setEditSP(item.story_points ?? 0);
    setSubTasks(item.sub_tasks || []);
  }, [item]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(item.id, { title: editTitle, description: editDescription || null, priority: editPriority, status: editStatus, story_points: editSP });
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditPriority(item.priority);
    setEditStatus(item.status);
    setEditSP(item.story_points ?? 0);
    setEditing(false);
  };

  const handleStatusQuick = async (newStatus: string) => { await onSave(item.id, { status: newStatus }); };

  const handleBreakDown = async () => {
    setGeneratingSubtasks(true);
    setSubtaskError(null);
    try {
      const res = await fetch("/api/backlog/subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          description: item.description || "",
          acceptanceCriteria: item.acceptance_criteria?.join("; ") || "",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setSubtaskError(err.error || `Failed (${res.status})`);
        setGeneratingSubtasks(false);
        return;
      }
      const data = await res.json();
      const tasks = (data.tasks || []) as SubTask[];
      if (tasks.length === 0) {
        setSubtaskError("AI returned no sub-tasks. Try editing the description for more detail.");
      } else {
        setSubTasks(tasks);
        await onSave(item.id, { sub_tasks: tasks } as Partial<BacklogItem>);
      }
    } catch (err) {
      setSubtaskError(err instanceof Error ? err.message : "Network error occurred");
    }
    setGeneratingSubtasks(false);
  };

  const scoreReasons = item.score_reasons || [];
  const getReasonFor = (dim: string) => scoreReasons.find((r) => r.dimension?.toLowerCase() === dim.toLowerCase());

  const dims = [
    { key: "frontend" as const, label: "FE" },
    { key: "backend" as const, label: "BE" },
    { key: "testing" as const, label: "Test" },
    { key: "security" as const, label: "Sec" },
    { key: "performance" as const, label: "Perf" },
    { key: "dependencies" as const, label: "Deps" },
  ];

  const avg = item.readiness_score
    ? Math.round(dims.reduce((s, d) => s + (item.readiness_score![d.key] || 0), 0) / dims.length)
    : null;

  const displayAC = acFormat === "bdd" && item.bdd_criteria?.length
    ? item.bdd_criteria
    : item.acceptance_criteria;

  return (
    <div className={clsx("rounded-xl border bg-surface transition-all", editing ? "border-primary shadow-sm" : "border-border hover:border-border-hover")}>
      <div className="flex items-center gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {editing ? (
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold outline-none cursor-pointer ${priorityColors[editPriority]}`}>
                <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option>
              </select>
            ) : (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityColors[item.priority]}`}>{item.priority}</span>
            )}
            {item.projects && <span className="text-[10px] text-text-tertiary">{item.projects.name}</span>}
            {avg !== null && (
              <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                avg >= 7 ? "bg-green-50 text-green-600" : avg >= 4 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600")}>
                ⓢ {avg}/10
              </span>
            )}
          </div>
          {editing ? (
            <input ref={titleRef} value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1 text-sm font-semibold text-foreground outline-none focus:border-primary"
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }} />
          ) : (
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Jira signal */}
          {item.jira_key ? (
            <span className="flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
              <ExternalLink className="h-2.5 w-2.5" />{item.jira_key}
            </span>
          ) : (
            <button className="rounded-md p-1 text-text-tertiary/30 hover:text-blue-500 hover:bg-blue-50" title="Push to Jira (coming soon)">
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}

          {editing ? (
            <input type="number" value={editSP} onChange={(e) => setEditSP(Number(e.target.value))} min={0} max={100}
              className="w-14 rounded-full border border-border bg-background px-2 py-0.5 text-center text-xs font-bold text-primary outline-none focus:border-primary" />
          ) : (
            item.story_points != null && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{item.story_points} SP</span>
          )}
          {editing ? (
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
              className={`rounded-full border-0 px-2 py-0.5 text-[10px] font-medium outline-none cursor-pointer ${statusColors[editStatus]}`}>
              <option value="TODO">TODO</option><option value="IN_PROGRESS">IN PROGRESS</option><option value="DONE">DONE</option>
            </select>
          ) : (
            <select value={item.status} onChange={(e) => { e.stopPropagation(); handleStatusQuick(e.target.value); }} onClick={(e) => e.stopPropagation()}
              className={`rounded-full border-0 px-2 py-0.5 text-[10px] font-medium outline-none cursor-pointer ${statusColors[item.status]}`}>
              <option value="TODO">TODO</option><option value="IN_PROGRESS">IN PROGRESS</option><option value="DONE">DONE</option>
            </select>
          )}
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="rounded-md p-1 text-green-600 hover:bg-green-50">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              </button>
              <button onClick={handleCancel} className="rounded-md p-1 text-text-tertiary hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
            </>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); setEditing(true); setTimeout(() => titleRef.current?.focus(), 50); }}
                className="rounded-md p-1 text-text-tertiary hover:bg-blue-50 hover:text-blue-600"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="rounded-md p-1 text-text-tertiary hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
              <button onClick={onToggleExpand} className="rounded-md p-1 text-text-tertiary hover:bg-muted hover:text-foreground">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {editing && (
        <div className="border-t border-border px-4 py-3">
          <label className="mb-1 block text-xs font-semibold uppercase text-text-tertiary">Description</label>
          <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3}
            className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm text-text-secondary outline-none focus:border-primary" />
        </div>
      )}

      {isExpanded && !editing && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {item.description && (
            <div><h4 className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Description</h4><p className="text-sm text-text-secondary">{item.description}</p></div>
          )}

          {/* Readiness Scores as Badges */}
          {item.readiness_score && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase text-text-tertiary">Readiness Score</h4>
              <div className="flex flex-wrap gap-1.5">
                {dims.map((d) => {
                  const val = item.readiness_score![d.key] || 0;
                  const r = getReasonFor(d.key);
                  return (
                    <ScoreBadge key={d.key} score={val} label={d.label} reason={r?.reason} fix={r?.fix_suggestion}
                      itemTitle={item.title} itemDescription={item.description || ""} dimension={d.key} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Acceptance Criteria with BDD toggle */}
          {displayAC && Array.isArray(displayAC) && displayAC.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase text-text-tertiary">Acceptance Criteria</h4>
                <button onClick={() => setAcFormat(acFormat === "bullet" ? "bdd" : "bullet")}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary hover:bg-muted hover:text-foreground">
                  <ArrowRightLeft className="h-2.5 w-2.5" />{acFormat === "bullet" ? "Gherkin (BDD)" : "Bullets"}
                </button>
              </div>
              <ul className="space-y-1">
                {displayAC.map((ac, i) => (
                  <li key={i} className={clsx("flex items-start gap-2 text-sm",
                    acFormat === "bdd" ? "text-text-secondary font-mono text-xs bg-muted rounded-md px-2.5 py-1.5" : "text-text-secondary")}>
                    {acFormat !== "bdd" && <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />}{ac}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sub-tasks */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase text-text-tertiary">Sub-tasks</h4>
              <button onClick={handleBreakDown} disabled={generatingSubtasks}
                className="flex items-center gap-1 rounded-md bg-primary/5 border border-primary/20 px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10 disabled:opacity-50">
                {generatingSubtasks ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <GitBranch className="h-2.5 w-2.5" />}
                {subTasks.length > 0 ? "Regenerate" : "Break Down"}
              </button>
            </div>
            {generatingSubtasks && <div className="flex items-center gap-2 py-2 text-xs text-primary"><Loader2 className="h-3 w-3 animate-spin" />Breaking down into developer tasks...</div>}
            {subtaskError && <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600"><AlertTriangle className="h-3 w-3 flex-shrink-0" />{subtaskError}</div>}
            {subTasks.length > 0 && (
              <div className="space-y-1">
                {subTasks.map((st, i) => (
                  <label key={i} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted cursor-pointer">
                    <input type="checkbox" checked={st.done}
                      onChange={() => { const updated = [...subTasks]; updated[i] = { ...st, done: !st.done }; setSubTasks(updated); }}
                      className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5" />
                    <span className={clsx("rounded-full px-1.5 py-0.5 text-[9px] font-bold", tagColors[st.tag] || "bg-gray-100 text-gray-700")}>{st.tag}</span>
                    <span className={clsx("text-text-secondary", st.done && "line-through opacity-50")}>{st.task}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Technical Risks */}
          {item.technical_risks && Array.isArray(item.technical_risks) && item.technical_risks.length > 0 && (
            <div className="rounded-lg border border-red-100 bg-red-50/50 p-3">
              <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase text-red-600">
                <AlertTriangle className="h-3 w-3" />Technical Risks
              </h4>
              <ul className="space-y-1">
                {item.technical_risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />{risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Test Scenarios */}
          {item.test_scenarios && Array.isArray(item.test_scenarios) && item.test_scenarios.length > 0 && (
            <div className="rounded-lg border border-green-100 bg-green-50/50 p-3">
              <h4 className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase text-green-700">
                <TestTube2 className="h-3 w-3" />Test Scenarios
              </h4>
              <ul className="space-y-1">
                {item.test_scenarios.map((ts, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-green-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />{ts}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BacklogContent() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("project");

  const [items, setItems] = useState<BacklogItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>(initialProjectId || "");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(searchParams.get("new") === "true");
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const fetchBacklog = async () => {
    const url = selectedProject ? `/api/backlog?projectId=${selectedProject}` : "/api/backlog";
    const res = await fetch(url);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetch("/api/projects").then((r) => r.ok ? r.json() : []).then(setProjects); }, []);
  useEffect(() => { fetchBacklog(); }, [selectedProject]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !generatePrompt.trim()) return;
    setGenerating(true);
    const res = await fetch("/api/backlog/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: selectedProject, prompt: generatePrompt }),
    });
    if (res.ok) { setGeneratePrompt(""); setShowGenerate(false); fetchBacklog(); }
    setGenerating(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/backlog/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = async (id: string, updates: Partial<BacklogItem>) => {
    const res = await fetch(`/api/backlog/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...updated } : i));
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const stats = {
    total: items.length,
    todo: items.filter((i) => i.status === "TODO").length,
    inProgress: items.filter((i) => i.status === "IN_PROGRESS").length,
    done: items.filter((i) => i.status === "DONE").length,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ListChecks className="h-6 w-6 text-primary" />Backlog</h1>
          <p className="mt-1 text-sm text-text-secondary">AI-scored backlog items with actionable readiness insights</p>
        </div>
        <Link href={selectedProject ? `/backlog/smart-generate?project=${selectedProject}` : "/backlog/smart-generate"}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
          <Sparkles className="h-4 w-4" />Generate with AI
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary">
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span>{stats.total} total</span>
          <span className="text-text-tertiary/30">|</span>
          <span className="text-gray-500">{stats.todo} todo</span>
          <span className="text-blue-500">{stats.inProgress} active</span>
          <span className="text-green-500">{stats.done} done</span>
        </div>
      </div>

      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <form onSubmit={handleGenerate} className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Generate Backlog Items</h2>
              <button type="button" onClick={() => setShowGenerate(false)} className="text-text-tertiary hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Project</label>
                <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary" required>
                  <option value="">Select a project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Describe what to generate</label>
                <textarea value={generatePrompt} onChange={(e) => setGeneratePrompt(e.target.value)} rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary" placeholder="e.g. Create backlog items for user authentication" required />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowGenerate(false)} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover">Cancel</button>
              <button type="submit" disabled={generating || !selectedProject}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
                {generating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4" />Generate</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <ListChecks className="mx-auto h-10 w-10 text-text-tertiary/50" />
          <p className="mt-4 text-sm font-medium text-text-secondary">No backlog items yet</p>
          <p className="mt-1 text-xs text-text-tertiary">Use AI to generate scored backlog items for your project</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <EditableBacklogItem key={item.id} item={item} isExpanded={expandedId === item.id}
              onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onSave={handleSave} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BacklogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
      <BacklogContent />
    </Suspense>
  );
}

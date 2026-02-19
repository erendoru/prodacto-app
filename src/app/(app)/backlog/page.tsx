"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ListChecks,
  Loader2,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Pencil,
  Check,
  Save,
} from "lucide-react";
import clsx from "clsx";

interface ReadinessScore {
  frontend: number; backend: number; testing: number;
  security: number; performance: number; dependencies: number;
}

interface BacklogItem {
  id: string;
  title: string;
  description: string | null;
  acceptance_criteria: string[] | null;
  readiness_score: ReadinessScore | null;
  story_points: number | null;
  priority: string;
  status: string;
  technical_risks: string[] | null;
  test_scenarios: string[] | null;
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

function ReadinessRadar({ scores }: { scores: ReadinessScore }) {
  const dims = [
    { key: "frontend", label: "FE" },
    { key: "backend", label: "BE" },
    { key: "testing", label: "Test" },
    { key: "security", label: "Sec" },
    { key: "performance", label: "Perf" },
    { key: "dependencies", label: "Deps" },
  ] as const;
  const avg = Math.round(dims.reduce((sum, d) => sum + (scores[d.key] || 0), 0) / dims.length);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-secondary">Readiness Score</span>
        <span className={clsx("rounded-full px-2 py-0.5 text-xs font-bold",
          avg >= 7 ? "bg-green-50 text-green-600" : avg >= 4 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
        )}>{avg}/10</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {dims.map((d) => {
          const val = scores[d.key] || 0;
          return (
            <div key={d.key} className="text-center">
              <div className="mb-1 h-1.5 w-full rounded-full bg-muted">
                <div className={clsx("h-full rounded-full transition-all",
                  val >= 7 ? "bg-green-500" : val >= 4 ? "bg-amber-500" : "bg-red-500"
                )} style={{ width: `${val * 10}%` }} />
              </div>
              <span className="text-[10px] text-text-tertiary">{d.label} {val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditableBacklogItem({
  item,
  isExpanded,
  onToggleExpand,
  onSave,
  onDelete,
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

  useEffect(() => {
    setEditTitle(item.title);
    setEditDescription(item.description || "");
    setEditPriority(item.priority);
    setEditStatus(item.status);
    setEditSP(item.story_points ?? 0);
  }, [item]);

  const handleSave = async () => {
    setSaving(true);
    await onSave(item.id, {
      title: editTitle,
      description: editDescription || null,
      priority: editPriority,
      status: editStatus,
      story_points: editSP,
    });
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

  const handleStatusQuick = async (newStatus: string) => {
    await onSave(item.id, { status: newStatus });
  };

  return (
    <div className={clsx("rounded-xl border bg-surface transition-all",
      editing ? "border-primary shadow-sm" : "border-border hover:border-border-hover")}>
      <div className="flex items-center gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {editing ? (
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold outline-none cursor-pointer ${priorityColors[editPriority]}`}>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            ) : (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${priorityColors[item.priority]}`}>
                {item.priority}
              </span>
            )}
            {item.projects && (
              <span className="text-[10px] text-text-tertiary">{item.projects.name}</span>
            )}
          </div>
          {editing ? (
            <input ref={titleRef} value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1 text-sm font-semibold text-foreground outline-none focus:border-primary"
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
            />
          ) : (
            <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {editing ? (
            <input type="number" value={editSP} onChange={(e) => setEditSP(Number(e.target.value))} min={0} max={100}
              className="w-14 rounded-full border border-border bg-background px-2 py-0.5 text-center text-xs font-bold text-primary outline-none focus:border-primary" />
          ) : (
            item.story_points != null && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {item.story_points} SP
              </span>
            )
          )}
          {editing ? (
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
              className={`rounded-full border-0 px-2 py-0.5 text-[10px] font-medium outline-none cursor-pointer ${statusColors[editStatus]}`}>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          ) : (
            <select value={item.status}
              onChange={(e) => { e.stopPropagation(); handleStatusQuick(e.target.value); }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-full border-0 px-2 py-0.5 text-[10px] font-medium outline-none cursor-pointer ${statusColors[item.status]}`}>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          )}

          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving}
                className="rounded-md p-1 text-green-600 hover:bg-green-50" title="Save">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              </button>
              <button onClick={handleCancel} className="rounded-md p-1 text-text-tertiary hover:bg-muted" title="Cancel">
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={(e) => { e.stopPropagation(); setEditing(true); setTimeout(() => titleRef.current?.focus(), 50); }}
                className="rounded-md p-1 text-text-tertiary hover:bg-blue-50 hover:text-blue-600" title="Edit">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                className="rounded-md p-1 text-text-tertiary hover:bg-red-50 hover:text-red-600" title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={onToggleExpand}
                className="rounded-md p-1 text-text-tertiary hover:bg-muted hover:text-foreground">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editing description */}
      {editing && (
        <div className="border-t border-border px-4 py-3">
          <label className="mb-1 block text-xs font-semibold uppercase text-text-tertiary">Description</label>
          <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3}
            className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-sm text-text-secondary outline-none focus:border-primary"
            placeholder="Add a description..." />
        </div>
      )}

      {/* Expanded read-only details */}
      {isExpanded && !editing && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {item.description && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Description</h4>
              <p className="text-sm text-text-secondary">{item.description}</p>
            </div>
          )}
          {item.readiness_score && <ReadinessRadar scores={item.readiness_score} />}
          {item.acceptance_criteria && Array.isArray(item.acceptance_criteria) && item.acceptance_criteria.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Acceptance Criteria</h4>
              <ul className="space-y-1">
                {item.acceptance_criteria.map((ac, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />{ac}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.technical_risks && Array.isArray(item.technical_risks) && item.technical_risks.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Technical Risks</h4>
              <ul className="space-y-1">
                {item.technical_risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-600">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />{risk}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.test_scenarios && Array.isArray(item.test_scenarios) && item.test_scenarios.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-semibold uppercase text-text-tertiary">Test Scenarios</h4>
              <ul className="space-y-1">
                {item.test_scenarios.map((ts, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
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

export default function BacklogPage() {
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

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
  };

  useEffect(() => { fetchProjects(); }, []);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Backlog</h1>
          <p className="mt-1 text-sm text-text-secondary">AI-scored backlog items with readiness assessment</p>
        </div>
        <Link
          href={selectedProject ? `/backlog/smart-generate?project=${selectedProject}` : "/backlog/smart-generate"}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
          <Sparkles className="h-4 w-4" />Generate with AI
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
          <option value="">All Projects</option>
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
        <span className="text-sm text-text-tertiary">{items.length} items</span>
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
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary" required>
                  <option value="">Select a project</option>
                  {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Describe what to generate</label>
                <textarea value={generatePrompt} onChange={(e) => setGeneratePrompt(e.target.value)} rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="e.g. Create backlog items for a user authentication feature" required />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowGenerate(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover">Cancel</button>
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
        <div className="space-y-3">
          {items.map((item) => (
            <EditableBacklogItem
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

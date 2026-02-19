"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Mic,
  StopCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Strikethrough,
  MessageSquare,
  GitBranch,
  Clock,
  Send,
  Layers,
  Undo2,
  User,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import clsx from "clsx";

// ─── Types ─────────────────────────────────────────

interface ReadinessScore {
  frontend: number; backend: number; testing: number;
  security: number; performance: number; dependencies: number;
}

interface Task {
  id: string; title: string; description: string;
  acceptance_criteria: string[]; story_points: number;
  priority: string; dependencies: string[];
  readiness_score: ReadinessScore;
  technical_notes?: string; technical_risks?: string[];
  estimated_days?: number;
  assignee_role?: string;
  delivery_criteria?: string[];
  blockers_checklist?: string[];
  _edited?: boolean; _strikethrough?: boolean;
  _userNote?: string; _editedTitle?: string; _editedDescription?: string;
}

interface Layer { name: string; description: string; order: number; tasks: Task[]; }

interface TimelinePhase {
  phase: string;
  start_day: number;
  end_day: number;
  task_ids: string[];
  parallel_tracks?: { track: string; task_ids: string[] }[];
  goal: string;
}

interface BacklogResult {
  feature_summary: string; tech_context: string;
  layers: Layer[];
  timeline?: TimelinePhase[];
  total_story_points: number;
  total_estimated_days?: number;
  // legacy support
  sprint_plan?: { sprint: number; name: string; duration: string; task_ids: string[]; total_points: number; goal: string; }[];
  estimated_duration?: string;
}

interface Project { id: string; name: string; tech_stack?: Record<string, unknown> | null; }

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600", MEDIUM: "bg-blue-50 text-blue-600",
  HIGH: "bg-amber-50 text-amber-600", CRITICAL: "bg-red-50 text-red-600",
};

const layerColors: Record<string, { bg: string; text: string; icon: string; border: string }> = {
  DESIGN:          { bg: "bg-pink-50",    text: "text-pink-700",    icon: "🎨", border: "border-pink-200" },
  BACKEND:         { bg: "bg-indigo-50",  text: "text-indigo-700",  icon: "🔧", border: "border-indigo-200" },
  FRONTEND:        { bg: "bg-sky-50",     text: "text-sky-700",     icon: "🖥️", border: "border-sky-200" },
  "QA & POLISH":   { bg: "bg-emerald-50", text: "text-emerald-700", icon: "✅", border: "border-emerald-200" },
  TESTING:         { bg: "bg-emerald-50", text: "text-emerald-700", icon: "🧪", border: "border-emerald-200" },
};

const roleLabels: Record<string, { label: string; color: string }> = {
  designer:  { label: "Designer",  color: "bg-pink-100 text-pink-700" },
  backend:   { label: "Backend",   color: "bg-indigo-100 text-indigo-700" },
  frontend:  { label: "Frontend",  color: "bg-sky-100 text-sky-700" },
  qa:        { label: "QA",        color: "bg-emerald-100 text-emerald-700" },
  fullstack: { label: "Fullstack", color: "bg-purple-100 text-purple-700" },
};

// ─── Readiness Bar ─────────────────────────────────

function ReadinessBar({ scores }: { scores: ReadinessScore }) {
  const dims = [
    { key: "frontend" as const, label: "FE", color: "bg-sky-500" },
    { key: "backend" as const, label: "BE", color: "bg-indigo-500" },
    { key: "testing" as const, label: "Test", color: "bg-emerald-500" },
    { key: "security" as const, label: "Sec", color: "bg-red-500" },
    { key: "performance" as const, label: "Perf", color: "bg-amber-500" },
    { key: "dependencies" as const, label: "Deps", color: "bg-purple-500" },
  ];
  const avg = Math.round(dims.reduce((s, d) => s + (scores[d.key] || 0), 0) / dims.length);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-text-tertiary">Readiness</span>
        <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px] font-bold",
          avg >= 7 ? "bg-green-50 text-green-600" : avg >= 4 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
        )}>{avg}/10</span>
      </div>
      <div className="flex gap-1">
        {dims.map((d) => (
          <div key={d.key} className="flex-1">
            <div className="h-1 w-full rounded-full bg-muted">
              <div className={`h-full rounded-full ${d.color}`} style={{ width: `${(scores[d.key] || 0) * 10}%` }} />
            </div>
            <span className="block text-center text-[8px] text-text-tertiary mt-0.5">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Task Card (Enhanced) ───────────────────────────

function TaskCard({ task, onEdit, onToggleStrike, onAddNote }: {
  task: Task;
  onEdit: (id: string, field: string, value: string) => void;
  onToggleStrike: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState(task._userNote || "");
  const [showNote, setShowNote] = useState(false);

  const role = task.assignee_role ? roleLabels[task.assignee_role] || { label: task.assignee_role, color: "bg-gray-100 text-gray-600" } : null;

  return (
    <div className={clsx("rounded-lg border p-3.5 transition-all",
      task._strikethrough ? "border-red-200 bg-red-50/30 opacity-60" : "border-border bg-white hover:shadow-sm")}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex-shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-bold text-text-tertiary">{task.id}</span>
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            {editing === "title" ? (
              <input autoFocus defaultValue={task._editedTitle || task.title}
                onBlur={(e) => { onEdit(task.id, "title", e.target.value); setEditing(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") { onEdit(task.id, "title", (e.target as HTMLInputElement).value); setEditing(null); }}}
                className="flex-1 rounded border border-primary bg-primary/5 px-2 py-0.5 text-sm font-semibold text-foreground outline-none" />
            ) : (
              <h4 className={clsx("flex-1 text-sm font-semibold cursor-pointer", task._strikethrough ? "line-through text-text-tertiary" : "text-foreground")}
                onClick={() => setEditing("title")}>{task._editedTitle || task.title}</h4>
            )}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${priorityColors[task.priority]}`}>{task.priority}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{task.story_points} SP</span>
          </div>

          {/* Description */}
          {editing === "description" ? (
            <textarea autoFocus defaultValue={task._editedDescription || task.description}
              onBlur={(e) => { onEdit(task.id, "description", e.target.value); setEditing(null); }} rows={2}
              className="mt-1 w-full rounded border border-primary bg-primary/5 px-2 py-1 text-xs text-text-secondary outline-none" />
          ) : (
            <p className={clsx("mt-1 text-xs cursor-pointer", task._strikethrough ? "line-through text-text-tertiary" : "text-text-secondary")}
              onClick={() => setEditing("description")}>{task._editedDescription || task.description}</p>
          )}

          {/* Meta badges (days, role) */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {task.estimated_days != null && (
              <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                <Calendar className="h-2.5 w-2.5" />{task.estimated_days} {task.estimated_days === 1 ? "day" : "days"}
              </span>
            )}
            {role && (
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${role.color}`}>
                <User className="h-2.5 w-2.5" />{role.label}
              </span>
            )}
            {task.dependencies.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                <GitBranch className="h-2.5 w-2.5" />
                {task.dependencies.map((dep) => (
                  <span key={dep} className="rounded bg-muted px-1.5 py-0.5 font-mono">{dep}</span>
                ))}
              </span>
            )}
          </div>

          {/* User note */}
          {task._userNote && (
            <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5">
              <p className="text-xs text-amber-700"><span className="font-semibold">Your note: </span>{task._userNote}</p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-shrink-0 flex-col gap-1">
          <button onClick={() => setExpanded(!expanded)} className="rounded p-1 text-text-tertiary hover:bg-muted hover:text-foreground">
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          <button onClick={() => setEditing("title")} className="rounded p-1 text-text-tertiary hover:bg-blue-50 hover:text-blue-600"><Pencil className="h-3 w-3" /></button>
          <button onClick={() => onToggleStrike(task.id)} className="rounded p-1 text-text-tertiary hover:bg-red-50 hover:text-red-600">
            {task._strikethrough ? <Undo2 className="h-3 w-3" /> : <Strikethrough className="h-3 w-3" />}
          </button>
          <button onClick={() => setShowNote(!showNote)} className="rounded p-1 text-text-tertiary hover:bg-amber-50 hover:text-amber-600"><MessageSquare className="h-3 w-3" /></button>
        </div>
      </div>

      {/* Note input */}
      {showNote && (
        <div className="mt-2 flex gap-2">
          <input value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Add your note..."
            className="flex-1 rounded border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-primary"
            onKeyDown={(e) => { if (e.key === "Enter") { onAddNote(task.id, noteInput); setShowNote(false); }}} />
          <button onClick={() => { onAddNote(task.id, noteInput); setShowNote(false); }}
            className="rounded bg-primary px-2 py-1 text-xs text-white hover:bg-primary-dark">Save</button>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {/* Delivery Criteria */}
          {task.delivery_criteria && task.delivery_criteria.length > 0 && (
            <div>
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-text-tertiary">
                <CheckCircle2 className="h-3 w-3" /> Delivery Criteria
              </span>
              <ul className="mt-1 space-y-0.5">
                {task.delivery_criteria.map((dc, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary">
                    <Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />{dc}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Blockers Checklist */}
          {task.blockers_checklist && task.blockers_checklist.length > 0 && (
            <div>
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-text-tertiary">
                <Shield className="h-3 w-3" /> Blockers / Prerequisites
              </span>
              <ul className="mt-1 space-y-0.5">
                {task.blockers_checklist.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
                    <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />{b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Acceptance Criteria */}
          {task.acceptance_criteria?.length > 0 && (
            <div>
              <span className="text-[10px] font-semibold uppercase text-text-tertiary">Acceptance Criteria</span>
              <ul className="mt-1 space-y-0.5">
                {task.acceptance_criteria.map((ac, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary"><Check className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />{ac}</li>
                ))}
              </ul>
            </div>
          )}

          {task.technical_notes && (
            <div><span className="text-[10px] font-semibold uppercase text-text-tertiary">Technical Notes</span><p className="mt-0.5 text-xs text-text-secondary">{task.technical_notes}</p></div>
          )}
          {task.technical_risks && task.technical_risks.length > 0 && (
            <div><span className="text-[10px] font-semibold uppercase text-text-tertiary">Risks</span>
              <ul className="mt-0.5 space-y-0.5">{task.technical_risks.map((r, i) => (<li key={i} className="text-xs text-amber-600">⚠ {r}</li>))}</ul>
            </div>
          )}
          {task.readiness_score && <ReadinessBar scores={task.readiness_score} />}
        </div>
      )}
    </div>
  );
}

// ─── Timeline Phase Card ────────────────────────────

function TimelineCard({ phase, allTasks }: { phase: TimelinePhase; allTasks: Task[] }) {
  const duration = phase.end_day - phase.start_day + 1;
  const taskMap = new Map(allTasks.map(t => [t.id, t]));

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-primary">Day {phase.start_day}–{phase.end_day}</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{duration} {duration === 1 ? "day" : "days"}</span>
      </div>
      <h4 className="text-sm font-semibold text-foreground">{phase.phase}</h4>
      <p className="mt-1 text-xs text-text-secondary">{phase.goal}</p>

      {phase.parallel_tracks && phase.parallel_tracks.length > 0 ? (
        <div className="mt-3 space-y-2">
          {phase.parallel_tracks.map((track) => (
            <div key={track.track} className="rounded-lg border border-dashed border-border px-2.5 py-1.5">
              <span className="text-[10px] font-semibold text-text-tertiary uppercase">{track.track}</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {track.task_ids.map((tid) => {
                  const t = taskMap.get(tid);
                  return (
                    <span key={tid} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-text-tertiary" title={t?.title || tid}>
                      {tid}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-1 text-[10px] text-green-600">
            <Layers className="h-3 w-3" /> Running in parallel
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1">
          {phase.task_ids.map((tid) => (
            <span key={tid} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-text-tertiary">{tid}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────

export default function SmartBacklogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("project") || "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState(initialProjectId);
  const [result, setResult] = useState<BacklogResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [textInput, setTextInput] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [showRefine, setShowRefine] = useState(false);
  const [refineInput, setRefineInput] = useState("");
  const [refining, setRefining] = useState(false);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.ok ? r.json() : []).then(setProjects);
  }, []);

  const selectedProjectData = projects.find((p) => p.id === selectedProject);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");
          const res = await fetch("/api/ai/voice", { method: "POST", body: formData });
          if (res.ok) {
            const { text } = await res.json();
            if (text) {
              setTranscript((prev) => prev ? prev + " " + text : text);
              setTextInput((prev) => prev ? prev + " " + text : text);
            }
          }
        } catch { /* ignore */ }
        setIsTranscribing(false);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch { alert("Microphone access denied."); }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const handleGenerate = async () => {
    const description = textInput.trim();
    if (!selectedProject || !description) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/backlog/smart-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: "generate",
          projectId: selectedProject,
          featureDescription: description,
          answers: selectedProjectData?.tech_stack ? [
            { question: "Tech stack", answer: JSON.stringify(selectedProjectData.tech_stack) },
          ] : [],
          conversationHistory: transcript !== textInput ? `Voice transcript: ${transcript}` : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.data);
    } catch (err) {
      setError((err as Error).message || "Failed to generate backlog");
    }
    setLoading(false);
  };

  const handleRefine = async () => {
    if (!refineInput.trim() || !result) return;
    setRefining(true);
    try {
      const res = await fetch("/api/backlog/smart-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: "refine", projectId: selectedProject, currentBacklog: result, refinementRequest: refineInput }),
      });
      const data = await res.json();
      if (res.ok) { setResult(data.data); setRefineInput(""); setShowRefine(false); }
    } catch { /* ignore */ }
    setRefining(false);
  };

  const handleEditTask = (taskId: string, field: string, value: string) => {
    if (!result) return;
    setResult({ ...result, layers: result.layers.map((l) => ({ ...l, tasks: l.tasks.map((t) =>
      t.id === taskId ? { ...t, _edited: true, ...(field === "title" ? { _editedTitle: value } : { _editedDescription: value }) } : t
    )}))});
  };

  const handleToggleStrike = (taskId: string) => {
    if (!result) return;
    setResult({ ...result, layers: result.layers.map((l) => ({ ...l, tasks: l.tasks.map((t) =>
      t.id === taskId ? { ...t, _strikethrough: !t._strikethrough } : t
    )}))});
  };

  const handleAddNote = (taskId: string, note: string) => {
    if (!result) return;
    setResult({ ...result, layers: result.layers.map((l) => ({ ...l, tasks: l.tasks.map((t) =>
      t.id === taskId ? { ...t, _userNote: note } : t
    )}))});
  };

  const allTasks = result?.layers?.flatMap((l) => l.tasks) || [];
  const totalDays = result?.total_estimated_days || 0;
  const totalTasks = allTasks.length;
  const totalSP = result?.total_story_points || 0;

  // ─── Input Phase ─────────────────────────────────

  if (!result && !loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        <div className="flex items-center gap-3">
          <Link href="/backlog" className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Smart Backlog Generator</h1>
            <p className="mt-0.5 text-sm text-text-secondary">Describe what you need — type or speak</p>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Project</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="">Select a project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {selectedProjectData?.tech_stack && (
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-text-tertiary">Tech:</span>
              {[
                ...(selectedProjectData.tech_stack.frontend as string[] || []),
                ...(selectedProjectData.tech_stack.backend as string[] || []),
                ...(selectedProjectData.tech_stack.database as string[] || []),
              ].map((t) => (
                <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-text-secondary">{t}</span>
              ))}
              <span className="text-[10px] text-green-600">✓ AI knows your stack</span>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="mb-3 text-sm font-medium text-foreground">Describe the feature you want to build</p>
          <div className="relative">
            <textarea
              value={textInput} onChange={(e) => setTextInput(e.target.value)} rows={5}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-14 text-sm text-foreground outline-none transition-colors placeholder:text-text-tertiary focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={isRecording ? "Listening... speak naturally about your feature" : isTranscribing ? "Transcribing your voice..." : "e.g. We need a product detail page for A101 website showing product info, images, pricing..."}
              disabled={isRecording || isTranscribing}
            />
            <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isTranscribing}
              className={clsx("absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                isRecording ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30" : "bg-surface border border-border text-text-tertiary hover:bg-primary hover:text-white hover:border-primary")}>
              {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>

          {isRecording && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <p className="text-xs text-red-600">Recording... Speak naturally about what you need. Click stop when done.</p>
            </div>
          )}
          {isTranscribing && (
            <div className="mt-3 flex items-center gap-2 text-xs text-text-tertiary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />Converting speech to text...
            </div>
          )}
          <p className="mt-3 text-xs text-text-tertiary">
            Tip: Just press the mic and talk naturally. AI will generate a full backlog with Design, Backend, Frontend, and QA layers — with day-based estimates and delivery criteria.
          </p>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <button onClick={handleGenerate} disabled={!selectedProject || !textInput.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-all">
          <Sparkles className="h-4 w-4" />Generate Production-Grade Backlog
        </button>
      </div>
    );
  }

  // ─── Loading Phase ───────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Generating production-grade backlog...</h2>
          <p className="mt-2 max-w-sm text-center text-sm text-text-secondary">
            AI is creating a 4-layer backlog (Design → Backend → Frontend → QA) with day-based estimates and delivery criteria.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-text-tertiary">
            <Loader2 className="h-4 w-4 animate-spin" />This usually takes 15-30 seconds
          </div>
        </div>
      </div>
    );
  }

  // ─── Result Phase ────────────────────────────────

  if (!result) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => { setResult(null); setTextInput(""); setTranscript(""); }}
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Backlog Result</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Review, edit, and refine your backlog</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-base font-bold text-foreground">{result.feature_summary}</h3>
        <p className="mt-1 text-xs text-text-secondary">{result.tech_context}</p>
        <div className="mt-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Layers className="h-3.5 w-3.5" />{totalTasks} tasks
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            <Clock className="h-3.5 w-3.5" />{totalDays > 0 ? `~${totalDays} days` : result.estimated_duration || "N/A"}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            {totalSP} SP
          </div>
        </div>
      </div>

      {/* Layers */}
      {result.layers?.map((layer) => {
        const colors = layerColors[layer.name] || layerColors.BACKEND;
        const layerDays = layer.tasks.reduce((s, t) => s + (t.estimated_days || 0), 0);
        const layerSP = layer.tasks.reduce((s, t) => s + (t.story_points || 0), 0);

        return (
          <div key={layer.name} className="space-y-3">
            <div className={`flex items-center gap-2.5 rounded-lg border ${colors.border} ${colors.bg} px-4 py-3`}>
              <span className="text-lg">{colors.icon}</span>
              <div className="flex-1">
                <h3 className={`text-sm font-bold ${colors.text}`}>{layer.name}</h3>
                <p className="text-[11px] text-text-tertiary">{layer.description}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-tertiary">
                <span>{layer.tasks.length} tasks</span>
                {layerDays > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-amber-600">
                    <Calendar className="h-3 w-3" />{layerDays}d
                  </span>
                )}
                <span className="font-bold">{layerSP} SP</span>
              </div>
            </div>
            <div className="space-y-2 pl-4">
              {layer.tasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEditTask} onToggleStrike={handleToggleStrike} onAddNote={handleAddNote} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Timeline */}
      {result.timeline && result.timeline.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground"><Clock className="h-4 w-4 text-primary" />Timeline (Day-by-Day)</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.timeline.map((phase, i) => (
              <TimelineCard key={i} phase={phase} allTasks={allTasks} />
            ))}
          </div>
        </div>
      )}

      {/* Legacy sprint plan fallback */}
      {!result.timeline && result.sprint_plan && result.sprint_plan.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground"><Clock className="h-4 w-4 text-primary" />Sprint Plan</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.sprint_plan.map((sprint) => (
              <div key={sprint.sprint} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Sprint {sprint.sprint}</span>
                  <span className="text-xs text-text-tertiary">{sprint.duration}</span>
                </div>
                <h4 className="mt-1 text-sm font-semibold text-foreground">{sprint.name}</h4>
                <p className="mt-1 text-xs text-text-secondary">{sprint.goal}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {sprint.task_ids.map((tid) => (<span key={tid} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-text-tertiary">{tid}</span>))}
                </div>
                <div className="mt-2 text-right text-xs font-bold text-primary">{sprint.total_points} SP</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={() => setShowRefine(!showRefine)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover">
          <MessageSquare className="h-4 w-4" />Refine with AI
        </button>
        <button onClick={() => router.push("/backlog")}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">
          <Check className="h-4 w-4" />Done — View Backlog
        </button>
      </div>

      {showRefine && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs text-text-tertiary">Tell AI what to change — be specific</p>
          <div className="flex gap-2">
            <input value={refineInput} onChange={(e) => setRefineInput(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="e.g. Design phase should take 3 days, add error handling tasks to backend..."
              onKeyDown={(e) => { if (e.key === "Enter") handleRefine(); }} />
            <button onClick={handleRefine} disabled={refining || !refineInput.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
              {refining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

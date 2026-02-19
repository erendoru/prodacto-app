"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, Loader2, Mic, StopCircle, Check, ChevronRight,
  FileText, Code, FileQuestion, Bug, FlaskConical, Pencil, RotateCcw,
} from "lucide-react";
import clsx from "clsx";

interface Project { id: string; name: string; }

const TEMPLATES = [
  { id: "feature_prd", label: "Feature PRD", desc: "Full product requirement document", icon: FileText },
  { id: "technical_spec", label: "Technical Spec", desc: "Engineering specification", icon: Code },
  { id: "one_pager", label: "One-Pager", desc: "Quick summary for stakeholders", icon: FileQuestion },
  { id: "bug_fix", label: "Bug Fix PRD", desc: "Bug analysis and fix plan", icon: Bug },
  { id: "experiment", label: "Experiment Brief", desc: "A/B test or experiment plan", icon: FlaskConical },
];

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "problem", label: "Problem Statement" },
  { key: "goals", label: "Goals & Metrics" },
  { key: "user_stories", label: "User Stories" },
  { key: "scope", label: "Scope" },
  { key: "technical", label: "Technical Requirements" },
  { key: "rollout", label: "Rollout Plan" },
  { key: "risks", label: "Risks & Mitigations" },
  { key: "open_questions", label: "Open Questions" },
];

export default function CreatePRDPage() {
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "generate" | "review">("setup");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("feature_prd");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");

  const [sections, setSections] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.ok ? r.json() : []).then(setProjects);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsTranscribing(true);
        try {
          const fd = new FormData();
          fd.append("audio", new Blob(chunksRef.current, { type: "audio/webm" }), "rec.webm");
          const res = await fetch("/api/ai/voice", { method: "POST", body: fd });
          if (res.ok) { const { text } = await res.json(); if (text) setDescription((p) => p ? p + " " + text : text); }
        } catch { /* ignore */ }
        setIsTranscribing(false);
      };
      recorder.start();
      setIsRecording(true);
    } catch { alert("Microphone access denied."); }
  }, []);

  const stopRecording = useCallback(() => { mediaRecorderRef.current?.stop(); setIsRecording(false); }, []);

  const handleGenerateAll = async () => {
    if (!selectedProject || !description.trim()) return;
    setStep("generate");
    setGenerating(true);
    try {
      const res = await fetch("/api/prd/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject, featureDescription: description }),
      });
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
        if (!title) setTitle(description.slice(0, 80));
      }
    } catch { /* ignore */ }
    setGenerating(false);
  };

  const handleRegenerateSection = async (sectionKey: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/prd/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject, featureDescription: description, section: sectionKey, existingSections: sections }),
      });
      const data = await res.json();
      if (data.content) setSections((prev) => ({ ...prev, [sectionKey]: data.content }));
    } catch { /* ignore */ }
    setGenerating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const fullContent = SECTIONS.map((s) => `## ${s.label}\n\n${sections[s.key] || ""}`).join("\n\n---\n\n");
    try {
      const res = await fetch("/api/prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject, title: title || description.slice(0, 80), content: fullContent, templateType: selectedTemplate }),
      });
      if (res.ok) { const doc = await res.json(); router.push(`/prd/${doc.id}`); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const completedSections = Object.keys(sections).filter((k) => sections[k]?.trim());

  if (step === "setup") {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        <div className="flex items-center gap-3">
          <Link href="/prd" className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover"><ArrowLeft className="h-4 w-4" /></Link>
          <div><h1 className="text-2xl font-bold text-foreground">Create New PRD</h1><p className="mt-0.5 text-sm text-text-secondary">Describe your feature — AI generates a complete PRD</p></div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Project</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary">
            <option value="">Select a project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Document Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="e.g. User Onboarding Flow Redesign" />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Template</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                className={clsx("flex items-start gap-2.5 rounded-lg border p-3 text-left transition-all",
                  selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:border-border-hover")}>
                <t.icon className={clsx("h-4.5 w-4.5 mt-0.5 flex-shrink-0", selectedTemplate === t.id ? "text-primary" : "text-text-tertiary")} />
                <div><p className="text-xs font-semibold text-foreground">{t.label}</p><p className="text-[10px] text-text-tertiary">{t.desc}</p></div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="mb-3 text-sm font-medium text-foreground">Describe what you want to build</p>
          <div className="relative">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-14 text-sm outline-none focus:border-primary"
              placeholder="e.g. We need to redesign the user onboarding flow to reduce drop-off. Currently 40% of users don't complete signup..."
              disabled={isRecording || isTranscribing} />
            <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isTranscribing}
              className={clsx("absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                isRecording ? "bg-red-500 text-white animate-pulse" : "bg-surface border border-border text-text-tertiary hover:bg-primary hover:text-white")}>
              {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          </div>
          {isRecording && <div className="mt-2 flex items-center gap-2 text-xs text-red-600"><div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />Recording...</div>}
        </div>

        <button onClick={handleGenerateAll} disabled={!selectedProject || !description.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
          <Sparkles className="h-4 w-4" />Generate PRD
        </button>
      </div>
    );
  }

  if (step === "generate" && generating && completedSections.length === 0) {
    return (
      <div className="mx-auto max-w-3xl flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Generating your PRD...</h2>
        <p className="mt-2 text-sm text-text-secondary text-center max-w-sm">AI is writing all 9 sections of your PRD. This usually takes 20-40 seconds.</p>
        <Loader2 className="mt-6 h-5 w-5 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => setStep("setup")} className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover"><ArrowLeft className="h-4 w-4" /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{title || "New PRD"}</h1>
          <p className="mt-0.5 text-sm text-text-secondary">{completedSections.length}/{SECTIONS.length} sections completed</p>
        </div>
        <button onClick={handleSave} disabled={saving || completedSections.length === 0}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Save PRD
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {SECTIONS.map((s, i) => {
          const done = !!sections[s.key]?.trim();
          return (
            <button key={s.key} onClick={() => setCurrentSection(i)}
              className={clsx("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all border",
                currentSection === i ? "border-primary bg-primary/10 text-primary" : done ? "border-green-200 bg-green-50 text-green-700" : "border-border text-text-tertiary hover:border-border-hover")}>
              {done && <Check className="h-3 w-3" />}{s.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-sm font-bold text-foreground">{SECTIONS[currentSection].label}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => handleRegenerateSection(SECTIONS[currentSection].key)} disabled={generating}
              className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-text-tertiary hover:bg-muted hover:text-foreground disabled:opacity-50">
              {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}Regenerate
            </button>
            <button onClick={() => { setEditingSection(SECTIONS[currentSection].key); setEditValue(sections[SECTIONS[currentSection].key] || ""); }}
              className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-text-tertiary hover:bg-blue-50 hover:text-blue-600">
              <Pencil className="h-3 w-3" />Edit
            </button>
          </div>
        </div>

        <div className="p-5">
          {editingSection === SECTIONS[currentSection].key ? (
            <div className="space-y-3">
              <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} rows={12}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm font-mono outline-none focus:border-primary" />
              <div className="flex gap-2">
                <button onClick={() => { setSections((p) => ({ ...p, [SECTIONS[currentSection].key]: editValue })); setEditingSection(null); }}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">Save Changes</button>
                <button onClick={() => setEditingSection(null)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover">Cancel</button>
              </div>
            </div>
          ) : sections[SECTIONS[currentSection].key] ? (
            <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap">
              {sections[SECTIONS[currentSection].key]}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-text-tertiary">
              {generating ? <><Loader2 className="mx-auto h-5 w-5 animate-spin mb-2" />Generating this section...</> : "No content yet. Click Regenerate to create this section."}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentSection(Math.max(0, currentSection - 1))} disabled={currentSection === 0}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover disabled:opacity-30">Previous</button>
        {currentSection < SECTIONS.length - 1 ? (
          <button onClick={() => setCurrentSection(currentSection + 1)}
            className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
            Next<ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Save & Finish
          </button>
        )}
      </div>
    </div>
  );
}

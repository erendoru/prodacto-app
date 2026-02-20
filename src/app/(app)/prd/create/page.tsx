"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, Loader2, Mic, StopCircle, Check, ChevronRight,
  FileText, Code, FileQuestion, Bug, FlaskConical, Pencil, RotateCcw,
  Paperclip, Link2, Database, Wand2, Info, Keyboard, X,
} from "lucide-react";
import clsx from "clsx";

interface Project { id: string; name: string; }
interface VaultItem { id: string; title: string; type: string; }

const TEMPLATES = [
  {
    id: "feature_prd",
    label: "Feature PRD",
    desc: "Full product requirement document",
    icon: FileText,
    buttonText: "Generate Feature PRD",
    preview: ["Overview & Problem Statement", "Goals & Success Metrics", "User Stories", "Scope (In/Out)", "Technical Requirements", "Rollout Plan", "Risks & Mitigations"],
  },
  {
    id: "technical_spec",
    label: "Technical Spec",
    desc: "Engineering specification",
    icon: Code,
    buttonText: "Generate Technical Spec",
    preview: ["System Architecture", "Database Schema", "API Endpoints", "Data Models", "Security Considerations", "Performance Requirements"],
  },
  {
    id: "one_pager",
    label: "One-Pager",
    desc: "Quick summary for stakeholders",
    icon: FileQuestion,
    buttonText: "Generate One-Pager",
    preview: ["Executive Summary", "Problem & Opportunity", "Proposed Solution", "Key Metrics", "Timeline & Resources"],
  },
  {
    id: "bug_fix",
    label: "Bug Fix PRD",
    desc: "Bug analysis and fix plan",
    icon: Bug,
    buttonText: "Analyze & Generate Bug Report",
    preview: ["Bug Description & Reproduction", "Root Cause Analysis", "Impact Assessment", "Fix Strategy", "Test Plan", "Rollback Plan"],
  },
  {
    id: "experiment",
    label: "Experiment Brief",
    desc: "A/B test or experiment plan",
    icon: FlaskConical,
    buttonText: "Generate Experiment Brief",
    preview: ["Hypothesis", "Metrics & KPIs", "Variants", "Sample Size & Duration", "Analysis Plan", "Success Criteria"],
  },
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

const LOADING_MESSAGES = [
  "Analyzing project context...",
  "Structuring requirements...",
  "Writing user stories...",
  "Detecting edge cases...",
  "Defining acceptance criteria...",
  "Assessing technical risks...",
  "Finalizing rollout plan...",
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

  // Dual-mode: type vs speak
  const [inputMode, setInputMode] = useState<"type" | "speak">("type");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Enhance prompt
  const [enhancing, setEnhancing] = useState(false);

  // Context references
  const [pastedUrls, setPastedUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [selectedVaultIds, setSelectedVaultIds] = useState<string[]>([]);
  const [showVaultPicker, setShowVaultPicker] = useState(false);

  // Template hover preview
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  // Loading message rotation
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.ok ? r.json() : []).then(setProjects);
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetch(`/api/context-vault?projectId=${selectedProject}`)
        .then((r) => r.ok ? r.json() : [])
        .then((items: VaultItem[]) => setVaultItems(items));
    }
  }, [selectedProject]);

  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((p) => (p + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [generating]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setRecordingTime(0);
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
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch { alert("Microphone access denied."); }
  }, []);

  const stopRecording = useCallback(() => { mediaRecorderRef.current?.stop(); setIsRecording(false); }, []);

  const handleEnhancePrompt = async () => {
    if (!description.trim() || enhancing) return;
    setEnhancing(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Enhance this product feature description into a detailed, professional prompt. Keep it concise but specific. Add measurable goals, user impact, and key requirements. Only return the enhanced text, nothing else.\n\nOriginal: ${description}` }],
          projectId: selectedProject || undefined,
        }),
      });
      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let enhanced = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          enhanced += decoder.decode(value, { stream: true });
        }
        if (enhanced.trim()) setDescription(enhanced.trim());
      }
    } catch { /* ignore */ }
    setEnhancing(false);
  };

  const handleAddUrl = () => {
    if (urlInput.trim() && !pastedUrls.includes(urlInput.trim())) {
      setPastedUrls((p) => [...p, urlInput.trim()]);
      setUrlInput("");
      setShowUrlInput(false);
    }
  };

  const toggleVaultItem = (id: string) => {
    setSelectedVaultIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const handleGenerateAll = async () => {
    if (!selectedProject || !description.trim()) return;
    setStep("generate");
    setGenerating(true);
    setLoadingMsgIdx(0);
    try {
      const contextRefs = {
        urls: pastedUrls,
        vaultItemIds: selectedVaultIds,
      };
      const res = await fetch("/api/prd/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          featureDescription: description,
          contextReferences: contextRefs,
        }),
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

  const completedSections = Object.keys(sections).filter((k) => typeof sections[k] === "string" && sections[k].trim());
  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  // ──── SETUP STEP ────
  if (step === "setup") {
    return (
      <div className="mx-auto max-w-3xl space-y-6 pb-10">
        <div className="flex items-center gap-3">
          <Link href="/prd" className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover"><ArrowLeft className="h-4 w-4" /></Link>
          <div><h1 className="text-2xl font-bold text-foreground">Create New PRD</h1><p className="mt-0.5 text-sm text-text-secondary">Describe your feature — AI generates a complete PRD</p></div>
        </div>

        {/* Project & Title */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        </div>

        {/* Templates with hover preview */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Template</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="relative"
                onMouseEnter={() => setHoveredTemplate(t.id)}
                onMouseLeave={() => setHoveredTemplate(null)}>
                <button onClick={() => setSelectedTemplate(t.id)}
                  className={clsx("flex w-full items-start gap-2.5 rounded-lg border p-3 text-left transition-all",
                    selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border hover:border-border-hover")}>
                  <t.icon className={clsx("h-4.5 w-4.5 mt-0.5 flex-shrink-0", selectedTemplate === t.id ? "text-primary" : "text-text-tertiary")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{t.label}</p>
                    <p className="text-[10px] text-text-tertiary">{t.desc}</p>
                  </div>
                  <Info className="h-3 w-3 text-text-tertiary/40 flex-shrink-0 mt-1" />
                </button>
                {hoveredTemplate === t.id && (
                  <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-lg border border-border bg-surface p-3 shadow-lg">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Includes:</p>
                    <ul className="space-y-0.5">
                      {t.preview.map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Check className="h-2.5 w-2.5 text-accent flex-shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dual-Mode Input: Type / Speak */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="flex border-b border-border">
            <button onClick={() => setInputMode("type")}
              className={clsx("flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-all border-b-2",
                inputMode === "type" ? "border-primary text-primary bg-primary/5" : "border-transparent text-text-tertiary hover:text-foreground")}>
              <Keyboard className="h-4 w-4" />Type
            </button>
            <button onClick={() => setInputMode("speak")}
              className={clsx("flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-all border-b-2",
                inputMode === "speak" ? "border-primary text-primary bg-primary/5" : "border-transparent text-text-tertiary hover:text-foreground")}>
              <Mic className="h-4 w-4" />Speak
            </button>
          </div>

          <div className="p-5">
            {inputMode === "type" ? (
              <div>
                <div className="relative">
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-24 text-sm outline-none focus:border-primary resize-none"
                    placeholder="e.g. We need to redesign the user onboarding flow to reduce drop-off. Currently 40% of users don't complete signup..." />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <button onClick={handleEnhancePrompt} disabled={enhancing || !description.trim()}
                      title="Enhance your description with AI"
                      className={clsx("flex h-8 items-center gap-1 rounded-lg border px-2 text-[11px] font-medium transition-all",
                        enhancing ? "border-primary bg-primary/10 text-primary" : "border-border text-text-tertiary hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-30")}>
                      {enhancing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                      Enhance
                    </button>
                  </div>
                </div>
                {enhancing && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                    <Sparkles className="h-3 w-3 animate-pulse" />Enhancing your description with AI...
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                {isRecording ? (
                  <>
                    <button onClick={stopRecording}
                      className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/30 transition-all animate-pulse">
                      <StopCircle className="h-8 w-8 text-white" />
                    </button>
                    <p className="text-2xl font-mono font-bold text-red-600">{formatTime(recordingTime)}</p>
                    <p className="mt-1 text-xs text-red-500">Recording... Click to stop</p>
                    <div className="mt-4 flex h-8 items-center gap-[2px]">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div key={i} className="w-[3px] rounded-full bg-red-400"
                          style={{ animation: `waveform 1.2s ease-in-out ${i * 0.025}s infinite alternate` }} />
                      ))}
                    </div>
                  </>
                ) : isTranscribing ? (
                  <>
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Transcribing your voice...</p>
                  </>
                ) : (
                  <>
                    <button onClick={startRecording}
                      className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-all hover:scale-105"
                      style={{ animation: "mic-pulse 2s ease-in-out infinite" }}>
                      <Mic className="h-8 w-8 text-white" />
                    </button>
                    <p className="text-sm font-medium text-foreground">Click to start speaking</p>
                    <p className="mt-1 text-xs text-text-tertiary">Describe your feature naturally — AI will understand</p>
                  </>
                )}
                {description && (
                  <div className="mt-6 w-full rounded-lg border border-border bg-muted p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase text-text-tertiary">Transcription</p>
                    <p className="text-xs text-text-secondary">{description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Context References */}
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Paperclip className="h-3.5 w-3.5 text-text-tertiary" />Add Context
            <span className="text-text-tertiary font-normal">(Optional)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowUrlInput(true)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-all">
              <Link2 className="h-3.5 w-3.5" />Paste URL
            </button>
            {selectedProject && (
              <button onClick={() => setShowVaultPicker(!showVaultPicker)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-primary hover:text-primary transition-all">
                <Database className="h-3.5 w-3.5" />From Context Vault
                {selectedVaultIds.length > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">{selectedVaultIds.length}</span>
                )}
              </button>
            )}
          </div>

          {/* URL Input */}
          {showUrlInput && (
            <div className="mt-3 flex gap-2">
              <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs outline-none focus:border-primary"
                placeholder="Paste Jira, Notion, Slack link..." autoFocus />
              <button onClick={handleAddUrl} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark">Add</button>
              <button onClick={() => setShowUrlInput(false)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-tertiary hover:bg-surface-hover"><X className="h-3 w-3" /></button>
            </div>
          )}

          {/* Vault Picker */}
          {showVaultPicker && vaultItems.length > 0 && (
            <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-border bg-surface p-2 space-y-1">
              {vaultItems.map((item) => (
                <label key={item.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-muted cursor-pointer">
                  <input type="checkbox" checked={selectedVaultIds.includes(item.id)} onChange={() => toggleVaultItem(item.id)}
                    className="rounded border-border text-primary focus:ring-primary" />
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-text-tertiary">{item.type}</span>
                  <span className="text-foreground">{item.title}</span>
                </label>
              ))}
            </div>
          )}
          {showVaultPicker && vaultItems.length === 0 && (
            <p className="mt-3 text-xs text-text-tertiary">No items in Context Vault for this project. <Link href="/context-vault" className="text-primary hover:underline">Add some</Link></p>
          )}

          {/* Added references */}
          {(pastedUrls.length > 0 || selectedVaultIds.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {pastedUrls.map((url, i) => (
                <span key={i} className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">
                  <Link2 className="h-2.5 w-2.5" />{new URL(url).hostname}
                  <button onClick={() => setPastedUrls((p) => p.filter((_, j) => j !== i))} className="ml-0.5 hover:text-red-600"><X className="h-2.5 w-2.5" /></button>
                </span>
              ))}
              {selectedVaultIds.map((id) => {
                const item = vaultItems.find((v) => v.id === id);
                return item ? (
                  <span key={id} className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700">
                    <Database className="h-2.5 w-2.5" />{item.title}
                    <button onClick={() => toggleVaultItem(id)} className="ml-0.5 hover:text-red-600"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Dynamic Generate Button */}
        <button onClick={handleGenerateAll} disabled={!selectedProject || !description.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-all">
          <Sparkles className="h-4 w-4" />{currentTemplate.buttonText}
        </button>
      </div>
    );
  }

  // ──── GENERATING LOADING SCREEN ────
  if (step === "generate" && generating && completedSections.length === 0) {
    return (
      <div className="mx-auto max-w-3xl flex flex-col items-center justify-center py-20">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Generating your {currentTemplate.label}...</h2>
        <div className="mt-3 h-5">
          <p className="text-sm text-text-secondary text-center animate-pulse transition-all">{LOADING_MESSAGES[loadingMsgIdx]}</p>
        </div>
        <div className="mt-6 flex items-center gap-1">
          {LOADING_MESSAGES.map((_, i) => (
            <div key={i} className={clsx("h-1.5 w-1.5 rounded-full transition-all", i === loadingMsgIdx ? "bg-primary w-4" : "bg-muted")} />
          ))}
        </div>
      </div>
    );
  }

  // ──── REVIEW STEP ────
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
          const done = typeof sections[s.key] === "string" && sections[s.key].trim().length > 0;
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

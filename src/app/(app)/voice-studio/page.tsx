"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic, StopCircle, Loader2, Sparkles, Copy, FileText, ListChecks, MessageSquare,
  Clock, Trash2, ChevronDown,
} from "lucide-react";
import clsx from "clsx";

interface Project { id: string; name: string; }

interface VoiceEntry {
  id: string;
  transcript: string;
  timestamp: Date;
  classification: string | null;
  structuredOutput: string | null;
  processing: boolean;
}

const CLASSIFICATIONS = [
  { key: "feature_idea", label: "Feature Idea", color: "bg-blue-50 text-blue-700" },
  { key: "bug_report", label: "Bug Report", color: "bg-red-50 text-red-700" },
  { key: "user_feedback", label: "User Feedback", color: "bg-green-50 text-green-700" },
  { key: "meeting_notes", label: "Meeting Notes", color: "bg-purple-50 text-purple-700" },
  { key: "brainstorm", label: "Brainstorm", color: "bg-amber-50 text-amber-700" },
  { key: "other", label: "Other", color: "bg-gray-100 text-gray-700" },
];

export default function VoiceStudioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [entries, setEntries] = useState<VoiceEntry[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

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
        if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
        setRecordingTime(0);
        setIsTranscribing(true);

        const entryId = crypto.randomUUID();
        const newEntry: VoiceEntry = {
          id: entryId,
          transcript: "",
          timestamp: new Date(),
          classification: null,
          structuredOutput: null,
          processing: true,
        };
        setEntries((prev) => [newEntry, ...prev]);

        try {
          const fd = new FormData();
          fd.append("audio", new Blob(chunksRef.current, { type: "audio/webm" }), "rec.webm");
          const res = await fetch("/api/ai/voice", { method: "POST", body: fd });
          if (res.ok) {
            const { text } = await res.json();
            setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, transcript: text || "(No speech detected)" } : e));

            if (text) {
              const classifyRes = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages: [{ role: "user", content: `Classify this voice note and create a structured version. Return JSON:\n{"classification": "feature_idea"|"bug_report"|"user_feedback"|"meeting_notes"|"brainstorm"|"other", "structured": "clean, organized version of the content with bullet points"}\n\nVoice note: ${text}` }],
                  projectId: selectedProject || undefined,
                }),
              });
              if (classifyRes.ok) {
                const reader = classifyRes.body?.getReader();
                if (reader) {
                  let fullText = "";
                  const decoder = new TextDecoder();
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    fullText += decoder.decode(value, { stream: true });
                  }
                  try {
                    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                      const parsed = JSON.parse(jsonMatch[0]);
                      setEntries((prev) => prev.map((e) => e.id === entryId
                        ? { ...e, classification: parsed.classification, structuredOutput: parsed.structured, processing: false }
                        : e));
                    } else {
                      setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, processing: false } : e));
                    }
                  } catch {
                    setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, processing: false } : e));
                  }
                }
              } else {
                setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, processing: false } : e));
              }
            } else {
              setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, processing: false } : e));
            }
          }
        } catch {
          setEntries((prev) => prev.map((e) => e.id === entryId ? { ...e, transcript: "(Error processing audio)", processing: false } : e));
        }
        setIsTranscribing(false);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch { alert("Microphone access denied."); }
  }, [selectedProject]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const getClassConfig = (key: string | null) => CLASSIFICATIONS.find((c) => c.key === key) || CLASSIFICATIONS[5];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Mic className="h-6 w-6 text-primary" />Voice Studio</h1>
        <p className="mt-1 text-sm text-text-secondary">Record voice notes — AI transcribes, classifies, and structures them automatically</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="mb-4">
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
            className="mx-auto rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary">
            <option value="">No project context</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <button onClick={isRecording ? stopRecording : startRecording} disabled={isTranscribing}
          className={clsx("mx-auto flex h-24 w-24 items-center justify-center rounded-full transition-all",
            isRecording ? "bg-red-500 shadow-lg shadow-red-500/30 animate-pulse" : isTranscribing ? "bg-gray-300" : "bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30")}>
          {isTranscribing ? <Loader2 className="h-10 w-10 text-white animate-spin" /> : isRecording ? <StopCircle className="h-10 w-10 text-white" /> : <Mic className="h-10 w-10 text-white" />}
        </button>

        {isRecording && (
          <div className="mt-4 space-y-1">
            <p className="text-2xl font-mono font-bold text-red-600">{formatTime(recordingTime)}</p>
            <p className="text-xs text-red-500">Recording... Click to stop</p>
          </div>
        )}
        {isTranscribing && <p className="mt-4 text-sm text-text-secondary">Transcribing & classifying...</p>}
        {!isRecording && !isTranscribing && <p className="mt-4 text-sm text-text-tertiary">Click to start recording your voice note</p>}
      </div>

      {entries.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">Voice Notes ({entries.length})</h3>
          {entries.map((entry) => {
            const cls = getClassConfig(entry.classification);
            return (
              <div key={entry.id} className="rounded-xl border border-border bg-surface overflow-hidden">
                <button onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                  className="flex w-full items-center gap-3 p-4 text-left">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    {entry.processing ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <MessageSquare className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{entry.transcript || "Processing..."}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-tertiary">
                      <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{entry.timestamp.toLocaleTimeString()}</span>
                      {entry.classification && <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px] font-medium", cls.color)}>{cls.label}</span>}
                    </div>
                  </div>
                  {expandedEntry === entry.id ? <ChevronDown className="h-4 w-4 text-text-tertiary rotate-180" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
                </button>
                {expandedEntry === entry.id && (
                  <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-text-tertiary uppercase">Raw Transcript</p>
                      <p className="mt-1 text-xs text-text-secondary whitespace-pre-wrap">{entry.transcript}</p>
                    </div>
                    {entry.structuredOutput && (
                      <div>
                        <p className="text-[10px] font-bold text-text-tertiary uppercase">Structured Output</p>
                        <div className="mt-1 rounded-lg bg-muted p-3 text-xs text-text-secondary whitespace-pre-wrap">{entry.structuredOutput}</div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => copyToClipboard(entry.structuredOutput || entry.transcript)}
                        className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-text-tertiary hover:bg-surface-hover"><Copy className="h-3 w-3" />Copy</button>
                      <button onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                        className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-red-500 hover:bg-red-50"><Trash2 className="h-3 w-3" />Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

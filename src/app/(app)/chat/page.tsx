"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send, Loader2, Mic, StopCircle, Sparkles, User, Bot,
  MessageSquare, Plus, Trash2, Keyboard, FileText, ListChecks,
  BarChart3, TrendingUp, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import clsx from "clsx";

interface Message { role: "user" | "assistant"; content: string; }
interface ChatSession { id: string; title: string; project_id: string | null; created_at: string; updated_at: string; }

const SUGGESTIONS = [
  { text: "Generate a PRD for a new feature", icon: FileText, color: "bg-blue-50 text-blue-600 border-blue-100", prompt: "I'd like to generate a PRD for a new feature. Let me describe what I have in mind..." },
  { text: "Create user stories for onboarding flow", icon: ListChecks, color: "bg-green-50 text-green-600 border-green-100", prompt: "Help me create detailed user stories for a user onboarding flow." },
  { text: "Score these backlog items", icon: BarChart3, color: "bg-purple-50 text-purple-600 border-purple-100", prompt: "I need help scoring and prioritizing my backlog items. Can you analyze them for dev-readiness?" },
  { text: "Analyze the market for my product", icon: TrendingUp, color: "bg-amber-50 text-amber-600 border-amber-100", prompt: "I want a market analysis for my product. Let me share the details." },
];

function ChatContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const [inputMode, setInputMode] = useState<"type" | "speak">("type");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    fetch("/api/chat/sessions")
      .then((r) => r.ok ? r.json() : [])
      .then(setSessions)
      .finally(() => setSessionsLoading(false));
  }, []);

  const loadSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs.map((m: { role: string; content: string }) => ({
          role: m.role === "USER" ? "user" : "assistant",
          content: m.content,
        })));
      }
    } catch { setMessages([]); }
  };

  const createNewChat = async () => {
    setActiveSessionId(null);
    setMessages([]);
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        const session = await res.json();
        setActiveSessionId(session.id);
        setSessions((prev) => [session, ...prev]);
      }
    } catch { /* ignore */ }
  };

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) { setActiveSessionId(null); setMessages([]); }
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const res = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, title: content.slice(0, 60) }),
        });
        if (res.ok) {
          const session = await res.json();
          sessionId = session.id;
          setActiveSessionId(session.id);
          setSessions((prev) => [session, ...prev]);
        }
      } catch { /* ignore */ }
    }

    const userMessage: Message = { role: "user", content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          projectId,
          sessionId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: errData.error || "Something went wrong." };
          return updated;
        });
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const { content: c } = JSON.parse(data);
                if (c) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: "assistant", content: updated[updated.length - 1].content + c };
                    return updated;
                  });
                }
              } catch { /* skip */ }
            }
          }
        }
      }

      if (messages.length === 0 && sessionId) {
        const titleText = content.slice(0, 60) + (content.length > 60 ? "..." : "");
        setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, title: titleText } : s));
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Failed to connect. Please try again." };
        return updated;
      });
    }
    setLoading(false);
  }, [loading, messages, projectId, activeSessionId]);

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
          if (res.ok) { const { text } = await res.json(); if (text) sendMessage(text); }
        } catch { /* ignore */ }
        setIsTranscribing(false);
      };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((p) => p + 1), 1000);
    } catch { alert("Microphone access denied."); }
  }, [sendMessage]);

  const stopRecording = useCallback(() => { mediaRecorderRef.current?.stop(); setIsRecording(false); }, []);

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Chat History Panel */}
      {historyOpen && (
        <div className="flex w-64 flex-shrink-0 flex-col border-r border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <span className="text-xs font-bold text-foreground">Chat History</span>
            <div className="flex items-center gap-1">
              <button onClick={createNewChat}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover hover:text-foreground">
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setHistoryOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover hover:text-foreground">
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-4 w-4 animate-spin text-text-tertiary" /></div>
            ) : sessions.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-text-tertiary">No conversations yet</p>
            ) : (
              sessions.map((s) => (
                <button key={s.id} onClick={() => loadSession(s.id)}
                  className={clsx("group flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                    activeSessionId === s.id ? "bg-primary/10 text-primary" : "text-text-secondary hover:bg-surface-hover")}>
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1 truncate">{s.title}</span>
                  <button onClick={(e) => deleteSession(s.id, e)}
                    className="hidden rounded p-0.5 text-text-tertiary hover:text-red-500 group-hover:block">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        {!historyOpen && (
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <button onClick={() => setHistoryOpen(true)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-surface-hover">
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            <button onClick={createNewChat}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-tertiary hover:bg-surface-hover hover:text-foreground">
              <Plus className="h-3.5 w-3.5" />New Chat
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pb-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">How can I help you today?</h2>
              <p className="mt-2 max-w-md text-center text-sm text-text-secondary">
                I&apos;m your AI Product Manager. I can help you create PRDs, generate user stories, score backlogs, and more.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-w-lg w-full">
                {SUGGESTIONS.map((s) => (
                  <button key={s.text} onClick={() => sendMessage(s.prompt)}
                    className={clsx("flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all hover:shadow-sm", s.color)}>
                    <s.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-xs font-medium">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1 pt-4">
              {messages.map((msg, i) => (
                <div key={i} className={clsx("flex gap-3 px-4 py-3", msg.role === "user" ? "bg-transparent" : "bg-surface/50")}>
                  <div className={clsx("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs",
                    msg.role === "user" ? "bg-foreground/10 text-foreground" : "bg-primary/10 text-primary")}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {msg.content}
                    {loading && i === messages.length - 1 && msg.role === "assistant" && !msg.content && (
                      <span className="inline-flex items-center gap-1 text-text-tertiary"><Loader2 className="h-3.5 w-3.5 animate-spin" />Thinking...</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area with Dual Mode */}
        <div className="border-t border-border bg-background px-4 pb-2 pt-3">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex items-center gap-1">
              <button onClick={() => setInputMode("type")}
                className={clsx("flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  inputMode === "type" ? "bg-primary/10 text-primary" : "text-text-tertiary hover:text-foreground")}>
                <Keyboard className="h-3.5 w-3.5" />Type
              </button>
              <button onClick={() => setInputMode("speak")}
                className={clsx("flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                  inputMode === "speak" ? "bg-primary/10 text-primary" : "text-text-tertiary hover:text-foreground")}>
                <Mic className="h-3.5 w-3.5" />Speak
              </button>
            </div>

            {inputMode === "type" ? (
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="relative flex-1">
                  <textarea value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
                    rows={1}
                    className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-text-tertiary focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Ask me anything about your product..."
                    disabled={loading} />
                </div>
                <button type="submit" disabled={loading || !input.trim()}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-40">
                  {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center rounded-xl border border-border bg-surface py-6">
                {isRecording ? (
                  <>
                    <button onClick={stopRecording}
                      className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 shadow-lg shadow-red-500/30 animate-pulse">
                      <StopCircle className="h-7 w-7 text-white" />
                    </button>
                    <p className="text-lg font-mono font-bold text-red-600">{formatTime(recordingTime)}</p>
                    <p className="mt-1 text-xs text-red-500">Recording... Click to stop</p>
                    <div className="mt-3 flex h-6 items-center gap-[2px]">
                      {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className="w-[2px] rounded-full bg-red-400"
                          style={{ animation: `waveform 1.2s ease-in-out ${i * 0.03}s infinite alternate` }} />
                      ))}
                    </div>
                  </>
                ) : isTranscribing ? (
                  <>
                    <Loader2 className="mb-3 h-10 w-10 text-primary animate-spin" />
                    <p className="text-sm font-medium text-foreground">Transcribing & sending...</p>
                  </>
                ) : (
                  <>
                    <button onClick={startRecording}
                      className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 transition-all hover:scale-105"
                      style={{ animation: "mic-pulse 2s ease-in-out infinite" }}>
                      <Mic className="h-7 w-7 text-white" />
                    </button>
                    <p className="text-sm font-medium text-foreground">Click to speak</p>
                    <p className="mt-0.5 text-xs text-text-tertiary">Your voice message will be sent automatically</p>
                  </>
                )}
              </div>
            )}

            <p className="mt-2 text-center text-[11px] text-text-tertiary">
              Prodacto AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
      <ChatContent />
    </Suspense>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Loader2,
  Mic,
  MicOff,
  Sparkles,
  User,
  Bot,
  StopCircle,
} from "lucide-react";
import clsx from "clsx";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const initialVoice = searchParams.get("voice") === "true";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

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
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          projectId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: errData.error || "Something went wrong. Please try again.",
          };
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
                const { content } = JSON.parse(data);
                if (content) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: updated[updated.length - 1].content + content,
                    };
                    return updated;
                  });
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Failed to connect. Please check your connection and try again.",
        };
        return updated;
      });
    }

    setLoading(false);
  }, [loading, messages, projectId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert("Microphone access denied. Please allow microphone access.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const res = await fetch("/api/ai/voice", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { text } = await res.json();
        if (text) {
          sendMessage(text);
        }
      }
    } catch {
      alert("Transcription failed. Please try again.");
    }
    setIsTranscribing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const suggestions = [
    "Generate a PRD for a new feature",
    "Create user stories for onboarding flow",
    "Score these backlog items",
    "Analyze the market for my product",
  ];

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-4xl flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              How can I help you today?
            </h2>
            <p className="mt-2 max-w-md text-center text-sm text-text-secondary">
              I&apos;m your AI Product Manager. I can help you create PRDs, generate
              user stories, score backlogs, and more.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-lg border border-border bg-surface px-4 py-2.5 text-left text-sm text-text-secondary transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1 pt-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  "flex gap-3 px-4 py-3",
                  msg.role === "user" ? "bg-transparent" : "bg-surface/50"
                )}
              >
                <div
                  className={clsx(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs",
                    msg.role === "user"
                      ? "bg-foreground/10 text-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {msg.content}
                  {loading && i === messages.length - 1 && msg.role === "assistant" && !msg.content && (
                    <span className="inline-flex items-center gap-1 text-text-tertiary">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Thinking...
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background pb-2 pt-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={1}
              className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-text-tertiary focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder={
                isTranscribing
                  ? "Transcribing voice..."
                  : isRecording
                    ? "Recording... Click stop when done"
                    : "Ask me anything about your product..."
              }
              disabled={loading || isRecording || isTranscribing}
            />
          </div>

          {/* Voice Button */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading || isTranscribing}
            className={clsx(
              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl transition-colors",
              isRecording
                ? "bg-red-500 text-white hover:bg-red-600"
                : "border border-border bg-surface text-text-tertiary hover:bg-surface-hover hover:text-foreground"
            )}
          >
            {isTranscribing ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : isRecording ? (
              <StopCircle className="h-4.5 w-4.5" />
            ) : (
              <Mic className="h-4.5 w-4.5" />
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || !input.trim() || isRecording}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-dark disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Send className="h-4.5 w-4.5" />
            )}
          </button>
        </form>

        <p className="mt-2 text-center text-[11px] text-text-tertiary">
          Prodacto AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

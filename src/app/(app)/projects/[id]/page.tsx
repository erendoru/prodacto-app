"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderKanban,
  ListChecks,
  FileText,
  MessageSquare,
  Loader2,
  Trash2,
  Globe,
  Smartphone,
  Database,
} from "lucide-react";

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  platform: string;
  tech_stack: Record<string, string> | null;
  created_at: string;
  updated_at: string;
  backlog_items: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    story_points: number | null;
    created_at: string;
  }>;
  documents: Array<{
    id: string;
    title: string;
    template_type: string | null;
    created_at: string;
    updated_at: string;
  }>;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setProject)
      .catch(() => router.push("/projects"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project and all its data?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/projects");
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    TODO: "bg-gray-100 text-gray-600",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
    DONE: "bg-green-50 text-green-600",
  };

  const priorityColor: Record<string, string> = {
    LOW: "text-gray-500",
    MEDIUM: "text-blue-500",
    HIGH: "text-amber-500",
    CRITICAL: "text-red-500",
  };

  const backlogItems = project.backlog_items || [];
  const documents = project.documents || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="flex h-8 w-8 items-center justify-center rounded-md text-text-tertiary transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          {project.description && (
            <p className="mt-1 text-sm text-text-secondary">{project.description}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Platform",
            value: project.platform,
            icon: project.platform === "MOBILE" ? Smartphone : Globe,
          },
          { label: "Backlog Items", value: backlogItems.length, icon: ListChecks },
          { label: "Documents", value: documents.length, icon: FileText },
          { label: "Chat", value: "Open", icon: MessageSquare },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-text-tertiary">
              <stat.icon className="h-4 w-4" />
              <span className="text-xs">{stat.label}</span>
            </div>
            <p className="mt-1 text-lg font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href={`/chat?project=${id}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-medium text-foreground">AI Chat</span>
        </Link>
        <Link
          href={`/backlog?project=${id}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <ListChecks className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-medium text-foreground">Backlog</span>
        </Link>
        <Link
          href={`/context-vault?projectId=${id}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Database className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-medium text-foreground">Context Vault</span>
        </Link>
        <Link
          href={`/chat?project=${id}&template=prd`}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-medium text-foreground">Generate PRD</span>
        </Link>
      </div>

      {/* Backlog Items */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-tertiary">
          Backlog Items
        </h2>
        {backlogItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-tertiary">
            No backlog items yet. Use AI Chat to generate them.
          </div>
        ) : (
          <div className="space-y-2">
            {backlogItems.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${priorityColor[item.priority]}`}>
                    {item.priority}
                  </span>
                  <span className="text-sm text-foreground">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.story_points && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                      {item.story_points} SP
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[item.status]}`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

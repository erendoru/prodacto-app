"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  FolderKanban,
  MessageSquare,
  ListChecks,
  TrendingUp,
  Mic,
  FileText,
  Plus,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Loader2,
  Database,
  Shield,
  DollarSign,
  FlaskConical,
} from "lucide-react";
import OnboardingTour from "@/components/app/OnboardingTour";

const quickActions = [
  {
    label: "New Project",
    description: "Create a product project",
    href: "/projects?new=true",
    icon: FolderKanban,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "AI Chat",
    description: "Talk to your AI PM",
    href: "/chat",
    icon: MessageSquare,
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Voice Command",
    description: "Speak to create content",
    href: "/chat?voice=true",
    icon: Mic,
    color: "bg-primary/10 text-primary",
  },
  {
    label: "Create Backlog",
    description: "Generate scored items",
    href: "/backlog?new=true",
    icon: ListChecks,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Market Analysis",
    description: "Analyze any product",
    href: "/market-analysis",
    icon: TrendingUp,
    color: "bg-amber-50 text-amber-600",
  },
  {
    label: "PRD Generator",
    description: "AI-powered documents",
    href: "/prd/create",
    icon: FileText,
    color: "bg-rose-50 text-rose-600",
  },
  {
    label: "Context Vault",
    description: "Add knowledge for AI",
    href: "/context-vault",
    icon: Database,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    label: "AI Review",
    description: "CPO-level feedback",
    href: "/ai-review",
    icon: Shield,
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    label: "Business Case",
    description: "ROI & impact analysis",
    href: "/business-case",
    icon: DollarSign,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "A/B Tests",
    description: "Design experiments",
    href: "/experiments",
    icon: FlaskConical,
    color: "bg-violet-50 text-violet-600",
  },
  {
    label: "Voice Studio",
    description: "Record & structure notes",
    href: "/voice-studio",
    icon: Mic,
    color: "bg-pink-50 text-pink-600",
  },
];

interface DashboardProject {
  id: string;
  name: string;
  description: string | null;
  platform: string;
  created_at: string;
  backlog_items: { count: number }[];
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>("");
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then((res: { data: { user: { user_metadata?: Record<string, string>; email?: string } | null } }) => {
      const u = res.data.user;
      const name = u?.user_metadata?.full_name || u?.email?.split("@")[0] || "there";
      setUserName(name);
    });
  }, [supabase.auth]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setProjects(data.slice(0, 5)); setLoadingProjects(false); })
      .catch(() => setLoadingProjects(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [showTour, setShowTour] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <OnboardingTour />
      {showTour && <OnboardingTour />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {userName}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            What would you like to work on today?
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("prodacto_onboarding_seen");
            setShowTour(true);
            setTimeout(() => setShowTour(false), 100);
            window.location.reload();
          }}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-tertiary transition-colors hover:bg-surface-hover hover:text-foreground"
          title="Replay onboarding tour"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Tour
        </button>
      </div>

      {/* AI Command Bar */}
      <Link
        href="/chat"
        className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5 transition-all hover:border-primary/30 hover:shadow-sm"
      >
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="flex-1 text-sm text-text-tertiary">
          Ask AI to create a PRD, analyze a market, score your backlog...
        </span>
        <ArrowRight className="h-4 w-4 text-text-tertiary" />
      </Link>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-text-tertiary">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs text-text-tertiary">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-tertiary">
            Recent Projects
          </h2>
          <Link href="/projects" className="text-xs font-medium text-primary hover:text-primary-dark">
            View all
          </Link>
        </div>
        {loadingProjects ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center">
            <FolderKanban className="mx-auto h-8 w-8 text-text-tertiary/50" />
            <p className="mt-3 text-sm font-medium text-text-secondary">No projects yet</p>
            <p className="mt-1 text-xs text-text-tertiary">Create your first project to get started</p>
            <Link href="/projects?new=true"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-dark">
              <Plus className="h-3.5 w-3.5" />New Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const backlogCount = project.backlog_items?.[0]?.count || 0;
              return (
                <Link key={project.id} href={`/projects/${project.id}`}
                  className="group rounded-xl border border-border bg-surface p-4 transition-all hover:border-primary/30 hover:shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <FolderKanban className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-text-tertiary">{project.platform}</span>
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary">{project.name}</h3>
                  {project.description && (
                    <p className="mt-1 text-xs text-text-tertiary line-clamp-2">{project.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-3 text-[10px] text-text-tertiary">
                    <span className="flex items-center gap-1"><ListChecks className="h-3 w-3" />{backlogCount} backlog items</span>
                    <span>{new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              );
            })}
            <Link href="/projects?new=true"
              className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-4 text-center transition-all hover:border-primary/30 hover:bg-surface">
              <Plus className="h-6 w-6 text-text-tertiary" />
              <span className="mt-2 text-xs font-medium text-text-tertiary">New Project</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

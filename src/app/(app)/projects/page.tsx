"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  FolderKanban,
  ListChecks,
  FileText,
  Trash2,
  X,
  Loader2,
  Globe,
  Smartphone,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import clsx from "clsx";

interface Project {
  id: string;
  name: string;
  description: string | null;
  platform: string;
  tech_stack: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  backlog_items: { count: number }[];
  documents: { count: number }[];
}

const FRONTEND_OPTIONS = ["React", "Next.js", "Vue.js", "Angular", "Svelte", "React Native", "Flutter", "Swift", "Kotlin", "Other"];
const BACKEND_OPTIONS = ["Node.js", "Python", "Go", "Java", "Ruby", "PHP", "C#/.NET", "Rust", "Other"];
const DATABASE_OPTIONS = ["PostgreSQL", "MySQL", "MongoDB", "Supabase", "Firebase", "DynamoDB", "Redis", "Other"];
const TOOL_OPTIONS = ["Jira", "Linear", "Notion", "Figma", "GitHub", "GitLab", "Slack", "Vercel", "AWS", "Docker"];

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(searchParams.get("new") === "true");
  const [wizardStep, setWizardStep] = useState(1);

  // Step 1: Basics
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPlatform, setNewPlatform] = useState("WEB");

  // Step 2: Tech Stack
  const [frontend, setFrontend] = useState<string[]>([]);
  const [backend, setBackend] = useState<string[]>([]);
  const [database, setDatabase] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const toggleChip = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const techStack = {
      frontend: frontend.length > 0 ? frontend : undefined,
      backend: backend.length > 0 ? backend : undefined,
      database: database.length > 0 ? database : undefined,
      tools: tools.length > 0 ? tools : undefined,
      teamSize: teamSize || undefined,
      notes: extraNotes.trim() || undefined,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        description: newDesc,
        platform: newPlatform,
        techStack: Object.keys(techStack).some((k) => techStack[k as keyof typeof techStack]) ? techStack : null,
      }),
    });

    if (res.ok) {
      setNewName(""); setNewDesc(""); setNewPlatform("WEB");
      setFrontend([]); setBackend([]); setDatabase([]); setTools([]); setTeamSize(""); setExtraNotes("");
      setShowNew(false); setWizardStep(1);
      fetchProjects();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create project");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) fetchProjects();
  };

  const platformIcon = (p: string) =>
    p === "MOBILE" ? <Smartphone className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />;

  const getCount = (arr: { count: number }[] | undefined) => arr?.[0]?.count ?? 0;

  const chipGroup = (options: string[], selected: string[], setSelected: (v: string[]) => void) => (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o} type="button"
          onClick={() => toggleChip(selected, setSelected, o)}
          className={clsx(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
            selected.includes(o)
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-text-secondary hover:border-primary/30"
          )}
        >
          {selected.includes(o) && "✓ "}{o}
        </button>
      ))}
    </div>
  );

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
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage your product projects</p>
        </div>
        <button
          onClick={() => { setShowNew(true); setWizardStep(1); }}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* New Project Modal — 2-Step Wizard */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <form
            onSubmit={wizardStep === 2 ? handleCreate : (e) => { e.preventDefault(); setWizardStep(2); }}
            className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {wizardStep === 1 ? "New Project" : "Tech Stack & Team"}
              </h2>
              <button type="button" onClick={() => { setShowNew(false); setWizardStep(1); }} className="text-text-tertiary hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="mb-5 flex items-center gap-2">
              <div className={clsx("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                wizardStep >= 1 ? "bg-primary text-white" : "bg-muted text-text-tertiary")}>1</div>
              <span className="text-xs text-text-tertiary">Basics</span>
              <div className="h-px w-6 bg-border" />
              <div className={clsx("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                wizardStep >= 2 ? "bg-primary text-white" : "bg-muted text-text-tertiary")}>2</div>
              <span className="text-xs text-text-tertiary">Tech Stack</span>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Project Name</label>
                  <input
                    value={newName} onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. A101 Mobile App" required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Description</label>
                  <textarea
                    value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Describe your product briefly..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Platform</label>
                  <select
                    value={newPlatform} onChange={(e) => setNewPlatform(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="WEB">Web</option>
                    <option value="MOBILE">Mobile</option>
                    <option value="BOTH">Web + Mobile</option>
                  </select>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Frontend</label>
                  {chipGroup(FRONTEND_OPTIONS, frontend, setFrontend)}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Backend</label>
                  {chipGroup(BACKEND_OPTIONS, backend, setBackend)}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Database</label>
                  {chipGroup(DATABASE_OPTIONS, database, setDatabase)}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Tools & Services</label>
                  {chipGroup(TOOL_OPTIONS, tools, setTools)}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Team Size</label>
                  <select
                    value={teamSize} onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  >
                    <option value="">Select...</option>
                    <option value="solo">Solo (just me)</option>
                    <option value="small">Small (2-5)</option>
                    <option value="medium">Medium (6-15)</option>
                    <option value="large">Large (15+)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Additional Notes
                  </label>
                  <textarea
                    value={extraNotes} onChange={(e) => setExtraNotes(e.target.value)} rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Any extra technologies, dependencies, constraints, or things AI should know? e.g. We use a microservices architecture, our API gateway is Kong, we have a legacy PHP backend..."
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-5 flex gap-3">
              {wizardStep === 1 ? (
                <>
                  <button type="button" onClick={() => setShowNew(false)}
                    className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover">
                    Cancel
                  </button>
                  <button type="submit" disabled={!newName.trim()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setWizardStep(1)}
                    className="flex items-center gap-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover">
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" disabled={creating}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
                    {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                    Create Project
                  </button>
                </>
              )}
            </div>

            {wizardStep === 2 && (
              <p className="mt-3 text-center text-xs text-text-tertiary">
                This helps AI generate better backlogs for your project. You can skip and add later.
              </p>
            )}
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/50 p-12 text-center">
          <FolderKanban className="mx-auto h-10 w-10 text-text-tertiary/50" />
          <p className="mt-4 text-sm font-medium text-text-secondary">No projects yet</p>
          <p className="mt-1 text-xs text-text-tertiary">Create your first project to start managing your product</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="group relative rounded-xl border border-border bg-surface p-5 transition-all hover:border-primary/30 hover:shadow-sm">
              <Link href={`/projects/${project.id}`} className="absolute inset-0 z-10" />
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <button onClick={(e) => { e.preventDefault(); handleDelete(project.id); }}
                  className="relative z-20 rounded-md p-1.5 text-text-tertiary opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary">{project.name}</h3>
              {project.description && (
                <p className="mt-1 line-clamp-2 text-xs text-text-tertiary">{project.description}</p>
              )}
              {project.tech_stack && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {[...(project.tech_stack.frontend as string[] || []), ...(project.tech_stack.backend as string[] || [])].slice(0, 3).map((t) => (
                    <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-text-tertiary">{t}</span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center gap-3 text-xs text-text-tertiary">
                <span className="flex items-center gap-1">{platformIcon(project.platform)} {project.platform}</span>
                <span className="flex items-center gap-1"><ListChecks className="h-3.5 w-3.5" /> {getCount(project.backlog_items)}</span>
                <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {getCount(project.documents)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Database,
  Plus,
  Loader2,
  X,
  Pencil,
  Trash2,
  Save,
  FileText,
  Users,
  Target,
  AlertTriangle,
  BookOpen,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

interface VaultItem {
  id: string;
  project_id: string;
  title: string;
  content: string;
  type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  projects?: { name: string };
}

interface Project {
  id: string;
  name: string;
}

const CONTEXT_TYPES = [
  { value: "note", label: "Note", icon: StickyNote, color: "bg-gray-100 text-gray-600" },
  { value: "persona", label: "Persona", icon: Users, color: "bg-blue-50 text-blue-600" },
  { value: "competitor", label: "Competitor", icon: Target, color: "bg-red-50 text-red-600" },
  { value: "constraint", label: "Constraint", icon: AlertTriangle, color: "bg-amber-50 text-amber-600" },
  { value: "reference", label: "Reference", icon: BookOpen, color: "bg-purple-50 text-purple-600" },
  { value: "company", label: "Company Info", icon: FileText, color: "bg-green-50 text-green-600" },
];

function getTypeConfig(type: string) {
  return CONTEXT_TYPES.find((t) => t.value === type) || CONTEXT_TYPES[0];
}

export default function ContextVaultPage() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId") || "";

  const [items, setItems] = useState<VaultItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(initialProjectId);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formType, setFormType] = useState("note");
  const [formProject, setFormProject] = useState("");

  useEffect(() => {
    fetch("/api/projects").then((r) => r.ok ? r.json() : []).then(setProjects);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [selectedProject]);

  const fetchItems = async () => {
    setLoading(true);
    const url = selectedProject
      ? `/api/context-vault?projectId=${selectedProject}`
      : "/api/context-vault";
    const res = await fetch(url);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormContent("");
    setFormType("note");
    setFormProject(selectedProject || (projects[0]?.id ?? ""));
    setShowModal(true);
  };

  const openEdit = (item: VaultItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormType(item.type);
    setFormProject(item.project_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formContent.trim() || !formProject) return;
    setSaving(true);

    if (editingItem) {
      const res = await fetch(`/api/context-vault/${editingItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: formTitle, content: formContent, type: formType }),
      });
      if (res.ok) {
        const updated = await res.json();
        setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
      }
    } else {
      const res = await fetch("/api/context-vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: formProject, title: formTitle, content: formContent, type: formType }),
      });
      if (res.ok) fetchItems();
    }

    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/context-vault/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !filterType || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const groupedByType = filteredItems.reduce<Record<string, VaultItem[]>>((acc, item) => {
    const key = item.type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            Context Vault
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Store company info, personas, competitors, and constraints. AI uses this context automatically.
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark">
          <Plus className="h-4 w-4" />Add Context
        </button>
      </div>

      {/* AI Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">AI automatically uses your vault</p>
          <p className="text-xs text-text-secondary mt-0.5">
            Everything you add here is included as context when generating backlogs, PRDs, and chat responses for the selected project. 
            The more context you provide, the better AI output you get.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
          <option value="">All Projects</option>
          {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"
            placeholder="Search vault..." />
        </div>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
          <option value="">All Types</option>
          {CONTEXT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
        </select>

        <span className="text-sm text-text-tertiary">{filteredItems.length} items</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Database className="mx-auto h-10 w-10 text-text-tertiary/50" />
          <p className="mt-4 text-sm font-medium text-text-secondary">No context items yet</p>
          <p className="mt-1 text-xs text-text-tertiary">
            Add company info, personas, competitors, and constraints to help AI generate better output.
          </p>
          <button onClick={openCreate}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-dark">
            <Plus className="h-3.5 w-3.5" />Add Your First Context
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByType).map(([type, typeItems]) => {
            const config = getTypeConfig(type);
            const TypeIcon = config.icon;
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${config.color}`}>
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{config.label}</h3>
                  <span className="text-xs text-text-tertiary">{typeItems.length} items</span>
                </div>
                <div className="space-y-2 pl-2">
                  {typeItems.map((item) => {
                    const isExpanded = expandedId === item.id;
                    return (
                      <div key={item.id} className="rounded-xl border border-border bg-surface transition-all hover:border-border-hover">
                        <div className="flex items-center gap-3 p-3.5 cursor-pointer"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                              {item.projects && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-text-tertiary">
                                  {item.projects.name}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-text-secondary line-clamp-1">{item.content}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                              className="rounded-md p-1.5 text-text-tertiary hover:bg-blue-50 hover:text-blue-600">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                              className="rounded-md p-1.5 text-text-tertiary hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            {isExpanded ? <ChevronUp className="h-4 w-4 text-text-tertiary" /> : <ChevronDown className="h-4 w-4 text-text-tertiary" />}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="border-t border-border px-4 py-3">
                            <div className="prose prose-sm max-w-none text-text-secondary whitespace-pre-wrap">
                              {item.content}
                            </div>
                            <p className="mt-3 text-[10px] text-text-tertiary">
                              Updated {new Date(item.updated_at).toLocaleDateString()} at {new Date(item.updated_at).toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-lg mx-4">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editingItem ? "Edit Context" : "Add Context"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-text-tertiary hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!editingItem && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Project</label>
                  <select value={formProject} onChange={(e) => setFormProject(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary" required>
                    <option value="">Select a project</option>
                    {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Type</label>
                <div className="flex flex-wrap gap-2">
                  {CONTEXT_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button key={t.value} onClick={() => setFormType(t.value)}
                        className={clsx(
                          "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                          formType === t.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-text-secondary hover:border-border-hover"
                        )}>
                        <Icon className="h-3.5 w-3.5" />{t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Title</label>
                <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  placeholder={
                    formType === "persona" ? "e.g. Enterprise Buyer - CTO" :
                    formType === "competitor" ? "e.g. ChatPRD - AI PRD Tool" :
                    formType === "constraint" ? "e.g. GDPR Compliance Required" :
                    formType === "company" ? "e.g. Company Mission & Values" :
                    "e.g. Key Architecture Decision"
                  } />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Content</label>
                <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} rows={6}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  placeholder={
                    formType === "persona" ? "Age: 35-50, Role: CTO/VP Engineering, Pain points: too many meetings, needs clear specs..." :
                    formType === "competitor" ? "Pricing: $15/mo, Strengths: Notion integration, Weaknesses: no voice input..." :
                    formType === "constraint" ? "All data must be stored in EU region, SOC2 compliance required by Q3..." :
                    formType === "company" ? "We are a B2B SaaS company serving mid-market. 50 employees, $5M ARR..." :
                    "Detailed notes, context, or information that AI should know about..."
                  } />
                <p className="mt-1 text-xs text-text-tertiary">
                  Markdown supported. The more detail you provide, the better AI output.
                </p>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !formTitle.trim() || !formContent.trim() || !formProject}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />{editingItem ? "Update" : "Save"}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

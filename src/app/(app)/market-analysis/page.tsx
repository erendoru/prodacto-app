"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Target,
  Users,
  Shield,
  Lightbulb,
  X,
} from "lucide-react";
import clsx from "clsx";

interface MarketReport {
  summary: string;
  tam: { value: string; description: string };
  sam: { value: string; description: string };
  som: { value: string; description: string };
  competitors: Array<{
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
    marketShare: string;
  }>;
  trends: Array<{ trend: string; description: string; impact: string }>;
  opportunities: string[];
  threats: string[];
  gtmStrategy: {
    targetSegments: string[];
    channels: string[];
    pricing: string;
    positioning: string;
  };
  recommendations: string[];
}

interface Analysis {
  id: string;
  product_name: string;
  report: MarketReport;
  created_at: string;
}

export default function MarketAnalysisPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState("");
  const [context, setContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchAnalyses = async () => {
    const res = await fetch("/api/market-analysis");
    if (res.ok) setAnalyses(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;
    setGenerating(true);

    const res = await fetch("/api/market-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName, additionalContext: context }),
    });

    if (res.ok) {
      const newAnalysis = await res.json();
      setAnalyses((prev) => [newAnalysis, ...prev]);
      setExpandedId(newAnalysis.id);
      setProductName("");
      setContext("");
      setShowForm(false);
    }
    setGenerating(false);
  };

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
          <h1 className="text-2xl font-bold text-foreground">Market Analysis</h1>
          <p className="mt-1 text-sm text-text-secondary">
            AI-powered market research and competitive analysis
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <Sparkles className="h-4 w-4" />
          New Analysis
        </button>
      </div>

      {/* Generate Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <form
            onSubmit={handleGenerate}
            className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-lg"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">New Market Analysis</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-text-tertiary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Product / Market Name
                </label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="e.g. AI Product Management Tools"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Additional Context (optional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Target region, specific competitors, focus areas..."
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Analyses List */}
      {analyses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <TrendingUp className="mx-auto h-10 w-10 text-text-tertiary/50" />
          <p className="mt-4 text-sm font-medium text-text-secondary">No analyses yet</p>
          <p className="mt-1 text-xs text-text-tertiary">
            Enter a product name to get an instant AI-powered market analysis
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => {
            const r = analysis.report;
            const isExpanded = expandedId === analysis.id;

            return (
              <div
                key={analysis.id}
                className="rounded-xl border border-border bg-surface overflow-hidden"
              >
                <div
                  className="flex cursor-pointer items-center justify-between p-5"
                  onClick={() => setExpandedId(isExpanded ? null : analysis.id)}
                >
                  <div>
                    <h3 className="text-base font-bold text-foreground">{analysis.product_name}</h3>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {new Date(analysis.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-text-tertiary" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-text-tertiary" />
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-5 space-y-6">
                    {/* Summary */}
                    <p className="text-sm leading-relaxed text-text-secondary">{r.summary}</p>

                    {/* TAM/SAM/SOM */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "TAM", data: r.tam },
                        { label: "SAM", data: r.sam },
                        { label: "SOM", data: r.som },
                      ].map((m) => (
                        <div key={m.label} className="rounded-lg bg-muted p-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-text-tertiary">
                            <Target className="h-3.5 w-3.5" />
                            {m.label}
                          </div>
                          <p className="mt-1 text-lg font-bold text-primary">{m.data.value}</p>
                          <p className="mt-1 text-xs text-text-tertiary">{m.data.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* Competitors */}
                    {r.competitors && r.competitors.length > 0 && (
                      <div>
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-text-tertiary">
                          <Users className="h-3.5 w-3.5" />
                          Competitors
                        </h4>
                        <div className="space-y-2">
                          {r.competitors.map((c, i) => (
                            <div key={i} className="rounded-lg bg-muted p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground">{c.name}</span>
                                <span className="text-xs text-text-tertiary">{c.marketShare}</span>
                              </div>
                              <p className="mt-1 text-xs text-text-secondary">{c.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Trends */}
                    {r.trends && r.trends.length > 0 && (
                      <div>
                        <h4 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase text-text-tertiary">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Market Trends
                        </h4>
                        <div className="space-y-2">
                          {r.trends.map((t, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-lg bg-muted p-3">
                              <span
                                className={clsx(
                                  "mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                                  t.impact === "HIGH"
                                    ? "bg-red-50 text-red-600"
                                    : t.impact === "MEDIUM"
                                      ? "bg-amber-50 text-amber-600"
                                      : "bg-green-50 text-green-600"
                                )}
                              >
                                {t.impact}
                              </span>
                              <div>
                                <p className="text-sm font-medium text-foreground">{t.trend}</p>
                                <p className="mt-0.5 text-xs text-text-tertiary">{t.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opportunities & Threats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-green-600">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Opportunities
                        </h4>
                        <ul className="space-y-1">
                          {r.opportunities?.map((o, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-red-600">
                          <Shield className="h-3.5 w-3.5" />
                          Threats
                        </h4>
                        <ul className="space-y-1">
                          {r.threats?.map((t, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {r.recommendations && r.recommendations.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase text-text-tertiary">
                          Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {r.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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

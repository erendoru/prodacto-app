"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, Loader2, TrendingUp, Clock, AlertTriangle, CheckCircle2,
  ThumbsUp, ThumbsDown, Minus, ArrowRight,
} from "lucide-react";
import clsx from "clsx";

interface Project { id: string; name: string; }

interface BusinessCase {
  revenue_impact: { direct_revenue: string; indirect_revenue: string; confidence: string };
  cost_analysis: { development_cost: string; maintenance_cost: string; opportunity_cost: string };
  roi: { payback_period: string; projected_roi_6m: string; projected_roi_12m: string };
  cost_of_delay: { weekly_cost: string; competitive_risk: string; market_timing: string };
  risk_assessment: { technical_risk: string; market_risk: string; execution_risk: string };
  recommendation: string;
  priority_score: number;
  executive_summary: string;
}

function RiskBadge({ level }: { level: string }) {
  const l = level.split(" ")[0]?.toUpperCase();
  const cls = l === "LOW" ? "bg-green-50 text-green-700" : l === "HIGH" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700";
  return <span className={clsx("rounded-full px-2 py-0.5 text-[10px] font-bold", cls)}>{l}</span>;
}

export default function BusinessCasePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [devDays, setDevDays] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BusinessCase | null>(null);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.ok ? r.json() : []).then(setProjects);
  }, []);

  const handleAnalyze = async () => {
    if (!featureName.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/business-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject || undefined,
          featureName,
          featureDescription,
          estimatedDevDays: devDays ? parseInt(devDays) : undefined,
          teamSize: teamSize ? parseInt(teamSize) : undefined,
        }),
      });
      if (res.ok) setResult(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  };

  const RecIcon = result?.recommendation?.startsWith("BUILD") ? ThumbsUp : result?.recommendation?.startsWith("KILL") ? ThumbsDown : Minus;
  const recColor = result?.recommendation?.startsWith("BUILD") ? "text-green-600 bg-green-50 border-green-200" : result?.recommendation?.startsWith("KILL") ? "text-red-600 bg-red-50 border-red-200" : "text-amber-600 bg-amber-50 border-amber-200";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><DollarSign className="h-6 w-6 text-primary" />Business Case Builder</h1>
        <p className="mt-1 text-sm text-text-secondary">AI-powered ROI analysis, cost of delay, and build/defer/kill recommendations</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Project (optional)</label>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option value="">Select project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Feature Name *</label>
            <input value={featureName} onChange={(e) => setFeatureName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="e.g. Real-time notifications" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-foreground">Description</label>
            <textarea value={featureDescription} onChange={(e) => setFeatureDescription(e.target.value)} rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Describe the feature scope and expected impact..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Estimated Dev Days</label>
            <input type="number" value={devDays} onChange={(e) => setDevDays(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="e.g. 15" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">Team Size</label>
            <input type="number" value={teamSize} onChange={(e) => setTeamSize(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" placeholder="e.g. 3" />
          </div>
        </div>
        <button onClick={handleAnalyze} disabled={loading || !featureName.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing...</> : <><DollarSign className="h-4 w-4" />Analyze Business Case</>}
        </button>
      </div>

      {result && (
        <div className="space-y-4">
          <div className={clsx("flex items-center gap-4 rounded-xl border p-5", recColor)}>
            <RecIcon className="h-8 w-8 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">{result.recommendation}</span>
                <span className="rounded-full bg-white/50 px-2 py-0.5 text-xs font-bold">Priority: {result.priority_score}/10</span>
              </div>
              <p className="mt-1 text-sm">{result.executive_summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-4">
              <h4 className="mb-3 flex items-center gap-1 text-xs font-bold text-foreground"><TrendingUp className="h-3.5 w-3.5 text-green-600" />Revenue Impact</h4>
              <div className="space-y-2 text-xs text-text-secondary">
                <div><span className="font-medium text-foreground">Direct:</span> {result.revenue_impact.direct_revenue}</div>
                <div><span className="font-medium text-foreground">Indirect:</span> {result.revenue_impact.indirect_revenue}</div>
                <div className="flex items-center gap-1"><span className="font-medium text-foreground">Confidence:</span>
                  <span className={clsx("rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    result.revenue_impact.confidence === "HIGH" ? "bg-green-50 text-green-700" : result.revenue_impact.confidence === "MEDIUM" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>
                    {result.revenue_impact.confidence}
                  </span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <h4 className="mb-3 flex items-center gap-1 text-xs font-bold text-foreground"><DollarSign className="h-3.5 w-3.5 text-amber-600" />ROI</h4>
              <div className="space-y-2 text-xs text-text-secondary">
                <div><span className="font-medium text-foreground">Payback:</span> {result.roi.payback_period}</div>
                <div><span className="font-medium text-foreground">6m ROI:</span> {result.roi.projected_roi_6m}</div>
                <div><span className="font-medium text-foreground">12m ROI:</span> {result.roi.projected_roi_12m}</div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <h4 className="mb-3 flex items-center gap-1 text-xs font-bold text-foreground"><Clock className="h-3.5 w-3.5 text-red-600" />Cost of Delay</h4>
              <div className="space-y-2 text-xs text-text-secondary">
                <div><span className="font-medium text-foreground">Weekly:</span> {result.cost_of_delay.weekly_cost}</div>
                <div><span className="font-medium text-foreground">Competitive:</span> {result.cost_of_delay.competitive_risk}</div>
                <div><span className="font-medium text-foreground">Timing:</span> {result.cost_of_delay.market_timing}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4">
              <h4 className="mb-3 flex items-center gap-1 text-xs font-bold text-foreground"><DollarSign className="h-3.5 w-3.5" />Cost Analysis</h4>
              <div className="space-y-2 text-xs text-text-secondary">
                <div><span className="font-medium text-foreground">Development:</span> {result.cost_analysis.development_cost}</div>
                <div><span className="font-medium text-foreground">Maintenance:</span> {result.cost_analysis.maintenance_cost}</div>
                <div><span className="font-medium text-foreground">Opportunity:</span> {result.cost_analysis.opportunity_cost}</div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-4">
              <h4 className="mb-3 flex items-center gap-1 text-xs font-bold text-foreground"><AlertTriangle className="h-3.5 w-3.5 text-amber-600" />Risk Assessment</h4>
              <div className="space-y-2 text-xs text-text-secondary">
                <div className="flex items-center gap-2"><span className="font-medium text-foreground w-20">Technical:</span><RiskBadge level={result.risk_assessment.technical_risk} /></div>
                <div className="flex items-center gap-2"><span className="font-medium text-foreground w-20">Market:</span><RiskBadge level={result.risk_assessment.market_risk} /></div>
                <div className="flex items-center gap-2"><span className="font-medium text-foreground w-20">Execution:</span><RiskBadge level={result.risk_assessment.execution_risk} /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

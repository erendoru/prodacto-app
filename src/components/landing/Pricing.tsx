"use client";

import { motion } from "framer-motion";
import { Check, X, Star } from "lucide-react";

interface PlanFeature {
  label: string;
  free: string | boolean;
  pro: string | boolean;
  team: string | boolean;
}

const planFeatures: PlanFeature[] = [
  { label: "AI queries", free: "20/mo", pro: "Unlimited", team: "Unlimited" },
  { label: "Projects", free: "1", pro: "10", team: "Unlimited" },
  { label: "Voice commands", free: "5 trials", pro: true, team: true },
  { label: "Document templates", free: "3 basic", pro: "20+", team: "20+ & Custom" },
  { label: "Backlog scoring", free: "Basic", pro: "Advanced + SP", team: "Advanced + SP" },
  { label: "Market analysis", free: false, pro: "5/mo", team: "Unlimited" },
  { label: "Inline annotation", free: false, pro: true, team: true },
  { label: "AI coaching", free: false, pro: true, team: true },
  { label: "Document scoring", free: false, pro: true, team: true },
  { label: "Project memory", free: "Basic", pro: "Advanced", team: "Advanced" },
  { label: "Jira integration", free: false, pro: true, team: true },
  { label: "Linear / Slack / Notion", free: false, pro: false, team: true },
  { label: "MCP (IDE)", free: false, pro: false, team: true },
  { label: "Shared workspace", free: false, pro: false, team: true },
  { label: "Custom templates", free: false, pro: false, team: true },
  { label: "Admin panel", free: false, pro: false, team: true },
];

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-accent" />;
  if (value === false) return <X className="mx-auto h-4 w-4 text-text-tertiary/40" />;
  return <span className="text-sm text-foreground">{value}</span>;
}

export default function Pricing() {
  return (
    <section id="pricing" className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            Pricing for everyone
          </h2>
          <p className="mx-auto max-w-xl text-text-secondary">
            Start free, upgrade as you grow. Get 2 months free with annual billing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-12 grid gap-6 md:grid-cols-3"
        >
          {/* Free */}
          <div className="section-card flex flex-col p-8">
            <h3 className="mb-1 text-lg font-bold text-foreground">Free</h3>
            <p className="mb-6 text-sm text-text-secondary">Perfect to get started</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-foreground">$0</span>
              <span className="text-text-secondary">/mo</span>
            </div>
            <a href="/signup" className="mb-6 block rounded-full border border-border py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Get started free
            </a>
            <ul className="space-y-3">
              {["20 AI queries/mo", "1 project", "5 voice command trials", "3 basic templates", "Basic backlog scoring"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="section-card relative flex flex-col border-primary/30 p-8 shadow-lg shadow-primary/5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
                <Star className="h-3 w-3" />
                Most Popular
              </span>
            </div>
            <h3 className="mb-1 text-lg font-bold text-foreground">Pro</h3>
            <p className="mb-6 text-sm text-text-secondary">Unlimited AI power</p>
            <div className="mb-1">
              <span className="text-4xl font-bold text-foreground">$12</span>
              <span className="text-text-secondary">/mo</span>
            </div>
            <p className="mb-6 text-xs text-text-tertiary">$119/year with annual billing</p>
            <a href="/signup" className="mb-6 block rounded-full bg-primary py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90">
              Upgrade to Pro
            </a>
            <ul className="space-y-3">
              {["Unlimited AI queries", "10 projects", "Unlimited voice commands", "20+ templates", "Advanced scoring + SP", "5 market analyses/mo", "Inline annotation", "AI coaching & scoring", "Jira integration", "Priority support"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Team */}
          <div className="section-card flex flex-col p-8">
            <h3 className="mb-1 text-lg font-bold text-foreground">Team</h3>
            <p className="mb-6 text-sm text-text-secondary">Collaboration for teams</p>
            <div className="mb-1">
              <span className="text-4xl font-bold text-foreground">$24</span>
              <span className="text-text-secondary">/seat/mo</span>
            </div>
            <p className="mb-6 text-xs text-text-tertiary">$239/seat/year with annual billing</p>
            <a href="/signup" className="mb-6 block rounded-full border border-border py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Try Team
            </a>
            <ul className="space-y-3">
              {["Everything in Pro +", "Unlimited projects", "Unlimited market analyses", "Linear / Slack / Notion", "MCP (IDE connectivity)", "Shared workspace", "Custom templates", "Admin panel & roles", "Priority support + onboarding"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Check className="h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Detailed table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="section-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 px-6 text-left text-sm font-medium text-text-secondary">Feature</th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-text-secondary">Free</th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-primary">Pro</th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-text-secondary">Team</th>
                </tr>
              </thead>
              <tbody>
                {planFeatures.map((feature, i) => (
                  <tr key={feature.label} className={i % 2 === 0 ? "bg-transparent" : "bg-muted/50"}>
                    <td className="py-3 px-6 text-sm text-foreground">{feature.label}</td>
                    <td className="py-3 px-6 text-center"><FeatureCell value={feature.free} /></td>
                    <td className="py-3 px-6 text-center"><FeatureCell value={feature.pro} /></td>
                    <td className="py-3 px-6 text-center"><FeatureCell value={feature.team} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

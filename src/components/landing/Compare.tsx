"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

interface CompareItem {
  feature: string;
  prodacto: boolean | "partial";
  chatprd: boolean | "partial";
  notionAi: boolean | "partial";
  chatgpt: boolean | "partial";
}

const compareData: CompareItem[] = [
  { feature: "PM-specific AI", prodacto: true, chatprd: true, notionAi: false, chatgpt: false },
  { feature: "Voice commands", prodacto: true, chatprd: false, notionAi: false, chatgpt: false },
  { feature: "Backlog scoring", prodacto: true, chatprd: false, notionAi: false, chatgpt: false },
  { feature: "Market analysis", prodacto: true, chatprd: false, notionAi: false, chatgpt: "partial" },
  { feature: "Inline editing", prodacto: true, chatprd: "partial", notionAi: false, chatgpt: false },
  { feature: "AI coaching", prodacto: true, chatprd: true, notionAi: false, chatgpt: false },
  { feature: "Document scoring", prodacto: true, chatprd: true, notionAi: false, chatgpt: false },
  { feature: "Jira sync", prodacto: true, chatprd: false, notionAi: false, chatgpt: false },
  { feature: "Project memory", prodacto: true, chatprd: true, notionAi: true, chatgpt: "partial" },
];

function StatusIcon({ value }: { value: boolean | "partial" }) {
  if (value === true) return <Check className="mx-auto h-4 w-4 text-accent" />;
  if (value === "partial") return <Minus className="mx-auto h-4 w-4 text-amber-500" />;
  return <X className="mx-auto h-4 w-4 text-text-tertiary/30" />;
}

export default function Compare() {
  return (
    <section id="compare" className="px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            Why Prodacto?
          </h2>
          <p className="mx-auto max-w-xl text-text-secondary">
            See how we compare to alternatives
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="section-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-4 px-6 text-left text-sm font-medium text-text-secondary">Feature</th>
                  <th className="py-4 px-6 text-center">
                    <span className="text-sm font-bold text-primary">Prodacto</span><br />
                    <span className="text-xs text-text-tertiary">$12/mo</span>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="text-sm font-medium text-foreground">ChatPRD</span><br />
                    <span className="text-xs text-text-tertiary">$15/mo</span>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="text-sm font-medium text-foreground">Notion AI</span><br />
                    <span className="text-xs text-text-tertiary">$10/mo</span>
                  </th>
                  <th className="py-4 px-6 text-center">
                    <span className="text-sm font-medium text-foreground">ChatGPT</span><br />
                    <span className="text-xs text-text-tertiary">$20/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareData.map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-transparent" : "bg-muted/50"}>
                    <td className="py-3 px-6 text-sm text-foreground">{row.feature}</td>
                    <td className="py-3 px-6 text-center"><StatusIcon value={row.prodacto} /></td>
                    <td className="py-3 px-6 text-center"><StatusIcon value={row.chatprd} /></td>
                    <td className="py-3 px-6 text-center"><StatusIcon value={row.notionAi} /></td>
                    <td className="py-3 px-6 text-center"><StatusIcon value={row.chatgpt} /></td>
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

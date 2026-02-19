"use client";

import { motion } from "framer-motion";
import { Mic, Bot, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Mic,
    title: "Speak or type",
    description: "Press the mic and describe your idea, or type it out. English and Turkish supported.",
    color: "text-primary",
    bg: "bg-primary/8",
  },
  {
    number: "02",
    icon: Bot,
    title: "AI generates",
    description: "Prodacto creates structured output, scores the backlog, and flags risks. In seconds.",
    color: "text-primary",
    bg: "bg-primary/8",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Edit & ship",
    description: "Inline edit, approve, and push to Jira or export to Notion in one click.",
    color: "text-primary",
    bg: "bg-primary/8",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            Get started in 3 steps
          </h2>
          <p className="mx-auto max-w-xl text-text-secondary">
            No complex setup. Start talking right away.
          </p>
        </motion.div>

        <div className="relative grid gap-8 md:grid-cols-3">
          <div className="pointer-events-none absolute top-12 right-0 left-0 hidden h-px bg-border md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="relative text-center"
            >
              <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg} ${step.color}`}>
                <step.icon className="h-6 w-6" />
              </div>
              <span className="mb-1.5 block font-mono text-xs font-bold text-primary">
                {step.number}
              </span>
              <h3 className="mb-2 text-lg font-bold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

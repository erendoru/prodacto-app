"use client";

import { motion } from "framer-motion";
import {
  RefreshCw,
  Clock,
  FileText,
  TrendingDown,
  AlertTriangle,
  Search,
} from "lucide-react";

const problems = [
  {
    icon: RefreshCw,
    title: "Tool chaos",
    description: "Switching between 6+ tools every day — Jira, Notion, Docs, Slack, and more.",
  },
  {
    icon: Clock,
    title: "Hours on documentation",
    description: "PRDs take 3-4 hours, backlog creation takes 2, test plans take 1.",
  },
  {
    icon: FileText,
    title: "Starting from scratch",
    description: "Rewriting the same prompts, formats, and structures over and over.",
  },
  {
    icon: TrendingDown,
    title: "Inconsistent quality",
    description: "Is the backlog dev-ready? Nobody is really sure until sprint starts.",
  },
  {
    icon: AlertTriangle,
    title: "Technical blind spots",
    description: "Security risks, performance issues, and edge cases slipping through.",
  },
  {
    icon: Search,
    title: "No market insights",
    description: "Competitor analysis requires separate tools and hours of manual work.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Problems() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-14 text-center"
        >
          <h2 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            The daily struggles of a PM
          </h2>
          <p className="mx-auto max-w-xl text-text-secondary">
            Sound familiar? We built Prodacto to solve exactly these problems.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {problems.map((problem) => (
            <motion.div
              key={problem.title}
              variants={itemVariants}
              className="section-card p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-text-secondary">
                <problem.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                {problem.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

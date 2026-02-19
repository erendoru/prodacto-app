"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Mic, BarChart3, TrendingUp, Pencil, GraduationCap, Link2 } from "lucide-react";

const iconMap = {
  Mic, BarChart3, TrendingUp, Pencil, GraduationCap, Link2,
} as const;

type IconName = keyof typeof iconMap;

interface FeaturePageLayoutProps {
  iconName: IconName;
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  children: React.ReactNode;
}

export default function FeaturePageLayout({
  iconName,
  badge,
  title,
  description,
  bullets,
  children,
}: FeaturePageLayoutProps) {
  const Icon = iconMap[iconName];

  return (
    <div>
      <section className="px-4 pt-16 pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{badge}</span>
            </div>
            <h1 className="mb-5 text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-text-secondary">
              {description}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/signup"
                className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="/"
                className="rounded-full border border-border px-7 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Back to home
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="section-card p-8">
            <h3 className="mb-6 text-lg font-bold text-foreground">What&apos;s included</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {bullets.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm text-text-secondary">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {children}

      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Ready to try it?</h2>
          <p className="mb-6 text-text-secondary">Start free. No credit card required.</p>
          <a
            href="/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>
    </div>
  );
}

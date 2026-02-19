"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl"
        >
          The AI product manager
          <br />
          for your entire team
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-text-secondary"
        >
          Turn ideas into clear requirements, score your backlog for dev-readiness,
          and analyze markets — all with voice or text. Trusted by PMs who ship.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="/signup"
            className="group flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 rounded-full border border-border px-7 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Play className="h-3.5 w-3.5" />
            See how it works
          </a>
        </motion.div>
      </div>

      {/* Product screenshot mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.24 }}
        className="mx-auto mt-16 max-w-5xl px-4"
      >
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/5">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#FF605C]" />
              <div className="h-3 w-3 rounded-full bg-[#FFBD44]" />
              <div className="h-3 w-3 rounded-full bg-[#00CA4E]" />
            </div>
            <div className="ml-4 flex-1 rounded-md bg-muted px-3 py-1 text-center text-xs text-text-tertiary">
              app.prodacto.com
            </div>
          </div>

          <div className="grid md:grid-cols-[320px_1fr]">
            {/* Left: Chat panel */}
            <div className="border-r border-border p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <span className="text-xs font-bold text-white">P</span>
                </div>
                <span className="text-sm font-semibold text-foreground">Prodacto AI</span>
              </div>

              <div className="mb-4 rounded-lg border border-border bg-muted p-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-xs text-text-tertiary">Voice input</span>
                </div>
                <div className="flex h-6 items-end gap-[2px]">
                  {[8,13,17,20,19,15,10,6,5,8,13,17,20,19,15,10,6,5,8,13,17,20,19,15,10,6,5,8,13,17,20,19].map((h, i) => (
                    <div
                      key={i}
                      className="w-[3px] rounded-full bg-primary/40"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-3 rounded-lg bg-muted p-3">
                <p className="text-xs leading-relaxed text-text-secondary">
                  &ldquo;Users should be able to change their profile photo, crop it, max 5MB, jpeg and png supported&rdquo;
                </p>
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="mb-2 text-xs font-medium text-foreground">Generated:</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary-dark">User Story</span>
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-medium text-accent">Criteria</span>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-600">5 SP</span>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-medium text-blue-600">Score: 4.2</span>
                </div>
              </div>
            </div>

            {/* Right: Document panel */}
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Profile Photo Upload — User Story</h3>
                <div className="flex gap-2">
                  <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">Ready</span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-text-tertiary">v1</span>
                </div>
              </div>
              <div className="space-y-3 text-xs leading-relaxed text-text-secondary">
                <p>
                  <span className="font-medium text-foreground">As a</span> registered user,{" "}
                  <span className="font-medium text-foreground">I want to</span> change my profile photo with crop support{" "}
                  <span className="font-medium text-foreground">so that</span> my profile stays personalized.
                </p>
                <div>
                  <p className="mb-1.5 font-medium text-foreground">Acceptance Criteria</p>
                  <ul className="space-y-1 text-text-secondary">
                    <li className="flex items-start gap-2"><span className="mt-0.5 text-accent">&#10003;</span>&ldquo;Change Photo&rdquo; button is visible on profile</li>
                    <li className="flex items-start gap-2"><span className="mt-0.5 text-accent">&#10003;</span>JPEG and PNG formats are supported</li>
                    <li className="flex items-start gap-2"><span className="mt-0.5 text-accent">&#10003;</span>Maximum file size is 5MB</li>
                    <li className="flex items-start gap-2"><span className="mt-0.5 text-accent">&#10003;</span>Pre-upload crop functionality</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Backlog Readiness</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-md bg-accent/8 p-2 text-center"><span className="text-[10px] font-medium text-accent">Frontend &#10003;</span></div>
                    <div className="rounded-md bg-accent/8 p-2 text-center"><span className="text-[10px] font-medium text-accent">Backend &#10003;</span></div>
                    <div className="rounded-md bg-amber-500/8 p-2 text-center"><span className="text-[10px] font-medium text-amber-600">Tests &#9888;</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

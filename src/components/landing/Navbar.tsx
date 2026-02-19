"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  Mic,
  BarChart3,
  TrendingUp,
  Pencil,
  GraduationCap,
  Link2,
  Users,
  Rocket,
  Palette,
  ChevronDown,
} from "lucide-react";

const features = [
  { icon: Mic, label: "Voice Commands", desc: "Talk, AI writes", href: "/features/voice-commands" },
  { icon: BarChart3, label: "Backlog Scoring", desc: "Dev-readiness scoring", href: "/features/backlog-scoring" },
  { icon: TrendingUp, label: "Market Analysis", desc: "One-click market reports", href: "/features/market-analysis" },
  { icon: Pencil, label: "Inline Annotation", desc: "Strike through & edit", href: "/features/inline-annotation" },
  { icon: GraduationCap, label: "AI Coaching", desc: "CPO-level feedback", href: "/features/ai-coaching" },
  { icon: Link2, label: "Integrations", desc: "Connect your tools", href: "/features/integrations" },
];

const useCases = [
  { icon: Users, label: "Product Managers", href: "/use-cases/product-managers" },
  { icon: Rocket, label: "Startups", href: "/use-cases/startups" },
  { icon: Palette, label: "Design Teams", href: "/use-cases/design-teams" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">Prodacto</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setProductOpen(!productOpen)}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:text-foreground"
            >
              Products
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${productOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {productOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-[520px] rounded-xl border border-border bg-surface p-5 shadow-lg"
                >
                  <div className="grid grid-cols-2 gap-x-8">
                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Features</p>
                      <div className="space-y-1">
                        {features.map((f) => (
                          <a key={f.label} href={f.href} onClick={() => setProductOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted">
                            <f.icon className="h-4 w-4 text-text-tertiary" />
                            <div>
                              <div className="text-sm font-medium text-foreground">{f.label}</div>
                              <div className="text-xs text-text-tertiary">{f.desc}</div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Use Cases</p>
                      <div className="space-y-1">
                        {useCases.map((u) => (
                          <a key={u.label} href={u.href} onClick={() => setProductOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted">
                            <u.icon className="h-4 w-4 text-text-tertiary" />
                            <span className="text-sm font-medium text-foreground">{u.label}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 border-t border-border pt-4">
                    <a href="#demo" className="text-sm text-text-secondary transition-colors hover:text-foreground">Watch demo &rarr;</a>
                    <a href="#pricing" className="text-sm text-text-secondary transition-colors hover:text-foreground">View pricing &rarr;</a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="#pricing" className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:text-foreground">Pricing</a>
          <a href="#compare" className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:text-foreground">Reviews</a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a href="/login" className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:text-foreground">Log in</a>
          <a href="/signup" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
            Get started free
          </a>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground md:hidden">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-surface md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">Features</p>
              {features.map((f) => (
                <a key={f.label} href={f.href} onClick={() => setMobileOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-muted hover:text-foreground">
                  <f.icon className="h-4 w-4" />
                  {f.label}
                </a>
              ))}
              <div className="my-3 border-t border-border" />
              <a href="#pricing" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-muted hover:text-foreground">Pricing</a>
              <a href="#compare" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-muted hover:text-foreground">Reviews</a>
              <div className="my-3 border-t border-border" />
              <a href="/login" onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm text-text-secondary hover:bg-muted hover:text-foreground">Log in</a>
              <a href="/signup" onClick={() => setMobileOpen(false)} className="block rounded-full bg-primary py-2.5 text-center text-sm font-medium text-white">Get started free</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

interface ShowcaseProps {
  index: string;
  title: string;
  headline: string;
  description: string;
  bullets: string[];
  stat: string;
  statLabel: string;
  ctaLabel: string;
  ctaHref: string;
  testimonial?: { quote: string; author: string; role: string };
  children: React.ReactNode;
  reversed?: boolean;
}

function ShowcaseSection({
  index,
  title,
  headline,
  description,
  bullets,
  stat,
  statLabel,
  ctaLabel,
  ctaHref,
  testimonial,
  children,
  reversed = false,
}: ShowcaseProps) {
  return (
    <section className={`px-4 py-20 ${reversed ? "feature-showcase" : "feature-showcase-alt"}`}>
      <div className={`mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 ${reversed ? "lg:direction-rtl" : ""}`}>
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, x: reversed ? 20 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className={reversed ? "lg:order-2" : ""}
        >
          <p className="mb-4 text-sm font-semibold text-primary">{index}{title}</p>

          <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl">
            {headline}
          </h2>

          <p className="mb-6 text-base leading-relaxed text-text-secondary">
            {description}
          </p>

          <ul className="mb-8 space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-text-secondary">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {b}
              </li>
            ))}
          </ul>

          <div className="mb-6">
            <span className="text-3xl font-bold text-primary">{stat}</span>
            <p className="text-sm text-text-secondary">{statLabel}</p>
          </div>

          <a
            href={ctaHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            {ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
          </a>

          {testimonial && (
            <div className="mt-8 border-t border-border pt-6">
              <p className="mb-3 text-sm italic leading-relaxed text-text-secondary">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-text-tertiary">
                  {testimonial.author[0]}
                </div>
                <div>
                  <span className="text-xs font-medium text-foreground">{testimonial.author}</span>
                  <span className="ml-2 text-xs text-text-tertiary">{testimonial.role}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Visual side */}
        <motion.div
          initial={{ opacity: 0, x: reversed ? -20 : 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={reversed ? "lg:order-1" : ""}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Showcase: AI Documentation ─────────────────────────────────── */
function DocShowcaseVisual() {
  return (
    <div className="section-card overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">Template: PRD</div>
          <span className="text-xs text-text-tertiary">Dashboard Redesign</span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground mb-1">Overview</h4>
          <p className="text-xs text-text-secondary leading-relaxed">Build a customizable analytics dashboard that helps product teams reduce time-to-insight and share actionable views across the organization.</p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground mb-1">Goals & success metrics</h4>
          <ul className="space-y-1 text-xs text-text-secondary">
            <li>&#8226; Increase dashboard WAU by 25% within one quarter</li>
            <li>&#8226; Cut setup time from 12 minutes to under 4 minutes</li>
            <li>&#8226; Raise internal NPS from 31 to 45</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground mb-1">User stories</h4>
          <div className="space-y-2">
            <p className="rounded-md bg-muted p-2 text-xs text-text-secondary">As a product lead, I want to create a dashboard in under 4 minutes so I can quickly share metrics.</p>
            <p className="rounded-md bg-muted p-2 text-xs text-text-secondary">As an analyst, I want to share saved views with specific teams without granting full edit access.</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-accent/20 bg-accent/5 p-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-accent">Doc Score</p>
            <p className="text-lg font-bold text-foreground">8.5/10</p>
          </div>
          <div className="flex gap-3 text-[10px] text-text-tertiary">
            <div className="text-center"><div className="font-bold text-foreground text-xs">9.0</div>Strategy</div>
            <div className="text-center"><div className="font-bold text-foreground text-xs">8.5</div>Structure</div>
            <div className="text-center"><div className="font-bold text-foreground text-xs">8.0</div>Clarity</div>
            <div className="text-center"><div className="font-bold text-foreground text-xs">8.5</div>Complete</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Showcase: Backlog Scoring ──────────────────────────────────── */
function ScoringShowcaseVisual() {
  const items = [
    { name: "Profile Photo Upload", fe: true, be: true, test: "warn", sp: 5, score: 4.2 },
    { name: "Password Reset Flow", fe: true, be: true, test: true, sp: 3, score: 4.8 },
    { name: "Payment Integration", fe: "warn", be: "warn", test: false, sp: 13, score: 2.1 },
  ];
  return (
    <div className="section-card overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Backlog Readiness</span>
      </div>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.name} className="px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-text-tertiary">{item.sp} SP</span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${item.score >= 4 ? "bg-accent/10 text-accent" : item.score >= 3 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-500"}`}>
                  {item.score}/5
                </span>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {(["Frontend", "Backend", "Test", "Security", "Perf"] as const).map((dim, di) => {
                const val = di < 3 ? [item.fe, item.be, item.test][di] : (di === 3 ? item.fe : item.be);
                const color = val === true ? "bg-accent/10 text-accent" : val === "warn" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-500";
                const icon = val === true ? "✓" : val === "warn" ? "⚠" : "✗";
                return (
                  <div key={dim} className={`rounded px-1.5 py-1 text-center text-[9px] font-medium ${color}`}>
                    {dim} {icon}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Showcase: Market Analysis ──────────────────────────────────── */
function MarketShowcaseVisual() {
  return (
    <div className="section-card overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Market Analysis — E-commerce Mobile App</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-primary/5 p-3 text-center">
            <p className="text-[10px] text-text-tertiary">TAM</p>
            <p className="text-sm font-bold text-foreground">$340B</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-3 text-center">
            <p className="text-[10px] text-text-tertiary">SAM</p>
            <p className="text-sm font-bold text-foreground">$48B</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-3 text-center">
            <p className="text-[10px] text-text-tertiary">SOM</p>
            <p className="text-sm font-bold text-foreground">$2.4B</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">Top Competitors</p>
          <div className="space-y-2">
            {[
              { name: "Shopify", strength: "Ecosystem", weakness: "Enterprise pricing" },
              { name: "WooCommerce", strength: "Open source", weakness: "Complexity" },
              { name: "BigCommerce", strength: "B2B features", weakness: "Limited themes" },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-xs">
                <span className="font-medium text-foreground">{c.name}</span>
                <div className="flex gap-3">
                  <span className="text-accent">+ {c.strength}</span>
                  <span className="text-red-400">- {c.weakness}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">GTM Strategy</p>
          <p className="rounded-md border border-accent/20 bg-accent/5 p-3 text-xs leading-relaxed text-text-secondary">
            Focus on niche vertical (fashion e-commerce) with mobile-first experience. Target emerging markets with localized payment gateways.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Showcase: Inline Annotation ────────────────────────────────── */
function AnnotationShowcaseVisual() {
  return (
    <div className="section-card overflow-hidden">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Inline Editing</span>
        <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">1 annotation</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-text-secondary leading-relaxed">
            Users can upload photos with a maximum file size of{" "}
            <span className="bg-red-100 text-red-500 line-through px-0.5">5MB</span>{" "}
            <span className="bg-accent/10 text-accent font-medium px-0.5">10MB</span>
            {" "}and supported formats include JPEG and PNG.
          </p>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] text-primary">PM note: &ldquo;Make it 10MB, more flexible for high-res photos&rdquo;</span>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">AI Updated Sections</p>
          <div className="space-y-1.5">
            {[
              "Acceptance criteria → max size updated to 10MB",
              "Backend spec → validation limit changed",
              "Test scenarios → edge case for 10MB+ added",
              "Story points → unchanged (5 SP)",
            ].map((change) => (
              <div key={change} className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="text-accent">&#10003;</span>
                {change}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-white">Accept changes</button>
          <button className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-text-secondary">Revert</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function FeatureShowcase() {
  return (
    <div id="features">
      <ShowcaseSection
        index="01"
        title="AI Documentation"
        headline="Write product docs in minutes, not days"
        description="Transform rough ideas, meeting notes, or a simple prompt into comprehensive PRDs, user stories, technical specs, and go-to-market briefs. Prodacto understands product strategy — your docs are structured, thorough, and ready for review."
        bullets={[
          "Generate PRDs, one-pagers, and user stories from a prompt or voice",
          "20+ templates aligned to industry standards",
          "Automatic gap analysis and edge case detection",
          "Export to Notion, Confluence, or Google Docs",
        ]}
        stat="10h/wk"
        statLabel="saved per person on average"
        ctaLabel="Learn more"
        ctaHref="/features/voice-commands"
        testimonial={{
          quote: "I described a feature in 30 seconds and got a complete PRD with acceptance criteria, risks, and test scenarios. This is a game-changer.",
          author: "Alex",
          role: "Startup PM",
        }}
      >
        <DocShowcaseVisual />
      </ShowcaseSection>

      <ShowcaseSection
        index="02"
        title="Backlog Scoring"
        headline="Know if every story is dev-ready before sprint"
        description="Every backlog item gets a multi-dimensional readiness score. Frontend, Backend, Testing, Security, Performance — all evaluated automatically with AI-powered story point estimation and sprint assignment suggestions."
        bullets={[
          "6-dimension readiness scoring (Frontend, Backend, Test, Security, Perf, Dependencies)",
          "Fibonacci story point estimation with reasoning",
          "Sprint assignment recommendations",
          "Technical risk detection for each item",
        ]}
        stat="100%"
        statLabel="of stories reviewed before sprint"
        ctaLabel="Learn more"
        ctaHref="/features/backlog-scoring"
        testimonial={{
          quote: "The readiness score alone makes Prodacto worth it. No more unready stories sneaking into sprint.",
          author: "Maria",
          role: "Senior PM",
        }}
        reversed
      >
        <ScoringShowcaseVisual />
      </ShowcaseSection>

      <ShowcaseSection
        index="03"
        title="Market Analysis"
        headline="One-click market research in seconds"
        description="Enter your product or industry, and Prodacto generates a comprehensive market report with TAM/SAM/SOM sizing, competitor analysis, pricing benchmarks, trends, and go-to-market recommendations."
        bullets={[
          "TAM, SAM, SOM market sizing",
          "Competitor strengths & weaknesses analysis",
          "Pricing benchmark across competitors",
          "Go-to-Market strategy recommendations",
        ]}
        stat="30s"
        statLabel="from idea to market report"
        ctaLabel="Learn more"
        ctaHref="/features/market-analysis"
        testimonial={{
          quote: "The market analysis feature cut hours of research down to minutes. Never generated TAM/SAM/SOM this fast.",
          author: "James",
          role: "Startup Founder",
        }}
      >
        <MarketShowcaseVisual />
      </ShowcaseSection>

      <ShowcaseSection
        index="04"
        title="Inline Annotation"
        headline="Strike through, write your thoughts. AI updates everything."
        description="Select any text in your document, strike it through, and write what you want instead. Prodacto AI understands the context and automatically updates all related sections — acceptance criteria, backend specs, test scenarios, and story points."
        bullets={[
          "Strike through text and add annotations",
          "AI updates all related sections automatically",
          "Before/after diff view for every change",
          "Full version history — revert anytime",
        ]}
        stat="3x"
        statLabel="improvement in doc quality scores"
        ctaLabel="Learn more"
        ctaHref="/features/inline-annotation"
        reversed
      >
        <AnnotationShowcaseVisual />
      </ShowcaseSection>
    </div>
  );
}

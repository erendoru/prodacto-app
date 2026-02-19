"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, Sparkles, FolderKanban, MessageSquare, ListChecks, TrendingUp, Mic, Database, FileText, Shield, DollarSign, FlaskConical } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tip: string;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to Prodacto!",
    description: "Your AI-powered Product Management copilot. Let me show you around — it only takes a minute.",
    icon: Sparkles,
    color: "bg-primary/10 text-primary",
    tip: "Prodacto helps you go from idea to backlog in minutes, not days.",
  },
  {
    title: "1. Create a Project",
    description: "Start by creating your first project. Describe your product, pick the platform, and you're ready to go.",
    icon: FolderKanban,
    color: "bg-blue-50 text-blue-600",
    tip: "Pro tip: The more detail you add to the description, the better AI suggestions you'll get.",
  },
  {
    title: "2. Chat with AI",
    description: "Ask your AI PM anything — generate PRDs, brainstorm features, get technical recommendations, or refine your product strategy.",
    icon: MessageSquare,
    color: "bg-purple-50 text-purple-600",
    tip: "Try: \"Create a PRD for user onboarding flow\" or \"What tech stack do you recommend?\"",
  },
  {
    title: "3. Voice Commands",
    description: "Click the microphone button and speak naturally. Prodacto transcribes your voice and processes it with AI — perfect for quick ideas on the go.",
    icon: Mic,
    color: "bg-primary/10 text-primary",
    tip: "Just press the mic, describe your feature idea, and watch it become structured content.",
  },
  {
    title: "4. AI Backlog Scoring",
    description: "Generate backlog items with AI. Each item gets a 6-dimension readiness score (Frontend, Backend, Testing, Security, Performance, Dependencies) plus Fibonacci story points.",
    icon: ListChecks,
    color: "bg-green-50 text-green-600",
    tip: "The readiness score helps your team understand exactly what's needed before starting work.",
  },
  {
    title: "5. Context Vault",
    description: "Store company info, personas, competitor research, and constraints. AI uses this context automatically to generate more accurate and relevant output.",
    icon: Database,
    color: "bg-indigo-50 text-indigo-600",
    tip: "The more context you provide, the smarter your AI output becomes. Think of it as your product knowledge base.",
  },
  {
    title: "6. PRD Generator",
    description: "AI writes a complete PRD section by section — Overview, Problem, Goals, User Stories, Scope, Technical Requirements, and more. Edit any section inline.",
    icon: FileText,
    color: "bg-rose-50 text-rose-600",
    tip: "Describe your feature, pick a template, and let AI draft all 9 PRD sections. Then refine with AI Review.",
  },
  {
    title: "7. AI Review & Coaching",
    description: "Get CPO-level feedback on your backlog or PRD. AI scores your work across multiple dimensions and gives specific, actionable improvement suggestions.",
    icon: Shield,
    color: "bg-cyan-50 text-cyan-600",
    tip: "Run AI Review after generating a backlog — it catches missing tasks, bad estimates, and dependency gaps.",
  },
  {
    title: "8. Business Case Builder",
    description: "Analyze ROI, cost of delay, and risk for any feature. AI provides BUILD/DEFER/KILL recommendations with financial projections.",
    icon: DollarSign,
    color: "bg-emerald-50 text-emerald-600",
    tip: "Use this to prioritize your roadmap — stakeholders love data-driven feature decisions.",
  },
  {
    title: "9. A/B Test Planner",
    description: "Design rigorous experiments with AI. Get sample size calculations, metric recommendations, improved hypotheses, and go/no-go verdicts.",
    icon: FlaskConical,
    color: "bg-violet-50 text-violet-600",
    tip: "Write your hypothesis and let AI calculate the optimal experiment setup.",
  },
  {
    title: "10. Voice Studio",
    description: "Full-screen voice workspace. Record notes, ideas, or feedback — AI transcribes, classifies (feature idea, bug, feedback, etc.), and structures them automatically.",
    icon: Mic,
    color: "bg-pink-50 text-pink-600",
    tip: "Perfect for capturing ideas on the go. AI turns rambling voice notes into clean, organized content.",
  },
  {
    title: "11. Market Analysis",
    description: "Enter any product name and get an instant comprehensive report — TAM/SAM/SOM, competitors, trends, opportunities, and a go-to-market strategy.",
    icon: TrendingUp,
    color: "bg-amber-50 text-amber-600",
    tip: "Great for validating new ideas or preparing investor presentations.",
  },
];

export default function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem("prodacto_onboarding_seen");
    if (!seen) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("prodacto_onboarding_seen", "true");
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const isLast = currentStep === tourSteps.length - 1;
  const isFirst = currentStep === 0;
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Progress bar */}
        <div className="flex gap-1 px-6 pt-5">
          {tourSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-md p-1 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="px-6 pb-2 pt-6">
          <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${step.color}`}>
            <Icon className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            {step.description}
          </p>

          {/* Tip box */}
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs leading-relaxed text-primary/80">
              <span className="font-semibold text-primary">💡 </span>
              {step.tip}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-5 pt-4">
          <button
            onClick={handleSkip}
            className="text-xs font-medium text-text-tertiary transition-colors hover:text-foreground"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-hover"
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-dark"
            >
              {isLast ? (
                "Get Started!"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

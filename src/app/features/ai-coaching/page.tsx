import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FeaturePageLayout from "@/components/features/FeaturePageLayout";

export const metadata = {
  title: "AI Coaching — Prodacto",
  description: "CPO-level document reviews and real-time product coaching with 4-dimension scoring.",
};

export default function AiCoachingPage() {
  return (
    <>
      <Navbar />
      <FeaturePageLayout
        iconName="GraduationCap"
        badge="AI Coaching"
        title="Instant feedback from an expert product coach"
        description="Prodacto reviews your documents like a Chief Product Officer — scoring across Strategy, Structure, Clarity, and Completeness. Get specific, actionable improvement suggestions and real-time coaching as you write."
        bullets={[
          "4-dimension scoring: Strategy, Structure, Clarity, Completeness",
          "Score out of 10 with detailed breakdown",
          "Top 3 most impactful improvements highlighted",
          "Real-time coaching as you write and iterate",
          "Assumption questioning: 'Why are we building this?'",
          "Competitive positioning analysis",
          "Doc quality tracking over time",
          "Personalized to your product domain and context",
        ]}
      >
        <section className="px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="section-card overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-sm font-semibold text-foreground">Scoring dimensions</h3>
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-2">
                {[
                  { title: "Strategy", desc: "Problem definition, value proposition, target audience, competitive positioning." },
                  { title: "Structure", desc: "Headings, sections, logical flow, readability, formatting." },
                  { title: "Clarity", desc: "Sentence complexity, language clarity, no ambiguity, precise metrics." },
                  { title: "Completeness", desc: "Missing sections, content gaps, edge cases, rollout plan." },
                ].map((d) => (
                  <div key={d.title} className="bg-surface p-6">
                    <h4 className="mb-1 text-sm font-semibold text-foreground">{d.title}</h4>
                    <p className="text-xs leading-relaxed text-text-secondary">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FeaturePageLayout>
      <Footer />
    </>
  );
}

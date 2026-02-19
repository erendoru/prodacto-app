import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FeaturePageLayout from "@/components/features/FeaturePageLayout";

export const metadata = {
  title: "Backlog Scoring — Prodacto",
  description: "Multi-dimensional backlog readiness scoring with automatic story point estimation.",
};

export default function BacklogScoringPage() {
  return (
    <>
      <Navbar />
      <FeaturePageLayout
        iconName="BarChart3"
        badge="Prodacto Exclusive"
        title="Know if every story is dev-ready"
        description="Every backlog item gets a multi-dimensional readiness score across Frontend, Backend, Testing, Security, Performance, and Dependencies — with automatic story point estimation."
        bullets={[
          "6-dimension readiness scoring for every backlog item",
          "Fibonacci story point estimation (1, 2, 3, 5, 8, 13)",
          "Sprint assignment recommendations based on priority",
          "AI explains reasoning behind each score",
          "Technical risk flags per dimension",
          "Dependency detection across items",
          "Bulk scoring for entire backlogs",
          "Score history and trend tracking",
        ]}
      >
        <section className="px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="section-card overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-sm font-semibold text-foreground">Scoring dimensions</h3>
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-3">
                {[
                  { title: "Frontend", desc: "UI components exist? Design system compatible? Responsive?" },
                  { title: "Backend", desc: "API endpoint ready? DB schema fits? Migrations needed?" },
                  { title: "Testing", desc: "Unit testable? Edge cases defined? E2E needed?" },
                  { title: "Security", desc: "Auth checks? Input validation? XSS/CSRF risks?" },
                  { title: "Performance", desc: "N+1 query risk? Pagination needed? Cache strategy?" },
                  { title: "Dependencies", desc: "Third-party APIs? Blocked by another team?" },
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

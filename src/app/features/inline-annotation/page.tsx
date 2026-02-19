import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FeaturePageLayout from "@/components/features/FeaturePageLayout";

export const metadata = {
  title: "Inline Annotation — Prodacto",
  description: "Strike through text, write your thoughts. AI updates all related sections automatically.",
};

export default function InlineAnnotationPage() {
  return (
    <>
      <Navbar />
      <FeaturePageLayout
        iconName="Pencil"
        badge="Antigravity Style"
        title="Strike through, write your thoughts. AI updates everything."
        description="Select any text in your document, strike it through, and write what you want instead. Prodacto understands the context and automatically updates all related sections — acceptance criteria, backend specs, test scenarios, and story points."
        bullets={[
          "Strike through any text and add inline annotations",
          "AI automatically updates all related document sections",
          "Before/after diff view for every change",
          "Full version history with one-click revert",
          "Batch annotations — mark multiple sections, update at once",
          "Context-aware: AI understands the impact of each change",
          "Works across PRDs, user stories, and specs",
          "Collaborative annotations for team plans",
        ]}
      >
        <section className="px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="section-card overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-sm font-semibold text-foreground">How inline annotation works</h3>
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-3">
                {[
                  { step: "1", title: "Select & annotate", desc: "Highlight text, strike through, and write your desired change." },
                  { step: "2", title: "AI analyzes", desc: "Prodacto understands the context and identifies all affected sections." },
                  { step: "3", title: "Review diff", desc: "See before/after changes, accept or revert with one click." },
                ].map((s) => (
                  <div key={s.step} className="bg-surface p-6">
                    <span className="mb-2 block font-mono text-xs font-bold text-primary">{s.step}</span>
                    <h4 className="mb-1 text-sm font-semibold text-foreground">{s.title}</h4>
                    <p className="text-xs leading-relaxed text-text-secondary">{s.desc}</p>
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

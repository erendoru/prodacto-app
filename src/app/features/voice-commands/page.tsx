import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FeaturePageLayout from "@/components/features/FeaturePageLayout";

export const metadata = {
  title: "Voice Commands — Prodacto",
  description: "Talk to create PRDs, user stories, and backlog items. The first voice-powered product management tool.",
};

export default function VoiceCommandsPage() {
  return (
    <>
      <Navbar />
      <FeaturePageLayout
        iconName="Mic"
        badge="First in Industry"
        title="Write product docs by talking"
        description="Press the mic and describe your feature. Prodacto transcribes, structures, and scores — all in seconds. No more typing the same formats over and over."
        bullets={[
          "English and Turkish voice recognition via Whisper API",
          "Structured user stories with acceptance criteria",
          "Automatic backlog readiness scoring from voice input",
          "Voice corrections — say 'make it 10MB instead' and AI updates",
          "Technical risk detection from voice descriptions",
          "Test scenario generation from spoken requirements",
          "Works on desktop and mobile browsers",
          "Fallback to text input anytime",
        ]}
      >
        <section className="px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="section-card overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-sm font-semibold text-foreground">How voice commands work</h3>
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-3">
                {[
                  { step: "1", title: "Press & speak", desc: "Tap the mic button and describe your feature idea naturally." },
                  { step: "2", title: "AI processes", desc: "Whisper transcribes, GPT-4o structures into PRD/story format." },
                  { step: "3", title: "Review & ship", desc: "Edit inline, approve the output, push to Jira in one click." },
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

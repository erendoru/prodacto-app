import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FeaturePageLayout from "@/components/features/FeaturePageLayout";

export const metadata = {
  title: "Market Analysis — Prodacto",
  description: "One-click AI-powered market research with TAM/SAM/SOM, competitor analysis, and GTM strategy.",
};

export default function MarketAnalysisPage() {
  return (
    <>
      <Navbar />
      <FeaturePageLayout
        iconName="TrendingUp"
        badge="Not in Competitors"
        title="One-click market research"
        description="Enter your product or industry and get a comprehensive market report in seconds. TAM/SAM/SOM sizing, competitor analysis, pricing benchmarks, trends, opportunity areas, and go-to-market recommendations."
        bullets={[
          "TAM, SAM, SOM market sizing",
          "Direct and indirect competitor analysis",
          "Competitor strengths and weaknesses breakdown",
          "Pricing benchmark across the market",
          "Technology and market trend analysis",
          "Opportunity gap identification",
          "Risk assessment and market barriers",
          "Go-to-Market strategy recommendations",
        ]}
      >
        <section className="px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="section-card overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-sm font-semibold text-foreground">Report sections</h3>
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-2">
                {[
                  { title: "Market Sizing", desc: "TAM, SAM, SOM with data-backed estimates and growth projections." },
                  { title: "Competitor Landscape", desc: "Direct and indirect competitors with feature comparison matrix." },
                  { title: "Pricing Benchmark", desc: "How competitors price their products and where you should position." },
                  { title: "GTM Strategy", desc: "Recommended go-to-market approach based on market gaps and strengths." },
                ].map((s) => (
                  <div key={s.title} className="bg-surface p-6">
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

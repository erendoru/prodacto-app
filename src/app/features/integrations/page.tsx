import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FeaturePageLayout from "@/components/features/FeaturePageLayout";

export const metadata = {
  title: "Integrations — Prodacto",
  description: "Connect Prodacto with Jira, Linear, Notion, Slack, Confluence, GitHub, and your IDE.",
};

export default function IntegrationsPage() {
  const integrations = [
    { name: "Jira", desc: "Full sync — create stories, assign SP, push to sprints", status: "Available" },
    { name: "Linear", desc: "Create issues directly from Prodacto", status: "Coming soon" },
    { name: "Notion", desc: "Export PRDs and stories as Notion pages", status: "Coming soon" },
    { name: "Confluence", desc: "Publish docs directly to your Confluence space", status: "Coming soon" },
    { name: "Slack", desc: "Get notifications and share docs via Slack", status: "Coming soon" },
    { name: "GitHub", desc: "Create issues from backlog items", status: "Coming soon" },
    { name: "Google Drive", desc: "Import and export documents", status: "Coming soon" },
    { name: "MCP", desc: "Connect to Cursor, VS Code, and other IDEs", status: "Coming soon" },
  ];

  return (
    <>
      <Navbar />
      <FeaturePageLayout
        iconName="Link2"
        badge="Integrations"
        title="Connected to every tool your team uses"
        description="Push docs to Jira, sync with Notion, share via Slack, and connect to your IDE with MCP. All without leaving your flow."
        bullets={[
          "Jira: OAuth 2.0 secure connection with full story sync",
          "Automatic story point assignment in Jira",
          "Sprint assignment from Prodacto",
          "Bulk story creation across tools",
          "Notion and Confluence export",
          "Slack notifications for team updates",
          "MCP integration for IDE connectivity",
          "API access for custom integrations",
        ]}
      >
        <section className="px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="section-card overflow-hidden">
              <div className="border-b border-border px-6 py-4">
                <h3 className="text-sm font-semibold text-foreground">Available integrations</h3>
              </div>
              <div className="divide-y divide-border">
                {integrations.map((int) => (
                  <div key={int.name} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{int.name}</h4>
                      <p className="text-xs text-text-secondary">{int.desc}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${int.status === "Available" ? "bg-accent/10 text-accent" : "bg-muted text-text-tertiary"}`}>
                      {int.status}
                    </span>
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

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectContext } from "@/lib/context";

const SECTION_PROMPTS: Record<string, string> = {
  overview: "Write a clear, concise Overview section (2-3 paragraphs). Explain what is being built, why, and what problem it solves.",
  problem: "Write a Problem Statement section. Describe the current pain points, who is affected, and quantify the impact if possible.",
  goals: "Write a Goals & Success Metrics section. Include 3-5 measurable goals with specific KPIs and targets.",
  user_stories: "Write User Stories in the format: 'As a [role], I want [capability] so that [benefit]'. Include 5-8 user stories covering primary and edge cases.",
  scope: "Write a Scope section. Clearly define what is IN scope and OUT of scope. Include a phased approach if applicable.",
  technical: "Write Technical Requirements. Include architecture considerations, API specs, data models, performance requirements, and security considerations.",
  rollout: "Write a Rollout Plan. Include phases (alpha, beta, GA), timelines, KPI gates between phases, and rollback strategy.",
  risks: "Write a Risks & Mitigations section. Identify 3-5 key risks with their likelihood, impact, and specific mitigation strategies.",
  open_questions: "List Open Questions that need to be resolved before or during development. Include who should answer each question.",
};

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, featureDescription, section, existingSections, voiceTranscript } = await request.json();

  if (!projectId || !featureDescription) {
    return NextResponse.json({ error: "projectId and featureDescription required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects").select("*").eq("id", projectId).eq("user_id", user.id).single();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  let context = `Project: ${project.name}\nDescription: ${project.description || "N/A"}\nPlatform: ${project.platform}`;
  if (project.tech_stack) {
    const ts = project.tech_stack as Record<string, unknown>;
    if (ts.frontend) context += `\nFrontend: ${(ts.frontend as string[]).join(", ")}`;
    if (ts.backend) context += `\nBackend: ${(ts.backend as string[]).join(", ")}`;
    if (ts.database) context += `\nDatabase: ${(ts.database as string[]).join(", ")}`;
  }

  const vaultCtx = await getProjectContext(projectId, user.id);
  if (vaultCtx) context += `\n\n--- CONTEXT VAULT ---\n${vaultCtx}`;

  try {
    if (section && SECTION_PROMPTS[section]) {
      const existingCtx = existingSections
        ? `\n\nAlready written sections:\n${Object.entries(existingSections).map(([k, v]) => `### ${k}\n${v}`).join("\n\n")}`
        : "";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: `You are a senior Product Manager writing a PRD. Write professional, specific, and actionable content. No fluff. Use markdown formatting.\n\n${context}${existingCtx}` },
          { role: "user", content: `Feature: ${featureDescription}${voiceTranscript ? `\n\nVoice notes: ${voiceTranscript}` : ""}\n\n${SECTION_PROMPTS[section]}` },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });
      return NextResponse.json({ section, content: completion.choices[0]?.message?.content || "" });
    }

    const allSections = Object.keys(SECTION_PROMPTS);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `You are a senior Product Manager. Generate a complete PRD with these sections: ${allSections.join(", ")}. Use markdown. Be specific and actionable. Return as JSON with section names as keys.\n\n${context}` },
        { role: "user", content: `Feature: ${featureDescription}${voiceTranscript ? `\n\nVoice notes: ${voiceTranscript}` : ""}\n\nGenerate a complete PRD.` },
      ],
      temperature: 0.7,
      max_tokens: 6144,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return NextResponse.json({ error: "No response" }, { status: 500 });
    return NextResponse.json({ sections: JSON.parse(content) });
  } catch (error) {
    console.error("PRD generation error:", error);
    return NextResponse.json({ error: "Failed to generate PRD" }, { status: 500 });
  }
}

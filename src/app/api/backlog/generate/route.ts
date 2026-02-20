import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const BACKLOG_PROMPT = `You are a senior Product Manager generating professional backlog items.

For each backlog item, return JSON with these fields:
1. title: Clear, concise title
2. description: Detailed description
3. acceptanceCriteria: Array of specific acceptance criteria strings
4. bddCriteria: Array of the SAME criteria in Gherkin/BDD format ("Given X, When Y, Then Z")
5. readinessScore: Object with scores 1-10 for: frontend, backend, testing, security, performance, dependencies
6. scoreReasons: Array of objects explaining each score:
   [{"dimension":"frontend","score":7,"reason":"Why this score","fix_suggestion":"How to improve to 10"}]
   Include ALL 6 dimensions. Be specific about what's missing for scores below 8.
7. storyPoints: Fibonacci (1,2,3,5,8,13,21)
8. priority: LOW, MEDIUM, HIGH, or CRITICAL
9. technicalRisks: Array of technical risks (be specific)
10. testScenarios: Array of test scenarios

Return a JSON object like: {"items": [...]}. Be specific, actionable, and professional.`;

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, prompt } = await request.json();

  if (!projectId || !prompt) {
    return NextResponse.json(
      { error: "projectId and prompt are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  let projectContext = `Project: ${project.name}`;
  if (project.description) projectContext += `\nDescription: ${project.description}`;
  if (project.platform) projectContext += `\nPlatform: ${project.platform}`;
  if (project.tech_stack) projectContext += `\nTech Stack: ${JSON.stringify(project.tech_stack)}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: BACKLOG_PROMPT },
        {
          role: "user",
          content: `${projectContext}\n\nRequest: ${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    const items = Array.isArray(parsed) ? parsed : parsed.items || parsed.backlog || [parsed];

    const insertData = items.map((item: Record<string, unknown>) => ({
      user_id: user.id,
      project_id: projectId,
      title: item.title as string,
      description: (item.description as string) || null,
      acceptance_criteria: item.acceptanceCriteria || null,
      bdd_criteria: item.bddCriteria || null,
      readiness_score: item.readinessScore || null,
      score_reasons: item.scoreReasons || null,
      story_points: typeof item.storyPoints === "number" ? item.storyPoints : null,
      priority: (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(item.priority as string)
        ? item.priority
        : "MEDIUM") as string,
      status: "TODO",
      technical_risks: item.technicalRisks || null,
      test_scenarios: item.testScenarios || null,
    }));

    const { data: created, error } = await supabase
      .from("backlog_items")
      .insert(insertData)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Backlog generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate backlog items" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const BACKLOG_PROMPT = `You are an AI Product Manager. Generate backlog items based on the user's request.

For each backlog item, provide:
1. title: A clear, concise title
2. description: Detailed description of the work
3. acceptanceCriteria: Array of strings with specific acceptance criteria
4. readinessScore: Object with scores 1-10 for each dimension:
   - frontend: How ready is the frontend work? (UI complexity, design availability)
   - backend: How ready is the backend work? (API design, data model clarity)
   - testing: How clear are the test scenarios? (testability, edge cases identified)
   - security: Are security concerns addressed? (auth, data privacy, input validation)
   - performance: Are performance requirements clear? (load expectations, optimization needs)
   - dependencies: Are dependencies identified? (third-party libs, team dependencies)
5. storyPoints: Fibonacci story points (1, 2, 3, 5, 8, 13, 21)
6. priority: LOW, MEDIUM, HIGH, or CRITICAL
7. technicalRisks: Array of identified technical risks
8. testScenarios: Array of test scenario descriptions

Return ONLY a valid JSON array of backlog items. No markdown, no explanation, just the JSON array.`;

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
      readiness_score: item.readinessScore || null,
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

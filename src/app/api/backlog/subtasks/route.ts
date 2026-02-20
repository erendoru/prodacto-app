import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, acceptanceCriteria } = await request.json();

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You break down user stories into developer-ready sub-tasks. Return ONLY a JSON object like: {"tasks":[{"tag":"FE","task":"description","done":false}]}. Use tags: FE (Frontend), BE (Backend), QA (Testing/QA), DevOps, Design, DB (Database). Be specific and actionable. Each task should be completable in 1-4 hours.`,
        },
        {
          role: "user",
          content: `Title: ${title}\nDescription: ${description || "N/A"}\nAcceptance Criteria: ${acceptanceCriteria || "N/A"}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    const tasks = Array.isArray(parsed) ? parsed : parsed.tasks || parsed.subtasks || [];

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Subtask generation error:", error);
    return NextResponse.json({ error: "Failed to generate sub-tasks" }, { status: 500 });
  }
}

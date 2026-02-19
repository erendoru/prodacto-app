import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectContext } from "@/lib/context";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, contentType, content } = await request.json();
  if (!content || !contentType) {
    return NextResponse.json({ error: "content and contentType required" }, { status: 400 });
  }

  let context = "";
  if (projectId) {
    const supabase = await createClient();
    const { data: project } = await supabase
      .from("projects").select("*").eq("id", projectId).eq("user_id", user.id).single();
    if (project) {
      context = `Project: ${project.name}\nDescription: ${project.description || "N/A"}`;
      const vault = await getProjectContext(projectId, user.id);
      if (vault) context += `\n\n${vault}`;
    }
  }

  const prompts: Record<string, string> = {
    backlog: `Review these backlog items as a CPO. Evaluate:
- Task granularity (are tasks small enough? do they have clear delivery criteria?)
- Dependency management (correct order? blockers identified?)
- Layer coverage (Design, Backend, Frontend, QA all present?)
- Estimation accuracy (are day-based estimates realistic?)
- Missing items (what's been forgotten?)
- Risk identification (technical risks, integration risks)

Return JSON:
{
  "overall_score": 1-10,
  "categories": {
    "granularity": { "score": 1-10, "feedback": "..." },
    "dependencies": { "score": 1-10, "feedback": "..." },
    "coverage": { "score": 1-10, "feedback": "..." },
    "estimation": { "score": 1-10, "feedback": "..." },
    "completeness": { "score": 1-10, "feedback": "..." }
  },
  "missing_tasks": ["task 1", "task 2"],
  "risk_flags": ["risk 1", "risk 2"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "cpo_verdict": "2-3 sentence executive summary"
}`,
    prd: `Review this PRD as a CPO. Focus on strategic alignment, clarity, measurability of success criteria, technical feasibility, and stakeholder readiness.

Return JSON:
{
  "overall_score": 1-10,
  "categories": {
    "strategy": { "score": 1-10, "feedback": "..." },
    "clarity": { "score": 1-10, "feedback": "..." },
    "measurability": { "score": 1-10, "feedback": "..." },
    "feasibility": { "score": 1-10, "feedback": "..." },
    "completeness": { "score": 1-10, "feedback": "..." }
  },
  "missing_sections": ["section 1"],
  "risk_flags": ["risk 1"],
  "suggestions": ["suggestion 1"],
  "cpo_verdict": "2-3 sentence executive summary"
}`,
    general: `Review this product content as a senior product leader. Evaluate quality, completeness, and actionability.

Return JSON:
{
  "overall_score": 1-10,
  "categories": {
    "quality": { "score": 1-10, "feedback": "..." },
    "actionability": { "score": 1-10, "feedback": "..." },
    "completeness": { "score": 1-10, "feedback": "..." }
  },
  "suggestions": ["suggestion 1"],
  "cpo_verdict": "2-3 sentence summary"
}`,
  };

  const systemPrompt = prompts[contentType] || prompts.general;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `You are a Chief Product Officer with 15+ years of experience. Give brutally honest, specific, actionable feedback. ${context ? `\n\nProject context:\n${context}` : ""}` },
        { role: "user", content: `${systemPrompt}\n\nContent to review:\n${typeof content === "string" ? content : JSON.stringify(content, null, 2)}` },
      ],
      temperature: 0.7,
      max_tokens: 3072,
      response_format: { type: "json_object" },
    });
    const result = completion.choices[0]?.message?.content;
    if (!result) return NextResponse.json({ error: "No response" }, { status: 500 });
    return NextResponse.json(JSON.parse(result));
  } catch (error) {
    console.error("AI Review error:", error);
    return NextResponse.json({ error: "Failed to review" }, { status: 500 });
  }
}

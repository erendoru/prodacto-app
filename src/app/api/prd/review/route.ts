import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, type } = await request.json();
  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Chief Product Officer reviewing a ${type || "PRD"}. Give brutally honest, actionable feedback.

Return JSON:
{
  "scores": {
    "strategy": { "score": 1-10, "feedback": "specific feedback" },
    "structure": { "score": 1-10, "feedback": "specific feedback" },
    "clarity": { "score": 1-10, "feedback": "specific feedback" },
    "completeness": { "score": 1-10, "feedback": "specific feedback" }
  },
  "overall_score": 1-10,
  "strengths": ["strength 1", "strength 2"],
  "gaps": [
    { "section": "section name", "issue": "what's missing or wrong", "suggestion": "how to fix it" }
  ],
  "dev_perspective": "What would a senior developer think when reading this? What questions would they have?",
  "quick_wins": ["Easy improvement 1", "Easy improvement 2"]
}`,
        },
        { role: "user", content: `Review this document:\n\n${content}` },
      ],
      temperature: 0.7,
      max_tokens: 3072,
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) return NextResponse.json({ error: "No response" }, { status: 500 });
    return NextResponse.json(JSON.parse(result));
  } catch (error) {
    console.error("Review error:", error);
    return NextResponse.json({ error: "Failed to review" }, { status: 500 });
  }
}

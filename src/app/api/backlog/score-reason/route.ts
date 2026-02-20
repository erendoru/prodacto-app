import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, dimension, score } = await request.json();

  if (!title || !dimension) {
    return NextResponse.json({ error: "title and dimension are required" }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert Product Manager analyzing backlog item readiness scores. Given a backlog item and a specific dimension with its score, explain clearly why the score is what it is and what exactly needs to be added or improved to reach 10/10. Be specific and actionable. Return JSON: {"reason":"clear explanation of why the score is X/10","fix_suggestion":"specific actionable improvement to reach 10/10"}`,
        },
        {
          role: "user",
          content: `Backlog Item: ${title}\nDescription: ${description || "N/A"}\nDimension: ${dimension}\nCurrent Score: ${score}/10\n\nExplain why this dimension scored ${score}/10 and what specific improvements would bring it to 10/10.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json({
      reason: parsed.reason || "Unable to analyze",
      fix_suggestion: parsed.fix_suggestion || "",
    });
  } catch (error) {
    console.error("Score reason error:", error);
    return NextResponse.json({ error: "Failed to analyze score" }, { status: 500 });
  }
}

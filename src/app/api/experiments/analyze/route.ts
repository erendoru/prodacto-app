import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { hypothesis, metrics, description } = await request.json();
  if (!hypothesis) return NextResponse.json({ error: "hypothesis is required" }, { status: 400 });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a growth/experimentation expert. Design rigorous A/B tests with sound statistical methodology." },
        {
          role: "user",
          content: `Analyze this experiment plan:
Hypothesis: ${hypothesis}
Metrics: ${metrics ? JSON.stringify(metrics) : "Not defined yet"}
Description: ${description || "N/A"}

Return JSON:
{
  "improved_hypothesis": "Better version of the hypothesis if needed",
  "recommended_metrics": {
    "primary": { "name": "...", "measurement": "how to measure", "expected_lift": "X%" },
    "guardrail": [{ "name": "...", "threshold": "don't let this drop below X" }],
    "secondary": [{ "name": "...", "why": "useful to track because..." }]
  },
  "sample_size": {
    "recommended": 1000,
    "reasoning": "based on X% MDE, 80% power, 95% confidence",
    "minimum_detectable_effect": "5%"
  },
  "duration": {
    "recommended_days": 14,
    "reasoning": "account for weekly cycles, enough traffic"
  },
  "risks": ["risk 1", "risk 2"],
  "variant_suggestions": [
    { "name": "Variant A", "change": "description", "expected_impact": "why this should work" }
  ],
  "analysis_plan": "How to analyze results after the experiment concludes",
  "go_no_go": "READY|NEEDS_WORK|NOT_RECOMMENDED with reasoning"
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });
    const result = completion.choices[0]?.message?.content;
    if (!result) return NextResponse.json({ error: "No response" }, { status: 500 });
    return NextResponse.json(JSON.parse(result));
  } catch (error) {
    console.error("Experiment analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}

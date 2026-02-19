import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const MARKET_ANALYSIS_PROMPT = `You are an expert market analyst. Analyze the given product/market and provide a comprehensive report.

Return a JSON object with:
{
  "summary": "2-3 sentence executive summary",
  "tam": { "value": "$X billion", "description": "Total Addressable Market explanation" },
  "sam": { "value": "$X billion", "description": "Serviceable Addressable Market explanation" },
  "som": { "value": "$X million", "description": "Serviceable Obtainable Market explanation" },
  "competitors": [
    { "name": "Company", "description": "What they do", "strengths": ["..."], "weaknesses": ["..."], "marketShare": "X%" }
  ],
  "trends": [
    { "trend": "Trend name", "description": "Explanation", "impact": "HIGH/MEDIUM/LOW" }
  ],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "threats": ["Threat 1", "Threat 2"],
  "gtmStrategy": {
    "targetSegments": ["Segment 1", "Segment 2"],
    "channels": ["Channel 1", "Channel 2"],
    "pricing": "Pricing strategy recommendation",
    "positioning": "Recommended positioning statement"
  },
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Return ONLY valid JSON. Be specific with data, estimates, and actionable insights.`;

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data: analyses, error } = await supabase
    .from("market_analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(analyses);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productName, additionalContext } = await request.json();

  if (!productName) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: MARKET_ANALYSIS_PROMPT },
        {
          role: "user",
          content: `Analyze the market for: ${productName}${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ""}`,
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

    const report = JSON.parse(content);

    const supabase = await createClient();
    const { data: analysis, error } = await supabase
      .from("market_analyses")
      .insert({
        user_id: user.id,
        product_name: productName,
        report,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(analysis, { status: 201 });
  } catch (error) {
    console.error("Market analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate market analysis" },
      { status: 500 }
    );
  }
}

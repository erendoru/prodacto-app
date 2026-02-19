import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectContext } from "@/lib/context";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, featureName, featureDescription, estimatedDevDays, teamSize } = await request.json();
  if (!featureName) return NextResponse.json({ error: "featureName is required" }, { status: 400 });

  let context = "";
  if (projectId) {
    const supabase = await createClient();
    const { data: project } = await supabase
      .from("projects").select("*").eq("id", projectId).eq("user_id", user.id).single();
    if (project) {
      context = `Project: ${project.name}\nDescription: ${project.description || "N/A"}\nPlatform: ${project.platform}`;
      const vault = await getProjectContext(projectId, user.id);
      if (vault) context += `\n\n${vault}`;
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: `You are a product strategy consultant. Analyze the business case for a feature. Be realistic, quantify where possible, and consider opportunity costs. ${context ? `\n\nProject context:\n${context}` : ""}` },
        {
          role: "user",
          content: `Analyze this feature's business case:
Feature: ${featureName}
Description: ${featureDescription || "N/A"}
Estimated Dev Days: ${estimatedDevDays || "Unknown"}
Team Size: ${teamSize || "Unknown"}

Return JSON:
{
  "revenue_impact": {
    "direct_revenue": "estimate with reasoning",
    "indirect_revenue": "e.g. retention, upsell impact",
    "confidence": "HIGH|MEDIUM|LOW"
  },
  "cost_analysis": {
    "development_cost": "estimated based on dev days and team size",
    "maintenance_cost": "ongoing monthly/yearly",
    "opportunity_cost": "what else could the team build?"
  },
  "roi": {
    "payback_period": "estimated time to recoup investment",
    "projected_roi_6m": "6-month ROI percentage",
    "projected_roi_12m": "12-month ROI percentage"
  },
  "cost_of_delay": {
    "weekly_cost": "estimated cost per week of delay",
    "competitive_risk": "what happens if competitor ships first?",
    "market_timing": "is there a window of opportunity?"
  },
  "risk_assessment": {
    "technical_risk": "LOW|MEDIUM|HIGH with reasoning",
    "market_risk": "LOW|MEDIUM|HIGH with reasoning",
    "execution_risk": "LOW|MEDIUM|HIGH with reasoning"
  },
  "recommendation": "BUILD|DEFER|KILL with reasoning",
  "priority_score": 1-10,
  "executive_summary": "2-3 sentence business case summary"
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 3072,
      response_format: { type: "json_object" },
    });
    const result = completion.choices[0]?.message?.content;
    if (!result) return NextResponse.json({ error: "No response" }, { status: 500 });
    return NextResponse.json(JSON.parse(result));
  } catch (error) {
    console.error("Business case error:", error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}

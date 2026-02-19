import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = request.nextUrl.searchParams.get("projectId");
  const supabase = await createClient();

  let query = supabase
    .from("backlog_items")
    .select("*, projects:project_id(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data: backlogItems, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(backlogItems);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    projectId,
    title,
    description,
    acceptanceCriteria,
    readinessScore,
    storyPoints,
    priority,
    status,
    technicalRisks,
    testScenarios,
  } = body;

  if (!projectId || !title) {
    return NextResponse.json(
      { error: "projectId and title are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: item, error } = await supabase
    .from("backlog_items")
    .insert({
      user_id: user.id,
      project_id: projectId,
      title,
      description: description || null,
      acceptance_criteria: acceptanceCriteria || null,
      readiness_score: readinessScore || null,
      story_points: storyPoints || null,
      priority: priority || "MEDIUM",
      status: status || "TODO",
      technical_risks: technicalRisks || null,
      test_scenarios: testScenarios || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(item, { status: 201 });
}

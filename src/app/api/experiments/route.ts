import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  const supabase = await createClient();
  let query = supabase.from("experiments").select("*, projects(name)").eq("user_id", user.id).order("created_at", { ascending: false });
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { projectId, title, hypothesis, description, metrics, variants, sampleSize, durationDays } = body;

  if (!projectId || !title || !hypothesis) {
    return NextResponse.json({ error: "projectId, title, and hypothesis are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("experiments")
    .insert({
      project_id: projectId,
      user_id: user.id,
      title,
      hypothesis,
      description: description || null,
      metrics: metrics || [],
      variants: variants || [{ name: "Control", description: "Current experience" }, { name: "Variant A", description: "" }],
      sample_size: sampleSize || null,
      duration_days: durationDays || null,
      status: "DRAFT",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, avatar_url, plan, stripe_customer_id, created_at")
    .eq("id", user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { full_name, avatar_url } = body;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (full_name !== undefined) updates.full_name = full_name;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const supabase = await createClient();

  if (full_name !== undefined) {
    await supabase.auth.updateUser({ data: { full_name } });
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id)
    .select("id, email, full_name, avatar_url, plan, stripe_customer_id, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

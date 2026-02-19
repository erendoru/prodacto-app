import { createClient } from "@/lib/supabase/server";

export interface DbUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: "FREE" | "PRO" | "TEAM";
  stripe_customer_id: string | null;
  monthly_query_count: number;
  query_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getAuthUser(): Promise<DbUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: dbUser, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !dbUser) {
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create user:", insertError);
      return null;
    }

    return newUser as DbUser;
  }

  return dbUser as DbUser;
}

import { createClient } from "@/lib/supabase/server";

export interface ContextVaultItem {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  content: string;
  type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export async function getProjectContext(
  projectId: string,
  userId: string
): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("context_vault")
    .select("title, content, type")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("type")
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) return "";

  const grouped: Record<string, string[]> = {};
  for (const item of data) {
    const key = item.type.toUpperCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(`- ${item.title}: ${item.content}`);
  }

  return Object.entries(grouped)
    .map(([type, items]) => `### ${type}\n${items.join("\n")}`)
    .join("\n\n");
}

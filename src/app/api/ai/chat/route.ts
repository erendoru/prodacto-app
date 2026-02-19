import { NextRequest } from "next/server";
import { openai, SYSTEM_PROMPT } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectContext } from "@/lib/context";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = await createClient();

  if (user.plan === "FREE") {
    const resetAt = user.query_reset_at;
    const now = new Date();
    if (!resetAt || now > new Date(resetAt)) {
      await supabase
        .from("users")
        .update({
          monthly_query_count: 0,
          query_reset_at: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
        })
        .eq("id", user.id);
    } else if (user.monthly_query_count >= 20) {
      return new Response(
        JSON.stringify({ error: "Monthly query limit reached. Upgrade to Pro for unlimited queries." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  const { messages, projectId } = await request.json();

  let projectContext = "";
  if (projectId) {
    const { data: project } = await supabase
      .from("projects")
      .select("*, backlog_items(*), documents(*)")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (project) {
      projectContext = `\n\nCurrent Project Context:
- Name: ${project.name}
- Description: ${project.description || "N/A"}
- Platform: ${project.platform}
- Tech Stack: ${project.tech_stack ? JSON.stringify(project.tech_stack) : "N/A"}
- Backlog Items: ${project.backlog_items?.length || 0}
- Documents: ${project.documents?.length || 0}`;

      const vaultContext = await getProjectContext(projectId, user.id);
      if (vaultContext) {
        projectContext += `\n\n--- CONTEXT VAULT ---\n${vaultContext}`;
      }
    }
  }

  const lastUserMessage = messages[messages.length - 1];
  await supabase.from("chat_messages").insert({
    user_id: user.id,
    project_id: projectId || null,
    role: "USER",
    content: lastUserMessage.content,
  });

  await supabase
    .from("users")
    .update({ monthly_query_count: user.monthly_query_count + 1 })
    .eq("id", user.id);

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT + projectContext },
      ...messages,
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
  });

  const encoder = new TextEncoder();
  let assistantMessage = "";

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            assistantMessage += content;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }

        await supabase.from("chat_messages").insert({
          user_id: user.id,
          project_id: projectId || null,
          role: "ASSISTANT",
          content: assistantMessage,
        });

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

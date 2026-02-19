import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectContext } from "@/lib/context";

const LAYERED_BACKLOG_PROMPT = `You are a SENIOR Product Manager with 10+ years experience at top tech companies. Generate an extremely detailed, realistic, production-grade backlog.

CRITICAL RULES — follow these EXACTLY:

## LAYERS (4 layers, in this order)
1. **DESIGN** — UI/UX design tasks. Design MUST be done or at least started before Frontend coding.
   - Wireframes, mockups, design review, design handoff
   - Ask: Is design ready? Who designs it? Figma/Sketch?
   - Task IDs: DS-1, DS-2...

2. **BACKEND** — API, database, services. Can start in PARALLEL with design.
   - Data models, API endpoints, business logic, integrations
   - Each API endpoint must specify: what data it returns, request/response format
   - Task IDs: BE-1, BE-2...

3. **FRONTEND** — UI implementation. DEPENDS on both Design AND Backend being ready.
   - Component development, API integration, state management
   - Each task must reference which design (DS-x) and which API (BE-x) it depends on
   - Task IDs: FE-1, FE-2...

4. **QA & POLISH** — Testing + bug buffer. DEPENDS on Frontend being done.
   - Unit tests, integration tests, E2E tests, code review
   - ALWAYS include a "Bug Fix Buffer" task (typically 1-3 days)
   - Task IDs: QA-1, QA-2...

## TASK DETAIL REQUIREMENTS
Each task MUST have:
- **estimated_days**: Realistic estimate in DAYS (0.5, 1, 2, 3 etc). Be realistic — a simple API endpoint is 0.5-1 day, not a week.
- **delivery_criteria**: Specific list of what "done" means. For APIs: what fields are returned. For design: are all states covered (loading, error, empty)?
- **blockers_checklist**: What needs to be true before this task can start? e.g. "Design approved", "API deployed to staging"
- **dependencies**: Array of task IDs that must finish first
- **assignee_role**: "designer", "backend", "frontend", "qa", or "fullstack"

## TIME ESTIMATION RULES
- Be REALISTIC. A product detail page is NOT 4-6 weeks. It's more like:
  - Design: 1-2 days
  - Backend API: 1-2 days  
  - Frontend implementation: 2-3 days
  - Testing + bug fixes: 1-2 days
  - Total: ~7-10 days
- Simple CRUD API endpoint: 0.5-1 day
- Complex business logic: 2-3 days
- UI page with API integration: 1-3 days
- Design for a single page: 1-2 days
- Bug fix buffer: add ~20% of total time
- ALWAYS think: "How long would a competent mid-level developer actually take?"

## PARALLEL WORK
- Design and Backend can happen IN PARALLEL (both start Day 1)
- Frontend starts AFTER design is at least reviewed AND relevant APIs are ready
- QA starts as features are completed, not at the very end

## SPRINT PLAN
- Use DAY-based timeline, not just weeks
- Show which tasks run in parallel
- Include start_day and end_day for each sprint
- Include a bug buffer sprint/phase

Return ONLY valid JSON:
{
  "feature_summary": "Clear 1-sentence summary",
  "tech_context": "Tech stack being used",
  "total_estimated_days": 10,
  "layers": [
    {
      "name": "DESIGN",
      "description": "UI/UX design and handoff",
      "order": 1,
      "tasks": [
        {
          "id": "DS-1",
          "title": "Specific task title",
          "description": "Detailed description with context",
          "estimated_days": 1.5,
          "assignee_role": "designer",
          "priority": "HIGH",
          "dependencies": [],
          "delivery_criteria": [
            "Figma mockup for desktop and mobile",
            "All states covered: loading, error, empty, populated",
            "Design review approved by product"
          ],
          "blockers_checklist": [
            "Product requirements finalized",
            "Content/copy provided"
          ],
          "acceptance_criteria": ["Detailed criterion 1", "Criterion 2"],
          "story_points": 3,
          "readiness_score": {
            "frontend": 8, "backend": 9, "testing": 7,
            "security": 8, "performance": 7, "dependencies": 9
          },
          "technical_notes": "Implementation hints",
          "technical_risks": ["Risk 1"]
        }
      ]
    },
    {
      "name": "BACKEND",
      "description": "API endpoints, data models, services",
      "order": 2,
      "tasks": [...]
    },
    {
      "name": "FRONTEND", 
      "description": "UI components, pages, API integration",
      "order": 3,
      "tasks": [...]
    },
    {
      "name": "QA & POLISH",
      "description": "Testing, code review, bug fixes",
      "order": 4,
      "tasks": [
        { "...normal tasks..." },
        {
          "id": "QA-last",
          "title": "Bug Fix Buffer",
          "description": "Reserved time for fixing bugs found during QA",
          "estimated_days": 1,
          "assignee_role": "fullstack",
          "priority": "HIGH",
          "dependencies": ["QA-1"],
          "delivery_criteria": ["All critical/high bugs fixed", "No regression"],
          "blockers_checklist": ["QA testing completed"],
          "acceptance_criteria": ["Zero critical bugs", "All high-priority bugs resolved"],
          "story_points": 3,
          "readiness_score": { "frontend": 5, "backend": 5, "testing": 8, "security": 7, "performance": 6, "dependencies": 5 },
          "technical_risks": ["Unknown bugs may extend timeline"]
        }
      ]
    }
  ],
  "timeline": [
    {
      "phase": "Phase 1: Design + Backend (Parallel)",
      "start_day": 1,
      "end_day": 3,
      "task_ids": ["DS-1", "BE-1", "BE-2"],
      "parallel_tracks": [
        { "track": "Design", "task_ids": ["DS-1"] },
        { "track": "Backend", "task_ids": ["BE-1", "BE-2"] }
      ],
      "goal": "Design mockups ready, APIs deployed to staging"
    },
    {
      "phase": "Phase 2: Frontend Implementation",
      "start_day": 3,
      "end_day": 6,
      "task_ids": ["FE-1", "FE-2"],
      "goal": "Feature implemented and connected to APIs"
    },
    {
      "phase": "Phase 3: QA + Bug Fixes",
      "start_day": 6,
      "end_day": 8,
      "task_ids": ["QA-1", "QA-2"],
      "goal": "Feature tested, bugs fixed, ready for production"
    }
  ],
  "total_story_points": 25
}`;

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { step, projectId, featureDescription, answers, conversationHistory } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  let projectContext = `Project: ${project.name}
Description: ${project.description || "N/A"}
Platform: ${project.platform}`;

  if (project.tech_stack) {
    const ts = project.tech_stack as Record<string, unknown>;
    if (ts.frontend) projectContext += `\nFrontend: ${(ts.frontend as string[]).join(", ")}`;
    if (ts.backend) projectContext += `\nBackend: ${(ts.backend as string[]).join(", ")}`;
    if (ts.database) projectContext += `\nDatabase: ${(ts.database as string[]).join(", ")}`;
    if (ts.tools) projectContext += `\nTools: ${(ts.tools as string[]).join(", ")}`;
    if (ts.teamSize) projectContext += `\nTeam Size: ${ts.teamSize}`;
    if (ts.notes) projectContext += `\nAdditional Notes: ${ts.notes}`;
  }

  const vaultContext = await getProjectContext(projectId, user.id);
  if (vaultContext) {
    projectContext += `\n\n--- CONTEXT VAULT (Company knowledge, personas, constraints) ---\n${vaultContext}`;
  }

  try {
    if (step === "generate") {
      const answersText = answers?.length
        ? answers.map((a: { question: string; answer: string }) => `${a.question}: ${a.answer}`).join("\n")
        : "";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: LAYERED_BACKLOG_PROMPT },
          {
            role: "user",
            content: `${projectContext}

Feature request: ${featureDescription}

${answersText ? `Additional context:\n${answersText}` : ""}
${conversationHistory ? `Voice notes:\n${conversationHistory}` : ""}

Generate a detailed, realistic, production-grade backlog with day-based estimates. Remember:
- Include DESIGN layer
- Backend and Design can run in parallel
- Frontend depends on both Design and Backend
- Include bug fix buffer
- Use DAY estimates, not weeks
- Be specific about delivery criteria for each task`,
          },
        ],
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return NextResponse.json({ error: "No response from AI" }, { status: 500 });
      }

      const backlog = JSON.parse(content);

      const allTasks = backlog.layers?.flatMap(
        (layer: { name: string; tasks: Array<Record<string, unknown>> }) =>
          layer.tasks.map((task: Record<string, unknown>) => ({
            user_id: user.id,
            project_id: projectId,
            title: `[${layer.name}] ${task.title}`,
            description: task.description as string || null,
            acceptance_criteria: task.acceptance_criteria || null,
            readiness_score: task.readiness_score || null,
            story_points: typeof task.story_points === "number" ? task.story_points : null,
            priority: (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(task.priority as string)
              ? task.priority : "MEDIUM") as string,
            status: "TODO",
            technical_risks: task.technical_risks || null,
            test_scenarios: null,
          }))
      ) || [];

      if (allTasks.length > 0) {
        await supabase.from("backlog_items").insert(allTasks);
      }

      return NextResponse.json({ step: "result", data: backlog });
    }

    if (step === "refine") {
      const { currentBacklog, refinementRequest } = body;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: LAYERED_BACKLOG_PROMPT },
          {
            role: "user",
            content: `${projectContext}

Current backlog:
${JSON.stringify(currentBacklog, null, 2)}

User's refinement request: ${refinementRequest}

Update the backlog based on the user's request. Keep the same JSON structure. Remember to maintain day-based estimates and delivery criteria.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 8192,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return NextResponse.json({ error: "No response from AI" }, { status: 500 });
      }

      return NextResponse.json({ step: "result", data: JSON.parse(content) });
    }

    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  } catch (error) {
    console.error("Smart backlog generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate backlog. Please try again." },
      { status: 500 }
    );
  }
}

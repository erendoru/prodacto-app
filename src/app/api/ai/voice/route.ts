import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { getAuthUser } from "@/lib/auth";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const audioFile = formData.get("audio") as File | null;

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  const bytes = await audioFile.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const tempPath = join(tmpdir(), `${randomUUID()}.webm`);

  try {
    await writeFile(tempPath, buffer);

    const fs = await import("fs");
    const file = fs.createReadStream(tempPath);

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "text",
    });

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  } finally {
    try {
      await unlink(tempPath);
    } catch {
      // cleanup failure is non-critical
    }
  }
}

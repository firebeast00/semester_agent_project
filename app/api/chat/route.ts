import { agent } from "@/lib/agent";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEADLINE_MS = 30000;

export async function POST(request: Request) {
  const started = Date.now();
  try {
    const body: unknown = await request.json();
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? (body as { message: unknown }).message
        : undefined;

    if (typeof message !== "string" || !message.trim() || message.length > 4000) {
      return Response.json(
        { error: "Message must be a non-empty string up to 4000 characters." },
        { status: 400 }
      );
    }

    console.info("[chat] invoking agent", { length: message.length });
    // A hard response deadline prevents requests from leaving the UI spinning.
    // Promise.race limits response time; it does not cancel an already running
    // provider request. Tool/API timeouts must be handled separately.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("Agent request timed out after 30 seconds")),
        DEADLINE_MS
      );
    });

    try {
      const result = await Promise.race([
        agent.invoke(
          { messages: [{ role: "user", content: message.trim() }] },
          { recursionLimit: 8 }
        ),
        deadline,
      ]);

      const reply = result.messages.at(-1)?.text;
      console.info("[chat] completed", { elapsedMs: Date.now() - started });
      return Response.json({ reply: reply || "No reply from the agent" });
    } finally {
      if (timer) clearTimeout(timer);
    }
  } catch (error) {
    console.error("[chat] failed", { elapsedMs: Date.now() - started, error });
    const timedOut =
      error instanceof Error && error.message.includes("timed out");
    return Response.json(
      { error: timedOut ? "The AI request took too long. Please try again." : "Unable to process your request." },
      { status: timedOut ? 504 : 500 }
    );
  }
}

import { agentCandidates } from "@/lib/agent";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL_TIMEOUT_MS = 9000;

// This caps how long a server waits for a model. It cannot forcibly stop a
// Gemini request already in flight.
async function withDeadline<T>(operation: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Model deadline exceeded")), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? (body as { message: unknown }).message
        : undefined;

    if (typeof message !== "string" || !message.trim() || message.length > 4000) {
      return Response.json({ error: "Message must be 1–4000 characters." }, { status: 400 });
    }

    // IMPORTANT: Automatically retrying write actions can duplicate side effects.
    // For this learning prototype failover is restricted to read-only messages.
    // Messages that appear to request task creation run only on the primary model.
    const writeIntent = /\b(add|create|save|delete|remove|update|edit|complete|mark)\b/i.test(message);
    const candidates = writeIntent ? agentCandidates.slice(0, 1) : agentCandidates;

    for (const { id, agent } of candidates) {
      const start = Date.now();
      console.info("[chat] attempting", id);
      try {
        const result = await withDeadline(
          agent.invoke(
            { messages: [{ role: "user", content: message.trim() }] },
            { recursionLimit: 8 }
          ),
          MODEL_TIMEOUT_MS
        );

        const reply = result.messages.at(-1)?.text;
        if (!reply) throw new Error("Empty model reply");
        console.info("[chat] completed", { model: id, elapsedMs: Date.now() - start });
        return Response.json({ reply, model: id });
      } catch (error) {
        console.warn("[chat] model failed", {
          model: id,
          elapsedMs: Date.now() - start,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return Response.json(
      { error: "All available Gemini models failed or timed out. Check Google API connectivity and quota." },
      { status: 503 }
    );
  } catch (error) {
    console.error("[chat] request failed", error);
    return Response.json({ error: "Unable to process request." }, { status: 500 });
  }
}

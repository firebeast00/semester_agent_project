import { model } from "@/lib/gemini";

export const runtime = "nodejs";

export async function GET() {
  // Diagnostic endpoint is intentionally disabled outside local development.
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const start = Date.now();
  console.info("[debug-gemini] direct model invocation started", {
    keyPresent: Boolean(process.env.GOOGLE_API_KEY),
  });

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Direct Gemini request exceeded 12 seconds")), 12000);
    });

    const reply = await Promise.race([
      model.invoke("Reply with exactly: hello"),
      deadline,
    ]);

    console.info("[debug-gemini] success", { elapsedMs: Date.now() - start });
    return Response.json({
      ok: true,
      elapsedMs: Date.now() - start,
      text: reply.text,
    });
  } catch (error) {
    console.error("[debug-gemini] failed", error);
    return Response.json(
      {
        ok: false,
        elapsedMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
}

import { agent } from "@/lib/agent";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    

    const body = await request.json();
    

    const message = body.message;

    if (!message || typeof message !== "string") {
      

      return Response.json(
        {
          error: "Message is required",
        },
        {
          status: 400,
        }
      );
    }

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const lastMessage = result.messages.at(-1);
    const reply =
      lastMessage?.text || "No reply from the agent";
    return Response.json({
      reply,
    });
  } catch (error) {
  console.error("Agent error:", error);

  return Response.json(
    {
      error: "Something went wrong",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    },
    {
      status: 500,
    }
  );
}
}

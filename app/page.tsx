"use client";

import { FormEvent, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I’m your AI agent. I can answer questions and use tools such as weather, calculator, notes, tasks, and expense data.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();

    const text = input.trim();

    if (!text || loading) return;

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        signal: AbortSignal.timeout(35000),
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed (HTTP ${response.status})`);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);
      const errorMessage = error instanceof Error
        ? (error.name === "TimeoutError" ? "The request took too long. Try again." : error.message)
        : "An unexpected error occurred.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col">
        {/* Header */}
        <header className="border-b border-zinc-800 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                AI Agent Playground
              </h1>

              <p className="mt-1 text-sm text-zinc-400">
                Next.js + LangChain + Gemini
              </p>
            </div>

            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
              Agent Online
            </div>
          </div>
        </header>

        {/* Tool Section */}
        <section className="border-b border-zinc-800 px-6 py-4">
          <p className="mb-3 text-xs uppercase tracking-wider text-zinc-500">
            Available tools
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "Calculator",
              "Weather",
              "Date & Time",
              "Currency",
              "Notes",
              "Tasks",
              "Expenses",
            ].map((tool) => (
              <span
                key={tool}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300"
              >
                {tool}
              </span>
            ))}
          </div>
        </section>

        {/* Chat */}
        <section className="flex-1 overflow-y-auto px-6 py-8">
          <div className="space-y-5">
            {messages.map((message, index) => {
              const isUser =
                message.role === "user";

              return (
                <div
                  key={index}
                  className={`flex ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      isUser
                        ? "bg-white text-black"
                        : "border border-zinc-800 bg-zinc-900 text-zinc-100"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
                  Agent is thinking...
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Input */}
        <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-5">
          <form
            onSubmit={sendMessage}
            className="flex gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              placeholder="Ask your agent anything..."
              disabled={loading}
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-zinc-500 disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={
                loading || !input.trim()
              }
              className="rounded-xl bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Send
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-zinc-600">
            Gemini decides whether to answer directly or use a tool.
          </p>
        </footer>
      </div>
    </main>
  );
}
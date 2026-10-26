import { ChatGoogle } from "@langchain/google";

// Models share one Google API key and endpoint.
// Failover helps with model-specific errors, but not network-wide outages.
export const geminiModels = [
  { id: "gemini-3.8-flash", model: new ChatGoogle({ model: "gemini-3.8-flash", maxRetries: 0 }) },
  { id: "gemini-3.6-flash", model: new ChatGoogle({ model: "gemini-3.6-flash", maxRetries: 0 }) },
  { id: "gemini-3.5-flash-lite", model: new ChatGoogle({ model: "gemini-3.5-flash-lite", maxRetries: 0 }) },
] as const;

// Maintains compatibility with /api/test-gemini and existing imports.
export const model = geminiModels[0].model;

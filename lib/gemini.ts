import { ChatGoogle } from "@langchain/google";

export const model = new ChatGoogle({
  model: "gemini-3.8-flash",
  maxRetries: 1,
});

import { ChatGoogle } from "@langchain/google";

export const model = new ChatGoogle({
    model: 'gemini-3.7-flash', 
    maxRetries: 2
});

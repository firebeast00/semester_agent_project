import { createAgent } from "langchain";
import { geminiModels } from "@/lib/gemini";
import {
  calculatorTool,
  weatherTool,
  dateTimeTool,
  currencyTool,
  notesSearchTool,
  addTaskTool,
  listTasksTool,
  expenseTool,
} from "@/lib/tools";

const tools = [
  calculatorTool,
  weatherTool,
  dateTimeTool,
  currencyTool,
  notesSearchTool,
  addTaskTool,
  listTasksTool,
  expenseTool,
];

const systemPrompt = `You are a helpful AI assistant.
Use tools only when needed for current information or an action.
Use calculator for arithmetic; weather and currency tools for live data.
Don't repeatedly call the same tool once it returns an adequate result.
If a tool fails, explain it clearly. For general questions, answer directly.`;

export const agentCandidates = geminiModels.map(({ id, model }) => ({
  id,
  agent: createAgent({ model, tools, systemPrompt }),
}));

// Primary agent remains available to any code already importing it.
export const agent = agentCandidates[0].agent;

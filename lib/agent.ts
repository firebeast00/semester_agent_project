import { createAgent } from "langchain";
import { model } from "@/lib/gemini";
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

export const agent = createAgent({
  model,
  tools: [
    calculatorTool,
    weatherTool,
    dateTimeTool,
    currencyTool,
    notesSearchTool,
    addTaskTool,
    listTasksTool,
    expenseTool,
  ],
  systemPrompt: `You are a helpful AI assistant.
Use a tool only when it is necessary for current data or an action.
For calculations use the calculator tool.
For current weather or exchange rates use the corresponding external-data tool.
Do not repeatedly call the same tool if it already returned the needed result.
If a tool fails, explain what could not be retrieved rather than trying indefinitely.
For general questions, answer directly and concisely.`,
});

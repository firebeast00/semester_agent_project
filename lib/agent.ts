import { createAgent } from "langchain";

import { model } from "@/lib/gemini";
import { calculatorTool,
  weatherTool,
  dateTimeTool,
  currencyTool,
  notesSearchTool,
  addTaskTool,
  listTasksTool,
  expenseTool,
  readUrlTool, } from "@/lib/tools";

export const agent = createAgent({
  model,

  tools: [calculatorTool,
  weatherTool,
  dateTimeTool,
  currencyTool,
  notesSearchTool,
  addTaskTool,
  listTasksTool,
  expenseTool,
  readUrlTool,],

  systemPrompt: `
You are a helpful AI assistant.

Use the calculator tool whenever the user asks for
an arithmetic calculation.

For normal questions, answer directly.

Keep your answers simple and clear.
`,
});
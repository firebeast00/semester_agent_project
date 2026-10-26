import { tool } from "langchain";
import { z } from "zod";

export const calculatorTool = tool(
  async ({ a, b, operation }) => {
    switch (operation) {
      case "add":
        return String(a + b);

      case "subtract":
        return String(a - b);

      case "multiply":
        return String(a * b);

      case "divide":
        if (b === 0) {
          return "Cannot divide by zero.";
        }

        return String(a / b);
    }
  },
  {
    name: "calculator",

    description:
      "Use this tool when the user asks for an arithmetic calculation.",

    schema: z.object({
      a: z.number().describe("First number"),

      b: z.number().describe("Second number"),

      operation: z
        .enum([
          "add",
          "subtract",
          "multiply",
          "divide",
        ])
        .describe("The arithmetic operation"),
    }),
  }
);
export const courseInfoTool = tool(
  async ({ topic }) => {
    const courses: Record<string, string> = {
      langchain:
        "LangChain covers tools, agents, memory, and RAG.",
      nextjs:
        "Next.js covers App Router, API routes, and deployment.",
      gemini:
        "Gemini covers prompting, tool calling, and multimodal AI.",
    };

    return courses[topic.toLowerCase()] ?? "Course not found.";
  },
  {
    name: "get_course_info",
    description:
      "Use this tool when the user asks about available courses or course information.",
    schema: z.object({
      topic: z.string().describe("Course topic"),
    }),
  }
);


export const weatherTool = tool(
  async ({ city }) => {
    // 1. Convert city name into coordinates
    const geoResponse = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city
      )}&count=1&language=en&format=json`
    );

    if (!geoResponse.ok) {
      throw new Error("Failed to find city");
    }

    const geoData = await geoResponse.json();

    const location = geoData.results?.[0];

    if (!location) {
      return `Could not find weather information for ${city}.`;
    }

    const { latitude, longitude, name, country } = location;

    // 2. Get current weather using coordinates
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`
    );

    if (!weatherResponse.ok) {
      throw new Error("Failed to get weather");
    }

    const weatherData = await weatherResponse.json();

    return JSON.stringify({
      city: name,
      country,
      temperature: weatherData.current?.temperature_2m,
      apparentTemperature:
        weatherData.current?.apparent_temperature,
      windSpeed:
        weatherData.current?.wind_speed_10m,
      weatherCode:
        weatherData.current?.weather_code,
      units: weatherData.current_units,
    });
  },
  {
    name: "get_current_weather",

    description:
      "Get the current weather for a city. Use this tool when the user asks about current weather or temperature.",

    schema: z.object({
      city: z
        .string()
        .describe("City name, for example Karachi, London, or Tokyo"),
    }),
  }
);
export const dateTimeTool = tool(
  async ({ timezone }) => {
    const now = new Date();

    return now.toLocaleString("en-US", {
      timeZone: timezone,
      dateStyle: "full",
      timeStyle: "long",
    });
  },
  {
    name: "get_current_datetime",

    description:
      "Get the current date and time for a timezone.",

    schema: z.object({
      timezone: z
        .string()
        .describe(
          "IANA timezone such as Asia/Karachi or Europe/London"
        ),
    }),
  }
);

export const currencyTool = tool(
  async ({ amount, from, to }) => {
    const response = await fetch(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
    );

    if (!response.ok) {
      return "Unable to fetch currency conversion.";
    }

    const data = await response.json();

    return JSON.stringify({
      amount,
      from,
      to,
      convertedAmount: data.rates?.[to],
    });
  },
  {
    name: "convert_currency",

    description:
      "Convert money from one currency to another using current exchange rates.",

    schema: z.object({
      amount: z.number(),

      from: z
        .string()
        .describe("Source currency code such as USD"),

      to: z
        .string()
        .describe("Target currency code such as PKR"),
    }),
  }
);
const notes = [
  {
    title: "LangChain",
    content:
      "LangChain helps developers create applications using LLMs, tools, agents, retrieval, and memory.",
  },

  {
    title: "Agents",
    content:
      "An agent uses an LLM to decide which tools to call in order to complete a task.",
  },

  {
    title: "RAG",
    content:
      "Retrieval-Augmented Generation retrieves relevant information before generating an answer.",
  },
];
export const notesSearchTool = tool(
  async ({ query }) => {
    const normalizedQuery = query.toLowerCase();

    const results = notes.filter((note) =>
      `${note.title} ${note.content}`
        .toLowerCase()
        .includes(normalizedQuery)
    );

    if (results.length === 0) {
      return "No relevant notes found.";
    }

    return JSON.stringify(results);
  },
  {
    name: "search_notes",

    description:
      "Search the user's saved learning notes for relevant information.",

    schema: z.object({
      query: z.string(),
    }),
  }
);
const tasks: {
  id: number;
  title: string;
  completed: boolean;
}[] = [];
export const addTaskTool = tool(
  async ({ title }) => {
    const task = {
      id: Date.now(),
      title,
      completed: false,
    };

    tasks.push(task);

    return JSON.stringify(task);
  },
  {
    name: "add_task",

    description:
      "Create a task for the user.",

    schema: z.object({
      title: z.string(),
    }),
  }
);
export const listTasksTool = tool(
  async () => {
    return JSON.stringify(tasks);
  },
  {
    name: "list_tasks",

    description:
      "Get the user's current tasks.",

    schema: z.object({}),
  }
);
const expenses = [
  {
    category: "food",
    amount: 2500,
  },
  {
    category: "transport",
    amount: 1800,
  },
  {
    category: "internet",
    amount: 3500,
  },
];
export const expenseTool = tool(
  async ({ category }) => {
    if (!category) {
      return JSON.stringify(expenses);
    }

    const results = expenses.filter(
      (expense) =>
        expense.category.toLowerCase() ===
        category.toLowerCase()
    );

    return JSON.stringify(results);
  },
  {
    name: "get_expenses",

    description:
      "Get the user's expense information, optionally filtered by category.",

    schema: z.object({
      category: z.string().optional(),
    }),
  }
);

export const readUrlTool = tool(
  async ({ url }) => {
    const response = await fetch(url);

    if (!response.ok) {
      return "Unable to fetch this URL.";
    }

    const html = await response.text();

    return html.slice(0, 10000);
  },
  {
    name: "read_url",

    description:
      "Fetch the contents of a public webpage when the user provides a URL.",

    schema: z.object({
      url: z.string().url(),
    }),
  }
);
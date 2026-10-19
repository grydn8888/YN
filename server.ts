import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const app = express();
app.use(express.json());

// Initialize Gemini SDK with server-side API key
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback curated questions if offline or Gemini API key is missing
const FALLBACK_BANK: Record<string, Array<{ text: string; category: string }>> = {
  general: [
    { text: "Will making an unexpected move lead to success today?", category: "Predictions" },
    { text: "Is patience more valuable than swift action right now?", category: "Philosophical" },
    { text: "Should you embrace an unfamiliar challenge before the day ends?", category: "Daily Decisions" },
    { text: "Can intuition be trusted more than logic in this moment?", category: "Mysteries" },
    { text: "Will taking a 15-minute break solve your current obstacle?", category: "Daily Decisions" },
  ],
  predictions: [
    { text: "Will an unexpected message arrive before the sunset?", category: "Predictions" },
    { text: "Is good fortune waiting around the next corner?", category: "Predictions" },
    { text: "Will a long-forgotten project suddenly become relevant?", category: "Predictions" },
    { text: "Is the coming week going to bring a breakthrough?", category: "Predictions" },
  ],
  philosophical: [
    { text: "Is true silence possible in modern life?", category: "Philosophical" },
    { text: "Can a machine ever truly understand human nostalgia?", category: "Philosophical" },
    { text: "Is every random occurrence connected by hidden purpose?", category: "Philosophical" },
    { text: "Does taking the harder road always build stronger character?", category: "Philosophical" },
  ],
  decisions: [
    { text: "Should you say YES to the next invitation you receive?", category: "Daily Decisions" },
    { text: "Is it the right moment to declutter your workspace?", category: "Daily Decisions" },
    { text: "Should you take a walk outside right now?", category: "Daily Decisions" },
    { text: "Is it wiser to sleep on the problem before deciding?", category: "Daily Decisions" },
  ],
};

// API: Generate Yes/No Questions with Gemini
app.post("/api/generate-questions", async (req, res) => {
  try {
    const { topic = "General", count = 5, category = "General" } = req.body;
    const requestedCount = Math.min(Math.max(Number(count) || 5, 1), 10);

    const ai = getGeminiClient();

    if (!ai) {
      console.warn("GEMINI_API_KEY not configured. Returning thematic questions from local bank.");
      const catKey = (category.toLowerCase() in FALLBACK_BANK) ? category.toLowerCase() : "general";
      const pool = FALLBACK_BANK[catKey] || FALLBACK_BANK.general;
      const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, requestedCount);
      return res.json({
        questions: shuffled,
        source: "fallback",
      });
    }

    const prompt = `Generate ${requestedCount} creative, thought-provoking, and intriguing YES or NO questions for an Oracle decision game.
Topic or Theme: "${topic}".
Category hint: "${category}".

Requirements:
1. Every question MUST be answerable with strictly "YES" or "NO".
2. Avoid boring or purely factual questions (like "Is water wet?").
3. Make them engaging, poetic, philosophical, predictive, or relevant for personal decision-making.
4. Provide a concise category tag for each (e.g. "Predictions", "Daily Decisions", "Philosophical", "Mysteries", "Opinions", or a custom one).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "The full Yes/No question text, ending with a question mark.",
              },
              category: {
                type: Type.STRING,
                description: "Short category name or theme (1-2 words).",
              },
            },
            required: ["text", "category"],
          },
        },
      },
    });

    const rawJson = response.text?.trim() || "[]";
    let questions = JSON.parse(rawJson);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Invalid output format received from model.");
    }

    // Clean up questions
    questions = questions.map((q: { text: string; category?: string }) => ({
      text: q.text.trim().endsWith("?") ? q.text.trim() : `${q.text.trim()}?`,
      category: q.category?.trim() || category || "AI Generated",
    }));

    return res.json({
      questions,
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    // Return graceful fallback
    const fallbackList = [
      { text: "Will taking a spontaneous risk today lead to a great memory?", category: "Predictions" },
      { text: "Should you trust your first gut instinct on this matter?", category: "Daily Decisions" },
      { text: "Is the most obvious answer actually the correct one?", category: "Philosophical" },
      { text: "Will tomorrow bring an unexpected opportunity?", category: "Predictions" },
      { text: "Is it time to start that creative idea you've been postponing?", category: "Daily Decisions" },
    ];
    return res.json({
      questions: fallbackList,
      source: "fallback",
      error: error?.message || "Generation fallback used",
    });
  }
});

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Yes/No Oracle Backend" });
});

// Setup Vite middleware in dev or static files in production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Oracle server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite();

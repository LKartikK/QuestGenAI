require("dotenv").config();
console.log("GROQ key detected:", !!process.env.GROQ_API_KEY, (process.env.GROQ_API_KEY || "").slice(0,6));

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/ping", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.post("/generate", async (req, res) => {
  try {
    const { topic = "your topic", count = 5, difficulty = "mixed" } = req.body || {};
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GROQ_API_KEY" });

    const body = {
      // Groq uses an OpenAI-compatible Chat Completions API
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are QuestGenAI. Generate multiple-choice questions (MCQs) from a topic. " +
            "Return STRICT JSON ONLY matching this schema: " +
            "{ \"items\": [ { \"q\": string, \"a\": string[4], \"correct\": number (0-3) } ] } " +
            "Do not include commentary."
        },
        {
          role: "user",
          content: JSON.stringify({
            topic,
            count,
            difficulty,
            constraints: { numOptions: 4, avoidAmbiguity: true, varyDistractors: true }
          })
        }
      ]
    };

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("Groq API Error:", t);
      return res.status(502).json({ error: "Groq error", details: t });
    }

    const json = await resp.json();
    const content = json?.choices?.[0]?.message?.content || "{}";

    let parsed = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}$/);
      parsed = match ? JSON.parse(match[0]) : { items: [] };
    }

    const items = Array.isArray(parsed.items) ? parsed.items : [];
    return res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

import express from "express";
import OpenAI from "openai";

const app = express();
app.use(express.json({ limit: "30kb" }));
app.use(express.static("."));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const instructions = {
  reel: "Write a catchy short-form video/reel script in natural Hindi. Include a strong hook, scene-by-scene voiceover, and a short CTA.",
  news: "Write a clear, balanced Hindi news report. Do not invent facts, quotes, dates, names, or figures. Mark missing details as needing confirmation.",
  caption: "Create 5 engaging Hindi social media captions with relevant hashtags. Avoid misleading claims.",
  ideas: "Give 10 practical content ideas for an Indian audience, each with a short hook."
};

app.post("/api/generate", async (req, res) => {
  try {
    const { tool, topic } = req.body || {};
    if (!instructions[tool]) return res.status(400).json({ error: "यह टूल उपलब्ध नहीं है।" });
    if (typeof topic !== "string" || topic.trim().length < 3 || topic.length > 4000)
      return res.status(400).json({ error: "कृपया विषय 3 से 4000 अक्षरों के बीच लिखें।" });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6",
      instructions: instructions[tool] + " Respond in Hindi unless the user explicitly asks otherwise.",
      input: topic.trim()
    });
    res.json({ text: response.output_text || "अभी जवाब नहीं मिला। दोबारा कोशिश करें।" });
  } catch (err) {
    console.error("Generation error:", err?.message || err);
    res.status(500).json({ error: "AI से जवाब नहीं मिला। API key, billing और server settings जाँचें।" });
  }
});
app.listen(process.env.PORT || 3000, () => console.log("KARO AI running"));

import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * 🔹 GET: /api/gemini/quote
 * Returns a short motivational quote
 */
router.get("/quote", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(
      "Give me one short, powerful motivational quote about fitness, strength, or perseverance."
    );
    const quoteText = result.response.text().replace(/["*]/g, "");
    res.json({ quote: quoteText });
  } catch (error) {
    console.error("Error fetching quote:", error);
    res.status(500).json({ error: "Failed to fetch motivational quote" });
  }
});

/**
 * 🔹 POST: /api/gemini/alternatives
 * Returns AI-generated bodyweight/minimal equipment alternatives with YouTube tutorial links.
 */
router.post("/alternatives", async (req, res) => {
  const { muscleGroup } = req.body;

  if (!muscleGroup)
    return res.status(400).json({ error: "Missing muscleGroup in request body" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Suggest 3 effective bodyweight or minimal-equipment exercises for the ${muscleGroup} muscle group.
      Return JSON only in this format:
      [
        { "name": "Push-up", "description": "A classic upper-body exercise targeting chest and triceps." },
        { "name": "Dips", "description": "A bodyweight exercise focusing on triceps and shoulders." },
        { "name": "Plank", "description": "Core stabilization exercise improving posture and endurance." }
      ]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    let exercises = [];
    try {
      exercises = JSON.parse(text);
    } catch (err) {
      console.warn("Gemini output not JSON, fallback:", text);
      exercises = [{ name: "Push-ups", description: "Classic bodyweight chest exercise" }];
    }

    // Fetch YouTube tutorials
    const youtubeResults = await Promise.all(
      exercises.map(async (ex) => {
        try {
          const yt = await axios.get(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
              ex.name + " exercise tutorial"
            )}&key=${process.env.YOUTUBE_API_KEY}&maxResults=1&type=video`
          );
          const videoId = yt.data.items[0]?.id?.videoId;
          return { ...ex, youtubeLink: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null };
        } catch {
          return { ...ex, youtubeLink: null };
        }
      })
    );

    res.json(youtubeResults);
  } catch (error) {
    console.error("Error fetching AI alternatives:", error);
    res.status(500).json({ error: "Failed to generate alternative exercises" });
  }
});

export default router;

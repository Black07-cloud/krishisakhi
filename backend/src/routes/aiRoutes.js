import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: question }],
    });

    res.json({
      answer: response.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

export default router;

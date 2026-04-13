export const revalidate = 3600; // Cache for 1 hour to prevent spamming the API on every page load
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ quote: "Master your math skills with fun, encouraging challenges! You're doing amazing." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const prompt = "Generate a single, short, highly positive and encouraging quote about learning, math, or personal growth. Do not include quotes around the text. Maximum 2 sentences. Sound friendly and warm.";
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const quoteText = response.text?.replace(/"/g, '').trim();

    return NextResponse.json({ quote: quoteText || "You're capable of incredible things. Keep learning!" });
  } catch (error: any) {
    console.error("LLM Quote Generation Error:", error);
    return NextResponse.json({ quote: "Master your math skills with fun, encouraging challenges! You're doing amazing." });
  }
}

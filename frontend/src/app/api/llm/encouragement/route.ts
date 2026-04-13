export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const FALLBACK_ENCOURAGEMENTS = [
  "Keep going!",
  "Almost there!",
  "Try again!",
  "You've got this!",
  "Stay strong!"
];

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ phrases: FALLBACK_ENCOURAGEMENTS });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const prompt = `Generate exactly 5 unique, warm and encouraging short phrases for a child who just got a math question wrong. 
Rules:
- Each phrase must be 3-4 words MAX
- Sound gentle, sweet and motivating—not sarcastic  
- Return ONLY a valid JSON array of 5 strings, no preamble, no explanation
Example format: ["Try again!", "You've got this!", "Keep going!", "Almost there!", "Believe in yourself!"]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const raw = response.text?.trim() ?? '';
    const phrases: string[] = JSON.parse(raw);

    if (!Array.isArray(phrases) || phrases.length === 0) {
      return NextResponse.json({ phrases: FALLBACK_ENCOURAGEMENTS });
    }

    return NextResponse.json({ phrases });
  } catch (error: any) {
    console.error("LLM Encouragement Generation Error:", error);
    return NextResponse.json({ phrases: FALLBACK_ENCOURAGEMENTS });
  }
}

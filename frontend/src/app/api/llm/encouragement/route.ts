export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { generateText } from '@/lib/llmClient';
import { prisma } from '@/lib/prisma';

const FALLBACK_PHRASE = "Keep going! You've got this!";

const DEFAULT_PROMPT = `You are a gentle, supportive companion in a magical garden of math.
Generate exactly ONE short, encouraging phrase (6-10 words) for someone who just got a question wrong.
Rules:
- Sound sweet, warm, and motivating.
- Return ONLY a valid JSON object with a single "phrase" key
Example: {"phrase": "Every petal grows with practice! 🌸" }`;

export async function GET() {
  try {
    const config = await prisma.appConfig.findUnique({ where: { key: 'llm_prompt_encouragement' } });
    const prompt = config?.value || DEFAULT_PROMPT;

    const raw = await generateText(prompt, true);
    const data = JSON.parse(raw.trim());
    const phrase = data?.phrase || data?.[0] || FALLBACK_PHRASE;
    return NextResponse.json({ phrase });
  } catch (error: any) {
    console.error("LLM Encouragement error:", error);
    return NextResponse.json({ phrase: FALLBACK_PHRASE });
  }
}

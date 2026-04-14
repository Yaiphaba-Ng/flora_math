export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { generateText } from '@/lib/llmClient';
import { prisma } from '@/lib/prisma';

const FALLBACK_PHRASE = "Keep going! You've got this!";

const DEFAULT_PROMPT = `Generate exactly ONE unique, warm and encouraging short phrase for a student who just got a math question wrong.
Rules:
- Phrase must be 3-6 words MAX
- Sound gentle, sweet and motivating—not sarcastic
- Return ONLY a valid JSON object with a single "phrase" key
Example format: { "phrase": "You're doing great, try again!" }`;

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

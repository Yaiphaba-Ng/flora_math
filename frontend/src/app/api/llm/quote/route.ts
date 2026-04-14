export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { generateText } from '@/lib/llmClient';
import { prisma } from '@/lib/prisma';

const FALLBACK_QUOTE = "You are capable of incredible things. Keep learning and growing every single day!";
const DEFAULT_PROMPT = "Generate a single, very short, highly positive and encouraging quote about learning and personal growth. Maximum 2 short sentences. Sound friendly and warm with cutesy inspirational vibes.";

export async function GET() {
  try {
    const config = await prisma.appConfig.findUnique({ where: { key: 'llm_prompt_quote' } });
    const prompt = config?.value || DEFAULT_PROMPT;
    
    const text = await generateText(prompt);
    return NextResponse.json({ quote: text.replace(/"/g, '').trim() || FALLBACK_QUOTE });
  } catch (error: any) {
    console.error("LLM Quote error:", error);
    return NextResponse.json({ quote: FALLBACK_QUOTE });
  }
}

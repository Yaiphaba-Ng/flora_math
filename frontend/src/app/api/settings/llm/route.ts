export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_PROMPTS = {
  quote: "Generate a single, very short, highly positive and encouraging quote about learning, math, or personal growth. Do not include quotes around the text. Maximum 2 short sentences. Sound friendly and warm.",
  encouragement: `Generate exactly 5 unique, warm and encouraging short phrases for a child who just got a math question wrong.
Rules:
- Each phrase must be 3-4 words MAX
- Sound gentle, sweet and motivating—not sarcastic
- Return ONLY a valid JSON array of 5 strings, no preamble, no explanation
Example format: ["Try again!", "You've got this!", "Keep going!", "Almost there!", "Believe in yourself!"]`
};

async function getConfigMap() {
  const rows = await prisma.appConfig.findMany({
    where: { key: { in: ['llm_provider', 'llm_model', 'llm_api_key_gemini', 'llm_api_key_groq', 'llm_prompt_quote', 'llm_prompt_encouragement'] } }
  });
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

export async function GET() {
  try {
    const map = await getConfigMap();
    return NextResponse.json({
      provider: map['llm_provider'] ?? 'gemini',
      model: map['llm_model'] ?? 'gemini-2.5-flash',
      hasGeminiKey: !!map['llm_api_key_gemini'],
      hasGroqKey: !!map['llm_api_key_groq'],
      promptQuote: map['llm_prompt_quote'] ?? DEFAULT_PROMPTS.quote,
      promptEncouragement: map['llm_prompt_encouragement'] ?? DEFAULT_PROMPTS.encouragement,
    });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

async function upsert(key: string, value: string) {
  await prisma.appConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model, gemini_api_key, groq_api_key, promptQuote, promptEncouragement } = body;

    if (provider) await upsert('llm_provider', provider);
    if (model) await upsert('llm_model', model);
    if (gemini_api_key) await upsert('llm_api_key_gemini', gemini_api_key);
    if (groq_api_key) await upsert('llm_api_key_groq', groq_api_key);
    if (promptQuote) await upsert('llm_prompt_quote', promptQuote);
    if (promptEncouragement) await upsert('llm_prompt_encouragement', promptEncouragement);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

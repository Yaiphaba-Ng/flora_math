export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';
import type { LLMProvider } from '@/lib/llmClient';

export async function POST(request: NextRequest) {
  try {
    let { provider, api_key } = await request.json() as { provider: LLMProvider; api_key: string };

    if (!api_key) {
      // Try to fetch from database
      const keyEntry = await prisma.appConfig.findUnique({
        where: { key: provider === 'groq' ? 'llm_api_key_groq' : 'llm_api_key_gemini' }
      });
      api_key = keyEntry?.value ?? '';
    }

    if (!api_key) {
      return NextResponse.json({ error: 'API key not found. Please enter it first.' }, { status: 400 });
    }

    let models: string[] = [];

    if (provider === 'groq') {
      const groq = new Groq({ apiKey: api_key });
      const list = await groq.models.list();
      models = list.data
        .map(m => m.id)
        .sort();
    } else {
      // Gemini
      const ai = new GoogleGenAI({ apiKey: api_key });
      const list = await ai.models.list();
      for await (const m of list) {
        const name = m.name?.replace('models/', '') ?? '';
        // Filter for text generation models only
        if (name.startsWith('gemini') && m.supportedActions?.includes('generateContent')) {
          models.push(name);
        }
      }
      models.sort();
    }

    return NextResponse.json({ models });
  } catch (e: any) {
    console.error('Models list error:', e);
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

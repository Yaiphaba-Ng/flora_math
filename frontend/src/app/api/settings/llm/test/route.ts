export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { LLMProvider } from '@/lib/llmClient';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    let { provider, model, api_key } = await request.json() as {
      provider: LLMProvider;
      model: string;
      api_key: string;
    };

    if (!api_key) {
      // Try to fetch from database
      const keyEntry = await prisma.appConfig.findUnique({
        where: { key: provider === 'groq' ? 'llm_api_key_groq' : 'llm_api_key_gemini' }
      });
      api_key = keyEntry?.value ?? '';
    }

    if (!api_key) {
      return NextResponse.json({ success: false, message: 'API key not found. Please enter it first.' }, { status: 400 });
    }

    const testPrompt = "Say 'OK' and nothing else.";
    let result = '';

    if (provider === 'groq') {
      const groq = new Groq({ apiKey: api_key });
      const chat = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: testPrompt }],
      });
      result = chat.choices[0]?.message?.content ?? '';
    } else {
      const ai = new GoogleGenAI({ apiKey: api_key });
      const response = await ai.models.generateContent({ model, contents: testPrompt });
      result = response.text ?? '';
    }

    if (result) {
      return NextResponse.json({ success: true, message: `Connection successful! Response: "${result.trim()}"` });
    }
    return NextResponse.json({ success: false, message: 'No response from the model.' });
  } catch (e: any) {
    const msg = e?.message ?? 'Unknown error';
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}

import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';

export type LLMProvider = 'gemini' | 'groq';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey: string;
}

/** Read active LLM config — uses provider-specific key slots */
export async function getLLMConfig(): Promise<LLMConfig> {
  const rows = await prisma.appConfig.findMany({
    where: { key: { in: ['llm_provider', 'llm_model', 'llm_api_key_gemini', 'llm_api_key_groq'] } }
  });

  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  const provider = (map['llm_provider'] as LLMProvider) ?? 'gemini';
  const model = map['llm_model'] ?? 'gemini-2.5-flash';

  const apiKey =
    provider === 'groq'
      ? (map['llm_api_key_groq'] ?? process.env.GROQ_API_KEY ?? '')
      : (map['llm_api_key_gemini'] ?? process.env.GEMINI_API_KEY ?? '');

  return { provider, model, apiKey };
}

/** Generate text using the active LLM provider */
export async function generateText(prompt: string, jsonMode = false): Promise<string> {
  const config = await getLLMConfig();

  if (config.provider === 'groq') {
    const groq = new Groq({ apiKey: config.apiKey });
    const chat = await groq.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    });
    return chat.choices[0]?.message?.content ?? '';
  }

  // Default: Gemini
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const response = await ai.models.generateContent({
    model: config.model,
    contents: prompt,
    ...(jsonMode ? { config: { responseMimeType: 'application/json' } } : {}),
  });
  return response.text ?? '';
}

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const metrics = await prisma.questionMetric.findMany();
    
    const aggregates: Record<string, { attempts: number; failures: number; time_ms: number[] }> = {};
    for (const m of metrics) {
      if (!aggregates[m.question_string]) {
        aggregates[m.question_string] = { attempts: 0, failures: 0, time_ms: [] };
      }
      aggregates[m.question_string].attempts += 1;
      if (!m.is_correct) {
        aggregates[m.question_string].failures += 1;
      }
      aggregates[m.question_string].time_ms.push(m.response_time_ms);
    }

    const results = Object.entries(aggregates).map(([q, data]) => {
      const sumTime = data.time_ms.reduce((a, b) => a + b, 0);
      const avgTime = data.time_ms.length > 0 ? sumTime / data.time_ms.length : 0;
      return {
        question: q,
        attempts: data.attempts,
        failures: data.failures,
        avg_time_ms: Math.round(avgTime * 100) / 100
      };
    });

    results.sort((a, b) => b.failures - a.failures);
    return NextResponse.json(results.slice(0, 10));

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get("module") || "all";
    const where = moduleFilter !== "all" ? { module_slug: moduleFilter } : {};

    const metrics = await prisma.questionMetric.findMany({ where });
    
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

    const processed = Object.entries(aggregates).map(([q, data]) => {
      const sumTime = data.time_ms.reduce((a, b) => a + b, 0);
      const avgTimeSec = data.time_ms.length > 0 ? (sumTime / data.time_ms.length) / 1000 : 0;
      const accuracy = Math.round(((data.attempts - data.failures) / data.attempts) * 100);
      
      return {
        question: q,
        attempts: data.attempts,
        failures: data.failures,
        accuracy: accuracy,
        avg_time_sec: Math.round(avgTimeSec * 10) / 10
      };
    });

    const topErrors = processed
      .filter(p => p.failures > 0)
      .sort((a, b) => b.failures - a.failures || a.accuracy - b.accuracy)
      .slice(0, 10);

    const hesitations = processed
      .filter(p => p.failures === 0 && p.attempts >= 2) // Must have gotten it right 100% of time, at least twice
      .sort((a, b) => b.avg_time_sec - a.avg_time_sec)
      .slice(0, 10);

    return NextResponse.json({
      top_errors: topErrors,
      slowest_correct: hesitations
    });

  } catch (e: any) {
    console.error("Weak spots API error:", e);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}


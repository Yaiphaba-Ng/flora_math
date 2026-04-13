export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get("module") || "all";

    // Build the query constraints
    const sessionWhere = moduleFilter !== "all" ? { module_slug: moduleFilter } : {};
    const metricWhere = moduleFilter !== "all" ? { module_slug: moduleFilter } : {};

    // 1. Total Sessions Played
    const totalSessions = await prisma.quizSession.count({ where: sessionWhere });

    // 2. Global Accuracy & Time
    const metrics = await prisma.questionMetric.findMany({
      where: metricWhere,
      select: { is_correct: true, response_time_ms: true }
    });

    const totalQuestions = metrics.length;
    const totalCorrect = metrics.filter(m => m.is_correct).length;
    const globalAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
    
    const totalResponseTimeMs = metrics.reduce((acc, curr) => acc + curr.response_time_ms, 0);
    const avgResponseTimeSec = totalQuestions > 0 ? (totalResponseTimeMs / totalQuestions) / 1000 : 0;

    return NextResponse.json({
      totalSessions,
      totalQuestions,
      globalAccuracy: Math.round(globalAccuracy),
      avgResponseTimeSec: Math.round(avgResponseTimeSec * 10) / 10
    });

  } catch (e: any) {
    console.error("Overview API error:", e);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

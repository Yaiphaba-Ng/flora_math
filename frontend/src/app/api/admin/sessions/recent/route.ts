export const dynamic = 'force-dynamic';
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get("module") || "all";
    const where = moduleFilter !== "all" ? { module_slug: moduleFilter } : {};

    const sessions = await prisma.quizSession.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 10
    });

    const enriched = sessions.map(s => {
      const accuracy = s.total_questions > 0 
        ? Math.round((s.score / s.total_questions) * 100) 
        : 0;
      return { ...s, accuracy };
    });

    return NextResponse.json(enriched);
  } catch (e: any) {
    console.error("Recent sessions API error:", e);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}


export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Delete all metrics and sessions
    // Order matters due to foreign keys if they are not ON DELETE CASCADE
    // In our schema QuestionMetric points to QuizSession
    await prisma.questionMetric.deleteMany({});
    await prisma.quizSession.deleteMany({});
    
    // Also reset ConfigUsage if needed for a truly "clean" test state
    await prisma.configUsage.deleteMany({});

    return NextResponse.json({ success: true, message: "All metrics and sessions cleared." });
  } catch (error: any) {
    console.error("Reset metrics error:", error);
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }
}

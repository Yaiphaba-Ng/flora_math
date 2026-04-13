export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sessions = await prisma.quizSession.findMany({
      orderBy: { created_at: 'desc' },
      take: 10
    });
    return NextResponse.json(sessions);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

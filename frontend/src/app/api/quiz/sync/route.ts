export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { module_slug, config, score, total_questions, metrics } = payload;

    if (!module_slug || !metrics) {
      return NextResponse.json({ detail: "Missing required fields" }, { status: 400 });
    }

    // Default user handling
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Guest" } });
    }

    // Record config usage for dynamic chip suggestions
    if (config) {
        for (const [field_key, field_value] of Object.entries(config)) {
            if (typeof field_value === 'number') {
                const str_val = String(Math.floor(field_value));
                // We use findFirst/create to handle "usage" counters safely without massive lock overheads
                const existing = await prisma.configUsage.findFirst({
                    where: { module_slug, field_key, field_value: str_val }
                });

                if (existing) {
                    await prisma.configUsage.update({
                        where: { id: existing.id },
                        data: { use_count: { increment: 1 } }
                    });
                } else {
                    await prisma.configUsage.create({
                        data: { module_slug, field_key, field_value: str_val, use_count: 1 }
                    });
                }
            }
        }
    }

    // Record the Session
    const sessionRecord = await prisma.quizSession.create({
      data: {
        user_id: user.id,
        module_slug: module_slug,
        score: score || 0,
        total_questions: total_questions || metrics.length,
        is_completed: true, // we sync at the end
        session_data: JSON.stringify({ config, final_score: score })
      }
    });

    // Record all Question Metrics in a batch
    if (metrics.length > 0) {
        await prisma.questionMetric.createMany({
            data: metrics.map((m: any) => ({
                session_id: sessionRecord.id,
                module_slug: module_slug,
                question_string: m.question_string,
                is_correct: m.is_correct,
                response_time_ms: m.response_time_ms || 0
            }))
        });
    }

    return NextResponse.json({ success: true, session_id: sessionRecord.id });

  } catch (e: any) {
    console.error("Bulk sync error:", e);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

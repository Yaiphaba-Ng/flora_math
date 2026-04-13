export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getModuleBySlug } from '@/lib/quiz/registry';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { user_id, module_slug, config } = payload;

    const quizModule = getModuleBySlug(module_slug);
    if (!quizModule) {
      return NextResponse.json({ detail: "Quiz module not found" }, { status: 404 });
    }

    let questions = quizModule.generateQuestions(config);
    if (!questions || questions.length === 0) {
      return NextResponse.json({ detail: "Config generated 0 questions" }, { status: 400 });
    }

    const num_questions = Number(config.num_questions ?? 20);
    questions = questions.slice(0, Math.max(1, num_questions));

    const serialized_qs = questions.map(q => ({
      q: q.question_string,
      a: q.correct_answer
    }));

    // For now we assume a default user since user logic is minimal
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({ data: { name: "Guest" } });
    }

    const sessionData = {
      config: config,
      questions: serialized_qs,
      current_index: 0
    };

    const sessionRecord = await prisma.quizSession.create({
      data: {
        user_id: user.id, // Overrides payload.user_id for now 
        module_slug: module_slug,
        total_questions: questions.length,
        session_data: JSON.stringify(sessionData)
      }
    });

    // Record config usage for dynamic chip suggestions
    for (const [field_key, field_value] of Object.entries(config)) {
      if (typeof field_value === 'number') {
        const str_val = String(Math.floor(field_value));
        
        await prisma.configUsage.upsert({
          where: {
            module_slug_field_key_field_value: {
              module_slug: module_slug,
              field_key: field_key,
              field_value: str_val
            }
          },
          update: {
            use_count: { increment: 1 }
          },
          create: {
            module_slug: module_slug,
            field_key: field_key,
            field_value: str_val,
            use_count: 1
          }
        });
      }
    }

    return NextResponse.json({
      session_id: sessionRecord.id,
      total: questions.length,
      first_question: serialized_qs[0].q
    });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

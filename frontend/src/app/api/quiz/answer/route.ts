export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { session_id, question_string, user_answer, time_taken_ms } = payload;

    const sessionRecord = await prisma.quizSession.findUnique({
      where: { id: Number(session_id) }
    });

    if (!sessionRecord) {
      return NextResponse.json({ detail: "Session not found" }, { status: 404 });
    }

    const data = JSON.parse(sessionRecord.session_data);
    const questions = data.questions || [];
    const currentIndex = data.current_index || 0;

    if (currentIndex >= questions.length) {
      return NextResponse.json({ detail: "Session already completed" }, { status: 400 });
    }

    const currentQ = questions[currentIndex];
    let isCorrect = false;

    // Real answer validation
    const parsedUserAnswer = parseInt(String(user_answer), 10);
    if (!isNaN(parsedUserAnswer)) {
      isCorrect = parsedUserAnswer === parseInt(String(currentQ.a), 10);
    }

    const nextIndex = currentIndex + 1;
    const isFinished = nextIndex >= questions.length;

    data.current_index = nextIndex;
    const newScore = isCorrect ? sessionRecord.score + 1 : sessionRecord.score;

    // Update session state
    await prisma.quizSession.update({
      where: { id: sessionRecord.id },
      data: {
        session_data: JSON.stringify(data),
        score: newScore,
        is_completed: isFinished
      }
    });

    // Record metric
    await prisma.questionMetric.create({
      data: {
        session_id: sessionRecord.id,
        question_string: question_string,
        module_slug: sessionRecord.module_slug,
        is_correct: isCorrect,
        response_time_ms: time_taken_ms
      }
    });

    return NextResponse.json({
      is_correct: isCorrect,
      is_finished: isFinished,
      next_question: !isFinished ? questions[nextIndex].q : null,
      score: newScore,
      correct_answer: String(currentQ.a)
    });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}

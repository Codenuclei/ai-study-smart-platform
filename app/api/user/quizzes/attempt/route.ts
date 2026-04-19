import { db } from '@/lib/db';
import { quizAttempts } from '@/lib/schema';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId, score, totalQuestions, answers } = await req.json();

    if (!quizId || score === undefined || !totalQuestions) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        quizId,
        userId: session.user.id,
        score: score.toString(), // Score is decimal, Drizzle expects string for high precision
        totalQuestions,
        answers, // JSONB of user choices
        completedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ attempt });
  } catch (error) {
    console.error('[QUIZ_ATTEMPT_POST]', error);
    return NextResponse.json({ error: 'Failed to record attempt' }, { status: 500 });
  }
}

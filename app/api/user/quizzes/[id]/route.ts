import { db } from '@/lib/db';
import { quizzes, quizQuestions } from '@/lib/schema';
import { getSession } from '@/lib/auth-utils';
import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const quiz = await db.query.quizzes.findFirst({
      where: and(eq(quizzes.id, id), eq(quizzes.userId, session.user.id)),
      with: {
        questions: {
          orderBy: (questions, { asc }) => [asc(questions.orderIndex)],
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    console.log('[QUIZ_DETAIL_GET] Found quiz with questions:', quiz.questions?.length);
    return NextResponse.json(quiz);
  } catch (error) {
    console.error('[QUIZ_DETAIL_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch quiz details' }, { status: 500 });
  }
}

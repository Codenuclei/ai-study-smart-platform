import { db } from '@/lib/db';
import { quizzes, quizQuestions, quizAttempts, materials } from '@/lib/schema';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch quizzes with their latest/best attempt score if available
    const userQuizzes = await db
      .select({
        id: quizzes.id,
        materialId: quizzes.id,
        materialTitle: materials.title,
        title: quizzes.title,
        difficulty: quizzes.difficulty,
        createdAt: quizzes.createdAt,
        questionCount: sql<number>`count(${quizQuestions.id})::int`,
        bestScore: sql<number>`max(${quizAttempts.score})::float`,
      })
      .from(quizzes)
      .leftJoin(materials, eq(quizzes.materialId, materials.id))
      .leftJoin(quizQuestions, eq(quizzes.id, quizQuestions.quizId))
      .leftJoin(quizAttempts, eq(quizzes.id, quizAttempts.quizId))
      .where(eq(quizzes.userId, userId))
      .groupBy(quizzes.id, materials.title)
      .orderBy(desc(quizzes.createdAt));

    return NextResponse.json({ quizzes: userQuizzes });
  } catch (error) {
    console.error('[QUIZZES_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { materialId, title, difficulty, questions } = await req.json();

    if (!materialId || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Atomic transaction to create quiz and its questions
    const result = await db.transaction(async (tx) => {
      const [newQuiz] = await tx
        .insert(quizzes)
        .values({
          userId,
          materialId,
          title: title || 'New Quiz',
          difficulty: difficulty || 'medium',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      const questionsToInsert = questions.map((q: any, index: number) => ({
        quizId: newQuiz.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        orderIndex: index,
      }));

      await tx.insert(quizQuestions).values(questionsToInsert);

      return newQuiz;
    });

    return NextResponse.json({ quiz: result });
  } catch (error) {
    console.error('[QUIZZES_POST]', error);
    return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await db
      .delete(quizzes)
      .where(and(eq(quizzes.id, id), eq(quizzes.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[QUIZZES_DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 });
  }
}

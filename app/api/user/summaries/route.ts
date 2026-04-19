import { db } from '@/lib/db';
import { summaries, materials } from '@/lib/schema';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';
import { eq, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await db
      .select({
        id: summaries.id,
        materialId: summaries.materialId,
        materialTitle: materials.title,
        content: summaries.content,
        keyPoints: summaries.keyPoints,
        createdAt: summaries.createdAt,
      })
      .from(summaries)
      .leftJoin(materials, eq(summaries.materialId, materials.id))
      .where(eq(summaries.userId, session.user.id))
      .orderBy(desc(summaries.createdAt));

    return NextResponse.json({ summaries: rows });
  } catch (error) {
    console.error('[SUMMARIES_GET]', error);
    return NextResponse.json({ error: 'Failed to fetch summaries' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { materialId, content, keyPoints } = await req.json();

    if (!materialId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newSummary] = await db
      .insert(summaries)
      .values({
        userId: session.user.id,
        materialId,
        content,
        keyPoints: keyPoints || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({ summary: newSummary });
  } catch (error) {
    console.error('[SUMMARIES_POST]', error);
    return NextResponse.json({ error: 'Failed to create summary' }, { status: 500 });
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
      .delete(summaries)
      .where(and(eq(summaries.id, id), eq(summaries.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SUMMARIES_DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete summary' }, { status: 500 });
  }
}

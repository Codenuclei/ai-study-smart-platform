import { db } from '@/lib/db';
import { chatMessages } from '@/lib/schema';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, session.user.id))
      .orderBy(chatMessages.createdAt);
    return NextResponse.json({ messages: rows });
  } catch (error) {
    console.error('[API/USER/CHAT] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    // Accept both { role, content } and { role, parts: [{ type: 'text', text }] }
    let { materialId, role, content, parts } = body;
    if (!content && Array.isArray(parts)) {
      // Extract text from parts if present
      const textPart = parts.find((p: any) => p.type === 'text');
      content = textPart?.text || '';
    }
    if (!role || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const [message] = await db
      .insert(chatMessages)
      .values({
        userId: session.user.id,
        materialId: materialId || null,
        role,
        content,
        createdAt: new Date(),
      })
      .returning();
    return NextResponse.json({
      ...message,
      parts: parts || [{ type: 'text', text: content }]
    }, { status: 201 });
  } catch (error) {
    console.error('[API/USER/CHAT] POST error:', error);
    return NextResponse.json({ error: 'Failed to create chat message' }, { status: 500 });
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
    await db.execute(
      sql`DELETE FROM ${chatMessages} WHERE id = ${id} AND user_id = ${session.user.id}`
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API/USER/CHAT] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete chat message' }, { status: 500 });
  }
}

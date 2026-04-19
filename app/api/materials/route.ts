import { db } from '@/lib/db';
import { materials } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';
import { upsertMaterial } from '@/lib/qdrant';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const mats = await db
      .select()
      .from(materials)
      .where(eq(materials.userId, session.user.id));

    return NextResponse.json(mats);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, subject, fileUrl } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [material] = await db
      .insert(materials)
      .values({
        userId: session.user.id,
        title,
        content,
        subject: subject || null,
        fileUrl: fileUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Index in Qdrant Vector Store
    try {
      await upsertMaterial(material.id, title, content, session.user.id);
    } catch (indexError) {
      console.error('[QDRANT_INDEX_ERROR]', indexError);
      // We don't fail the whole request if indexing fails, but we log it
    }

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
      .delete(materials)
      .where(and(eq(materials.id, id), eq(materials.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[MATERIALS_DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete material' }, { status: 500 });
  }
}

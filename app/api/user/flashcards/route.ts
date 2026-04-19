import { db } from '@/lib/db';
import { flashcards, materials } from '@/lib/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const rows = await db
      .select({
        id: flashcards.id,
        userId: flashcards.userId,
        materialId: flashcards.materialId,
        materialTitle: materials.title,
        front: flashcards.front,
        back: flashcards.back,
        difficulty: flashcards.difficulty,
        nextReview: flashcards.nextReview,
        createdAt: flashcards.createdAt,
      })
      .from(flashcards)
      .leftJoin(materials, eq(flashcards.materialId, materials.id))
      .where(eq(flashcards.userId, session.user.id))
      .orderBy(desc(flashcards.createdAt));
    
    return NextResponse.json({ flashcards: rows });
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
    }

    const body = await req.json();
    
    // Support both single object and array of cards
    const cardsToInsert = Array.isArray(body) ? body : [body];

    if (cardsToInsert.length === 0) {
      return NextResponse.json({ error: 'No flashcards provided' }, { status: 400 });
    }

    const values = cardsToInsert.map((card, index) => {
      const { materialId, front, back, difficulty } = card;
      if (!materialId || !front || !back) {
        console.error(`Missing fields in card at index ${index}:`, card);
        throw new Error(`Flashcard at index ${index} is missing required fields (materialId, front, or back).`);
      }
      return {
        userId: userId,
        materialId,
        front,
        back,
        difficulty: difficulty || 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const insertedCards = await db
      .insert(flashcards)
      .values(values)
      .returning();

    return NextResponse.json({ 
      success: true, 
      count: insertedCards.length,
      flashcards: insertedCards 
    });
  } catch (error: any) {
    console.error('Error creating flashcards:', error);
    return NextResponse.json({ error: error.message || 'Failed to create flashcards' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id, materialId } = await req.json();
    
    if (materialId) {
      // Delete all cards for this material
      await db
        .delete(flashcards)
        .where(
          and(
            eq(flashcards.materialId, materialId),
            eq(flashcards.userId, session.user.id)
          )
        );
      return NextResponse.json({ success: true, message: 'Deck deleted' });
    }

    if (!id) return NextResponse.json({ error: 'Missing id or materialId' }, { status: 400 });

    await db
      .delete(flashcards)
      .where(
        and(
          eq(flashcards.id, id),
          eq(flashcards.userId, session.user.id)
        )
      );

    return NextResponse.json({ success: true, message: 'Card deleted' });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

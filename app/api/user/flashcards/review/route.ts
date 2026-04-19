import { db } from '@/lib/db';
import { flashcards } from '@/lib/schema';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

// Simplified SM-2 Algorithm for Flashcard Review
// q: rating (1 = Hard, 2 = Medium, 3 = Easy)
function calculateNextReview(q: number, prevInterval: number, prevEaseFactor: number) {
  let interval: number;
  let easeFactor: number;

  if (q >= 2) {
    if (prevInterval === 0) {
      interval = 1;
    } else if (prevInterval === 1) {
      interval = 3; // review in 3 days
    } else {
      interval = Math.round(prevInterval * prevEaseFactor);
    }
    
    // Adjust ease factor: q=3 increases it, q=2 keeps it stable
    easeFactor = prevEaseFactor + (0.1 - (3 - q) * (0.08 + (3 - q) * 0.02));
  } else {
    // Hard case: reset interval but don't punish too much
    interval = 1;
    easeFactor = Math.max(1.3, prevEaseFactor - 0.2);
  }

  easeFactor = Math.max(1.3, easeFactor); // Minimum ease factor
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { interval, easeFactor, nextReview };
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cardId, rating } = await req.json(); // rating: 1, 2, or 3

    if (!cardId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch current card state
    const [card] = await db
      .select()
      .from(flashcards)
      .where(and(eq(flashcards.id, cardId), eq(flashcards.userId, session.user.id)));

    if (!card) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
    }

    // 2. Calculate new SRS values
    const prevInterval = card.interval || 0;
    const prevEaseFactor = parseFloat(card.easeFactor?.toString() || '2.5');
    
    const { interval, easeFactor, nextReview } = calculateNextReview(rating, prevInterval, prevEaseFactor);

    // 3. Update database
    const [updatedCard] = await db
      .update(flashcards)
      .set({
        interval,
        easeFactor: easeFactor.toString(),
        nextReview,
        difficulty: rating === 1 ? 'hard' : rating === 2 ? 'medium' : 'easy',
        updatedAt: new Date(),
      })
      .where(eq(flashcards.id, cardId))
      .returning();

    return NextResponse.json({ success: true, flashcard: updatedCard });
  } catch (error) {
    console.error('SRS Review Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { generateText } from 'ai';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const flashcardsSchema = z.object({
  flashcards: z.array(
    z.object({
      id: z.string(),
      front: z.string(),
      back: z.string(),
      category: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, cardCount = 10 } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Missing content' },
        { status: 400 }
      );
    }

    const prompt = `Create ${cardCount} flashcards from the following content. Each flashcard should have a question/term on the front and the answer/definition on the back.

Content:
${content}

Format each flashcard with:
- Front: A clear question or term
- Back: A concise answer or definition
- Category: The topic category

Respond with valid JSON only containing a flashcards array.`;

    const result = await generateText({
      model: 'openai/gpt-4-turbo',
      system: 'You are an expert in creating educational flashcards. Generate clear, effective flashcards that promote learning and retention. Return valid JSON only.',
      prompt,
      temperature: 0.7,
      maxOutputTokens: 2000,
    });

    try {
      const parsed = JSON.parse(result.text);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ text: result.text });
    }
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}

import { streamText, Output } from 'ai';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const getModel = () => {
  const modelString = process.env.AI_MODEL || 'openai/gpt-4-turbo';
  return modelString;
};

const flashcardsSchema = z.object({
  flashcards: z.array(
    z.object({
      id: z.string(),
      front: z.string().describe('Question or term on the front of the card'),
      back: z.string().describe('Answer or definition on the back of the card'),
      category: z.string().describe('Category or topic of the flashcard'),
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

Flashcards should be memorable and help with spaced repetition learning.`;

    const result = streamText({
      model: getModel(),
      system: 'You are an expert in creating educational flashcards. Generate clear, effective flashcards that promote learning and retention.',
      prompt,
      output: Output.object({
        schema: flashcardsSchema,
      }),
      temperature: 0.7,
    });

    return (await result).toTextStreamResponse();
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json(
      { error: 'Failed to generate flashcards' },
      { status: 500 }
    );
  }
}

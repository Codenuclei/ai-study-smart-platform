import { generateText } from 'ai';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const quizSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.number(),
      explanation: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, difficulty = 'medium', questionCount = 5 } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Missing content' },
        { status: 400 }
      );
    }

    const prompt = `Create ${questionCount} multiple choice quiz questions based on the following content. The difficulty level should be ${difficulty}.

Content:
${content}

Generate quiz questions that test comprehension and critical thinking. Each question should have 4 options with only one correct answer. Include an explanation for the correct answer.

Respond with valid JSON only.`;

    const result = await generateText({
      model: 'openai/gpt-4-turbo',
      system: 'You are an expert educator creating quiz questions. Generate clear, educational quiz questions with accurate answers and explanations. Return valid JSON only.',
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
    console.error('Error generating quiz:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}

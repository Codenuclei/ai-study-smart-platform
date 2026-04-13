import { streamText } from 'ai';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, style = 'comprehensive' } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Missing content' },
        { status: 400 }
      );
    }

    const stylePrompts = {
      comprehensive: 'Create a comprehensive summary covering all main points',
      concise: 'Create a short, concise summary (2-3 bullet points)',
      detailed: 'Create a detailed summary with explanations and examples',
    };

    const prompt = `${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.comprehensive}.

Content to summarize:
${content}

Provide a well-structured summary with clear sections and key takeaways.`;

    const result = await streamText({
      model: 'openai/gpt-4-turbo',
      system: 'You are an expert educational content summarizer. Create clear, accurate, and well-organized summaries.',
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1000,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error summarizing content:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

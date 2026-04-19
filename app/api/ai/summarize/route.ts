import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getSession } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { summaries } from '@/lib/schema';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content: rawContent, style = 'comprehensive', materialId } = await req.json();

    if (!rawContent) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const stylePrompts = {
      comprehensive: 'Create a comprehensive summary covering all main points in a well-structured way.',
      concise: 'Create a short, concise summary with only the most essential 3-5 bullet points.',
      detailed: 'Create a detailed summary with deep explanations, examples, and detailed sections.',
    };

    const prompt = `${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.comprehensive}.

Content to summarize:
${rawContent}

Provide a well-structured summary. If using bullet points, use markdown.`;

    const { text } = await generateText({
      model: google('gemini-flash-latest'),
      system: 'You are an expert educational content summarizer. Create clear, accurate, and well-organized summaries using markdown formatting.',
      prompt,
      temperature: 0.7,
      maxOutputTokens: 1500,
    });

    // If materialId is provided, we auto-save it for the user
    let savedSummary = null;
    if (materialId) {
      const [inserted] = await db.insert(summaries).values({
        userId: session.user.id,
        materialId: materialId,
        content: text,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      savedSummary = inserted;
    }

    return NextResponse.json({ 
      text, 
      summary: savedSummary // return the saved record if applicable
    });
  } catch (error) {
    console.error('[AI-SUMMARIZE]', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

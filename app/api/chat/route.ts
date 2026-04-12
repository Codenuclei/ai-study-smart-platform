import { streamText } from 'ai';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

const getModel = () => {
  const modelString = process.env.AI_MODEL || 'openai/gpt-4-turbo';
  return modelString;
};

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const result = streamText({
      model: getModel(),
      system: `You are StudyAI, an expert study companion and educational assistant. Your role is to:
1. Help students understand complex concepts and topics
2. Answer study-related questions clearly and comprehensively
3. Provide study strategies and learning tips
4. Help with problem-solving and critical thinking
5. Guide students through their learning journey
6. Be encouraging and supportive

Always explain concepts in an easy-to-understand way and break down complex ideas into digestible parts. Provide examples when helpful. If asked about non-study topics, gently redirect to educational content.`,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      temperature: 0.7,
      maxTokens: 1500,
    });

    return (await result).toTextStreamResponse();
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}

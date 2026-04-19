import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';

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

    // Normalize UIMessage format to {role, content}
    const normalizedMessages = messages.map((msg: any) => {
      if (Array.isArray(msg.parts)) {
        const textPart = msg.parts.find((p: any) => p.type === 'text');
        return {
          role: msg.role,
          content: textPart?.text || '',
        };
      }
      return {
        role: msg.role,
        content: msg.content || msg.text || '',
      };
    });

    const { text } = await generateText({
      model: google('gemini-flash-latest'), // Using 1.5-flash as it is the stable current version
      system: `You are StudyAI, an expert study companion and educational assistant. Your role is to:
1. Help students understand complex concepts and topics
2. Answer study-related questions clearly and comprehensively
3. Provide study strategies and learning tips
4. Help with problem-solving and critical thinking
5. Guide students through their learning journey
6. Be encouraging and supportive
\nAlways explain concepts in an easy-to-understand way and break down complex ideas into digestible parts. Provide examples when helpful. If asked about non-study topics, gently redirect to educational content.`,
      messages: normalizedMessages,
      temperature: 0.7,
      maxOutputTokens: 1500,
    });

    const responseData = { text };
    console.log('[AI-CHAT] Sending response:', JSON.stringify(responseData, null, 2));

    return Response.json(responseData);
  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat' },
      { status: 500 }
    );
  }
}

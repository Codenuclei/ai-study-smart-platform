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

    const { content, difficulty = 'medium', questionCount = 5 } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const prompt = `Create a quiz with ${questionCount} multiple choice questions based on the following study material. 
Difficulty: ${difficulty}

Content:
${content}

Requirements:
- Each question must have exactly 4 options.
- options is an array of strings.
- correctAnswer is the 0-based index of the correct option.
- Include a helpful "explanation" for why the answer is correct.
- Return ONLY valid JSON in this format:
{
  "title": "Quiz Title",
  "questions": [
    {
      "question": "text",
      "options": ["a", "b", "c", "d"],
      "correctAnswer": 0,
      "explanation": "why..."
    }
  ]
}`;

    const { text } = await generateText({
      model: google('gemini-flash-latest'),
      system: 'You are an educational content creator. You must generate valid, high-quality quiz questions in the requested JSON format. Ensure all options are plausible.',
      prompt,
      temperature: 0.7,
      maxOutputTokens: 2500,
    });

    try {
      // Find the JSON part in case the model adds extra text
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) throw new Error('Invalid JSON response');
      
      const parsed = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
      return NextResponse.json(parsed);
    } catch (err) {
      console.error('Failed to parse AI JSON:', text);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (error) {
    console.error('[GENERATE-QUIZ]', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}

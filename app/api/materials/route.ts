import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { studyMaterials } from '@/lib/schema';
import { getSession } from '@/lib/auth-utils';
import { NextResponse } from 'next/server';
import * as schema from '@/lib/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const materials = await db
      .select()
      .from(studyMaterials)
      .where((table) => table.userId.equals(session.user.id));

    return NextResponse.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, type } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const material = await db
      .insert(studyMaterials)
      .values({
        userId: session.user.id,
        title,
        content,
        type: type || 'notes',
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(material[0], { status: 201 });
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

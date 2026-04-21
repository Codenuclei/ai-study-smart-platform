import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let email, password, name;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      email = body.email;
      password = body.password;
      name = body.name;
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.text();
      const parsed = Object.fromEntries(new URLSearchParams(formData));
      email = parsed.email;
      password = parsed.password;
      name = parsed.name;
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash: hashedPassword,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API/AUTH/REGISTER] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

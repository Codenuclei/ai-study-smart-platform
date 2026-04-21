import { db } from './db';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs'; 

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        let email, password;
        // Try to parse both JSON and form-urlencoded
        if (credentials?.email && credentials?.password) {
          email = credentials.email;
          password = credentials.password;
        } else if (req && req.body) {
          // NextAuth v4+ passes req.body as a string for form submissions
          try {
            const contentType = req.headers?.get?.('content-type') || '';
            if (typeof req.body === 'string') {
              if (contentType.includes('application/json')) {
                const parsed = JSON.parse(req.body);
                email = parsed.email;
                password = parsed.password;
              } else if (contentType.includes('application/x-www-form-urlencoded')) {
                const parsed = Object.fromEntries(new URLSearchParams(req.body));
                email = parsed.email;
                password = parsed.password;
              }
            }
          } catch (e) {
            // ignore
          }
        }
        if (!email || !password) {
          throw new Error('Invalid credentials');
        }

        // eq expects (column, value)
        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, email as string))
          .limit(1);

        const user = result[0];
        if (!user) {
          throw new Error('No user found with this email');
        }

        // Ensure passwordHash is string
        if (typeof user.passwordHash !== 'string') {
          throw new Error('User password is not set up correctly');
        }

        const passwordMatch = await bcrypt.compare(
          password as string,
          user.passwordHash
        );
        if (!passwordMatch) {
          throw new Error('Invalid password');
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

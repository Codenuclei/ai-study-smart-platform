import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    redirect('/auth/login');
  }
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

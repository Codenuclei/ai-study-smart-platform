import { auth } from './auth';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await auth();
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

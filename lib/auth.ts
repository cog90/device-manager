import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import argon2 from 'argon2';
import AV from 'leancloud-storage';

// Initialize LeanCloud
const APP_ID: string = process.env.NEXT_PUBLIC_LEANCLOUD_APP_ID || '';
const APP_KEY: string = process.env.NEXT_PUBLIC_LEANCLOUD_APP_KEY || '';
const SERVER_URL: string = process.env.NEXT_PUBLIC_LEANCLOUD_SERVER_URL || '';

AV.init({
  appId: APP_ID,
  appKey: APP_KEY,
  serverURL: SERVER_URL,
});

export const UsersTable = AV.Object.extend('users');
export const SessionsTable = AV.Object.extend('sessions');

const SESSION_COOKIE = 'sessionToken';
const SESSION_TTL_DAYS = 7;

export async function hashPassword(plain: string) {
  return argon2.hash(plain);
}

export async function verifyPassword(hash: string, plain: string) {
  return argon2.verify(hash, plain);
}

export async function findUserByUsername(username: string) {
  const query = new AV.Query(UsersTable);
  query.equalTo('username', username);
  const result = await query.first();
  return result || null;
}

export async function createUser(username: string, passwordHash: string) {
  const user = new UsersTable();
  user.set('username', username);
  user.set('password', passwordHash);
  return await user.save();
}

export async function createSession(userId: string) {
  const token = randomUUID();
  const session = new SessionsTable();
  session.set('userId', userId);
  session.set('token', token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  session.set('expiresAt', expiresAt.toISOString());
  await session.save();

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const query = new AV.Query(SessionsTable);
  query.equalTo('token', token);
  const s = await query.first();
  if (!s) return null;

  const expiresAt = s.get('expiresAt');
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    await s.destroy();
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  return { token, userId: s.get('userId') as string };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return;
  const query = new AV.Query(SessionsTable);
  query.equalTo('token', token);
  const s = await query.first();
  if (s) await s.destroy();
  cookieStore.delete(SESSION_COOKIE);
}



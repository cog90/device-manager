import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername, verifyPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ message: '缺少必要字段' }, { status: 400 });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 });
    }

    const ok = await verifyPassword(user.get('password'), password);
    if (!ok) {
      return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({ id: user.id, username });
  } catch (e) {
    console.error('Login failed', e);
    return NextResponse.json({ message: '服务器错误' }, { status: 500 });
  }
}



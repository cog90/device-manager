import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByUsername, hashPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password, inviteCode } = await req.json();
    if (!username || !password || !inviteCode) {
      return NextResponse.json({ message: '缺少必要字段' }, { status: 400 });
    }

    const REQUIRED_CODE = process.env.INVITE_CODE;
    if (!REQUIRED_CODE || inviteCode !== REQUIRED_CODE) {
      return NextResponse.json({ message: '认证码错误' }, { status: 403 });
    }

    const exists = await findUserByUsername(username);
    if (exists) {
      return NextResponse.json({ message: '用户名已存在' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser(username, passwordHash);
    
    if (!user.id) {
      return NextResponse.json({ message: '创建用户失败' }, { status: 500 });
    }
    
    await createSession(user.id);

    return NextResponse.json({ id: user.id, username });
  } catch (e) {
    console.error('Register failed', e);
    return NextResponse.json({ message: '服务器错误' }, { status: 500 });
  }
}



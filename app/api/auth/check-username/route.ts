import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    
    if (!username) {
      return NextResponse.json({ message: '用户名不能为空' }, { status: 400 });
    }

    const user = await findUserByUsername(username);
    
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Check username failed:', error);
    return NextResponse.json({ message: '服务器错误' }, { status: 500 });
  }
}

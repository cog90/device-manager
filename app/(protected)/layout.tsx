import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LogoutButton from './logout-button';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return (
    <div className="relative">
      <LogoutButton />
      {children}
    </div>
  );
}



// src/app/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/sessionContext';

export default function RootPage() {
  const { isLoggedIn, isLoadingAuth } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (isLoggedIn) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isLoggedIn, isLoadingAuth, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50">
      <p className="text-lg text-zinc-700 animate-pulse">Lade Anwendung...</p>
    </div>
  );
}
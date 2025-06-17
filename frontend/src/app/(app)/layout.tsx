// src/app/(app)/layout.tsx
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '../../context/sessionContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoggedIn, isLoadingAuth, logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoadingAuth, isLoggedIn, router]);

  if (isLoadingAuth || !isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <p className="text-lg text-zinc-700 animate-pulse">Lade...</p>
      </div>
    );
  }

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/tasks", label: "Aufgaben", icon: ClipboardIcon },
    { href: "/teams", label: "Teams", icon: UsersIcon },
  ];
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex h-dvh bg-zinc-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-200 bg-white">
        <div className="flex h-16 shrink-0 items-center border-b border-zinc-200 px-6">
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
            FocusFlow
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6 text-sm">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={label} href={href} className={`group flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
                  active ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}>
                <Icon className={`h-5 w-5 ${active ? "text-blue-600" : "text-zinc-400 group-hover:text-blue-600"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-4">
          <div className="flex items-center gap-3">
            <img src={`https://i.pravatar.cc/40?u=${user?.email}`} alt={user?.email} className="h-10 w-10 rounded-full" />
            <div>
              <p className="font-semibold">{user?.firstName || 'User'}</p>
              <p className="text-xs text-zinc-500">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="ml-auto rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors">
              <LogoutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Header - wird vom Kind-Layout (page.tsx) gerendert, damit Titel dynamisch ist */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

/* Icons */
const iconProps = { strokeWidth: 1.5, fill: "none", stroke: "currentColor" };

const HomeIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.5 1.5 0 0 1 2.122 0l8.954 8.955M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" {...iconProps} />
  </svg>
);

const ClipboardIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m-7.5-12L9 3m0 0h6M9 3v4.5M9 3l-6.75 3L9 12m6.75 3l-6.75 3L9 12m6.75-3L9 12" {...iconProps} />
  </svg>
);

const UsersIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-2.278 1.125 1.125 0 0 0 0-1.585 10.963 10.963 0 0 0-3.322-2.433 9.527 9.527 0 0 0-2.31-.337m-6.75 4.337a9.38 9.38 0 0 1 2.625-.372m-2.625.372a9.337 9.337 0 0 1-4.121-2.278 1.125 1.125 0 0 1 0-1.585 10.963 10.963 0 0 1 3.322-2.433 9.527 9.527 0 0 1 2.31-.337m6.75 4.337 3.322 2.433A1.125 1.125 0 0 1 18 21.75l-3.322-2.433m-7.5 0-3.322 2.433A1.125 1.125 0 0 0 6 21.75l3.322-2.433M12.75 6.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 6.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" {...iconProps} />
  </svg>
);

const LogoutIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" {...iconProps} />
  </svg>
);
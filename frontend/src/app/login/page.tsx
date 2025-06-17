// src/app/login/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/sessionContext';
import Link from 'next/link';

export default function LoginPage() {
  const { user, isLoggedIn, login, register, isLoadingAuth, authError } = useUser();
  const router = useRouter();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoadingAuth, isLoggedIn, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email: loginEmail, password: loginPassword });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== registerPasswordConfirm) {
      return;
    }
    const result = await register({
      email: registerEmail,
      password: registerPassword,
      passwordConfirm: registerPasswordConfirm,
      firstName: registerFirstName,
      lastName: registerLastName,
    });
    if (result.success) {
      alert('Registrierung erfolgreich! Du wirst nun eingeloggt.');
    }
  };

  if (isLoadingAuth || isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <p className="text-lg text-zinc-700">
          {isLoadingAuth ? "Lade Authentifizierungsstatus..." : "Weiterleitung..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md ring-1 ring-zinc-100">
        <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">
                FocusFlow
            </Link>
        </div>
        
        {authError && (
          <p className="mb-6 rounded-md bg-red-50 p-3 text-center text-sm font-medium text-red-700 ring-1 ring-red-100">
            {authError}
          </p>
        )}

        {showRegisterForm ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <h2 className="text-center text-xl font-semibold text-zinc-800">Neuen Account erstellen</h2>
            <div className="grid grid-cols-2 gap-3">
               <input type="text" value={registerFirstName} onChange={(e) => setRegisterFirstName(e.target.value)} placeholder="Vorname" className="input-field" />
               <input type="text" value={registerLastName} onChange={(e) => setRegisterLastName(e.target.value)} placeholder="Nachname" className="input-field" />
            </div>
            <input type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="E-Mail" required className="input-field" />
            <input type="password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} placeholder="Passwort" required className="input-field" />
            <input type="password" value={registerPasswordConfirm} onChange={(e) => setRegisterPasswordConfirm(e.target.value)} placeholder="Passwort bestätigen" required className="input-field" />
            
            <button type="submit" disabled={isLoadingAuth} className="btn-primary w-full">
              {isLoadingAuth ? "Registriere…" : "Registrieren"}
            </button>
            <p className="text-center text-sm text-zinc-600">
              Schon einen Account?{" "}
              <button type="button" onClick={() => setShowRegisterForm(false)} className="font-medium text-blue-600 hover:underline">
                Einloggen
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <h2 className="text-center text-xl font-semibold text-zinc-800">Willkommen zurück!</h2>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="E-Mail" required className="input-field" />
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Passwort" required className="input-field" />
            <button type="submit" disabled={isLoadingAuth} className="btn-primary w-full">
              {isLoadingAuth ? "Logge ein…" : "Login"}
            </button>
            <p className="text-center text-sm text-zinc-600">
              Noch keinen Account?{" "}
              <button type="button" onClick={() => setShowRegisterForm(true)} className="font-medium text-blue-600 hover:underline">
                Registrieren
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const input = "w-full rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";
const btn = "w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors";
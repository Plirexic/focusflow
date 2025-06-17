// src/app/(app)/teams/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getTeamsForUser,
  createTeam,
  Team,
  TeamCreationData,
  CreateTeamResponse
} from '../../../services/teamService';
import { useUser } from '../../../context/sessionContext';
import { useRouter } from 'next/navigation';

export default function TeamsPage() {
  const { user, isLoggedIn, isLoadingAuth } = useUser();
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetchTeams(user.id);
    }
  }, [isLoggedIn, user?.id]);

  const fetchTeams = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const userTeams = await getTeamsForUser(userId);
      setTeams(userTeams);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Teams.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!user?.email) {
      setError("Ersteller-E-Mail fehlt. Bitte einloggen.");
      return;
    }
    if (!newTeamName.trim()) {
      setError("Teamname darf nicht leer sein.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const payload: TeamCreationData = {
      name: newTeamName,
      description: newTeamDescription || undefined,
      creatorEmail: user.email,
    };

    try {
      const result: CreateTeamResponse = await createTeam(payload);
      setNewTeamName('');
      setNewTeamDescription('');
      if (user?.id) {
        await fetchTeams(user.id);
      }
      alert(`✅ ${result.message} (ID: ${result.teamId})`);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Erstellen des Teams.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md">
        <div>
            <h1 className="text-xl font-bold">Teams</h1>
            <p className="text-sm text-zinc-500">Teams erstellen und verwalten</p>
        </div>
      </header>
      
      <main className="flex-1 p-6 md:p-8">
        {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-center text-sm font-medium text-red-700 ring-1 ring-red-100">{error}</p>}
        
        <section className="mb-12 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Neues Team erstellen</h2>
            <div className="space-y-4">
                <input type="text" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="Teamname" disabled={isLoading} className="input-field" />
                <textarea rows={2} value={newTeamDescription} onChange={e => setNewTeamDescription(e.target.value)} placeholder="Beschreibung (optional)" disabled={isLoading} className="input-field" />
                <button onClick={handleCreateTeam} disabled={isLoading} className="btn-primary w-full">
                    {isLoading ? 'Speichern…' : 'Team erstellen'}
                </button>
            </div>
        </section>

        <section>
            <h2 className="text-lg font-semibold mb-6">Meine Teams</h2>
            {isLoading && teams.length === 0 && <p className="text-zinc-500">Lade Teams...</p>}
            {!isLoading && teams.length === 0 && <p className="text-zinc-500">Keine Teams vorhanden.</p>}
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {teams.map(team => (
                    <Link key={team.id} href={`/teams/${team.id}`} className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                        <h3 className="font-semibold text-zinc-800">{team.name}</h3>
                        <p className="text-sm text-zinc-600 mt-1 truncate">{team.description || 'Keine Beschreibung'}</p>
                        <p className="text-xs text-zinc-500 mt-4">{team.members?.length || 0} Mitglieder</p>
                    </Link>
                ))}
            </div>
        </section>
      </main>
    </>
  );
}
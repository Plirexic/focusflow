// src/app/my-teams/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTeamsForUser, Team } from '../../../services/teamService';
import { useUser } from '../../../context/sessionContext';
import { useRouter } from 'next/navigation';

export default function MyTeamsPage() {
  const { user, isLoggedIn, isLoadingAuth } = useUser();
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoadingAuth && !isLoggedIn) {
      router.push('/');
    }
  }, [isLoadingAuth, isLoggedIn, router]);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      const fetchMyTeams = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const list = await getTeamsForUser(user.id);
          setTeams(list);
        } catch (err: any) {
          setError(err.message || 'Fehler beim Laden deiner Teams.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchMyTeams();
    }
  }, [isLoggedIn, user?.id]);

  if (isLoadingAuth || (!isLoggedIn && !isLoadingAuth)) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700 font-sans">
        <p className="text-lg">Lade oder leite weiter...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Meine Teams</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {isLoading && teams.length === 0 ? (
        <p className="text-gray-700 text-lg">Lade deine Teams…</p>
      ) : teams.length === 0 ? (
        <p className="text-gray-600 text-lg">Du bist in noch keinem Team.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <li key={team.id} className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
              <Link href={`/teams/${team.id}`} className="block text-xl font-semibold text-blue-700 hover:text-blue-800 hover:underline mb-2">
                {team.name}
              </Link>
              {team.description && <p className="text-gray-600 text-sm">{team.description}</p>}
              {team.members && (
                <p className="text-gray-500 text-xs mt-3">
                  Mitglieder: {team.members.length}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
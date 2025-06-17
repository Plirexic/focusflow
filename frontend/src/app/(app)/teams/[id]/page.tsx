// src/app/(app)/teams/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getTeamById,
  addMembersToTeam,
  deleteTeam,
  updateTeam, // Wichtig: Neue Funktion importieren
  Team
} from "../../../../services/teamService";
import Link from "next/link";

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = Number(params.id);

  const [team, setTeam] = useState<Team | null>(null);
  const [emails, setEmails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Neuer State für den Bearbeitungsmodus
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", description: "" });

  const fetchTeam = async () => {
    if (!teamId) return;
    try {
      const t = await getTeamById(teamId);
      setTeam(t);
      // Fülle die Edit-Daten, wenn das Team geladen wird
      setEditData({ name: t.name, description: t.description || "" });
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [teamId]);

  const handleAddMembers = async () => {
    setError(null);
    const list = emails.split(",").map((e) => e.trim()).filter(Boolean);
    if (list.length === 0) {
      setError("Bitte mindestens eine E-Mail angeben.");
      return;
    }
    setIsLoading(true);
    try {
      await addMembersToTeam(teamId, list);
      setEmails("");
      await fetchTeam(); // Team neu laden, um neue Mitglieder anzuzeigen
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm(`Team "${team?.name}" wirklich löschen?`)) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteTeam(teamId);
      router.push("/teams");
    } catch (e: any) {
      setError(e.message);
      setIsDeleting(false);
    }
  };

  // NEUE FUNKTION: Speichert die Änderungen am Team
  const handleUpdateTeam = async () => {
    if (!editData.name.trim()) {
      setError("Der Teamname darf nicht leer sein.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await updateTeam(teamId, editData);
      setIsEditing(false); // Bearbeitungsmodus beenden
      await fetchTeam(); // Team neu laden, um Änderungen anzuzeigen
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!team) {
    return (
      <>
        <header className="sticky top-0 z-10 flex h-16 items-center border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md">
            <h1 className="text-xl font-bold">Lade Team...</h1>
        </header>
        <main className="p-6 md:p-8">
            <Link href="/teams" className="text-sm font-medium text-blue-600 hover:underline">← Zurück zu allen Teams</Link>
        </main>
      </>
    );
  }

  return (
    <>
       <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md">
        <div>
            {isEditing ? (
                <input 
                    type="text" 
                    value={editData.name} 
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="text-xl font-bold bg-transparent focus:outline-none focus:ring-0 border-0 border-b-2 border-blue-500 p-0"
                />
            ) : (
                <h1 className="text-xl font-bold truncate">{team.name}</h1>
            )}
            <p className="text-sm text-zinc-500 truncate">{team.description || "Teamdetails"}</p>
        </div>
        <div className="flex items-center gap-2">
            <Link href="/teams" className="btn-secondary">← Zurück</Link>
            <button onClick={handleDeleteTeam} disabled={isDeleting} className="btn-danger">
                {isDeleting ? "Lösche…" : "Team löschen"}
            </button>
        </div>
      </header>

      <main className="p-6 md:p-8 space-y-8">
        {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-center text-sm font-medium text-red-700 ring-1 ring-red-100">{error}</p>}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-1 space-y-6">
                {/* Bearbeitungs-Sektion für Team-Details */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Team-Details</h2>
                        {isEditing ? (
                            <div className="flex gap-2">
                                <button onClick={handleUpdateTeam} className="btn-primary" disabled={isLoading}>Speichern</button>
                                <button onClick={() => { setIsEditing(false); setEditData({ name: team.name, description: team.description || "" }); }} className="btn-secondary">Abbrechen</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="btn-secondary">Bearbeiten</button>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-600 mb-1">Teamname</label>
                                <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-600 mb-1">Beschreibung</label>
                                <textarea rows={3} value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} className="input-field" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-sm text-zinc-600"><strong>Name:</strong> {team.name}</p>
                            <p className="text-sm text-zinc-600"><strong>Beschreibung:</strong> {team.description || 'Keine Angabe'}</p>
                        </div>
                    )}
                </div>

                {/* Mitglieder-Anzeige */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Mitglieder ({team.members?.length || 0})</h2>
                    {team.members && team.members.length > 0 ? (
                    <ul className="space-y-2">
                        {team.members.map((u) => (
                        <li key={u.id} className="text-sm text-zinc-700">{u.firstName} ({u.email})</li>
                        ))}
                    </ul>
                    ) : (
                    <p className="text-sm text-zinc-500">Noch keine Mitglieder.</p>
                    )}
                </div>
            </section>

            {/* Mitglieder hinzufügen Sektion */}
            <section className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Neue Mitglieder hinzufügen</h2>
                <div className="space-y-4">
                <textarea
                    rows={3}
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    placeholder="a@example.com, b@example.com, ..."
                    disabled={isLoading || isDeleting}
                    className="input-field"
                />
                <button
                    onClick={handleAddMembers}
                    disabled={isLoading || isDeleting}
                    className="btn-primary w-full"
                >
                    {isLoading ? "Speichern…" : "Mitglieder hinzufügen"}
                </button>
                </div>
            </section>
        </div>
      </main>
    </>
  );
}
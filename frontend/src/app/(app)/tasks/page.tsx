"use client";

import { useEffect, useState } from 'react';
import {
  createTask,
  updateTask,
  deleteTask,
  Task,
  TaskCreationData,
  TaskUpdateData,
  TaskPriority,
  TaskStatus,
  getTasksForUser,
} from '../../../services/taskService';
import { getTeamsForUser, Team, UserInTeam } from '../../../services/teamService';
import { useUser } from '../../../context/sessionContext';

export default function TasksPage() {
  const { user } = useUser();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<UserInTeam[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState<TaskCreationData>({
    title: '',
    description: '',
    longDescription: '',
    dueDate: '',
    assigneeEmail: '',
    teamId: undefined,
    creatorId: user?.id || 0,
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.OPEN,
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<TaskUpdateData>({});

  const today = new Date().toISOString().split('T')[0];

  const statusStyles: Record<TaskStatus, string> = {
    OPEN: "bg-emerald-100 text-emerald-800",
    PENDING: "bg-amber-100 text-amber-800",
    IN_REVIEW: "bg-sky-100 text-sky-800",
    CLOSED: "bg-zinc-200 text-zinc-600",
  };

  // Load tasks and teams
  const fetchInitialData = async (userId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const [userTasks, teams] = await Promise.all([
        getTasksForUser(userId),
        getTeamsForUser(userId),
      ]);
      setTasks(userTasks || []);
      setUserTeams(teams || []);
    } catch (e: any) {
      setError("Fehler beim Laden der Daten: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchInitialData(user.id);
      setNewTask(prev => ({ ...prev, creatorId: user.id }));
    }
  }, [user?.id]);

  // Create handlers
  const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTeamId = Number(event.target.value);
    setNewTask(prev => ({
      ...prev,
      teamId: selectedTeamId || undefined,
      assigneeEmail: '',
    }));
    const team = userTeams.find(t => t.id === selectedTeamId);
    setSelectedTeamMembers(team?.members || []);
  };

  const handleCreate = async () => {
    if (!user?.id) {
      setError('Du musst angemeldet sein.');
      return;
    }
    // Nur Titel und Datum sind zwingend
    if (!newTask.title.trim() || !newTask.dueDate) {
      setError('Titel und Fälligkeitsdatum sind erforderlich.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Fallback: kein Team/Assignee ⇒ assign an eingeloggten User
      const assignee = newTask.assigneeEmail || user.email;
      await createTask({
        ...newTask,
        creatorId: user.id,
        assigneeEmail: assignee,
      });
      setShowCreateForm(false);
      setNewTask({ title: '', assigneeEmail: '', teamId: undefined, creatorId: user.id, status: TaskStatus.OPEN, dueDate: '', description: '', longDescription: '', priority: TaskPriority.MEDIUM });
      setSelectedTeamMembers([]);
      await fetchInitialData(user.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit handlers
  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority,
      status: task.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setError(null);
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateTask(editingId, editData);
      setEditingId(null);
      setEditData({});
      if (user?.id) await fetchInitialData(user.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Soll diese Aufgabe wirklich gelöscht werden?')) return;
    setError(null);
    try {
      await deleteTask(id);
      if (user?.id) await fetchInitialData(user.id);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold">Aufgaben</h1>
          <p className="text-sm text-zinc-500">Alle zugewiesenen Aufgaben</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateForm(v => !v)}>
          {showCreateForm ? 'Abbrechen' : 'Neue Aufgabe'}
        </button>
      </header>

      <main className="flex-1 p-6 md:p-8">
        {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-center text-sm font-medium text-red-700 ring-1 ring-red-100">{error}</p>}

        {showCreateForm && (
          <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Neue Aufgabe anlegen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newTask.title}
                onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Titel *"
                className="input-field"
              />
              <input
                type="date"
                min={today}
                value={newTask.dueDate}
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                placeholder="Fälligkeitsdatum *"
                className="input-field"
              />

              <select value={newTask.teamId || ''} onChange={handleTeamChange} className="input-field">
                <option value="">-- Team (optional) --</option>
                {userTeams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>

              <select
                value={newTask.assigneeEmail || ''}
                onChange={e => setNewTask({ ...newTask, assigneeEmail: e.target.value })}
                disabled={!newTask.teamId}
                className="input-field"
              >
                <option value="">-- Person zuweisen --</option>
                {selectedTeamMembers.map(m => (
                  <option key={m.id} value={m.email}>
                    {`${m.firstName || ''} ${m.lastName || ''} (${m.email})`}
                  </option>
                ))}
              </select>

              <textarea
                value={newTask.description}
                onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Kurzbeschreibung (optional)"
                rows={3}
                className="input-field md:col-span-2"
              />
            </div>
            <button onClick={handleCreate} disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Wird erstellt...' : 'Aufgabe erstellen'}
            </button>
          </section>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading && <p className="col-span-full text-zinc-500">Lade Aufgaben...</p>}
          {!isLoading && tasks.length === 0 && <p className="col-span-full text-zinc-500">Keine Aufgaben gefunden.</p>}

          {tasks.map(task => (
            <article key={task.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              {editingId === task.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.title || ''}
                    onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="date"
                    min={today}
                    value={editData.dueDate || ''}
                    onChange={e => setEditData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input-field"
                  />
                  <textarea
                    value={editData.description || ''}
                    onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="input-field"
                  />
                  <select
                    value={editData.status || TaskStatus.OPEN}
                    onChange={e => setEditData(prev => ({ ...prev, status: e.target.value as TaskStatus }))}
                    className="input-field"
                  >
                    {Object.values(TaskStatus).map(status => (
                      <option key={status} value={status}>
                        {status.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editData.priority || TaskPriority.MEDIUM}
                    onChange={e => setEditData(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                    className="input-field"
                  >
                    {Object.values(TaskPriority).map(priority => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-2">
                    <button onClick={saveEdit} disabled={isSubmitting} className="btn-primary">Speichern</button>
                    <button onClick={cancelEdit} className="btn-secondary">Abbrechen</button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-zinc-800">{task.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${statusStyles[task.status || TaskStatus.OPEN]}`}>
                        {(task.status || 'OPEN').replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-600">{task.description || 'Keine Beschreibung.'}</p>
                    {task.dueDate && <p className="text-xs text-zinc-500 mt-3">Fällig: {new Date(task.dueDate).toLocaleDateString('de-DE')}</p>}
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button className="btn-secondary" onClick={() => startEdit(task)}>Bearbeiten</button>
                    <button className="btn-danger" onClick={() => handleDelete(task.id)}>Löschen</button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
// src/services/taskService.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// KORREKTUR: 'export' hinzugefügt, um den Build-Fehler zu beheben.
export enum TaskPriority { LOW = "LOW", MEDIUM = "MEDIUM", HIGH = "HIGH" }
export enum TaskStatus { OPEN = "OPEN", PENDING = "PENDING", IN_REVIEW = "IN_REVIEW", CLOSED = "CLOSED" }

export interface TaskCreationData {
  title: string;
  description?: string;
  longDescription?: string;
  dueDate?: string;
  assigneeEmail?: string;
  teamId?: number;
  creatorId: number;
  priority?: TaskPriority;
  status?: TaskStatus;
  simulateNotificationFailure?: boolean;
}

export interface TaskUpdateData {
  title?: string;
  description?: string;
  longDescription?: string;
  dueDate?: string;
  assigneeEmail?: string;
  teamId?: number;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface CreateTaskResponse {
  taskId: number;
  message: string;
  warning?: string;
  error?: string;
}

// KORREKTUR: Das Task-Interface ist flach, genau wie deine API-Antwort.
// Die verschachtelten Objekte sind optional, falls die API sie doch mal liefert.
export interface Task {
  id: number;
  title: string;
  description?: string;
  longDescription?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  creator?: { id: number; email: string; }; // Optional
  assignee?: { id: number; email: string; }; // Optional
  team?: { id: number; name: string }; // Optional
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || res.statusText;
    throw new Error(`HTTP-Fehler ${res.status}: ${msg}`);
  }
  return data as T;
}

export function createTask(taskData: TaskCreationData): Promise<CreateTaskResponse> {
  return apiFetch<CreateTaskResponse>(`/api/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export function updateTask(taskId: number, data: TaskUpdateData): Promise<void> {
  return apiFetch<void>(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// DIES IST JETZT UNSERE EINZIGE FUNKTION ZUM HOLEN VON AUFGABENLISTEN
export function getTasksForUser(userId: number): Promise<Task[]> {
  return apiFetch<Task[]>(`/api/tasks/user?userId=${userId}`);
}

export function deleteTask(taskId: number): Promise<void> {
  return apiFetch<void>(`/api/tasks/${taskId}`, {
    method: 'DELETE'
  });
}
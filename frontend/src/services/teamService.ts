import { apiFetch, API_BASE_URL } from './api';

export interface TeamCreationData {
  name: string;
  description?: string;
  memberEmails?: string[];
  creatorEmail: string;
}

export interface CreateTeamResponse {
  message: string;
  teamId: number;
  error?: string;
}

export interface UserSummary {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  members?: UserSummary[];
  creator?: UserSummary;
}

export interface UserInTeam {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}



async function handleResponse<T>(res: Response): Promise<T> {
  // Fallback for any legacy direct fetch usage
  const text = await res.text();
  let body: any = null;
  if (text) {
    try { body = JSON.parse(text); } catch { body = text; }
  }
  if (!res.ok) {
    const msg = typeof body === 'string'
      ? body
      : body?.error || body?.message || `HTTP-Fehler ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

export async function getAllTeams(): Promise<Team[]> {
  return apiFetch<Team[]>(`/api/teams/all`);
}

export async function getTeamById(teamId: number): Promise<Team> {
  return apiFetch<Team>(`/api/teams?id=${teamId}`);
}

export async function getTeamsForUser(userId: number): Promise<Team[]> {
  return apiFetch<Team[]>(`/api/teams/user?userId=${userId}`);
}

export async function createTeam(teamData: TeamCreationData): Promise<CreateTeamResponse> {
  return apiFetch<CreateTeamResponse>(`/api/teams/create`, {
    method: 'POST',
    body: JSON.stringify(teamData),
  });
}

export async function addMembersToTeam(
  teamId: number,
  memberEmails: string[]
): Promise<void> {
  await apiFetch<void>(`/api/teams/${teamId}/members`, {
    method: 'POST',
    body: JSON.stringify({ memberEmails })
  });
}

export async function deleteTeam(teamId: number): Promise<void> {
  await apiFetch<void>(`/api/teams/${teamId}`, {
    method: 'DELETE'
  });
}

export async function updateTeam(
  teamId: number,
  data: { name: string; description?: string }
): Promise<Team> {
  return apiFetch<Team>(`/api/teams/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

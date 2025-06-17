const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

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
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = typeof body === 'string'
      ? body
      : body?.error || body?.message || `HTTP-Fehler ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

export async function getAllTeams(): Promise<Team[]> {
  const res = await fetch(`${API_BASE_URL}/api/teams/all`);
  return handleResponse<Team[]>(res);
}

export async function getTeamById(teamId: number): Promise<Team> {
  const res = await fetch(`${API_BASE_URL}/api/teams?id=${teamId}`);
  if (res.status === 404) {
    throw new Error(`Team mit ID ${teamId} nicht gefunden.`);
  }
  return handleResponse<Team>(res);
}

export async function getTeamsForUser(userId: number): Promise<Team[]> {
  const res = await fetch(`${API_BASE_URL}/api/teams/user?userId=${userId}`);
  return handleResponse<Team[]>(res);
}

export async function createTeam(teamData: TeamCreationData): Promise<CreateTeamResponse> {
  const url = `${API_BASE_URL}/api/teams/create`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teamData),
  });
  return handleResponse<CreateTeamResponse>(res);
}

export async function addMembersToTeam(
  teamId: number,
  memberEmails: string[]
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ memberEmails })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP-Fehler ${res.status}`);
  }
}

export async function deleteTeam(teamId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP-Fehler ${res.status}`);
  }
}

export async function updateTeam(
  teamId: number,
  data: { name: string; description?: string }
): Promise<Team> {
  const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP-Fehler ${res.status}`);
  }
  return res.json() as Promise<Team>;
}
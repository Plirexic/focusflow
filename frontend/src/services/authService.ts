const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export interface UserLoginData {
  email: string;
  password: string;
}

// Dieses Interface bildet die Struktur der Backend-Antwort ab.
// Das Backend sendet kein 'success'-Feld.
export interface AuthResponse {
  userId: number | null;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  message: string;
}

// Dieses Interface definiert den Rückgabetyp der Login/Registrierungs-Funktionen
// im UserContext, die das 'success'-Flag für die Frontend-Logik hinzufügen.
export interface LoginResult {
  success: boolean;
  message: string;
  userId: number | null;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export async function loginUser(
  credentials: UserLoginData
): Promise<AuthResponse> {
  const form = new URLSearchParams();
  form.append('email', credentials.email);
  form.append('password', credentials.password);

  const response = await fetch(`${API_BASE_URL}/api/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
    credentials: 'include',
  });

  const data: AuthResponse = await response.json();
  return data;
}

export async function fetchUserProfile(
  email: string
): Promise<UserProfile> {
  const res = await fetch(
    `${API_BASE_URL}/api/user/profile?email=${encodeURIComponent(email)}`
  );
  if (!res.ok) {
    throw new Error(`Profil konnte nicht geladen werden: ${res.status}`);
  }
  return res.json();
}
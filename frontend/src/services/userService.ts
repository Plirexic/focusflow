const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

import { AuthResponse, UserProfile } from './authService';

export interface UserRegistrationData {
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    passwordConfirm: string;
}

export async function registerUser(userData: UserRegistrationData): Promise<AuthResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                password: userData.password,
                passwordConfirm: userData.passwordConfirm,
            }),
        });

        const data: AuthResponse = await response.json();
        return data;

    } catch (error: any) {
        return { userId: null, email: null, message: error.message || 'Netzwerkfehler oder Server nicht erreichbar.' };
    }
}

export async function getUserById(userId: number): Promise<UserProfile> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user?id=${userId}`, {
            method: 'GET',
            headers: {
            },
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error(`Benutzer mit ID ${userId} nicht gefunden.`);
            const errorText = await response.text();
            throw new Error(`HTTP-Fehler! Status: ${response.status}, Nachricht: ${errorText}`);
        }
        return await response.json() as UserProfile;
    } catch (error) {
        throw error;
    }
}

export async function updateUserProfile(email: string, updatedInfo: Partial<UserProfile>): Promise<UserProfile> {
    try {
        const { id, ...dataToSend } = updatedInfo;

        const response = await fetch(`${API_BASE_URL}/api/user/profile?email=${encodeURIComponent(email)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });
        if (!response.ok) {
            try {
                const errorBody = await response.json();
                throw new Error(errorBody.message || `HTTP-Fehler! Status: ${response.status}`);
            } catch (jsonError) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP-Fehler! Status: ${response.status}`);
            }
        }
        return await response.json() as UserProfile;
    } catch (error) {
        throw error;
    }
}

export async function addUserToTeam(userId: number, teamId: number): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/teams/add?userId=${userId}&teamId=${teamId}`, {
            method: 'POST',
            headers: {
            },
        });
        const responseText = await response.text();
        if (response.ok) {
            return { success: true, message: responseText };
        } else {
            return { success: false, message: responseText || 'Fehler beim Hinzufügen zum Team.' };
        }
    } catch (error: any) {
        return { success: false, message: error.message || 'Netzwerkfehler.' };
    }
}

export async function removeUserFromTeam(userId: number, teamId: number): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/teams/delete?userId=${userId}&teamId=${teamId}`, {
            method: 'DELETE',
            headers: {
            },
        });
        const responseText = await response.text();
        if (response.ok) {
            return { success: true, message: responseText };
        } else {
            return { success: false, message: responseText || 'Fehler beim Entfernen aus Team.' };
        }
    } catch (error: any) {
        return { success: false, message: error.message || 'Netzwerkfehler.' };
    }
}
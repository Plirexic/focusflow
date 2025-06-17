"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthResponse, loginUser, UserLoginData, UserProfile, LoginResult } from '@/services/authService';
import { registerUser, UserRegistrationData } from '@/services/userService';

interface UserContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (credentials: UserLoginData) => Promise<LoginResult>;
  register: (data: UserRegistrationData) => Promise<LoginResult>;
  logout: () => void;
  isLoadingAuth: boolean;
  authError: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser: UserProfile = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          localStorage.removeItem('currentUser');
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }, [user]);

  const handleAuthResult = (response: AuthResponse, isSuccessStatus: boolean): LoginResult => {
    if (response.userId && response.email && isSuccessStatus) {
      const userProfile: UserProfile = {
        id: response.userId,
        email: response.email,
        firstName: response.firstName || undefined,
        lastName: response.lastName || undefined,
        role: response.role || undefined,
      };
      setUser(userProfile);
      setAuthError(null);
      return { ...response, success: true };
    }
    setAuthError(response.message || 'Authentifizierung fehlgeschlagen.');
    return { ...response, success: false, userId: null, email: null };
  };

  const login = useCallback(async (credentials: UserLoginData): Promise<LoginResult> => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await loginUser(credentials);
      // Hier prüfen wir den Statuscode oder das Vorhandensein der userId für den Erfolg
      const isSuccess = response.userId != null;
      return handleAuthResult(response, isSuccess);
    } catch (err: any) {
      const errorMessage = err.message || 'Netzwerkfehler oder Server nicht erreichbar.';
      setAuthError(errorMessage);
      return { userId: null, email: null, message: errorMessage, success: false };
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const register = useCallback(async (data: UserRegistrationData): Promise<LoginResult> => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const response = await registerUser(data);
      const isSuccess = response.userId != null;
      return handleAuthResult(response, isSuccess);
    } catch (err: any) {
      const errorMessage = err.message || 'Netzwerkfehler oder Server nicht erreichbar.';
      setAuthError(errorMessage);
      return { userId: null, email: null, message: errorMessage, success: false };
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    router.push('/');
  }, [router]);

  const isLoggedIn = !!user;

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, register, logout, isLoadingAuth, authError }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser muss innerhalb eines UserProvider verwendet werden.');
  }
  return context;
}
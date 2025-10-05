"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends AuthUser {
  password: string;
}

interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

interface SignInInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signUp: (input: SignUpInput) => Promise<void>;
  signIn: (input: SignInInput) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_USER_KEY = "auth_user";
const AUTH_USERS_KEY = "auth_users";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = async ({ name, email, password }: SignUpInput) => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (!name.trim() || !normalizedEmail || !password) {
      const message = "All fields are required";
      setError(message);
      throw new Error(message);
    }

    const usersRaw = localStorage.getItem(AUTH_USERS_KEY);
    const users: Record<string, StoredUser> = usersRaw ? JSON.parse(usersRaw) : {};

    if (users[normalizedEmail]) {
      const message = "An account with this email already exists";
      setError(message);
      throw new Error(message);
    }

    const newUser: StoredUser = {
      id: `u_${Math.random().toString(36).slice(2, 10)}`,
      name: name.trim(),
      email: normalizedEmail,
      password, // Demo only: do NOT store plaintext passwords in production
    };

    users[normalizedEmail] = newUser;
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));

    const authUser: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const signIn = async ({ email, password }: SignInInput) => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    const usersRaw = localStorage.getItem(AUTH_USERS_KEY);
    const users: Record<string, StoredUser> = usersRaw ? JSON.parse(usersRaw) : {};
    const existing = users[normalizedEmail];

    if (!existing || existing.password !== password) {
      const message = "Invalid email or password";
      setError(message);
      throw new Error(message);
    }

    const authUser: AuthUser = { id: existing.id, name: existing.name, email: existing.email };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const signOut = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, error, signUp, signIn, signOut }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

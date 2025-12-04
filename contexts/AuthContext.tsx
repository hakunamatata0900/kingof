"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'admin' | 'staff' | 'visitor';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  register: (username: string, email: string, password: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredUser extends User {
  password: string;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<StoredUser[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date(),
    },
    {
      id: '2',
      username: 'staff',
      email: 'staff@gmail.com',
      password: 'staff123',
      role: 'staff',
      createdAt: new Date(),
    },
    {
      id: '3',
      username: 'visitor',
      email: 'visitor@gmail.com',
      password: 'visitor123',
      role: 'visitor',
      createdAt: new Date(),
    },
  ]);

  const [resetTokens, setResetTokens] = useState<Map<string, { email: string; expiresAt: Date }>>(
    new Map()
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user');
      }
    }
  }, []);

  const register = async (
    username: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<void> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (users.some((u) => u.email === email)) {
      setIsLoading(false);
      throw new Error('Email already registered');
    }

    if (users.some((u) => u.username === username)) {
      setIsLoading(false);
      throw new Error('Username already taken');
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      role,
      createdAt: new Date(),
    };

    setUsers((prev) => [...prev, newUser]);

    const userToStore = { ...newUser };
    delete (userToStore as Partial<StoredUser>).password;
    setUser(userToStore as User);
    localStorage.setItem('currentUser', JSON.stringify(userToStore));

    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = users.find((u) => u.email === email && u.password === password);

    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Invalid email or password');
    }

    const userToStore: User = {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.role,
      createdAt: foundUser.createdAt,
    };

    setUser(userToStore);
    localStorage.setItem('currentUser', JSON.stringify(userToStore));

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = users.find((u) => u.email === email);

    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Email not found');
    }

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    setResetTokens((prev) => new Map(prev).set(token, { email, expiresAt }));

    console.log(`Password reset link (frontend only): token=${token}`);

    setIsLoading(false);
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const resetData = resetTokens.get(token);

    if (!resetData) {
      setIsLoading(false);
      throw new Error('Invalid or expired reset token');
    }

    if (new Date() > resetData.expiresAt) {
      setResetTokens((prev) => {
        const newMap = new Map(prev);
        newMap.delete(token);
        return newMap;
      });
      setIsLoading(false);
      throw new Error('Reset token has expired');
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.email === resetData.email
          ? { ...u, password: newPassword }
          : u
      )
    );

    setResetTokens((prev) => {
      const newMap = new Map(prev);
      newMap.delete(token);
      return newMap;
    });

    setIsLoading(false);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    register,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

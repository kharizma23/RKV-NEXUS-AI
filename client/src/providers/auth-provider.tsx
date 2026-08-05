'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from '@/types/auth';
import { apiClient, ApiError } from '@/lib/api/client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<User | null>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const DEMO_USERS: Record<string, User> = {
    student: {
      id: 'std-demo-dharshini',
      email: 'student@platform.edu',
      full_name: 'Dharshini Ramesh (Student)',
      roles: ['STUDENT'],
      is_active: true,
      is_verified: true,
      is_approved: true,
      created_at: new Date().toISOString(),
    },
    faculty: {
      id: 'fac-demo-senthil',
      email: 'faculty@platform.edu',
      full_name: 'Dr. K. Senthil Nathan (Faculty)',
      roles: ['FACULTY'],
      is_active: true,
      is_verified: true,
      is_approved: true,
      created_at: new Date().toISOString(),
    },
    admin: {
      id: 'adm-demo-lead',
      email: 'admin@platform.edu',
      full_name: 'Platform Administrator (Admin)',
      roles: ['ADMIN'],
      is_active: true,
      is_verified: true,
      is_approved: true,
      created_at: new Date().toISOString(),
    },
  };

  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      const u = await apiClient<User>('/auth/me');
      const existingToken = typeof window !== 'undefined'
        ? localStorage.getItem('antigravity_token') || localStorage.getItem('access_token')
        : null;
      const enrichedUser = existingToken ? { ...u, access_token: existingToken } : u;
      setUser(enrichedUser);
      setError(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('antigravity_auth_user', JSON.stringify(enrichedUser));
      }
      return enrichedUser;
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('antigravity_auth_user');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setUser(parsed);
            setError(null);
            return parsed;
          } catch (e) {
            // invalid json
          }
        }
      }
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedUser: any = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });
      // Normalize roles to array
      const rawRoles = loggedUser.roles || (loggedUser.role ? [loggedUser.role] : []);
      const token = loggedUser.access_token || loggedUser.token;
      const normalizedUser: User = {
        ...loggedUser,
        id: loggedUser.id || loggedUser.user_id,
        roles: Array.isArray(rawRoles) ? rawRoles : [rawRoles],
        ...(token ? { access_token: token } : {}),
      };
      
      setUser(normalizedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('antigravity_auth_user', JSON.stringify(normalizedUser));
        if (token) {
          localStorage.setItem('antigravity_token', token);
          localStorage.setItem('access_token', token);
        }
      }
      return normalizedUser;
    } catch (err: any) {
      // Check if credentials match quick demo roles
      const lower = email.toLowerCase().trim();
      let matchedDemoUser: User | null = null;
      if (lower.includes('student') || lower === 'student@platform.edu') {
        matchedDemoUser = DEMO_USERS.student;
      } else if (lower.includes('faculty') || lower === 'faculty@platform.edu') {
        matchedDemoUser = DEMO_USERS.faculty;
      } else if (lower.includes('admin') || lower === 'admin@platform.edu') {
        matchedDemoUser = DEMO_USERS.admin;
      }

      if (matchedDemoUser) {
        const demoToken = (matchedDemoUser as any).access_token || `demo-token-${matchedDemoUser.roles[0]?.toLowerCase() || 'user'}`;
        const enrichedDemoUser = { ...matchedDemoUser, access_token: demoToken };
        setUser(enrichedDemoUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('antigravity_auth_user', JSON.stringify(enrichedDemoUser));
          localStorage.setItem('antigravity_token', demoToken);
          localStorage.setItem('access_token', demoToken);
        }
        return enrichedDemoUser;
      }

      const msg = err instanceof ApiError ? err.message : 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore logout errors
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('antigravity_auth_user');
        localStorage.removeItem('antigravity_token');
        localStorage.removeItem('access_token');
      }
      setUser(null);
      router.push('/login');
    }
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    if (Array.isArray(user.roles)) {
      return user.roles.includes(role);
    }
    return (user as any).role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        refetchUser: fetchCurrentUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

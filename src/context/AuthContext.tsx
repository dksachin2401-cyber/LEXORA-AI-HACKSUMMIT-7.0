import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

export type UserRole = 'judge' | 'lawyer' | 'admin' | 'court_staff' | 'staff' | 'citizen';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  court: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole, email?: string, password?: string) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const mockUsers: Record<UserRole, User> = {
  judge: {
    id: 'J001',
    name: 'Hon. Justice Rajesh Sharma',
    email: 'judge@lexora.gov.in',
    role: 'judge',
    designation: 'Senior High Court Judge',
    court: 'High Court of Judicature',
  },
  lawyer: {
    id: 'L001',
    name: 'Advocate Priya Nair',
    email: 'lawyer@lexora.gov.in',
    role: 'lawyer',
    designation: 'Senior Legal Practitioner',
    court: 'Supreme Court & High Court Bar',
  },
  admin: {
    id: 'A001',
    name: 'Dr. Sunita Rao',
    email: 'admin@lexora.gov.in',
    role: 'admin',
    designation: 'Director of Judicial Informatics',
    court: 'National Judicial Data Center',
  },
  court_staff: {
    id: 'S001',
    name: 'Amit Kumar',
    email: 'staff@lexora.gov.in',
    role: 'court_staff',
    designation: 'Chief Bench Registrar',
    court: 'High Court Registry',
  },
  staff: {
    id: 'S001',
    name: 'Amit Kumar',
    email: 'staff@lexora.gov.in',
    role: 'staff',
    designation: 'Chief Bench Registrar',
    court: 'High Court Registry',
  },
  citizen: {
    id: 'C001',
    name: 'Ramesh Patel',
    email: 'citizen@lexora.gov.in',
    role: 'citizen',
    designation: 'Litigant Citizen',
    court: 'N/A',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => mockUsers.judge);

  useEffect(() => {
    api.getCurrentUser()
      .then((res) => {
        if (res.user) setUser(res.user);
      })
      .catch(() => {
        api.login({
          email: mockUsers.judge.email,
          password: 'lexora123',
          role: 'judge',
        })
          .then((res) => {
            if (res.user) setUser(res.user);
          })
          .catch(() => {
            setUser(mockUsers.judge);
          });
      });
  }, []);

  const login = async (role: UserRole, email?: string, password?: string) => {
    try {
      const res = await api.login({
        email: email || mockUsers[role]?.email || 'user@lexora.gov.in',
        password: password || 'lexora123',
        role,
      });

      if (res.user) {
        setUser(res.user);
      } else {
        setUser(mockUsers[role] || mockUsers.judge);
      }
    } catch (e) {
      console.log('Using local auth state fallback:', e);
      setUser(mockUsers[role] || mockUsers.judge);
    }
  };

  const logout = () => {
    api.logout().catch(() => {});
    setUser(null);
  };

  const setRole = (role: UserRole) => {
    login(role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        login,
        logout,
        setRole,
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

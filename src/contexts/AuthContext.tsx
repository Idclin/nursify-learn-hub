import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, StudentLevel } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: UserRole, level?: StudentLevel) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    email: 'student@nursing.edu',
    role: 'student',
    level: 100,
    fullName: 'Sarah Johnson',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'teacher@nursing.edu',
    role: 'teacher',
    fullName: 'Dr. Michael Chen',
    createdAt: new Date(),
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
    setIsLoading(false);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    level?: StudentLevel
  ) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      fullName,
      role,
      level: role === 'student' ? level : undefined,
      createdAt: new Date(),
    };
    
    setUser(newUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

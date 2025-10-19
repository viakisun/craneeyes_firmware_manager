import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored authentication on app load
    const storedAuth = localStorage.getItem('craneeyes_auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        setIsAuthenticated(true);
        setUser(authData.user);
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('craneeyes_auth');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    // Database authentication
    // In production, this would call an API
    if (email === 'crane@dy.co.kr' && password === '1234') {
      const userData: User = {
        id: '1',
        email: email,
        name: 'CraneEyes Admin',
        role: 'admin'
      };

      const authData = {
        user: userData,
        token: 'demo-token-' + Date.now()
      };

      localStorage.setItem('craneeyes_auth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setUser(userData);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = (): void => {
    localStorage.removeItem('craneeyes_auth');
    setIsAuthenticated(false);
    setUser(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

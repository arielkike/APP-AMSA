import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cliente } from '../types/models';
import { api } from '../api/client';
import { StorageService } from '../utils/storage';

interface AuthContextType {
  cliente: Cliente | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identificacion: string, expediente_num: string) => Promise<void>;
  logout: () => Promise<void>;
  biometricsEnabled: boolean;
  setBiometricsEnabled: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [biometricsEnabled, setBiometricsEnabledState] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedCliente = await StorageService.getJSON<Cliente>('cliente_data');
        const token = await StorageService.get('auth_token');
        const bio = await StorageService.get('bio_enabled');
        
        if (bio === 'true') {
          setBiometricsEnabledState(true);
        }

        if (token && storedCliente) {
          api.setToken(token);
          setCliente(storedCliente);
        }
      } catch (err) {
        console.error('Error restaurando sesión:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (identificacion: string, expediente_num: string) => {
    setIsLoading(true);
    try {
      const res = await api.loginCliente(identificacion, expediente_num);
      setCliente(res.cliente);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setCliente(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setBiometricsEnabled = async (enabled: boolean) => {
    setBiometricsEnabledState(enabled);
    await StorageService.set('bio_enabled', enabled ? 'true' : 'false');
  };

  return (
    <AuthContext.Provider
      value={{
        cliente,
        isAuthenticated: !!cliente,
        isLoading,
        login,
        logout,
        biometricsEnabled,
        setBiometricsEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

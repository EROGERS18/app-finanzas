import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, CurrencyCode } from '../types';
import { storageService, INITIAL_USERS } from '../services/storageService';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  registeredUsers: UserProfile[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoUser: (user: UserProfile) => void;
  register: (data: {
    name: string;
    email: string;
    password: string;
    birthDate?: string;
    avatarUrl?: string;
    primaryCurrency?: CurrencyCode;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => storageService.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const activeUserId = storageService.getCurrentUserId();
    const allUsers = storageService.getUsers();
    if (activeUserId) {
      return allUsers.find(u => u.id === activeUserId) || null;
    }
    return null;
  });

  useEffect(() => {
    storageService.saveUsers(registeredUsers);
  }, [registeredUsers]);

  useEffect(() => {
    storageService.setCurrentUserId(currentUser?.id || null);
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const user = registeredUsers.find(
      u => u.email.trim().toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      return { success: false, error: 'No existe una cuenta registrada con este correo electrónico.' };
    }

    if (user.password !== password) {
      return { success: false, error: 'La contraseña ingresada es incorrecta.' };
    }

    setCurrentUser(user);
    return { success: true };
  };

  const loginAsDemoUser = (user: UserProfile) => {
    setCurrentUser(user);
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    birthDate?: string;
    avatarUrl?: string;
    primaryCurrency?: CurrencyCode;
  }): Promise<{ success: boolean; error?: string }> => {
    const existing = registeredUsers.find(
      u => u.email.trim().toLowerCase() === data.email.trim().toLowerCase()
    );

    if (existing) {
      return { success: false, error: 'Ya existe una cuenta con este correo electrónico.' };
    }

    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const defaultAvatar = data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newUser: UserProfile = {
      id: newUserId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      avatarUrl: defaultAvatar,
      birthDate: data.birthDate || '',
      primaryCurrency: data.primaryCurrency || 'DOP',
      createdAt: new Date().toISOString(),
    };

    // Inicializar base de datos vacía e independiente para este usuario
    storageService.initNewUserAccount(newUserId, data.primaryCurrency || 'DOP');

    const updatedList = [...registeredUsers, newUser];
    setRegisteredUsers(updatedList);
    setCurrentUser(newUser);

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    storageService.setCurrentUserId(null);
  };

  const updateProfile = async (updatedData: Partial<UserProfile>) => {
    if (!currentUser) return;

    const updatedUser: UserProfile = {
      ...currentUser,
      ...updatedData,
    };

    setCurrentUser(updatedUser);
    setRegisteredUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No hay usuario autenticado.' };

    if (currentUser.password !== currentPassword) {
      return { success: false, error: 'La contraseña actual no coincide.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }

    await updateProfile({ password: newPassword });
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        registeredUsers,
        login,
        loginAsDemoUser,
        register,
        logout,
        updateProfile,
        changePassword,
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

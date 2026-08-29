import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, CurrencyCode } from '../types';
import { storageService, INITIAL_USERS } from '../services/storageService';

import { cloudStorageService } from '../services/cloudStorageService';

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

  // Cargar usuarios desde Supabase en la nube al montar la app
  useEffect(() => {
    const loadCloudProfiles = async () => {
      if (cloudStorageService.isReady()) {
        const cloudProfiles = await cloudStorageService.fetchProfiles();
        if (cloudProfiles && cloudProfiles.length > 0) {
          setRegisteredUsers(prev => {
            const mergedMap = new Map<string, UserProfile>();
            prev.forEach(u => mergedMap.set(u.email.toLowerCase(), u));
            cloudProfiles.forEach(u => mergedMap.set(u.email.toLowerCase(), u));
            const mergedList = Array.from(mergedMap.values());
            storageService.saveUsers(mergedList);
            return mergedList;
          });
        }
      }
    };
    loadCloudProfiles();
  }, []);

  useEffect(() => {
    storageService.saveUsers(registeredUsers);
  }, [registeredUsers]);

  useEffect(() => {
    storageService.setCurrentUserId(currentUser?.id || null);
  }, [currentUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    let user = registeredUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);

    // Si no está en memoria local, buscar en la nube
    if (!user && cloudStorageService.isReady()) {
      const cloudProfiles = await cloudStorageService.fetchProfiles();
      if (cloudProfiles) {
        setRegisteredUsers(cloudProfiles);
        storageService.saveUsers(cloudProfiles);
        user = cloudProfiles.find(u => u.email.trim().toLowerCase() === cleanEmail);
      }
    }

    if (!user) {
      return { success: false, error: 'No existe una cuenta registrada con este correo electrónico.' };
    }

    if (user.password && user.password !== password) {
      return { success: false, error: 'La contraseña ingresada es incorrecta.' };
    }

    if (!user.password) {
      user.password = password;
      updateProfile({ password });
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
    const cleanEmail = data.email.trim().toLowerCase();

    // Verificar si existe en la nube o local
    let allUsers = registeredUsers;
    if (cloudStorageService.isReady()) {
      const cloudProfiles = await cloudStorageService.fetchProfiles();
      if (cloudProfiles) {
        allUsers = cloudProfiles;
      }
    }

    const existing = allUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);

    if (existing) {
      return { success: false, error: 'Ya existe una cuenta con este correo electrónico.' };
    }

    const newUserId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const defaultAvatar = data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newUser: UserProfile = {
      id: newUserId,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password,
      avatarUrl: defaultAvatar,
      birthDate: data.birthDate || '',
      primaryCurrency: data.primaryCurrency || 'DOP',
      createdAt: new Date().toISOString(),
    };

    // Inicializar base de datos vacía e independiente para este usuario
    storageService.initNewUserAccount(newUserId, data.primaryCurrency || 'DOP');

    // Guardar en la Nube Supabase
    if (cloudStorageService.isReady()) {
      await cloudStorageService.saveProfile(newUser);
    }

    const updatedList = [...allUsers, newUser];
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

    if (cloudStorageService.isReady()) {
      await cloudStorageService.saveProfile(updatedUser);
    }
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

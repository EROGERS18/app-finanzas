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
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
}

export const getCanonicalUserId = (email: string): string => {
  if (!email) return 'usr-guest';
  const clean = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `usr_${clean}`;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState<UserProfile[]>(() => {
    const raw = storageService.getUsers();
    return raw.map(u => ({ ...u, id: getCanonicalUserId(u.email) }));
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const activeUserId = storageService.getCurrentUserId();
    const allUsers = storageService.getUsers();
    if (activeUserId) {
      const found = allUsers.find(u => getCanonicalUserId(u.email) === activeUserId || u.id === activeUserId);
      return found ? { ...found, id: getCanonicalUserId(found.email) } : null;
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
            prev.forEach(u => mergedMap.set(u.email.toLowerCase(), { ...u, id: getCanonicalUserId(u.email) }));
            cloudProfiles.forEach(u => mergedMap.set(u.email.toLowerCase(), { ...u, id: getCanonicalUserId(u.email) }));
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
    const canonicalId = getCanonicalUserId(cleanEmail);

    // 1. Consultar la Nube de Supabase para validar la existencia real de la cuenta
    if (cloudStorageService.isReady()) {
      const cloudProfiles = await cloudStorageService.fetchProfiles();
      if (cloudProfiles !== null) {
        const existsInCloud = cloudProfiles.some(u => u.email.trim().toLowerCase() === cleanEmail);
        if (!existsInCloud) {
          // La cuenta fue eliminada de Supabase. Limpiar cache local del navegador y denegar login.
          setRegisteredUsers(prev => {
            const filtered = prev.filter(u => u.email.toLowerCase() !== cleanEmail);
            storageService.saveUsers(filtered);
            return filtered;
          });
          storageService.clearUserData(canonicalId);
          return { success: false, error: 'No existe una cuenta registrada con este correo electrónico (ha sido eliminada).' };
        }

        // Sincronizar contraseña y perfil de la nube
        const mapped = cloudProfiles.map(u => ({ ...u, id: getCanonicalUserId(u.email) }));
        setRegisteredUsers(prev => {
          const mergedMap = new Map<string, UserProfile>();
          mapped.forEach(u => mergedMap.set(u.email.toLowerCase(), { ...u, id: getCanonicalUserId(u.email) }));
          const mergedList = Array.from(mergedMap.values());
          storageService.saveUsers(mergedList);
          return mergedList;
        });
      }
    }

    let user = registeredUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
    if (!user) {
      const all = storageService.getUsers();
      user = all.find(u => u.email.trim().toLowerCase() === cleanEmail);
    }

    if (!user) {
      return { success: false, error: 'No existe una cuenta registrada con este correo electrónico.' };
    }

    // Asegurar id canónico
    user = { ...user, id: canonicalId };

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
    const canonicalUser = { ...user, id: getCanonicalUserId(user.email) };
    setCurrentUser(canonicalUser);
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
    const canonicalId = getCanonicalUserId(cleanEmail);

    // Verificar si existe en la nube o local
    let allUsers = registeredUsers;
    if (cloudStorageService.isReady()) {
      const cloudProfiles = await cloudStorageService.fetchProfiles();
      if (cloudProfiles) {
        allUsers = cloudProfiles.map(u => ({ ...u, id: getCanonicalUserId(u.email) }));
      }
    }

    const existing = allUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);

    if (existing) {
      return { success: false, error: 'Ya existe una cuenta con este correo electrónico.' };
    }

    const defaultAvatar = data.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

    const newUser: UserProfile & { isJustRegistered?: boolean } = {
      id: canonicalId,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password,
      avatarUrl: defaultAvatar,
      birthDate: data.birthDate || '',
      primaryCurrency: data.primaryCurrency || 'DOP',
      createdAt: new Date().toISOString(),
      isJustRegistered: true
    };

    // Inicializar base de datos vacía e independiente para este usuario
    storageService.initNewUserAccount(canonicalId, data.primaryCurrency || 'DOP');

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

  // Escuchador de sesión OAuth de Supabase (Google Sign-In)
  useEffect(() => {
    const handleOAuthSession = async () => {
      if (!cloudStorageService.isReady()) return;
      const { supabase } = await import('../services/supabaseClient');
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user && session.user.email) {
        const cleanEmail = session.user.email.toLowerCase();
        const canonicalId = getCanonicalUserId(cleanEmail);
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || cleanEmail.split('@')[0];
        const avatarUrl = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

        const cloudProfiles = await cloudStorageService.fetchProfiles();
        const existing = cloudProfiles?.find(u => u.email.toLowerCase() === cleanEmail);

        if (!existing) {
          const googleUser: UserProfile & { isJustRegistered?: boolean } = {
            id: canonicalId,
            name,
            email: cleanEmail,
            password: '',
            avatarUrl,
            primaryCurrency: 'DOP',
            createdAt: new Date().toISOString(),
            isJustRegistered: true
          };

          storageService.initNewUserAccount(canonicalId, 'DOP');
          await cloudStorageService.saveProfile(googleUser);

          setRegisteredUsers(prev => [...prev.filter(u => u.email.toLowerCase() !== cleanEmail), googleUser]);
          setCurrentUser(googleUser);
        } else {
          const loggedUser = { ...existing, id: canonicalId, avatarUrl: avatarUrl || existing.avatarUrl };
          setCurrentUser(loggedUser);
        }
      }
    };

    handleOAuthSession();
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!cloudStorageService.isReady()) {
        return { success: false, error: 'La conexión con la nube no está configurada.' };
      }
      const { supabase } = await import('../services/supabaseClient');
      if (!supabase) {
        return { success: false, error: 'Servicio de autenticación no disponible.' };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error al iniciar sesión con Google:', err);
      return { success: false, error: err.message || 'Error al conectar con Google.' };
    }
  };

  const deleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No hay usuario autenticado.' };
    const uId = currentUser.id;
    const userEmail = currentUser.email;

    try {
      if (cloudStorageService.isReady()) {
        await cloudStorageService.deleteProfile(uId, userEmail);
        const { supabase } = await import('../services/supabaseClient');
        if (supabase) {
          await supabase.auth.signOut();
        }
      }

      setRegisteredUsers(prev => {
        const filtered = prev.filter(u => u.email.toLowerCase() !== userEmail.toLowerCase());
        storageService.saveUsers(filtered);
        return filtered;
      });

      storageService.clearUserData(uId);
      logout();
      return { success: true };
    } catch (err: any) {
      console.error('Error al eliminar la cuenta:', err);
      return { success: false, error: err.message || 'Error al eliminar la cuenta.' };
    }
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
        deleteAccount,
        loginWithGoogle,
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

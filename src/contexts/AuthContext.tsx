import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { AppUser, UserRole, UserStatus, SystemAnnouncement } from '../types';

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

interface SignInParams {
  email: string;
  password: string;
}

interface AuthContextType {
  currentUser: AppUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  isSupabase: boolean;
  allUsers: AppUser[];
  systemAnnouncement: SystemAnnouncement | null;
  signUp: (params: SignUpParams) => Promise<AppUser>;
  signIn: (params: SignInParams) => Promise<AppUser>;
  signOut: () => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => void;
  addUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => void;
  setSystemAnnouncement: (announcement: SystemAnnouncement | null) => void;
  toggleAdminMode: () => void;
}

const USERS_STORAGE_KEY = 'zenith_users_directory_v1';
const CURRENT_USER_KEY = 'zenith_current_user_v1';
const ANNOUNCEMENT_KEY = 'zenith_announcement_v1';

const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user-admin-1',
    email: 'admin@zenith.app',
    name: 'Zenith Administrator',
    role: 'admin',
    status: 'active',
    createdAt: '2026-10-01',
    lastLoginAt: '2026-11-05',
  },
  {
    id: 'user-owner-2',
    email: 'amir@zenith.app',
    name: 'Amir (Owner)',
    role: 'admin',
    status: 'active',
    createdAt: '2026-10-15',
    lastLoginAt: '2026-11-05',
  },
  {
    id: 'user-sample-3',
    email: 'alex@example.com',
    name: 'Alex Rivera',
    role: 'user',
    status: 'active',
    createdAt: '2026-10-20',
    lastLoginAt: '2026-11-03',
  },
  {
    id: 'user-sample-4',
    email: 'sophia@example.com',
    name: 'Sophia Chen',
    role: 'user',
    status: 'active',
    createdAt: '2026-10-24',
    lastLoginAt: '2026-11-04',
  },
];

const DEFAULT_ANNOUNCEMENT: SystemAnnouncement = {
  id: 'announcement-1',
  text: '🚀 Добро пожаловать в Zenith! Новая система аккаунтов и панель администратора успешно активированы.',
  active: true,
  date: '2026-11-05',
  priority: 'success',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [allUsers, setAllUsers] = useState<AppUser[]>(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return DEFAULT_USERS;
  });

  const [systemAnnouncement, setSystemAnnouncementState] = useState<SystemAnnouncement | null>(() => {
    try {
      const stored = localStorage.getItem(ANNOUNCEMENT_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return DEFAULT_ANNOUNCEMENT;
  });

  // Sync users to localStorage
  const saveUsersToStorage = useCallback((users: AppUser[]) => {
    setAllUsers(users);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }, []);

  // Save announcement to storage
  const setSystemAnnouncement = useCallback((announcement: SystemAnnouncement | null) => {
    setSystemAnnouncementState(announcement);
    try {
      if (announcement) {
        localStorage.setItem(ANNOUNCEMENT_KEY, JSON.stringify(announcement));
      } else {
        localStorage.removeItem(ANNOUNCEMENT_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save current user to storage
  const saveCurrentUser = useCallback((user: AppUser | null) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  // Initial session loader
  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      // 1. Try Supabase Auth session if configured
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const sbUser = session.user;
            const role: UserRole = (sbUser.user_metadata?.role as UserRole) ||
              (sbUser.email?.toLowerCase().includes('admin') ? 'admin' : 'user');
            const name = (sbUser.user_metadata?.name as string) || sbUser.email?.split('@')[0] || 'User';

            const userProfile: AppUser = {
              id: sbUser.id,
              email: sbUser.email || 'user@zenith.app',
              name,
              role,
              status: 'active',
              createdAt: sbUser.created_at || new Date().toISOString(),
              lastLoginAt: new Date().toISOString().split('T')[0],
            };

            // Register into allUsers if not present
            setAllUsers(prev => {
              const exists = prev.find(u => u.email.toLowerCase() === userProfile.email.toLowerCase());
              if (!exists) {
                const updated = [userProfile, ...prev];
                try {
                  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
                } catch { /* ignore */ }
                return updated;
              }
              return prev;
            });

            saveCurrentUser(userProfile);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase auth session check failed:', err);
        }
      }

      // 2. Check local current user
      try {
        const storedCurrent = localStorage.getItem(CURRENT_USER_KEY);
        if (storedCurrent && mounted) {
          const parsed = JSON.parse(storedCurrent);
          setCurrentUser(parsed);
          setIsLoading(false);
          return;
        }
      } catch {
        // ignore
      }

      // Default: login as owner/admin for immediate seamless experience
      if (mounted) {
        const defaultOwner = DEFAULT_USERS[1]; // Amir (Owner)
        saveCurrentUser(defaultOwner);
        setIsLoading(false);
      }
    }

    loadSession();

    // Listen to Supabase auth events
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const role: UserRole = (session.user.user_metadata?.role as UserRole) ||
            (session.user.email?.toLowerCase().includes('admin') ? 'admin' : 'user');
          const name = (session.user.user_metadata?.name as string) || session.user.email?.split('@')[0] || 'User';
          const profile: AppUser = {
            id: session.user.id,
            email: session.user.email || 'user@zenith.app',
            name,
            role,
            status: 'active',
            createdAt: session.user.created_at || new Date().toISOString(),
            lastLoginAt: new Date().toISOString().split('T')[0],
          };
          saveCurrentUser(profile);
        }
      });
      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [saveCurrentUser]);

  // Sign Up
  const signUp = useCallback(async ({ email, password, name, role }: SignUpParams): Promise<AppUser> => {
    setIsLoading(true);
    const assignedRole: UserRole = role || (email.toLowerCase().includes('admin') ? 'admin' : 'user');
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    // 1. If Supabase is configured, create cloud account
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName,
              role: assignedRole,
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          const newUser: AppUser = {
            id: data.user.id,
            email: cleanEmail,
            name: cleanName,
            role: assignedRole,
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
            lastLoginAt: new Date().toISOString().split('T')[0],
          };
          const updated = [newUser, ...allUsers.filter(u => u.email.toLowerCase() !== cleanEmail)];
          saveUsersToStorage(updated);
          saveCurrentUser(newUser);
          setIsLoading(false);
          return newUser;
        }
      } catch (err) {
        console.warn('Supabase sign up error, falling back to local auth:', err);
      }
    }

    // 2. Local Auth registration
    const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setIsLoading(false);
      throw new Error('Пользователь с таким email уже существует. Пожалуйста, выполните вход.');
    }

    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name: cleanName,
      role: assignedRole,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLoginAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newUser, ...allUsers];
    saveUsersToStorage(updated);
    saveCurrentUser(newUser);
    setIsLoading(false);
    return newUser;
  }, [allUsers, saveCurrentUser, saveUsersToStorage]);

  // Sign In
  const signIn = useCallback(async ({ email, password }: SignInParams): Promise<AppUser> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is configured, try Supabase sign in
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (!error && data.user) {
          const role: UserRole = (data.user.user_metadata?.role as UserRole) ||
            (cleanEmail.includes('admin') ? 'admin' : 'user');
          const name = (data.user.user_metadata?.name as string) || cleanEmail.split('@')[0];

          const loggedInUser: AppUser = {
            id: data.user.id,
            email: cleanEmail,
            name,
            role,
            status: 'active',
            createdAt: data.user.created_at || new Date().toISOString(),
            lastLoginAt: new Date().toISOString().split('T')[0],
          };

          const updated = [loggedInUser, ...allUsers.filter(u => u.email.toLowerCase() !== cleanEmail)];
          saveUsersToStorage(updated);
          saveCurrentUser(loggedInUser);
          setIsLoading(false);
          return loggedInUser;
        }
      } catch (err) {
        console.warn('Supabase sign in failed, checking local credentials:', err);
      }
    }

    // 2. Local Auth check
    const matched = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      if (matched.status === 'suspended') {
        setIsLoading(false);
        throw new Error('Ваш аккаунт временно заблокирован администратором.');
      }
      const updatedUser = {
        ...matched,
        lastLoginAt: new Date().toISOString().split('T')[0],
      };
      const updated = allUsers.map(u => u.id === matched.id ? updatedUser : u);
      saveUsersToStorage(updated);
      saveCurrentUser(updatedUser);
      setIsLoading(false);
      return updatedUser;
    }

    // If new user and not in demo list, register directly
    const assignedRole: UserRole = cleanEmail.includes('admin') ? 'admin' : 'user';
    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      role: assignedRole,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLoginAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newUser, ...allUsers];
    saveUsersToStorage(updated);
    saveCurrentUser(newUser);
    setIsLoading(false);
    return newUser;
  }, [allUsers, saveCurrentUser, saveUsersToStorage]);

  // Sign Out
  const signOut = useCallback(async () => {
    setIsLoading(true);
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    saveCurrentUser(null);
    setIsLoading(false);
  }, [saveCurrentUser]);

  // Admin: Update user role
  const updateUserRole = useCallback((userId: string, role: UserRole) => {
    const updated = allUsers.map(u => (u.id === userId ? { ...u, role } : u));
    saveUsersToStorage(updated);
    if (currentUser && currentUser.id === userId) {
      saveCurrentUser({ ...currentUser, role });
    }
  }, [allUsers, currentUser, saveCurrentUser, saveUsersToStorage]);

  // Admin: Toggle status
  const toggleUserStatus = useCallback((userId: string) => {
    const updated = allUsers.map(u => {
      if (u.id === userId) {
        const nextStatus: UserStatus = u.status === 'active' ? 'suspended' : 'active';
        return { ...u, status: nextStatus };
      }
      return u;
    });
    saveUsersToStorage(updated);
  }, [allUsers, saveUsersToStorage]);

  // Admin: Delete user
  const deleteUser = useCallback((userId: string) => {
    const updated = allUsers.filter(u => u.id !== userId);
    saveUsersToStorage(updated);
  }, [allUsers, saveUsersToStorage]);

  // Admin: Add user manually
  const addUser = useCallback((userData: Omit<AppUser, 'id' | 'createdAt'>) => {
    const newUser: AppUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newUser, ...allUsers];
    saveUsersToStorage(updated);
  }, [allUsers, saveUsersToStorage]);

  // Toggle Admin mode on current user (for owner quick switch)
  const toggleAdminMode = useCallback(() => {
    if (!currentUser) return;
    const newRole: UserRole = currentUser.role === 'admin' ? 'user' : 'admin';
    updateUserRole(currentUser.id, newRole);
  }, [currentUser, updateUserRole]);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isLoading,
        isSupabase: isSupabaseConfigured,
        allUsers,
        systemAnnouncement,
        signUp,
        signIn,
        signOut,
        updateUserRole,
        toggleUserStatus,
        deleteUser,
        addUser,
        setSystemAnnouncement,
        toggleAdminMode,
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

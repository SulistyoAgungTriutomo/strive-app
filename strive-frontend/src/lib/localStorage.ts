import { habitsApi, authApi, scheduleApi } from './apiClient';

// --- 1. INTERFACES ---

export interface Profile {
  id: string;
  email?: string;
  total_exp: number;
  current_level: number;
  longest_streak: number;
  full_name?: string;
  streak_count?: number;
  avatar_url?: string | null;
  streak_freeze_count?: number;
  onboarding_data?: any; 
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon_name?: string;
  icon?: string;
  frequency: string[];
  target_completion?: number;
  current_streak?: number;
  
  // TAMBAHAN BARU:
  reminder_time?: string | null; 
}

export interface ProgressEntry {
  id: string;
  habit_id: string;
  user_id: string;
  completion_date: string;
  exp_earned: number;
  created_at: string;
}

export interface Badge {
  id: string;
  badge_name: string;
  date_earned: string;
  label?: string;
  icon?: string;
  description?: string;
}

export interface ClassSchedule {
  id: string;
  course_name: string;
  day: string;
  start_time: string;
  end_time: string;
  location: string;
}


// --- 2. TOKEN MANAGEMENT ---
const JWT_KEY = 'strive_jwt_token';

export const saveToken = (token: string) => localStorage.setItem(JWT_KEY, token);
export const getToken = () => localStorage.getItem(JWT_KEY);
export const removeToken = () => {
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem('strive_profile');
};
export const isAuthenticated = () => !!getToken();


// --- 3. ADAPTOR API ---

// Habit Operations
export const getHabits = async (): Promise<Habit[]> => {
  try {
    const data = await habitsApi.list();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Gagal ambil habits:", e);
    return [];
  }
};

export const addHabit = async (habit: any) => {
  const payload = {
    ...habit,
    icon_name: habit.icon || habit.icon_name,
  };
  return await habitsApi.create(payload);
};

export const deleteHabit = async (id: string): Promise<boolean> => {
  try {
    await habitsApi.remove(id);
    return true;
  } catch (error) {
    console.error("Gagal menghapus habit:", error);
    throw error;
  }
};

export const updateHabit = async (id: string, updates: any) => {
  return await habitsApi.update(id, updates);
};

// Progress Operations
export const getProgress = async (): Promise<ProgressEntry[]> => {
  try {
    const data = await habitsApi.getLogs();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Gagal ambil progress:", e);
    return [];
  }
};

export const addProgress = async (habitId: string) => {
  return await habitsApi.checkIn(habitId);
};

// Profile Operations
export const getProfile = async (): Promise<Profile | null> => {
  try {
    const data = await authApi.getMe();
    return {
      id: data.id,
      full_name: data.username || data.full_name || 'Striver',
      email: data.email,
      total_exp: data.total_exp || 0,
      current_level: data.current_level || 1,
      longest_streak: data.longest_streak || 0,
      streak_count: data.longest_streak || 0,
      avatar_url: data.avatar_url, 
      streak_freeze_count: data.streak_freeze_count || 0,
      onboarding_data: data.onboarding_data || {}
    };
  } catch (e) {
    console.error("Gagal mengambil profil:", e);
    return null;
  }
};

// Schedule Operations
export const getSchedules = async (): Promise<ClassSchedule[]> => {
  try {
    const data = await scheduleApi.get();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Gagal ambil jadwal:", e);
    return [];
  }
};

// Badge Operations
export const getBadges = async (): Promise<Badge[]> => {
  try {
    const data = await habitsApi.getBadges();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Gagal ambil badges:", e);
    return [];
  }
};
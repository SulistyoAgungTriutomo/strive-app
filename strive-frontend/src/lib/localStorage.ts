import { habitsApi, authApi } from './apiClient';

// --- 1. INTERFACES (Tipe Data Diperbarui) ---
export interface Profile {
  id: string;
  email?: string;
  total_exp: number;
  current_level: number;
  longest_streak: number;
  full_name?: string;
  streak_count?: number;        // Alias untuk kompatibilitas
  avatar_url?: string | null;   // TAMBAHAN BARU
  streak_freeze_count?: number; // TAMBAHAN BARU
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
  // Properti visual (akan di-fill oleh frontend)
  label?: string;
  icon?: string;
  description?: string;
}

// --- 2. TOKEN MANAGEMENT ---
const JWT_KEY = 'strive_jwt_token';

export const saveToken = (token: string) => localStorage.setItem(JWT_KEY, token);
export const getToken = () => localStorage.getItem(JWT_KEY);
export const removeToken = () => localStorage.removeItem(JWT_KEY);
export const isAuthenticated = () => !!getToken();

// --- 3. ADAPTOR API ---

// Mengambil Habits
export const getHabits = async (): Promise<Habit[]> => {
  try {
    const data = await habitsApi.list();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Gagal ambil habits:", e);
    return [];
  }
};

// Menambah Habit
export const addHabit = async (habit: any) => {
  const payload = {
    ...habit,
    icon_name: habit.icon || habit.icon_name,
  };
  return await habitsApi.create(payload);
};

// Menghapus Habit
export const deleteHabit = async (id: string) => {
  await habitsApi.remove(id);
  return true;
};

// Update Habit
export const updateHabit = async (id: string, updates: any) => {
  return await habitsApi.update(id, updates);
};

// Check-in
export const addProgress = async (habitId: string) => {
  return await habitsApi.checkIn(habitId);
};

// Get Profile (Disesuaikan dengan Interface Baru)
export const getProfile = async (): Promise<Profile | null> => {
  try {
    const data = await authApi.getMe();
    
    return {
      id: data.id,
      full_name: data.username || data.full_name || 'Striver', // Perbaikan fallback nama
      email: data.email,
      total_exp: data.total_exp || 0,
      current_level: data.current_level || 1,
      longest_streak: data.longest_streak || 0,
      streak_count: data.longest_streak || 0,
      
      // PERBAIKAN UTAMA: Ambil dari data backend, JANGAN null
      avatar_url: data.avatar_url, 
      
      streak_freeze_count: data.streak_freeze_count || 0
    };
  } catch (e) {
    console.error("Gagal mengambil profil:", e);
    return {
        id: 'guest',
        full_name: 'Striver',
        avatar_url: null,
        current_level: 1,
        total_exp: 0,
        streak_count: 0,
        streak_freeze_count: 0,
        longest_streak: 0
    };
  }
};

export const getProgress = async (): Promise<ProgressEntry[]> => {
  try {
    const data = await habitsApi.getLogs();
    // Pastikan return array
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Gagal ambil progress:", e);
    return [];
  }
};

export const getBadges = async (): Promise<Badge[]> => {
  try {
    // Panggil endpoint /habits/badges (atau /badges jika anda buat router terpisah)
    // Di backend kode di atas saya taruh di routes/habits.ts dengan path /badges
    // Jadi URL nya: http://localhost:3000/habits/badges
    const data = await habitsApi.getBadges(); 
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Gagal ambil badges:", e);
    return [];
  }
};
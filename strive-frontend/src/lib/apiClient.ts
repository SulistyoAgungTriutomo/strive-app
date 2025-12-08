//export const API_BASE = "http://192.168.1.101:3000";
export const API_BASE = "http://10.0.2.2:3000";

async function request(path: string, opts: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem('strive_jwt_token');
  
  // 1. Siapkan Header Dasar (Auth Token)
  const headers: Record<string, string> = {
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(opts.headers as Record<string, string> || {})
  };

  // 2. LOGIKA KRUSIAL: 
  // Hanya set 'application/json' jika BODY BUKAN FormData (File).
  // Jika FormData, biarkan kosong agar browser set 'multipart/form-data' otomatis.
  if (!(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const res = await fetch(url, { ...opts, headers });
    
    if (res.status === 204) return null;
    if (res.status === 401) {
      localStorage.removeItem('strive_jwt_token');
      window.location.href = '/signin'; 
      return;
    }

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      throw new Error(data.error || data.message || `Error ${res.status}`);
    }

    return data;
  } catch (error: any) {
    console.error("API Request Failed:", error);
    throw error;
  }
}

type ApiPayload = Record<string, unknown>;

export const authApi = {
  register: (payload: ApiPayload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: ApiPayload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/auth/me"),
  updateProfile: (data: { full_name?: string; email?: string; onboarding_data?: any }) => 
    request("/auth/me", { method: "PUT", body: JSON.stringify(data) }),
  
  updatePassword: (password: string) => request("/auth/password", { method: "PUT", body: JSON.stringify({ password }) }),

  // Fungsi Upload Avatar (Menggunakan FormData)
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return request("/auth/avatar", { 
        method: "POST", 
        body: formData 
        // Perhatikan: Kita TIDAK melakukan JSON.stringify di sini
    });
  },

  getGoogleUrl: () => request("/auth/google", { method: "GET" }),
};

export const habitsApi = {
  list: () => request("/habits"),
  create: (body: ApiPayload) => request("/habits", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: ApiPayload) => request(`/habits/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: string) => request(`/habits/${id}`, { method: "DELETE" }),
  checkIn: (id: string) => request(`/habits/${id}/checkin`, { method: "POST", body: JSON.stringify({}) }),
  getLogs: () => request("/habits/logs"),
  getBadges: () => request("/habits/badges"),
};

export const scheduleApi = {
    get: () => request("/schedule"),
    create: (schedules: any[]) => request("/schedule", { method: "POST", body: JSON.stringify({ schedules }) }),
    delete: (id: string) => request(`/schedule/${id}`, { method: "DELETE" }),
};

export const aiApi =  {
  getWeeklyReview: () => request("/ai/weekly-review", {method: "GET"}),
};
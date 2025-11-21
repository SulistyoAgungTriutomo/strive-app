// FILE INI DINONAKTIFKAN KARENA KITA SUDAH PAKAI BACKEND NODE.JS
// Kita export objek dummy agar file lain yang masih mengimport ini tidak error.

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => {},
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        order: () => ({ data: [], error: null }),
      }),
      order: () => ({ data: [], error: null }),
    }),
    insert: async () => ({ error: null }),
    update: async () => ({ error: null }),
    delete: async () => ({ error: null }),
  }),
  storage: {
    from: () => ({
      upload: async () => ({ error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "" } })
    })
  }
} as any;
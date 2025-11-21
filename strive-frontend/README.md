# 🚀 Strive Frontend (Strive-for-Awesome)

Frontend dari aplikasi **Strive** — sebuah habit tracker yang membantu pengguna membangun kebiasaan positif dan memantau progresnya setiap hari. Dibangun menggunakan **React (Vite)** dan **Supabase** untuk autentikasi dan penyimpanan data.

---

## 📦 Tech Stack

| Layer                | Tools/Tech                |
| -------------------- | ------------------------- |
| Framework            | React (Vite)              |
| Styling              | TailwindCSS               |
| Auth & DB            | Supabase                  |
| State Management     | React Hooks / Context API |
| Deployment (planned) | Vercel / Netlify          |

---

## 🔧 Project Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/SulistyoAgungTriutomo/strive-for-awesome.git
cd strive-for-awesome
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Buat file `.env`

Salin dari `.env.example` atau buat baru:

```env
VITE_SUPABASE_URL=https://lsdpwrglbomnorndcfbc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...<anon-key>...
VITE_API_BASE_URL=http://localhost:4000
```

> **Catatan:**
>
> * URL dan ANON key diambil dari Supabase project yang aktif.
> * Pastikan backend berjalan di port 4000 agar dapat menerima request.

---

## 🔐 Integrasi Supabase Auth

1. Supabase digunakan untuk **login / register / session handling**.
2. Setelah login, Supabase memberikan `access_token`.
3. Token ini dikirim ke backend melalui header HTTP:

   ```js
   Authorization: Bearer <ACCESS_TOKEN>
   ```
4. Backend akan memverifikasi token menggunakan Supabase Admin SDK.

Contoh pengiriman request:

```js
const { data, error } = await supabase.auth.signInWithPassword({
  email, password,
});

if (data?.session) {
  const token = data.session.access_token;
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/habits`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
```

---

## 🔄 Jalankan Project

```bash
npm run dev
```

Kemudian buka di browser:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🔍 Struktur Folder

```
strive-for-awesome/
│
├── public/                # aset publik
├── src/
│   ├── components/        # komponen UI
│   ├── pages/             # halaman utama (Login, Dashboard, Habits)
│   ├── supabase/          # konfigurasi bawaan Loveable Supabase
│   ├── App.jsx            # root component
│   └── main.jsx           # entry point Vite
│
├── .env.example
├── package.json
└── README.md
```

---

## 🧠 Integrasi Backend

* Semua request data habit / progres dikirim ke backend (`http://localhost:4000`).
* Pastikan backend sudah jalan dan Supabase terhubung.

| Method   | Endpoint      | Deskripsi              |
| -------- | ------------- | ---------------------- |
| `GET`    | `/habits`     | Ambil semua habit user |
| `POST`   | `/habits`     | Tambah habit baru      |
| `PUT`    | `/habits/:id` | Update habit           |
| `DELETE` | `/habits/:id` | Hapus habit            |

---

## 📊 Progress Development

### 16–17 Oktober 2025

* Setup awal Supabase dan Vite React.
* Integrasi backend ke Supabase PostgreSQL berhasil.
* Menghubungkan environment Supabase di backend.

### 18 Oktober 2025 (Target Berikutnya)

* Update `.env` frontend dengan Supabase baru.
* Pastikan login Supabase frontend terhubung ke backend (token dikirim via header Authorization).
* Uji koneksi frontend–backend secara lokal.

---

## 👨‍💻 Author

**Sulistyo Agung Triutomo**
📍 Binus University
💼 Project: Strive – Habit Tracking Application

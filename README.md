# 🚀 Strive - Gamified Habit Tracker & Student Planner

**Strive** is a full-stack productivity application designed to help users, especially students, build consistency through gamification. It combines habit tracking with class scheduling, ensuring a balanced lifestyle without conflicts.

Features a robust gamification system (EXP, Streaks, Badges), smart notifications, and cross-platform support (Web & Android).

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Key Features

### 🎮 Gamification Engine
- **EXP & Leveling**: Gain EXP for every check-in and level up your character.
- **Visual Streaks**: Maintain daily streaks to keep the momentum going.
- **Badges System**: Unlock achievements like "First Step", "Week Warrior", and "Month Master".
- **Level Up Animations**: Satisfying confetti effects when reaching a new level.

### 📅 Smart Scheduling
- **Habit Management**: Create, update, and delete daily habits with custom icons and frequencies.
- **Class Schedule Integration**: Input your weekly university/school schedule.
- **Conflict Detection**: The system prevents you from scheduling habits during class hours.
- **Activity Heatmap**: Visualize your productivity history with a GitHub-style heatmap.

### 🔔 Notifications & Reminders
- **Smart Habits Reminders**: Get notified H-1 hour before, and every 15 minutes until the habit time.
- **Class Reminders**: Never miss a class with automated alerts.
- **Daily Streak Reminders**: H-1 day notifications for daily habits to save your streak.

### 👤 User & Security
- **Flexible Authentication**: Sign in via **Email/Password** or **Google OAuth**.
- **Profile Management**: Update profile details and upload custom avatars (powered by Supabase Storage).
- **Secure**: JWT-based authentication with Row Level Security (RLS) on the database.

## 🛠️ Tech Stack

### Frontend (Web & Mobile)
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Mobile Runtime**: Capacitor (Android)
- **State Management**: TanStack Query (React Query)
- **Notifications**: `@capacitor/local-notifications`

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **File Handling**: Multer (for Avatar Uploads)

### Database & Cloud
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (Public Bucket 'avatars')
- **Auth**: Supabase Auth (Google & Email)

## 📂 Project Structure

This project is organized as a **Monorepo**:

```bash
strive-app/
├── strive-frontend/   # React application (Vite + Capacitor)
└── strive-backend/    # Node.js Express API
🚀 Getting Started
Prerequisites
Node.js & npm installed

Android Studio (for mobile development)

A Supabase project created

1. Setup Backend
Bash

cd strive-backend
npm install

# Create .env file
# SUPABASE_URL=...
# SUPABASE_KEY=... (Anon Key)
# SUPABASE_SERVICE_ROLE_KEY=... (Service Role Key for Admin tasks)
# PORT=3000

npm run dev
2. Setup Frontend (Web)
Bash

cd ../strive-frontend
npm install

# Create .env file (if needed for local config)
# Check src/lib/apiClient.ts to configure API Base URL

npm run dev
3. Setup Mobile (Android)
Make sure the backend is running on your local network (e.g., 0.0.0.0).

Bash

cd strive-frontend

# 1. Configure IP Address in src/lib/apiClient.ts
# Change API_BASE to "[http://10.0.2.2:3000](http://10.0.2.2:3000)" (Emulator) or your LAN IP (Real Device)

# 2. Build & Sync
npm run build
npx cap sync

# 3. Open Android Studio
npx cap open android
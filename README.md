# 🚀 Strive - Gamified Habit Tracker

**Strive** is a full-stack habit tracking application designed to help users build consistency through gamification. It combines a modern frontend with a robust backend to track daily habits, calculate streaks, award experience points (EXP), and visualize progress through activity heatmaps.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Key Features

- **🔐 Secure Authentication**: User sign-up and login with JWT, including automatic profile creation.
- **📝 Habit Management**: Create, update, and delete daily habits with custom icons and frequencies.
- **🎮 Gamification Engine**:
  - **EXP & Leveling**: Gain +10 EXP for every check-in and level up.
  - **Streaks**: Maintain daily streaks to keep the momentum going.
  - **Badges**: Unlock achievements like "First Step", "Week Warrior", and "Month Master".
- **📊 Analytics Dashboard**: Visualize productivity with a GitHub-style **Activity Heatmap** and monthly calendar.
- **👤 User Profile**: Update profile details and upload custom avatars (powered by Supabase Storage).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **File Handling**: Multer (for Avatar Uploads)

### Database & Cloud
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (Public Bucket 'avatars')
- **Authentication**: Supabase Auth & Custom JWT Middleware

## 📂 Project Structure

This project is organized as a **Monorepo**:

```bash
strive-app/
├── strive-frontend/   # React application (Vite)
└── strive-backend/    # Node.js Express API


# 🚀 Strive - Gamified Habit Tracker

**Strive** is a full-stack habit tracking application designed to help users build consistency through gamification. It combines a modern frontend with a robust backend to track daily habits, calculate streaks, award experience points (EXP), and visualize progress through activity heatmaps.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Key Features

- **🔐 Secure Authentication**: User sign-up and login with JWT, including automatic profile creation.
- **📝 Habit Management**: Create, update, and delete daily habits with custom icons and frequencies.
- **🎮 Gamification Engine**:
  - **EXP & Leveling**: Gain +10 EXP for every check-in and level up.
  - **Streaks**: Maintain daily streaks to keep the momentum going.
  - **Badges**: Unlock achievements like "First Step", "Week Warrior", and "Month Master".
- **📊 Analytics Dashboard**: Visualize productivity with a GitHub-style **Activity Heatmap** and monthly calendar.
- **👤 User Profile**: Update profile details and upload custom avatars (powered by Supabase Storage).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **File Handling**: Multer (for Avatar Uploads)

### Database & Cloud
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (Public Bucket 'avatars')
- **Authentication**: Supabase Auth & Custom JWT Middleware

## 📂 Project Structure

This project is organized as a **Monorepo**:

```bash
strive-app/
├── strive-frontend/   # React application (Vite)
└── strive-backend/    # Node.js Express API
🚀 Getting Started
Prerequisites
Node.js installed

A Supabase project created (with tables: profiles, habits, progress, user_badges)

1. Clone the Repository
Bash

git clone [https://github.com/SulistyoAgungTriutomo/strive-app.git](https://github.com/SulistyoAgungTriutomo/strive-app.git)
cd strive-app
2. Setup Backend
Bash

cd strive-backend
npm install
# Create .env file with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm run dev
3. Setup Frontend
Bash

cd ../strive-frontend
npm install
npm run dev

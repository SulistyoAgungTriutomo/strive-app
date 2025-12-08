# ⚡ Strive - AI-Powered Habit & Productivity Tracker

**Strive** is a gamified productivity application designed to help users build positive habits with the guidance of an intelligent **AI Coach**. Unlike standard trackers, Strive proactively prevents schedule conflicts with academic commitments and provides personalized, empathetic weekly analysis.

## 🚀 Key Features

### 🧠 Smart AI Coach (Powered by Gemini 2.0)
- **Personalized Onboarding:** The AI understands the user's specific goals (e.g., Academic Success, Health) and struggles (e.g., Procrastination) right from the start.
- **Weekly Review:** Generates automated weekly summaries with energetic feedback, specific actionable tips, and motivation tailored to the user's persona.

### 🎮 Gamification System
- **Leveling & EXP:** Users earn Experience Points (EXP) for every habit checked in.
- **Streak System:** Tracks consistency with "Longest Streak" metrics to keep users motivated.
- **Badges & Achievements:** Unlockable milestones (e.g., "Week Warrior", "Champion") that appear in the statistics tab.
- **Visual Rewards:** Confetti effects upon leveling up and detailed Activity Heatmaps.

### 📅 Smart Scheduling & Conflict Detection
- **Class Schedule Integration:** Users can input their weekly academic/work schedule.
- **Anti-Conflict Logic:** The backend automatically rejects new habits if they overlap with existing class schedules, ensuring realistic planning.
- **Dynamic Calendar:** A unified view showing Class Schedules, To-Do Habits, and Completed tasks for any selected date.

### 📱 Mobile Optimized
- Built with **Capacitor** for a native Android experience.
- Features **Adaptive Icons** and responsive design for various screen sizes.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + Vite (TypeScript)
- **UI Components:** shadcn/ui, Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **Icons:** Lucide React
- **Mobile Build:** Capacitor (Android)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (TypeScript)
- **AI Integration:** Google Generative AI SDK (Gemini 2.0 Flash)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Clone Repository
```bash
git clone [https://github.com/yourusername/strive-app.git](https://github.com/yourusername/strive-app.git)
cd strive-app
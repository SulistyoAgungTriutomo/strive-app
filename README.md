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

2. Setup Backend
Navigate to the backend folder, install dependencies, and configure environment variables.

Bash

cd strive-backend
npm install
Create a .env file in strive-backend/ and add:

Ini, TOML

PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
Run the server:

Bash

npm run dev
3. Setup Frontend
Open a new terminal, navigate to the frontend folder.

Bash

cd strive-frontend
npm install
Create a .env file in strive-frontend/:

Ini, TOML

VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Run the frontend:

Bash

npm run dev
📱 Mobile Build (Android)
To run the application on an Android Emulator or physical device:

Ensure Android Studio is installed.

Build the React project:

Bash

cd strive-frontend
npm run build
Sync with Capacitor:

Bash

npx cap sync
Open in Android Studio:

Bash

npx cap open android
Click the Run (Play) button in Android Studio.

🗄️ Database Schema (Supabase)
The application utilizes the following tables in PostgreSQL:

profiles: Stores user data (level, exp, streak, onboarding_data).

habits: Stores habit details (name, frequency, time, icon).

progress: Logs daily habit completions and EXP earned.

class_schedules: Stores academic schedules for conflict detection.

badges: Tracks unlocked user achievements.
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HabitSelection from "./pages/HabitSelection";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import AddHabit from "./pages/AddHabit";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthCallback from "./pages/authCallback"; // Pastikan nama file sesuai (kapitalisasi)
import { LocalNotifications } from "@capacitor/local-notifications";
import ClassSchedule from "./pages/ScheduleClass";

const queryClient = new QueryClient();

const App = () => {
  // --- LANGKAH 5: INISIALISASI NOTIFIKASI ---
  useEffect(() => {
    const initNotifications = async () => {
      try {
        // 1. Minta Izin Notifikasi saat aplikasi dibuka
        const permission = await LocalNotifications.requestPermissions();
        
        if (permission.display === 'granted') {
          // 2. Buat Channel (Penting untuk Android 8+)
          // Tanpa ini, notifikasi mungkin tidak bunyi atau tidak muncul
          await LocalNotifications.createChannel({
              id: 'default',
              name: 'Habit Reminders',
              description: 'Reminders for your daily habits',
              importance: 5, // High importance (muncul pop-up)
              visibility: 1, // Visible on lock screen
              vibration: true,
              sound: 'beep.wav', // Opsional: suara custom jika ada
          });
          console.log("Notification channel created");
        }
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };
    
    initNotifications();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/habit-selection" element={<ProtectedRoute><HabitSelection /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/add-habit" element={<ProtectedRoute><AddHabit /></ProtectedRoute>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/schedule-input" element={<ProtectedRoute><ClassSchedule /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Plus, Flame, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";

// IMPOR PENTING: Menggunakan adaptor 
import { getHabits, getProfile, addProgress, deleteHabit } from "@/lib/localStorage";

// Definisi tipe untuk data yang kita gunakan
interface Habit {
  id: string;
  name: string;
  icon_name: string;
  frequency: string[];
  current_streak: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // 1. Fetch Profile
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  // 2. Fetch Habits
  const { data: allHabits = [], isLoading: loadingHabits } = useQuery({
    queryKey: ['habits'],
    queryFn: getHabits,
  });

  // Filter habits untuk hari ini
  const habits = Array.isArray(allHabits) 
    ? allHabits.filter((habit: Habit) => habit.frequency && habit.frequency.includes(today))
    : [];

  // 3. Check-in Mutation (PERBAIKAN TIPE DATA DI SINI)
  const toggleHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      return await addProgress(habitId); 
    },
    // Ganti 'any' dengan tipe objek yang memiliki message optional
    onSuccess: (data: { message?: string, leveled_up?: boolean, new_level?: number } | null) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      // LOGIKA CONFETTI
      if (data?.leveled_up) {
        // 1. Tampilkan Toast Spesial
        toast.success(`LEVEL UP! You reached Level ${data.new_level}! 🎉`, {
            duration: 5000,
            style: { border: '2px solid #FFD700', fontWeight: 'bold' }
        });

        // 2. Ledakkan Confetti!
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          // Tembak dari kiri dan kanan
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

      } else {
        // Toast biasa jika tidak naik level
        toast.success(data?.message || "Habit checked in! +10 EXP");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to check in");
    },
  });

  // 4. Handle Delete
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      return await deleteHabit(habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success("Habit deleted");
      setHabitToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete habit");
    },
  });

  const handleCheckIn = (habitId: string) => {
    toggleHabitMutation.mutate(habitId);
  };

  const handleDelete = () => {
    if (habitToDelete) {
      deleteHabitMutation.mutate(habitToDelete);
    }
  };

  const completedCount = 0; 
  const totalCount = habits.length;
  
  if (loadingProfile || loadingHabits) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Hello, {profile?.full_name || 'Striver'}!</h1>
              <div className="flex items-center gap-2 mt-1">
                <Flame className="h-5 w-5 text-streak" strokeWidth={1.5} />
                <span className="text-lg font-semibold">{profile?.longest_streak || 0} day streak</span>
              </div>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full text-primary font-bold text-sm">
              Lvl {profile?.current_level || 1}
            </div>
          </div>
          
          {/* EXP Bar */}
          <div className="bg-card rounded-2xl p-6 shadow-md space-y-3">
            <h3 className="font-semibold text-lg">Total Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total EXP</span>
                <span className="font-medium text-primary">{profile?.total_exp || 0} EXP</span>
              </div>
              <Progress value={(profile?.total_exp || 0) % 100} className="h-2" />
            </div>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habits.length === 0 ? (
            <div className="bg-card rounded-2xl p-8 text-center shadow-md">
              <p className="text-muted-foreground mb-4">No habits scheduled for {today}</p>
              <Button onClick={() => navigate("/add-habit")}>
                <Plus className="mr-2 h-4 w-4" /> Add Habit
              </Button>
            </div>
          ) : (
            habits.map((habit: Habit) => (
              <div key={habit.id} className="bg-card rounded-2xl p-4 shadow-md flex items-center justify-between transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-4xl">{habit.icon_name || "📝"}</div>
                  <div>
                    <h4 className="font-semibold">{habit.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {habit.current_streak || 0} day streak
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleCheckIn(habit.id)} 
                    disabled={toggleHabitMutation.isPending}
                    className={`
                      w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary/10 transition-all
                      ${toggleHabitMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setHabitToDelete(habit.id)} className="text-destructive">Delete Habit</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* FAB */}
        <Button onClick={() => navigate("/add-habit")} size="icon" className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
      <BottomNav />

      <AlertDialog open={!!habitToDelete} onOpenChange={() => setHabitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
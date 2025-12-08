import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Plus, Flame, MoreVertical, CalendarDays } from "lucide-react";
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

// IMPOR ADAPTOR
import { getHabits, getProfile, addProgress, deleteHabit, Habit } from "@/lib/localStorage";

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

  // Filter habit hari ini
  const habits = Array.isArray(allHabits) 
    ? allHabits.filter((habit: Habit) => habit.frequency && habit.frequency.includes(today))
    : [];

  // 3. Check-in Mutation
  const toggleHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      return await addProgress(habitId); 
    },
    onSuccess: (data: { message?: string, leveled_up?: boolean, new_level?: number } | null) => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      if (data?.leveled_up) {
        toast.success(`LEVEL UP! You reached Level ${data.new_level}! 🎉`, {
            duration: 5000,
            style: { border: '2px solid #FFD700', fontWeight: 'bold' }
        });
        confetti();
      } else {
        toast.success("Habit checked in! +10 EXP");
      }
    },
    onError: (error: Error) => {
      toast.error("Failed to check in");
    },
  });

  // 4. Delete Mutation
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

  const handleDeleteConfirm = () => {
    if (habitToDelete) {
      deleteHabitMutation.mutate(habitToDelete);
    }
  };

  // Progress Stats
  const completedCount = habits.filter(h => h.current_streak > 0).length; // Simplified logic
  const totalCount = habits.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loadingProfile || loadingHabits) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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

          {/* Progress Card */}
          <div className="bg-card rounded-2xl p-6 shadow-md space-y-3">
            <h3 className="font-semibold text-lg">Today's Progress</h3>
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>{completedCount} / {totalCount} completed</span>
                    <span className="font-medium text-primary">{profile?.total_exp || 0} EXP</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </div>

        {/* --- TOMBOL MANAGE SCHEDULE (DIKEMBALIKAN) --- */}
        <Button 
            variant="outline" 
            className="w-full border-dashed border-2 text-muted-foreground hover:text-primary hover:border-primary"
            onClick={() => navigate("/schedule-input")}
        >
            <CalendarDays className="mr-2 h-4 w-4" /> Manage Class Schedule
        </Button>
        {/* --------------------------------------------- */}

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
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${toggleHabitMutation.isPending ? 'opacity-50' : 'hover:border-primary'}`}
                  >
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" strokeWidth={1.5} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setHabitToDelete(habit.id)} className="text-destructive cursor-pointer">
                        Delete Habit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FAB */}
        <Button onClick={() => navigate("/add-habit")} size="icon" className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" strokeWidth={1.5} />
        </Button>
      </div>

      <BottomNav />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!habitToDelete} onOpenChange={() => setHabitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
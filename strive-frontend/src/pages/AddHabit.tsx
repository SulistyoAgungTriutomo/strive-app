import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHabit } from "@/lib/localStorage";
import { scheduleHabitReminder } from "@/lib/notifications";

const HABIT_ICONS = ["📚", "💪", "🧘", "💧", "🎓", "🙏", "🎯", "✍️", "🏃", "🎨", "🎵", "🌱"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AddHabit = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [habitName, setHabitName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState("");

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const createHabitMutation = useMutation({
    mutationFn: async (habitData: { name: string; icon_name: string; frequency: string[]; reminder_time: string | null }) => {
      const newHabit = await addHabit(habitData);
      if (habitData.reminder_time && newHabit?.id) {
          try {
            await scheduleHabitReminder(newHabit.id, habitData.name, habitData.reminder_time, habitData.frequency);
          } catch (err) { console.error(err); }
      }
      return newHabit;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success("Habit created!");
      navigate("/dashboard");
    },
    onError: (error: any) => { // Tangkap error dari backend
        console.error("Error Create:", error);
        // Tampilkan pesan error spesifik (misal konflik jadwal)
        toast.error(error.message || "Failed to create habit"); 
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return toast.error("Please enter a habit name");
    if (selectedDays.length === 0) return toast.error("Please select at least one day");

    createHabitMutation.mutate({
      name: habitName.trim(),
      icon_name: selectedIcon,
      frequency: selectedDays,
      reminder_time: reminderTime || null,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 relative z-10">
          {/* TOMBOL BACK YANG DIPERBAIKI */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")} // Pastikan ini mengarah ke /dashboard
            className="hover:bg-muted/50 -ml-2"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </Button>
          <h1 className="text-2xl font-bold">Add New Habit</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="habitName">Habit Name</Label>
            <Input
              id="habitName"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              disabled={createHabitMutation.isPending}
            />
          </div>

          <div className="space-y-3">
            <Label>Choose an Icon</Label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-4xl transition-all ${selectedIcon === icon ? 'bg-primary text-primary-foreground ring-2 ring-primary' : 'bg-card hover:bg-muted'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Frequency (Select Days)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`py-3 px-4 rounded-xl font-medium text-sm transition-all ${selectedDays.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted'}`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderTime">Reminder Time (Optional)</Label>
            <Input
              id="reminderTime"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              disabled={createHabitMutation.isPending}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={createHabitMutation.isPending}>
            {createHabitMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Habit"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddHabit;
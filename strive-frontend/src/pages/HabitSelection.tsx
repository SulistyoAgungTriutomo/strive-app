import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// IMPOR DARI ADAPTOR
import { addHabit } from "@/lib/localStorage";

const SUGGESTED_HABITS = [
  { name: "Read a Book", icon: "📚", frequency: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
  { name: "Workout", icon: "💪", frequency: ["Monday", "Wednesday", "Friday"] },
  { name: "Meditate", icon: "🧘", frequency: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
  { name: "Drink Water", icon: "💧", frequency: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
];

const HabitSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);

  const createHabitsMutation = useMutation({
    mutationFn: async (habitNames: string[]) => {
      // Loop untuk membuat multiple habits
      for (const habitName of habitNames) {
        const habit = SUGGESTED_HABITS.find(h => h.name === habitName);
        if (habit) {
          await addHabit({
            name: habit.name,
            icon_name: habit.icon,
            frequency: habit.frequency,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success("Habits created successfully!");
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Failed to create habits");
    },
  });

  const toggleHabit = (habitName: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitName) 
        ? prev.filter(h => h !== habitName)
        : [...prev, habitName]
    );
  };

  const handleFinish = () => {
    if (selectedHabits.length === 0) {
      toast.error("Please select at least one habit");
      return;
    }
    createHabitsMutation.mutate(selectedHabits);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            What do you want to Strive for?
          </h1>
          <p className="text-muted-foreground">Select habits to start</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SUGGESTED_HABITS.map((habit) => {
            const isSelected = selectedHabits.includes(habit.name);
            return (
              <button
                key={habit.name}
                onClick={() => toggleHabit(habit.name)}
                className={`relative bg-card rounded-2xl p-6 transition-all duration-200 ${isSelected ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:shadow-md'}`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary rounded-full p-1">
                    <Check className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
                  </div>
                )}
                <div className="text-5xl mb-3">{habit.icon}</div>
                <p className="font-medium text-sm text-foreground">{habit.name}</p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleFinish}
            disabled={createHabitsMutation.isPending || selectedHabits.length === 0}
            size="lg"
            className="min-w-[200px]"
          >
            {createHabitsMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : `Finish (${selectedHabits.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HabitSelection;
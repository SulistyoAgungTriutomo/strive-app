import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Trophy, Flame, Target, Sparkles, Bot, Loader2, BookOpen, MapPin, Clock, CheckCircle2, Circle, MoreHorizontal, Trash2, Zap, BarChart3 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, getHabits, getProgress, getSchedules, getBadges, deleteHabit, ProgressEntry, ClassSchedule, Habit, Badge } from "@/lib/localStorage";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { aiApi } from "@/lib/apiClient";
import ReactMarkdown from 'react-markdown';
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

const ALL_BADGES = [
  { name: "first_habit", label: "First Step", icon: "🚀", description: "Complete your first habit" },
  { name: "week_streak", label: "Week Warrior", icon: "🔥", description: "7 day streak" },
  { name: "month_streak", label: "Month Master", icon: "👑", description: "30 day streak" },
  { name: "level_5", label: "Rising Star", icon: "⭐", description: "Reach level 5" },
  { name: "level_10", label: "Champion", icon: "🏆", description: "Reach level 10" },
];

const Progress = () => {
  const queryClient = useQueryClient();

  // 1. FETCH DATA
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const { data: allHabits = [] } = useQuery({ queryKey: ['habits'], queryFn: getHabits });
  const { data: progressLogs = [] } = useQuery({ queryKey: ['progress'], queryFn: getProgress });
  const { data: schedules = [] } = useQuery({ queryKey: ['schedules'], queryFn: getSchedules });
  const { data: userBadges = [] } = useQuery({ queryKey: ['badges'], queryFn: getBadges });

  const habits = Array.isArray(allHabits) ? allHabits : [];
  const logs = Array.isArray(progressLogs) ? progressLogs : [];
  const classList = Array.isArray(schedules) ? schedules : [];
  const earnedBadgeNames = new Set(userBadges?.map((b: Badge) => b.badge_name));

  // 2. STATE & FILTERING
  const activeDates = logs.map((log: ProgressEntry) => new Date(log.completion_date));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const getSelectedDateStr = () => {
      if (!selectedDate) return "";
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  }
  const selectedDateStr = getSelectedDateStr();
  const selectedDayName = selectedDate?.toLocaleDateString('en-US', { weekday: 'long' });

  const logsForSelectedDate = logs.filter((log: ProgressEntry) => log.completion_date === selectedDateStr);
  const completedHabitIds = new Set(logsForSelectedDate.map((log: any) => log.habit_id));

  const upcomingHabits = habits.filter((habit: Habit) => {
      const isScheduledToday = habit.frequency.includes(selectedDayName || "");
      const isNotCompleted = !completedHabitIds.has(habit.id);
      return isScheduledToday && isNotCompleted;
  });

  const classesForSelectedDate = classList.filter((cls: ClassSchedule) => {
      return cls.day === selectedDayName;
  }).sort((a, b) => a.start_time.localeCompare(b.start_time));

  const expForNextLevel = 100; 
  const expProgress = ((profile?.total_exp || 0) % expForNextLevel); 

  // --- STATISTIK ---
  
  // 1. Total Habits Crushed
  const totalHabitsCrushed = logs.length;

  // 2. Weekly Consistency Score (%)
  const calculateConsistency = () => {
      if (habits.length === 0) return 0;
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentLogs = logs.filter((log: ProgressEntry) => 
          new Date(log.completion_date) >= sevenDaysAgo
      ).length;

      const maxPossibleLogs = habits.length * 7; 
      if (maxPossibleLogs === 0) return 0;

      const score = Math.round((recentLogs / maxPossibleLogs) * 100);
      return score > 100 ? 100 : score;
  };
  const consistencyScore = calculateConsistency();

  // --- AI LOGIC ---
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const generateInsight = async () => {
    setLoadingAI(true);
    try {
        const res = await aiApi.getWeeklyReview();
        setAiInsight(res.insight);
        toast.success("Coach Strive has spoken!");
    } catch (error) {
        toast.error("AI is taking a nap. Try again later.");
    } finally {
        setLoadingAI(false);
    }
  };

  // --- DELETE LOGIC ---
  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      return await deleteHabit(habitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      toast.success("Habit deleted successfully");
      setHabitToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete habit");
    },
  });

  const handleDeleteConfirm = () => {
    if (habitToDelete) deleteHabitMutation.mutate(habitToDelete);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-2">Your Progress</h1>

        {/* AI Coach */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 shadow-md text-white space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <h3 className="font-bold text-md">Strive AI Coach</h3>
                </div>
                <Button 
                    onClick={generateInsight} 
                    disabled={loadingAI}
                    variant="secondary" 
                    size="sm" 
                    className="h-8 text-xs bg-white/20 hover:bg-white/30 text-white border-none"
                >
                    {loadingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Sparkles className="h-3 w-3 mr-1.5" /> Analyze Me</>}
                </Button>
            </div>
            {aiInsight ? (
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 border border-white/10 max-h-60 overflow-y-auto custom-scrollbar">
                    <div className="prose prose-invert prose-sm max-w-none text-xs leading-relaxed">
                        <ReactMarkdown components={{
                                strong: ({node, ...props}) => <span className="font-bold text-yellow-300" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-1 my-1" {...props} />,
                                li: ({node, ...props}) => <li className="text-white/90" {...props} />,
                                p: ({node, ...props}) => <p className="mb-1.5 last:mb-0" {...props} />
                            }}
                        >{aiInsight}</ReactMarkdown>
                    </div>
                </div>
            ) : (
                <p className="text-xs text-white/80 leading-snug">Need advice? Ask AI to analyze your weekly progress!</p>
            )}
        </div>

        {/* Level Card */}
        <div className="bg-card rounded-xl p-4 shadow-sm space-y-3 border">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">Level {profile?.current_level || 1}</h3>
                <Trophy className="h-5 w-5 text-level" strokeWidth={1.5} />
            </div>
            <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>EXP Progress</span>
                    <span className="font-medium text-foreground">{expProgress} / {expForNextLevel}</span>
                </div>
                <ProgressBar value={expProgress} className="h-2" />
            </div>
        </div>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="calendar" className="text-xs">Calendar</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">Statistics</TabsTrigger>
          </TabsList>

          {/* TAB CALENDAR */}
          <TabsContent value="calendar" className="space-y-4">
             <div className="bg-card rounded-xl shadow-sm border p-2">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full"
                    classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                        month: "space-y-4 w-full",
                        caption: "flex justify-center pt-1 relative items-center mb-2",
                        caption_label: "text-sm font-bold",
                        nav: "space-x-1 flex items-center absolute right-0",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] h-8",
                        row: "flex w-full mt-1",
                        cell: "h-9 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md transition-colors font-medium text-sm",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_hidden: "invisible",
                    }}
                    modifiers={{ hasActivity: activeDates }}
                    modifiersStyles={{
                        hasActivity: { fontWeight: '900', color: 'var(--primary)', borderBottom: '2px solid var(--primary)' }
                    }}
                />
             </div>

             <div className="space-y-3">
                <h3 className="font-semibold text-sm border-b pb-1">
                    Agenda for {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </h3>
                
                {classesForSelectedDate.length > 0 && (
                    <div className="space-y-2">
                         <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Classes
                        </h4>
                        {classesForSelectedDate.map((cls) => (
                            <div key={cls.id} className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex flex-col gap-1 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold text-foreground text-sm">{cls.course_name}</div>
                                    <div className="text-[10px] font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                        {cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}
                                    </div>
                                </div>
                                {cls.location && (
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                        <MapPin className="h-3 w-3" /> <span>{cls.location}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {upcomingHabits.length > 0 && (
                    <div className="space-y-2">
                         <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="h-3 w-3" /> To Do
                        </h4>
                        {upcomingHabits.map((habit) => (
                            <div key={habit.id} className="bg-card p-3 rounded-lg shadow-sm border border-orange-100/50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg grayscale opacity-70">{habit.icon_name || '📝'}</span>
                                    <div>
                                        <p className="font-medium text-sm text-foreground">{habit.name}</p>
                                        <p className="text-[10px] text-orange-500 flex items-center gap-1">
                                            <Circle className="h-2 w-2 fill-orange-200" /> Pending
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {habit.reminder_time && (
                                        <div className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                            {habit.reminder_time}
                                        </div>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setHabitToDelete(habit.id)} className="text-destructive cursor-pointer">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {logsForSelectedDate.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                        </h4>
                        {logsForSelectedDate.map((log: any) => {
                            const habit = habits.find((h: any) => h.id === log.habit_id);
                            return (
                                <div key={log.id} className="bg-card p-3 rounded-lg shadow-sm border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{habit?.icon_name || '📝'}</span>
                                        <div>
                                            <p className="font-medium text-sm">{habit?.name || 'Unknown Habit'}</p>
                                            <p className="text-[10px] text-green-600 font-medium">Done</p>
                                        </div>
                                    </div>
                                    <div className="bg-accent/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                        +{log.exp_earned || 10} EXP
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {classesForSelectedDate.length === 0 && logsForSelectedDate.length === 0 && upcomingHabits.length === 0 && (
                    <div className="text-center py-8 px-4 bg-muted/20 rounded-lg border-dashed border-2">
                        <p className="text-xs text-muted-foreground">No classes or activity for this day.</p>
                    </div>
                )}
             </div>
          </TabsContent>

          {/* TAB STATISTICS (CLEAN: GRID + BADGES ONLY) */}
          <TabsContent value="stats" className="space-y-4">
             
             {/* 1. STATS GRID (4 KARTU) */}
             <div className="grid grid-cols-2 gap-3">
                <div className="bg-card rounded-xl p-4 shadow-sm text-center border">
                    <Target className="h-6 w-6 text-primary mx-auto mb-1" strokeWidth={1.5} />
                    <p className="text-xl font-bold">{habits.length}</p>
                    <p className="text-xs text-muted-foreground">Active Habits</p>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-sm text-center border">
                    <Flame className="h-6 w-6 text-streak mx-auto mb-1" strokeWidth={1.5} />
                    <p className="text-xl font-bold">{profile?.longest_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Best Streak</p>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-sm text-center border">
                    <BarChart3 className="h-6 w-6 text-blue-500 mx-auto mb-1" strokeWidth={1.5} />
                    <p className="text-xl font-bold">{consistencyScore}%</p>
                    <p className="text-xs text-muted-foreground">Consistency (7d)</p>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-sm text-center border">
                    <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-1" strokeWidth={1.5} />
                    <p className="text-xl font-bold">{totalHabitsCrushed}</p>
                    <p className="text-xs text-muted-foreground">Total Done</p>
                </div>
            </div>

            {/* 2. BADGES */}
            <div className="bg-card rounded-xl p-4 shadow-sm space-y-3 border">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" strokeWidth={1.5} />
                Achievements
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {ALL_BADGES.map((badge) => {
                  const isEarned = earnedBadgeNames.has(badge.name);
                  return (
                    <div
                      key={badge.name}
                      className={`
                        text-center p-2 rounded-lg border flex flex-col items-center justify-center
                        ${isEarned ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-transparent opacity-40 grayscale'}
                      `}
                    >
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <p className="text-[10px] font-medium leading-tight">{badge.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />

      {/* Delete Dialog */}
      <AlertDialog open={!!habitToDelete} onOpenChange={() => setHabitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the habit from your future schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteHabitMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Progress;
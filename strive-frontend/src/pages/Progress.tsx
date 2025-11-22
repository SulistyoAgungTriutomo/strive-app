import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Trophy, Flame, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getHabits, getProgress, getBadges, ProgressEntry, Badge } from "@/lib/localStorage";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Definisi Metadata Badge (Frontend Only)
const BADGE_META: Record<string, { label: string; icon: string; description: string }> = {
  "first_habit": { label: "First Step", icon: "🚀", description: "Complete your first habit" },
  "week_streak": { label: "Week Warrior", icon: "🔥", description: "Reach 7 day streak" },
  "month_streak": { label: "Month Master", icon: "👑", description: "Reach 30 day streak" },
  "level_5": { label: "Rising Star", icon: "⭐", description: "Reach level 5" },
  "level_10": { label: "Champion", icon: "🏆", description: "Reach level 10" },
};

const Progress = () => {
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const { data: allHabits = [] } = useQuery({ queryKey: ['habits'], queryFn: getHabits });
  const { data: progressLogs = [] } = useQuery({ queryKey: ['progress'], queryFn: getProgress });
  
  // Fetch Badges dari API
  const { data: userBadges = [] } = useQuery({ queryKey: ['badges'], queryFn: getBadges });

  const habits = Array.isArray(allHabits) ? allHabits : [];
  const logs = Array.isArray(progressLogs) ? progressLogs : [];
  const earnedBadgeNames = new Set(userBadges?.map((b: Badge) => b.badge_name));

  // ... (Logika Kalender sama seperti sebelumnya) ...
  const activeDates = logs.map((log: ProgressEntry) => new Date(log.completion_date));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const logsForSelectedDate = logs.filter((log: ProgressEntry) => {
    if (!selectedDate) return false;
    
    // Perbaikan: Gunakan waktu lokal komputer, BUKAN UTC (toISOString)
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const selectedDateStr = `${year}-${month}-${day}`;

    // Bandingkan string tanggal (YYYY-MM-DD)
    return log.completion_date === selectedDateStr;
  });

  const expForNextLevel = 100; 
  const expProgress = ((profile?.total_exp || 0) % expForNextLevel); 

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Your Progress</h1>

        {/* User Level Card */}
        <div className="bg-card rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Level {profile?.current_level || 1}</h3>
            <Trophy className="h-6 w-6 text-level" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span>EXP Progress</span>
                <span className="font-medium">{expProgress} / {expForNextLevel}</span>
            </div>
            <ProgressBar value={expProgress} className="h-3" />
            </div>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="stats">Badges & Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
             {/* ... (Kode Kalender yang sudah miliki, Copy dari sebelumnya) ... */}
             <div className="bg-card rounded-2xl shadow-sm border p-4">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full"
                    classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                        month: "space-y-4 w-full",
                        caption: "flex justify-center pt-1 relative items-center mb-4",
                        caption_label: "text-xl font-bold",
                        nav: "space-x-1 flex items-center absolute right-0",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex",
                        head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.9rem] h-10",
                        row: "flex w-full mt-2",
                        cell: "h-12 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-primary/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md transition-colors font-medium",
                        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_hidden: "invisible",
                    }}
                    modifiers={{ hasActivity: activeDates }}
                    modifiersStyles={{
                        hasActivity: { fontWeight: '900', color: 'var(--primary)', borderBottom: '3px solid var(--primary)' }
                    }}
                />
             </div>
             
             {/* Detail Aktivitas */}
             <div className="space-y-3">
                <h3 className="font-semibold text-lg">
                    Activity on {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                {logsForSelectedDate.length > 0 ? (
                    logsForSelectedDate.map((log: any) => {
                        const habit = habits.find((h: any) => h.id === log.habit_id);
                        return (
                            <div key={log.id} className="bg-card p-4 rounded-xl shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{habit?.icon_name || '📝'}</span>
                                    <p className="font-medium">{habit?.name || 'Unknown Habit'}</p>
                                </div>
                                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold">+{log.exp_earned || 10} EXP</div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center p-8 bg-muted/30 rounded-xl border-dashed border-2">
                        <p className="text-muted-foreground">No activity recorded for this day.</p>
                    </div>
                )}
             </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {/* Badges Collection */}
            <div className="bg-card rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" strokeWidth={1.5} />
                Achievements
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(BADGE_META).map(([key, meta]) => {
                  const isEarned = earnedBadgeNames.has(key);
                  return (
                    <div key={key} className={`text-center p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${isEarned ? 'bg-primary/10 border-primary/50' : 'bg-muted/30 border-transparent opacity-50 grayscale'}`}>
                      <div className="text-3xl">{meta.icon}</div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold leading-tight">{meta.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{meta.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl p-6 shadow-md text-center">
                    <Target className="h-8 w-8 text-primary mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-2xl font-bold">{habits.length}</p>
                    <p className="text-sm text-muted-foreground">Active Habits</p>
                </div>
                <div className="bg-card rounded-2xl p-6 shadow-md text-center">
                    <Flame className="h-8 w-8 text-streak mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-2xl font-bold">{profile?.longest_streak || 0}</p>
                    <p className="text-sm text-muted-foreground">Longest Streak</p>
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Progress;
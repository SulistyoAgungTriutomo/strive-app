import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Trophy, Flame, Target, BookOpen, MapPin, CheckCircle2, Circle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getHabits, getProgress, getSchedules, ProgressEntry, ClassSchedule, Habit } from "@/lib/localStorage";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Progress = () => {
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const { data: allHabits = [] } = useQuery({ queryKey: ['habits'], queryFn: getHabits });
  const { data: progressLogs = [] } = useQuery({ queryKey: ['progress'], queryFn: getProgress });
  const { data: schedules = [] } = useQuery({ queryKey: ['schedules'], queryFn: getSchedules });

  const habits = Array.isArray(allHabits) ? allHabits : [];
  const logs = Array.isArray(progressLogs) ? progressLogs : [];
  const classList = Array.isArray(schedules) ? schedules : [];

  const activeDates = logs.map((log: ProgressEntry) => new Date(log.completion_date));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // --- FILTERING LOGIC ---
  
  // 1. Get Date Strings
  const getSelectedDateStr = () => {
      if (!selectedDate) return "";
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  }
  const selectedDateStr = getSelectedDateStr();
  const selectedDayName = selectedDate?.toLocaleDateString('en-US', { weekday: 'long' }); // e.g. "Monday"

  // 2. Filter Completed Habits (Logs)
  const logsForSelectedDate = logs.filter((log: ProgressEntry) => log.completion_date === selectedDateStr);
  const completedHabitIds = new Set(logsForSelectedDate.map((log: any) => log.habit_id));

  // 3. Filter Upcoming Habits (Scheduled Today but NOT in Logs)
  const upcomingHabits = habits.filter((habit: Habit) => {
      // Cek apakah habit dijadwalkan hari ini
      const isScheduledToday = habit.frequency.includes(selectedDayName || "");
      // Cek apakah BELUM selesai
      const isNotCompleted = !completedHabitIds.has(habit.id);
      
      return isScheduledToday && isNotCompleted;
  });

  // 4. Filter Class Schedule
  const classesForSelectedDate = classList.filter((cls: ClassSchedule) => {
      return cls.day === selectedDayName;
  }).sort((a, b) => a.start_time.localeCompare(b.start_time));

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
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
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

             {/* --- ACTIVITY LOG --- */}
             <div className="space-y-5">
                <h3 className="font-semibold text-lg border-b pb-2">
                    Agenda for {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                
                {/* 1. JADWAL KULIAH */}
                {classesForSelectedDate.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="h-3 w-3" /> Class Schedule
                        </h4>
                        {classesForSelectedDate.map((cls) => (
                            <div key={cls.id} className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex flex-col gap-2 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="font-semibold text-foreground text-base">{cls.course_name}</div>
                                    <div className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                                        {cls.start_time.slice(0,5)} - {cls.end_time.slice(0,5)}
                                    </div>
                                </div>
                                {cls.location && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5" /> <span>{cls.location}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 2. UPCOMING HABITS (BARU DITAMBAHKAN) */}
                {upcomingHabits.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="h-3 w-3" /> To Do
                        </h4>
                        {upcomingHabits.map((habit) => (
                            <div key={habit.id} className="bg-card p-4 rounded-xl shadow-sm border border-orange-100 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl grayscale opacity-70">{habit.icon_name || '📝'}</span>
                                    <div>
                                        <p className="font-medium text-foreground">{habit.name}</p>
                                        <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                                            <Circle className="h-3 w-3 fill-orange-100" /> Pending
                                        </p>
                                    </div>
                                </div>
                                {habit.reminder_time && (
                                    <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                                        {habit.reminder_time}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* 3. COMPLETED HABITS */}
                {logsForSelectedDate.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                        </h4>
                        {logsForSelectedDate.map((log: any) => {
                            const habit = habits.find((h: any) => h.id === log.habit_id);
                            return (
                                <div key={log.id} className="bg-card p-4 rounded-xl shadow-sm border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{habit?.icon_name || '📝'}</span>
                                        <div>
                                            <p className="font-medium">{habit?.name || 'Unknown Habit'}</p>
                                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> Done
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-accent/50 px-2 py-1 rounded-md text-xs font-bold">
                                        +{log.exp_earned || 10} EXP
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* State Kosong */}
                {classesForSelectedDate.length === 0 && logsForSelectedDate.length === 0 && upcomingHabits.length === 0 && (
                    <div className="text-center py-12 px-4 bg-muted/20 rounded-xl border-dashed border-2">
                        <p className="text-muted-foreground">No classes, todos, or activity for this day.</p>
                        <p className="text-xs text-muted-foreground mt-1">A free day!</p>
                    </div>
                )}
             </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
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
import { useState } from "react";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CalendarDay {
  date: string;
  completions: number;
  totalScheduled: number;
  completedHabits: { name: string; icon: string }[];
}

interface ActivityCalendarProps {
  calendarData: CalendarDay[];
}

export const ActivityCalendar = ({ calendarData }: ActivityCalendarProps) => {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const getIntensityClass = (day: CalendarDay) => {
    if (day.completions === 0) {
      return "bg-muted/30 hover:bg-muted/50";
    }
    
    if (day.totalScheduled === 0) {
      return "bg-muted/30 hover:bg-muted/50";
    }

    const percentage = (day.completions / day.totalScheduled) * 100;
    
    if (percentage === 100) {
      // Perfect day - darkest blue
      return "bg-primary hover:bg-primary/90";
    } else if (percentage >= 70) {
      return "bg-primary/70 hover:bg-primary/80";
    } else if (percentage >= 40) {
      return "bg-primary/50 hover:bg-primary/60";
    } else {
      return "bg-primary/30 hover:bg-primary/40";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="bg-card rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" strokeWidth={1.5} />
          <h3 className="font-semibold">Activity Calendar</h3>
        </div>
        <div className="grid grid-cols-10 gap-2">
          {calendarData.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className={`
                aspect-square rounded-lg transition-all duration-200
                ${getIntensityClass(day)}
                cursor-pointer active:scale-95
              `}
              title={`${day.date}: ${day.completions} completions`}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-muted/30"></div>
            <div className="w-3 h-3 rounded bg-primary/30"></div>
            <div className="w-3 h-3 rounded bg-primary/50"></div>
            <div className="w-3 h-3 rounded bg-primary/70"></div>
            <div className="w-3 h-3 rounded bg-primary"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <Dialog open={selectedDay !== null} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDay && formatDate(selectedDay.date)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDay && selectedDay.completedHabits.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed Habits</span>
                  <span className="font-semibold">
                    {selectedDay.completions} / {selectedDay.totalScheduled}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedDay.completedHabits.map((habit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="text-2xl">{habit.icon}</span>
                      <span className="font-medium">{habit.name}</span>
                      <span className="ml-auto text-primary">✓</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No activity recorded on this day.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

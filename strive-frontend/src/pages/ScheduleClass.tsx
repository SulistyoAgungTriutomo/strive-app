import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { scheduleApi } from "@/lib/apiClient";
import { scheduleClassReminder } from "@/lib/notifications";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface ClassItem {
  course_name: string;
  day: string;
  start_time: string;
  end_time: string;
  location: string;
}

const ClassSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([
    { course_name: "", day: "Monday", start_time: "", end_time: "", location: "" }
  ]);

  const addClassField = () => {
    setClasses([...classes, { course_name: "", day: "Monday", start_time: "", end_time: "", location: "" }]);
  };

  const removeClassField = (index: number) => {
    const newClasses = classes.filter((_, i) => i !== index);
    setClasses(newClasses);
  };

  const updateField = (index: number, field: keyof ClassItem, value: string) => {
    const newClasses = [...classes];
    newClasses[index] = { ...newClasses[index], [field]: value };
    setClasses(newClasses);
  };

  const handleSave = async () => {
    // 1. Validasi Sederhana
    for (const c of classes) {
        if (!c.course_name || !c.start_time || !c.end_time) {
            toast.error("Please fill in all required fields (Name, Time)");
            return;
        }
        if (c.start_time >= c.end_time) {
            toast.error(`Invalid time for ${c.course_name}: End time must be after Start time`);
            return;
        }
    }

    setLoading(true);
    try {
        // 2. Simpan ke Backend
        await scheduleApi.create(classes);

        // 3. LANGKAH 2: Jadwalkan Notifikasi untuk Setiap Kelas
        for (const c of classes) {
            await scheduleClassReminder(
                c.course_name,
                c.day,
                c.start_time,
                c.location
            );
        }

        toast.success("Schedule saved & Reminders set!");
        navigate("/dashboard");
    } catch (error: any) {
        toast.error(error.message || "Failed to save schedule");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Input Class Schedule</h1>
        </div>

        <p className="text-muted-foreground text-sm">
            Add your class schedule so we can prevent scheduling conflicts with your habits.
        </p>

        {/* Form List */}
        <div className="space-y-4">
          {classes.map((item, index) => (
            <Card key={index} className="border border-border shadow-sm">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">Class {index + 1}</CardTitle>
                {classes.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeClassField(index)} className="text-destructive h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Course Name & Day */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Course Name *</Label>
                        <Input 
                            placeholder="e.g. Mathematics 101" 
                            value={item.course_name}
                            onChange={(e) => updateField(index, 'course_name', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Day *</Label>
                        <Select 
                            value={item.day} 
                            onValueChange={(val) => updateField(index, 'day', val)}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {DAYS.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Start Time *</Label>
                        <Input 
                            type="time" 
                            value={item.start_time}
                            onChange={(e) => updateField(index, 'start_time', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>End Time *</Label>
                        <Input 
                            type="time" 
                            value={item.end_time}
                            onChange={(e) => updateField(index, 'end_time', e.target.value)}
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <Label>Location (Optional)</Label>
                    <Input 
                        placeholder="e.g. Room 301"
                        value={item.location}
                        onChange={(e) => updateField(index, 'location', e.target.value)}
                    />
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
            <Button variant="outline" onClick={addClassField} className="w-full border-dashed border-2">
                <Plus className="mr-2 h-4 w-4" /> Add Another Class
            </Button>

            <Button onClick={handleSave} className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Schedule"}
            </Button>
        </div>

      </div>
    </div>
  );
};

export default ClassSchedule;
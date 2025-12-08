import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, ArrowRight, Check } from "lucide-react";
import { authApi } from "@/lib/apiClient";

// Definisi Pertanyaan
const QUESTIONS = [
  {
    id: "primaryGoals", // ID Jamak untuk Multi-select
    type: "multi",      // Tipe: Bisa pilih banyak
    question: "What are your main goals right now?",
    description: "Select all that apply",
    options: [
      "💪 Improve Physical Health",
      "📚 Academic Success / Study",
      "🧘 Mental Wellbeing & Mindfulness",
      "💼 Career & Productivity",
      "🎨 Learn a New Skill"
    ]
  },
  {
    id: "biggestStruggles", // ID Jamak
    type: "multi",
    question: "What stops you from building habits?",
    description: "Select all that apply",
    options: [
      "⏳ I don't have enough time",
      "🥱 I lose motivation easily",
      "🤯 I get overwhelmed",
      "😵 I simply forget",
      "📱 Too many distractions"
    ]
  },
  {
    id: "routineType",
    type: "single", // Tipe: Pilih satu
    question: "How would you describe your daily routine?",
    description: "Select the one that fits best",
    options: [
      "📅 Very structured and strict",
      "🌊 Flexible and changing",
      "🌙 I'm a night owl",
      "☀️ I'm an early bird",
      "🎢 Chaotic and unpredictable"
    ]
  }
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
  // State untuk menyimpan jawaban (bisa string atau array of strings)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);

  const currentQuestion = QUESTIONS[step];

  // Handler untuk Checkbox (Multi Select)
  const handleMultiSelect = (option: string, checked: boolean) => {
    setAnswers(prev => {
      const currentSelected = (prev[currentQuestion.id] as string[]) || [];
      if (checked) {
        // Tambahkan ke array jika dicentang
        return { ...prev, [currentQuestion.id]: [...currentSelected, option] };
      } else {
        // Hapus dari array jika tidak dicentang
        return { ...prev, [currentQuestion.id]: currentSelected.filter(item => item !== option) };
      }
    });
  };

  // Handler untuk Radio Button (Single Select)
  const handleSingleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = async () => {
    const currentAnswer = answers[currentQuestion.id];
    
    // Validasi: Pastikan user memilih setidaknya satu opsi
    if (!currentAnswer || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      toast.error("Please select at least one option");
      return;
    }

    // Cek apakah ini langkah terakhir
    if (step === QUESTIONS.length - 1) {
      setLoading(true);
      try {
        // Simpan ke Backend
        await authApi.updateProfile({ onboarding_data: answers });
        
        toast.success("Profile personalized!", { description: "AI Coach is ready." });
        
        // Redirect ke Input Jadwal (dengan state khusus)
        navigate("/schedule-input", { state: { fromOnboarding: true } }); 
        
      } catch (error) {
        toast.error("Failed to save preferences");
      } finally {
        setLoading(false);
      }
    } else {
      // Lanjut ke pertanyaan berikutnya
      setStep(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        
        {/* Header & Progress Bar */}
        <div className="mb-8 text-center">
             <h1 className="text-2xl font-bold mb-2">Let's get to know you 👋</h1>
             <p className="text-muted-foreground">Step {step + 1} of {QUESTIONS.length}</p>
             <div className="h-1 w-full bg-secondary mt-4 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                />
             </div>
        </div>

        {/* Kartu Pertanyaan */}
        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
            <CardDescription>{currentQuestion.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {currentQuestion.type === 'multi' ? (
                // TAMPILAN MULTI SELECT (CHECKBOX)
                <div className="space-y-3">
                    {currentQuestion.options.map((option) => {
                        // Cek apakah opsi ini sudah dipilih
                        const isChecked = (answers[currentQuestion.id] as string[] || []).includes(option);
                        return (
                            <div 
                                key={option} 
                                // Style dinamis: beri border/bg warna jika dipilih
                                className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all ${isChecked ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                                onClick={() => handleMultiSelect(option, !isChecked)}
                            >
                                <Checkbox checked={isChecked} id={option} />
                                <Label htmlFor={option} className="flex-1 cursor-pointer font-medium">{option}</Label>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // TAMPILAN SINGLE SELECT (RADIO)
                <RadioGroup 
                    onValueChange={handleSingleSelect} 
                    value={answers[currentQuestion.id] as string}
                    className="space-y-3"
                >
                    {currentQuestion.options.map((option) => (
                        <div key={option} className={`flex items-center space-x-3 border rounded-xl p-4 cursor-pointer transition-all ${answers[currentQuestion.id] === option ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                            <RadioGroupItem value={option} id={option} />
                            <Label htmlFor={option} className="flex-1 cursor-pointer font-medium">{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            )}

            <Button onClick={handleNext} className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              ) : (
                step === QUESTIONS.length - 1 ? (
                    <>Finish Setup <Check className="ml-2 h-4 w-4" /></>
                ) : (
                    <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                )
              )}
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
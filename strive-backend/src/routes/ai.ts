import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../database';
import { protect } from '../middleware/auth';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.get('/weekly-review', protect, async (req: any, res: Response) => {
    const userId = req.userId;

    try {
        // 1. Ambil Data
        const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, current_level, onboarding_data') 
            .eq('id', userId)
            .single();
            
        // Cast ke 'any' agar TypeScript aman membaca onboarding_data
        const profile: any = profileData; 

        const { data: habits } = await supabase.from('habits').select('id, name, frequency').eq('user_id', userId);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: logs } = await supabase.from('progress')
            .select('habit_id, completion_date')
            .eq('user_id', userId)
            .gte('completion_date', sevenDaysAgo.toISOString());

        // 2. Mapping ID ke Nama Habit
        const habitMap = habits?.reduce((acc: any, habit: any) => {
            acc[habit.id] = habit.name;
            return acc;
        }, {});

        const humanReadableLogs = logs?.map((log: any) => ({
            habit_name: habitMap[log.habit_id] || "Unknown Habit",
            date: log.completion_date
        }));

        // 3. Persiapkan Data Onboarding (Handle Multi-Select)
        const userPersona = profile?.onboarding_data || {};

        // Cek apakah data berupa Array (Multi-select) atau String (Single)
        const goals = Array.isArray(userPersona.primaryGoals) 
            ? userPersona.primaryGoals.join(", ") 
            : (userPersona.primaryGoal || "General Improvement");
            
        const struggles = Array.isArray(userPersona.biggestStruggles) 
            ? userPersona.biggestStruggles.join(", ") 
            : (userPersona.biggestStruggle || "Consistency");

        // 4. Prompt yang diperbarui
        const prompt = `
        Act as a motivational Habit Coach named "Strive AI".
        
        USER PROFILE:
        - Name: ${profile?.full_name} (Level ${profile?.current_level})
        - Main Goals: ${goals}
        - Biggest Struggles: ${struggles}
        - Daily Routine: ${userPersona.routineType || "Flexible"}
        
        CURRENT HABITS:
        ${JSON.stringify(habits)}
        
        ACTIVITY LOG (Last 7 Days):
        ${JSON.stringify(humanReadableLogs)} 
        
        TASK:
        1. Analyze their performance based on the logs.
        2. RELATE your advice to their Goals: "${goals}" and Struggles: "${struggles}".
        3. Give a short, energetic summary.
        4. Provide 1 specific actionable tip.
        5. Use emojis. Be friendly, empathetic, but disciplined.
        `;

        // 5. Panggil Gemini (Gunakan Model Lite 2.0 agar support Key Anda)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ insight: text });

    } catch (err: any) {
        console.error("AI Error:", err);
        
        // Handle Rate Limit (429)
        if (err.message?.includes("429") || err.status === 429) {
            return res.status(429).json({ 
                error: 'AI is taking a break. Please wait 1 minute and try again.' 
            });
        }

        return res.status(500).json({ 
            error: 'Failed to generate insight.',
            details: err.message 
        });
    }
});

export default router;
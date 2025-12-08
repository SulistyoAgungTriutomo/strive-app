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
        // UPDATE: Tambahkan 'onboarding_data' ke dalam select agar datanya terambil
        const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, current_level, onboarding_data') 
            .eq('id', userId)
            .single();
            
        // UPDATE: Cast ke 'any' agar TypeScript tidak komplain soal tipe data baru
        const profile: any = profileData; 

        const { data: habits } = await supabase.from('habits').select('id, name, frequency').eq('user_id', userId);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: logs } = await supabase.from('progress')
            .select('habit_id, completion_date')
            .eq('user_id', userId)
            .gte('completion_date', sevenDaysAgo.toISOString());

        // 2. BUAT PEMETAAN ID KE NAMA (Mapping)
        const habitMap = habits?.reduce((acc: any, habit: any) => {
            acc[habit.id] = habit.name;
            return acc;
        }, {});

        // Ganti ID di logs dengan Nama Habit untuk dikirim ke AI
        const humanReadableLogs = logs?.map((log: any) => ({
            habit_name: habitMap[log.habit_id] || "Unknown Habit",
            date: log.completion_date
        }));

        // AMBIL DATA ONBOARDING (Sekarang aman karena profile sudah di-cast ke any)
        const userPersona = profile?.onboarding_data || {};

        // 3. Prompt yang Lebih Jelas
        const prompt = `
        Act as a motivational Habit Coach named "Strive AI".
        
        USER PROFILE:
        - Name: ${profile?.full_name} (Level ${profile?.current_level})
        - Main Goal: ${userPersona.primaryGoal || "General Improvement"}
        - Biggest Struggle: ${userPersona.biggestStruggle || "Consistency"}
        - Daily Routine: ${userPersona.routineType || "Flexible"}
        
        CURRENT HABITS:
        ${JSON.stringify(habits)}
        
        ACTIVITY LOG (Last 7 Days):
        ${JSON.stringify(humanReadableLogs)} 
        
        TASK:
        1. Analyze their performance based on the logs.
        2. RELATE your advice to their "Main Goal" and "Biggest Struggle" mentioned in their User Profile. (e.g., if they struggle with time, suggest shorter habits).
        3. Give a short, energetic summary.
        4. Provide 1 specific actionable tip.
        5. Use emojis. Be friendly, empathetic, but disciplined.
        `;

        // 4. Panggil Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ insight: text });

    } catch (err: any) {
        console.error("AI Error:", err);
        return res.status(500).json({ error: 'Failed to generate insight.', details: err.message });
    }
});

export default router;
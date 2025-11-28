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
        const { data: profile } = await supabase.from('profiles').select('full_name, current_level').eq('id', userId).single();
        const { data: habits } = await supabase.from('habits').select('id, name, frequency').eq('user_id', userId);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: logs } = await supabase.from('progress')
            .select('habit_id, completion_date')
            .eq('user_id', userId)
            .gte('completion_date', sevenDaysAgo.toISOString());

        // 2. BUAT PEMETAAN ID KE NAMA (Mapping)
        // Agar AI tahu ID "abc-123" itu habit "Lari Pagi"
        const habitMap = habits?.reduce((acc: any, habit: any) => {
            acc[habit.id] = habit.name;
            return acc;
        }, {});

        // Ganti ID di logs dengan Nama Habit untuk dikirim ke AI
        const humanReadableLogs = logs?.map((log: any) => ({
            habit_name: habitMap[log.habit_id] || "Unknown Habit",
            date: log.completion_date
        }));

        // 3. Prompt yang Lebih Jelas
        const prompt = `
        Act as a motivational Habit Coach named "Strive AI".
        User Name: ${profile?.full_name} (Level ${profile?.current_level}).
        
        User's Habits Goals:
        ${JSON.stringify(habits?.map(h => ({ name: h.name, freq: h.frequency })))}
        
        User's Activity Log (Last 7 Days):
        ${JSON.stringify(humanReadableLogs)}
        
        Task:
        1. Analyze their performance based on the logs. Mention specific habit names.
        2. Give a short, energetic summary (max 2 sentences).
        3. Provide 1 specific actionable tip to improve next week.
        4. Use emojis. Be friendly but disciplined.
        `;

        // 4. Panggil Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Pakai model terbaru Anda
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
import { Router, Response } from 'express';
import Groq from 'groq-sdk';
import { supabase } from '../database';
import { protect } from '../middleware/auth';

const router = Router();

// Inisialisasi Groq Client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

router.get('/weekly-review', protect, async (req: any, res: Response) => {
    const userId = req.userId;

    try {
        // --- 1. PENGAMBILAN DATA (LOGIC TETAP SAMA) ---
        
        const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, current_level, onboarding_data') 
            .eq('id', userId)
            .single();
            
        const profile: any = profileData; 

        const { data: habits } = await supabase.from('habits').select('id, name, frequency').eq('user_id', userId);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { data: logs } = await supabase.from('progress')
            .select('habit_id, completion_date')
            .eq('user_id', userId)
            .gte('completion_date', sevenDaysAgo.toISOString());

        // Mapping ID ke Nama Habit
        const habitMap = habits?.reduce((acc: any, habit: any) => {
            acc[habit.id] = habit.name;
            return acc;
        }, {});

        const humanReadableLogs = logs?.map((log: any) => ({
            habit_name: habitMap[log.habit_id] || "Unknown Habit",
            date: log.completion_date
        }));

        // Handle Multi-Select Onboarding Data
        const userPersona = profile?.onboarding_data || {};
        const goals = Array.isArray(userPersona.primaryGoals) 
            ? userPersona.primaryGoals.join(", ") 
            : (userPersona.primaryGoal || "General Improvement");  
        const struggles = Array.isArray(userPersona.biggestStruggles) 
            ? userPersona.biggestStruggles.join(", ") 
            : (userPersona.biggestStruggle || "Consistency");

        // --- 2. KONSTRUKSI PROMPT (TETAP SAMA) ---
        const systemPrompt = `You are "Strive AI", a high-energy, empathetic motivational habit coach. Your goal is to help users build consistency.`;
        
        const userPrompt = `
        USER PROFILE:
        - Name: ${profile?.full_name} (Level ${profile?.current_level})
        - Main Goals: ${goals}
        - Biggest Struggles: ${struggles}
        
        CURRENT HABITS:
        ${JSON.stringify(habits)}
        
        ACTIVITY LOG (Last 7 Days):
        ${JSON.stringify(humanReadableLogs)} 
        
        TASK:
        1. Analyze their performance based on the logs.
        2. Relate advice to their Goals ("${goals}") and Struggles ("${struggles}").
        3. Give a short, energetic summary.
        4. Provide 1 specific actionable tip.
        5. Use emojis. Be friendly but disciplined. Keep it concise.
        `;

        // --- 3. PANGGIL AI (MENGGUNAKAN GROQ) ---
        // Kita pakai model Llama 3 70B (Sangat cerdas & Cepat)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile", // Model terbaik Groq saat ini
            temperature: 0.7,                 // Kreativitas seimbang
            max_tokens: 1024,
        });

        // Ambil hasil teks
        const insight = chatCompletion.choices[0]?.message?.content || "Let's keep striving! (AI didn't return text)";

        return res.status(200).json({ insight });

    } catch (err: any) {
        console.error("Groq AI Error:", err);
        
        // Handle Rate Limit (Mirip 429)
        if (err?.status === 429) {
            return res.status(429).json({ 
                error: 'Coach is busy analyzing too many pros. Please wait a moment!' 
            });
        }

        return res.status(500).json({ 
            error: 'Failed to generate insight.',
            details: err.message 
        });
    }
});

export default router;
// strive-backend/src/routes/habits.ts
import { Router, Request, Response } from 'express';
import { supabase } from '../database';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

const getUserId = (req: any): string => req.userId;

// --- GET HABITS ---
router.get('/', async (req: any, res: Response) => {
    const userId = getUserId(req);
    const { data, error } = await supabase.from('habits').select('*').eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
});

// --- GET BADGES (Endpoint Baru) ---
router.get('/badges', async (req: any, res: Response) => {
    const userId = getUserId(req);
    const { data, error } = await supabase.from('user_badges').select('*').eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
});

// --- GET LOGS ---
router.get('/logs', async (req: any, res: Response) => {
    const userId = getUserId(req);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .gte('completion_date', oneYearAgo.toISOString())
        .order('completion_date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
});

// --- CREATE HABIT ---
router.post('/', async (req: any, res: Response) => {
    const userId = getUserId(req);
    const { name, icon_name, frequency } = req.body;

    const { data, error } = await supabase
        .from('habits')
        .insert({ 
            user_id: userId,
            name,
            icon_name: icon_name || '📝',
            frequency: frequency || [],
            current_streak: 0
        })
        .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
});

// --- DELETE HABIT ---
router.delete('/:habitId', async (req: any, res: Response) => {
    const userId = getUserId(req);
    const habitId = req.params.habitId;
    const { error } = await supabase.from('habits').delete().eq('id', habitId).eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).send();
});

// --- UPDATE HABIT ---
router.put('/:habitId', async (req: any, res: Response) => {
    const userId = getUserId(req);
    const habitId = req.params.habitId;
    const { data, error } = await supabase
        .from('habits')
        .update(req.body)
        .eq('id', habitId)
        .eq('user_id', userId)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data[0]);
});

// --- CHECK-IN with BADGE SYSTEM ---
router.post('/:habitId/checkin', async (req: any, res: Response) => {
    const habitId = req.params.habitId;
    const userId = getUserId(req);
    const today = new Date().toISOString().split('T')[0];

    try {
        // 1. Cek Duplikat Check-in
        const { data: existing } = await supabase
            .from('progress')
            .select('*')
            .eq('habit_id', habitId)
            .eq('completion_date', today)
            .single();

        if (existing) {
            return res.status(400).json({ message: 'Already checked in today.' });
        }

        // 2. Insert Progress
        const expGained = 10;
        const { error: logError } = await supabase.from('progress').insert({
            habit_id: habitId,
            user_id: userId,
            completion_date: today,
            exp_earned: expGained
        });
        if (logError) throw logError;

        // 3. Update User Stats & Get Updated Data
        // Kita butuh data terbaru untuk cek Badge
        const { data: userProfile } = await supabase.from('profiles').select('current_exp, streak_count').eq('id', userId).single();
        let newStreak = (userProfile?.streak_count || 0); 
        
        if (userProfile) {
            newStreak += 1;
            await supabase.from('profiles').update({
                current_exp: (userProfile.current_exp || 0) + expGained,
                streak_count: newStreak
            }).eq('id', userId);
        }

        // 4. === BADGE LOGIC ===
        const newBadges: string[] = [];

        // Cek Badge: First Habit (Check-in pertama kali)
        const { count: progressCount } = await supabase
            .from('progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (progressCount === 1) newBadges.push('first_habit');

        // Cek Badge: Week Warrior (Streak 7)
        if (newStreak === 7) newBadges.push('week_streak');

        // Cek Badge: Month Master (Streak 30)
        if (newStreak === 30) newBadges.push('month_streak');

        // Insert Badges (Gunakan upsert/ignore agar tidak error jika duplikat)
        if (newBadges.length > 0) {
            const badgesToInsert = newBadges.map(name => ({
                user_id: userId,
                badge_name: name
            }));
            await supabase.from('user_badges').upsert(badgesToInsert, { onConflict: 'user_id, badge_name', ignoreDuplicates: true });
        }

        return res.status(200).json({ 
            message: 'Check-in successful!', 
            exp_gained: expGained,
            new_badges: newBadges // Kirim info badge baru ke frontend
        });

    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: 'Check-in failed.' });
    }
});

export default router;
import { Router, Request, Response } from 'express';
import { supabase } from '../database';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

const getUserId = (req: any): string => req.userId;

// --- GET HABITS ---
router.get('/', async (req: any, res: Response) => {
    const userId = getUserId(req);
    // Urutkan berdasarkan waktu dibuat agar rapi
    const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
});

// --- GET BADGES ---
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

// --- CREATE HABIT (DENGAN VALIDASI JADWAL) ---
router.post('/', async (req: any, res: Response) => {
    const userId = getUserId(req);
    
    // PERBAIKAN 1: Tambahkan 'reminder_time' di sini agar diambil dari request body
    const { name, icon_name, frequency, reminder_time } = req.body;

    // 1. VALIDASI KONFLIK JADWAL KULIAH
    if (reminder_time && frequency && frequency.length > 0) {
        // Ambil jadwal kuliah user
        const { data: classes } = await supabase
            .from('class_schedules')
            .select('*')
            .eq('user_id', userId);

        if (classes && classes.length > 0) {
            // Loop setiap hari yang dipilih untuk habit
            for (const habitDay of frequency) {
                // Cari kelas di hari yang sama
                const classesOnDay = classes.filter((c: any) => c.day === habitDay);
                
                for (const cls of classesOnDay) {
                    // PERBAIKAN 2: Gunakan variabel 'reminder_time' yang sudah diambil
                    // Format waktu biasanya "HH:mm" atau "HH:mm:ss", bisa dibandingkan string langsung
                    if (reminder_time >= cls.start_time && reminder_time < cls.end_time) {
                        return res.status(409).json({ 
                            error: `Conflict! You have class "${cls.course_name}" on ${habitDay} at ${cls.start_time}. Cannot schedule habit.` 
                        });
                    }
                }
            }
        }
    }

    // 2. Jika aman, Insert Habit
    const { data, error } = await supabase
        .from('habits')
        .insert({ 
            user_id: userId,
            name,
            icon_name: icon_name || '📝',
            frequency: frequency || [],
            reminder_time: reminder_time, // Simpan ke DB
            current_streak: 0
        })
        .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
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

// --- DELETE HABIT ---
router.delete('/:habitId', async (req: any, res: Response) => {
    const userId = getUserId(req);
    const habitId = req.params.habitId;
    const { error } = await supabase.from('habits').delete().eq('id', habitId).eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).send();
});

// --- CHECK-IN (LOGIKA STREAK BARU) ---
router.post('/:habitId/checkin', async (req: any, res: Response) => {
    const habitId = req.params.habitId;
    const userId = getUserId(req);
    const today = new Date().toISOString().split('T')[0];
    
    // Hitung tanggal kemarin
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    try {
        // 1. Cek Duplikat Check-in Hari Ini
        const { data: existing } = await supabase
            .from('progress')
            .select('id')
            .eq('habit_id', habitId)
            .eq('completion_date', today)
            .single();

        if (existing) {
            return res.status(400).json({ message: 'Already checked in today.' });
        }

        // 2. Insert Progress Baru
        const expGained = 10;
        const { error: logError } = await supabase.from('progress').insert({
            habit_id: habitId,
            user_id: userId,
            completion_date: today,
            exp_earned: expGained
        });
        if (logError) throw logError;

        // 3. === UPDATE HABIT STREAK (Per Habit) ===
        // Cek apakah habit ini dikerjakan kemarin?
        const { data: habitYesterday } = await supabase
            .from('progress')
            .select('id')
            .eq('habit_id', habitId)
            .eq('completion_date', yesterday)
            .maybeSingle();

        // Ambil data habit saat ini
        const { data: currentHabit } = await supabase.from('habits').select('current_streak').eq('id', habitId).single();
        let newHabitStreak = 1;

        if (habitYesterday && currentHabit) {
            // Jika kemarin dikerjakan, lanjut streak
            newHabitStreak = (currentHabit.current_streak || 0) + 1;
        } 
        // Jika kemarin tidak dikerjakan, streak otomatis jadi 1 (reset)

        // Update streak di tabel habits
        await supabase.from('habits').update({ current_streak: newHabitStreak }).eq('id', habitId);


        // 4. === UPDATE USER STATS & GLOBAL STREAK ===
        const { data: userProfile } = await supabase.from('profiles').select('current_exp, streak_count, current_level').eq('id', userId).single();
        
        let leveledUp = false;
        let newLevel = userProfile?.current_level || 1;
        let newGlobalStreak = userProfile?.streak_count || 0;

        if (userProfile) {
            // Update EXP selalu
            const newExp = (userProfile.current_exp || 0) + expGained;
            
            // Logika Level Up
            const calculatedLevel = Math.floor(newExp / 100) + 1;
            if (calculatedLevel > newLevel) {
                leveledUp = true;
                newLevel = calculatedLevel;
            }

            // Logika Global Streak (Hanya update jika ini aktivitas pertama hari ini)
            // Cek apakah ada log LAIN selain yang barusan kita insert hari ini
            const { count: todayLogCount } = await supabase
                .from('progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('completion_date', today);

            // Jika count === 1, berarti ini adalah log PERTAMA hari ini. Kita boleh update streak.
            if (todayLogCount === 1) {
                // Cek apakah USER aktif kemarin (di habit apapun)?
                const { count: yesterdayActivityCount } = await supabase
                    .from('progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('completion_date', yesterday);

                if (yesterdayActivityCount && yesterdayActivityCount > 0) {
                    // Kemarin aktif -> Lanjut Streak
                    newGlobalStreak += 1;
                } else {
                    // Kemarin tidak aktif -> Reset Streak jadi 1
                    newGlobalStreak = 1;
                }
            }
            // Jika count > 1, berarti user sudah check-in habit lain hari ini. Streak tidak berubah.

            // Simpan ke Database Profil
            await supabase.from('profiles').update({
                current_exp: newExp,
                streak_count: newGlobalStreak,
                current_level: newLevel
            }).eq('id', userId);
        }

        // 5. === BADGE LOGIC (Sama seperti sebelumnya) ===
        const newBadges: string[] = [];
        const { count: totalProgress } = await supabase
            .from('progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);
        
        if (totalProgress === 1) newBadges.push('first_habit');
        if (newGlobalStreak === 7) newBadges.push('week_streak');
        if (newGlobalStreak === 30) newBadges.push('month_streak');
        if (newLevel === 5) newBadges.push('level_5');
        if (newLevel === 10) newBadges.push('level_10');

        if (newBadges.length > 0) {
            const badgesToInsert = newBadges.map(name => ({ user_id: userId, badge_name: name }));
            await supabase.from('user_badges').upsert(badgesToInsert, { onConflict: 'user_id, badge_name', ignoreDuplicates: true });
        }

        return res.status(200).json({ 
            message: 'Check-in successful!', 
            exp_gained: expGained,
            leveled_up: leveledUp,
            new_level: newLevel,
            new_badges: newBadges,
            habit_streak: newHabitStreak // Kirim balik habit streak untuk update UI instan
        });

    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ error: 'Check-in failed.' });
    }
});

export default router;
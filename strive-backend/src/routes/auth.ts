// strive-backend/src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { supabase } from '../database';
import { protect } from '../middleware/auth';
import multer from 'multer';

const router = Router();

// Konfigurasi Multer (Simpan file di Memory sementara)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB
});

// --- 1. SIGN UP ---
router.post('/signup', async (req: Request, res: Response) => {
    const { email, password, username } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    // A. Buat akun di Supabase Auth
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: username || email.split('@')[0] } // Sesuaikan meta data
        }
    });

    if (error) return res.status(400).json({ error: error.message });

    // B. Manual Insert ke tabel 'profiles' (sesuai skema migrasi Anda)
    if (data.user) {
        const { error: insertError } = await supabase
            .from('profiles') // GANTI: users -> profiles
            .insert({
                id: data.user.id,
                full_name: username || email.split('@')[0], // GANTI: username -> full_name
                // email: email, // Tabel profiles sepertinya tidak menyimpan email di schema Anda, tidak apa-apa
                current_exp: 0,    // GANTI: total_exp -> current_exp
                current_level: 1,
                streak_count: 0    // GANTI: longest_streak -> streak_count
            });

        if (insertError) {
             // Jika error "duplicate key", berarti trigger database sudah membuatnya. Abaikan saja.
             if (!insertError.message.includes('duplicate key')) {
                 console.error("Gagal buat profil:", insertError);
             }
        }
    }
    
    return res.status(201).json(data);
});

// --- 2. LOGIN ---
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
});

// --- 3. GET ME ---
router.get('/me', protect, async (req: any, res: Response) => {
    const userId = req.userId;

    try {
        // Ambil data dari tabel 'profiles'
        const { data, error } = await supabase
            .from('profiles') // GANTI: users -> profiles
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        // Kembalikan data dengan mapping agar cocok dengan frontend kita
        // Frontend mengharapkan: total_exp, longest_streak
        // Database punya: current_exp, streak_count
        const formattedData = {
            ...data,
            username: data.full_name,
            total_exp: data.current_exp,      // Mapping
            longest_streak: data.streak_count // Mapping
        };

        return res.status(200).json(formattedData);
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

router.post('/avatar', protect, upload.single('avatar'), async (req: any, res: Response) => {
    const userId = req.userId;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        // 1. Upload ke Supabase Storage
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase
            .storage
            .from('avatars')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (uploadError) throw uploadError;

        // 2. Dapatkan Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(filePath);

        // 3. Update URL ke Profil User
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', userId);

        if (updateError) throw updateError;

        return res.status(200).json({ message: 'Avatar updated', avatar_url: publicUrl });

    } catch (err: any) {
        console.error("Upload error:", err);
        return res.status(500).json({ error: 'Failed to upload avatar.' });
    }
});

// --- UPDATE PROFILE (PUT /auth/me) ---
router.put('/me', protect, async (req: any, res: Response) => {
    const userId = req.userId;
    const { full_name } = req.body; // Kita hanya izinkan ganti nama dulu

    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ full_name })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return res.status(200).json({ message: 'Profile updated successfully', user: data });
    } catch (err: any) {
        console.error("Update error:", err);
        return res.status(500).json({ error: err.message });
    }
});

router.get('/google', async (req, res) => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Arahkan kembali ke halaman khusus di frontend kita
                redirectTo: 'http://localhost:8080/auth/callback',
                skipBrowserRedirect: true // Penting: Agar kita dapat URL-nya saja
            }
        });

        if (error) throw error;

        // Kirim URL ke frontend agar frontend yang melakukan redirect
        return res.json({ url: data.url });
    } catch (err: any) {
        console.error("Google Auth Error:", err);
        return res.status(500).json({ error: err.message });
    }
});

export default router;
// src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../database';

// Extend Express Request interface to include userId
// Ini memungkinkan kita menyimpan userId di objek Request setelah verifikasi
interface AuthenticatedRequest extends Request {
    userId?: string; 
}

/**
 * Middleware untuk memverifikasi token JWT dari Supabase di header Authorization.
 */
export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        
        // 1. Cek Header
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({ error: 'Authorization token required or malformed.' });
        }

        const token = authHeader.split(' ')[1]; // Ambil token dari 'Bearer <token>'

        // 2. Verifikasi Token dengan Supabase
        // supabase.auth.getUser(token) akan memverifikasi JWT dan status sesi
        const { data: userResponse, error } = await supabase.auth.getUser(token);

        if (error || !userResponse.user) {
            console.error('Auth verification failed:', error?.message || 'User data missing.');
            return res.status(401).send({ error: 'Invalid or expired token.' });
        }

        // 3. Simpan User ID untuk Handler berikutnya
        req.userId = userResponse.user.id; 
        
        // Lanjutkan ke handler berikutnya (e.g., GET /habits)
        next(); 

    } catch (err) {
        // Tangani kesalahan tak terduga
        console.error('Auth check error:', err);
        res.status(500).send({ error: 'Internal server error during authentication check.' });
    }
};
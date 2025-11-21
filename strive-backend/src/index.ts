// src/index.ts

import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/auth';
import habitRoutes from './routes/habits';
// Kita perlu impor database untuk memastikan koneksi Supabase terinisialisasi
import './database'; 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Global
// -------------------------------------------------------------------------
// 1. CORS: Izinkan akses dari frontend (penting untuk pengembangan/deployment)
app.use(cors({
    // TODO: GANTI INI dengan URL frontend Loveable Anda saat deployment
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
})); 

// 2. Body Parser: Mengurai body request JSON
app.use(bodyParser.json());

// 3. Health Check: Endpoint sederhana untuk memeriksa apakah server berjalan
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ 
        message: 'Strive Backend API is running successfully!',
        status: 'OK',
    });
});
// -------------------------------------------------------------------------


// Routes
// Hubungkan router yang telah kita buat
app.use('/auth', authRoutes);
app.use('/habits', habitRoutes); 

// Global Error Handler
// Digunakan untuk menangani kesalahan tak terduga yang tidak tertangkap oleh handler route
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send({ 
        error: 'Internal Server Error',
        details: err.message
    });
});


// Menjalankan Server
// -------------------------------------------------------------------------
if (process.env.NODE_ENV !== 'production') {
    // Jalankan server jika di lingkungan lokal
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        console.log(`API URL: http://localhost:${PORT}`);
    });
}

// Ekspor app untuk deployment Serverless (seperti Vercel atau Cloud Run)
export default app;
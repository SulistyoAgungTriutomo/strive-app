import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/auth';
import habitRoutes from './routes/habits';
import './database'; 
import scheduleRoutes from './routes/schedule';
import aiRoutes from './routes/ai'

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Global
// 1. CORS: Izinkan akses dari mana saja (*) agar Emulator bisa akses
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
})); 

// 2. Body Parser
// Perbesar limit agar bisa upload gambar (10mb cukup untuk avatar)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// 3. Health Check
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ 
        message: 'Strive Backend API is running successfully!',
        status: 'OK',
    });
});

// Routes
app.use('/auth', authRoutes);
app.use('/habits', habitRoutes); 
app.use('/schedule', scheduleRoutes);
app.use('/ai', aiRoutes)

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send({ 
        error: 'Internal Server Error',
        details: err.message
    });
});

// Menjalankan Server
if (process.env.NODE_ENV !== 'production') {
    // PERBAIKAN UTAMA DI SINI:
    // Tambahkan '0.0.0.0' sebagai argumen kedua.
    // Ini memaksa server "terbuka" ke jaringan, sehingga Emulator (10.0.2.2) bisa melihatnya.
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
        console.log(`Localhost URL: http://localhost:${PORT}`);
    });
}

export default app;
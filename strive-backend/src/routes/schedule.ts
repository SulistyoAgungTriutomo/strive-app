import { Router, Request, Response } from 'express';
import { supabase } from '../database';
import { protect } from '../middleware/auth';

const router = Router();
router.use(protect);

const getUserId = (req: any): string => req.userId;

// GET Schedule
router.get('/', async (req: any, res: Response) => {
    const userId = getUserId(req);
    const { data, error } = await supabase
        .from('class_schedules')
        .select('*')
        .eq('user_id', userId)
        .order('day'); // Bisa disesuaikan sorting-nya
    
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
});

// CREATE Schedule (Bulk or Single)
router.post('/', async (req: any, res: Response) => {
    const userId = getUserId(req);
    const { schedules } = req.body; // Expect array of objects

    // Tambahkan user_id ke setiap item
    const dataToInsert = schedules.map((item: any) => ({
        ...item,
        user_id: userId
    }));

    const { data, error } = await supabase
        .from('class_schedules')
        .insert(dataToInsert)
        .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
});

// DELETE Schedule
router.delete('/:id', async (req: any, res: Response) => {
    const userId = getUserId(req);
    const { error } = await supabase
        .from('class_schedules')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', userId);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: "Deleted" });
});

export default router;
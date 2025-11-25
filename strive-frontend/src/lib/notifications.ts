import { LocalNotifications } from '@capacitor/local-notifications';

const DAY_MAP: Record<string, number> = {
    'Sunday': 1, 'Monday': 2, 'Tuesday': 3, 'Wednesday': 4, 
    'Thursday': 5, 'Friday': 6, 'Saturday': 7
};

export const scheduleHabitReminder = async (
    habitId: string,
    habitName: string, 
    reminderTime: string, 
    frequency: string[]
) => {
    // 1. Cek Izin
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') return;

    if (!reminderTime) return;

    const [targetHour, targetMinute] = reminderTime.split(':').map(Number);

    // 2. Tentukan Waktu Notifikasi
    // Standard: H-60 menit sampai H-0
    const offsets = [-60, -45, -30, -15, 0];

    // FITUR BARU: H-1 Hari (24 Jam = 1440 Menit)
    // Kita tambahkan ini KHUSUS jika habit dilakukan setiap hari atau minimal 5 hari/minggu
    // (Sesuai permintaan "habit yang dilakukan setiap hari atau 5 hari beruntun")
    if (frequency.length >= 5) {
        offsets.unshift(-1440); // Tambahkan H-1 Hari di awal array
    }

    const notifications = [];

    // 3. Loop Penjadwalan
    for (const dayName of frequency) {
        const dayCode = DAY_MAP[dayName];
        if (!dayCode) continue;

        for (const offset of offsets) {
            let totalMinutes = (targetHour * 60) + targetMinute + offset;
            let notifDayCode = dayCode;

            // Logika Mundur Hari (Jika H-1 atau H-Jam menyebabkan pindah hari)
            // Contoh: H-1 Hari (-1440 menit) pasti akan masuk ke blok ini
            while (totalMinutes < 0) {
                totalMinutes += (24 * 60); // Tambah 24 jam
                notifDayCode = notifDayCode - 1; // Mundur 1 hari
                if (notifDayCode < 1) notifDayCode = 7; // Minggu(1) -> Sabtu(7)
            }

            const notifHour = Math.floor(totalMinutes / 60);
            const notifMinute = totalMinutes % 60;
            const notifId = Math.floor(Math.random() * 100000000);

            // Pesan yang Bervariasi
            let title = `Strive Reminder: ${habitName}`;
            let body = "";

            if (offset === 0) {
                // H-0 (Waktunya!)
                body = `⏰ It's time! Let's complete ${habitName} now! 🔥`;
                title = `DO IT NOW: ${habitName}`;
            } else if (offset === -1440) {
                // H-1 Hari
                body = `📅 Heads up! Tomorrow is a streak day for ${habitName}. Prepare yourself!`;
                title = `Upcoming: ${habitName}`;
            } else {
                // H-Jam (Countdown)
                body = `⏳ ${habitName} is starting in ${Math.abs(offset)} mins. Get ready!`;
            }

            notifications.push({
                id: notifId,
                title: title,
                body: body,
                schedule: {
                    on: {
                        weekday: notifDayCode,
                        hour: notifHour,
                        minute: notifMinute,
                    },
                    allowWhileIdle: true,
                },
                extra: { habitId }
            });
        }
    }

    // 4. Eksekusi Jadwal
    if (notifications.length > 0) {
        // Batalkan notifikasi lama (opsional, agar tidak duplikat jika edit)
        // await LocalNotifications.cancel(...) // Butuh ID spesifik, kita skip dulu untuk simplisitas
        
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled ${notifications.length} reminders including H-1 Day logic`);
    }
};
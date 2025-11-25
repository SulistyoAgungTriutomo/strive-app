import { LocalNotifications } from '@capacitor/local-notifications';

const DAY_MAP: Record<string, number> = {
    'Sunday': 1, 'Monday': 2, 'Tuesday': 3, 'Wednesday': 4, 
    'Thursday': 5, 'Friday': 6, 'Saturday': 7
};

// --- 1. HABIT REMINDER ---
export const scheduleHabitReminder = async (
    habitId: string,
    habitName: string, 
    reminderTime: string, 
    frequency: string[]
) => {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') return;

    if (!reminderTime) return;

    const [targetHour, targetMinute] = reminderTime.split(':').map(Number);
    const offsets = [-60, -45, -30, -15, 0];

    if (frequency.length >= 5) {
        offsets.unshift(-1440);
    }

    const notifications = [];

    for (const dayName of frequency) {
        const dayCode = DAY_MAP[dayName];
        if (!dayCode) continue;

        for (const offset of offsets) {
            let totalMinutes = (targetHour * 60) + targetMinute + offset;
            let notifDayCode = dayCode;

            while (totalMinutes < 0) {
                totalMinutes += (24 * 60);
                notifDayCode = notifDayCode - 1;
                if (notifDayCode < 1) notifDayCode = 7;
            }

            const notifHour = Math.floor(totalMinutes / 60);
            const notifMinute = totalMinutes % 60;
            const notifId = Math.floor(Math.random() * 100000000);

            // Di sini 'let' digunakan karena title BERUBAH tergantung offset
            let title = `Strive Reminder: ${habitName}`;
            let body = "";

            if (offset === 0) {
                body = `⏰ It's time! Let's complete ${habitName} now! 🔥`;
                title = `DO IT NOW: ${habitName}`;
            } else if (offset === -1440) {
                body = `📅 Heads up! Tomorrow is a streak day for ${habitName}.`;
                title = `Upcoming: ${habitName}`;
            } else {
                body = `⏳ ${habitName} is starting in ${Math.abs(offset)} mins.`;
            }

            notifications.push({
                id: notifId,
                title: title,
                body: body,
                schedule: {
                    on: { weekday: notifDayCode, hour: notifHour, minute: notifMinute },
                    allowWhileIdle: true,
                },
                extra: { habitId }
            });
        }
    }

    if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled habit reminders for ${habitName}`);
    }
};

// --- 2. CLASS REMINDER (Yang Error Tadi) ---
export const scheduleClassReminder = async (
    className: string,
    day: string,
    startTime: string,
    location: string
) => {
    const permission = await LocalNotifications.requestPermissions();
    if (permission.display !== 'granted') return;

    const [targetHour, targetMinute] = startTime.split(':').map(Number);
    const dayCode = DAY_MAP[day];
    if (!dayCode) return;

    const offsets = [-60, -45, -30, -15, -10, 0];
    const notifications = [];

    for (const offset of offsets) {
        let totalMinutes = (targetHour * 60) + targetMinute + offset;
        let notifDayCode = dayCode;

        while (totalMinutes < 0) {
            totalMinutes += (24 * 60);
            notifDayCode = notifDayCode - 1;
            if (notifDayCode < 1) notifDayCode = 7;
        }

        const notifHour = Math.floor(totalMinutes / 60);
        const notifMinute = totalMinutes % 60;
        const notifId = Math.floor(Math.random() * 100000000);

        // PERBAIKAN: Gunakan 'const' karena title tidak berubah di bawah
        const title = `📚 Class: ${className}`;
        let body = "";

        if (offset === 0) {
            body = `🔔 Class is starting NOW at ${location}! Good luck!`;
        } else {
            body = `⏳ ${className} starts in ${Math.abs(offset)} mins at ${location}.`;
        }

        notifications.push({
            id: notifId,
            title: title,
            body: body,
            schedule: {
                on: { weekday: notifDayCode, hour: notifHour, minute: notifMinute },
                allowWhileIdle: true,
            }
        });
    }

    if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled class reminders for ${className}`);
    }
};
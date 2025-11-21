import cron from 'node-cron';
import { checkAndSendInactivityEmails } from '../services/emailService';

/**
 * Schedule daily check for inactive users (runs at 9:00 AM every day)
 */
export const scheduleInactivityEmailJob = () => {
    // Run every day at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('⏰ Running scheduled inactivity check (9:00 AM)...');
        await checkAndSendInactivityEmails();
    }, {
        timezone: process.env.TZ || 'Africa/Lagos'
    });

    console.log('✅ Inactivity email job scheduled (9:00 AM daily)');
};

/**
 * Run inactivity check immediately (for testing)
 */
export const runInactivityCheckNow = async () => {
    console.log('🚀 Running immediate inactivity check...');
    await checkAndSendInactivityEmails();
};

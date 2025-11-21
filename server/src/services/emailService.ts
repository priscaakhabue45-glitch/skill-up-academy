import { sendEmail } from '../config/resend';
import { getWelcomeEmailTemplate, getInactivityEmailTemplate } from '../templates/emailTemplates';
import { supabase } from '../config/supabase';

export interface EmailLog {
    user_id: string;
    email_type: string;
    sent_at: string;
    status: string;
    error_message?: string;
}

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (userEmail: string, userName: string, userId: string) => {
    try {
        const subject = `Welcome to Skill Up Academy, ${userName}! 🎉`;
        const html = getWelcomeEmailTemplate(userName);

        const result = await sendEmail(userEmail, subject, html);

        // Log the email in database
        await supabase.from('email_logs').insert({
            user_id: userId,
            email_type: 'welcome',
            sent_at: new Date().toISOString(),
            status: result.success ? 'sent' : 'failed',
            error_message: result.success ? null : JSON.stringify(result.error)
        });

        console.log(`Welcome email sent to ${userEmail}:`, result.success ? 'Success' : 'Failed');
        return result;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error };
    }
};

/**
 * Send inactivity reminder email
 */
export const sendInactivityEmail = async (
    userEmail: string,
    userName: string,
    userId: string,
    daysSinceLastActivity: number
) => {
    try {
        let subject = '';
        if (daysSinceLastActivity === 3) {
            subject = `${userName}, we miss you! 👋`;
        } else if (daysSinceLastActivity === 7) {
            subject = `Don't lose momentum, ${userName}! ⏰`;
        } else if (daysSinceLastActivity === 14) {
            subject = `Last chance to get back on track, ${userName}! 🔥`;
        }

        const html = getInactivityEmailTemplate(userName, daysSinceLastActivity);
        const result = await sendEmail(userEmail, subject, html);

        // Log the email in database
        await supabase.from('email_logs').insert({
            user_id: userId,
            email_type: `inactivity_${daysSinceLastActivity}d`,
            sent_at: new Date().toISOString(),
            status: result.success ? 'sent' : 'failed',
            error_message: result.success ? null : JSON.stringify(result.error)
        });

        console.log(`Inactivity email (${daysSinceLastActivity}d) sent to ${userEmail}:`, result.success ? 'Success' : 'Failed');
        return result;
    } catch (error) {
        console.error('Error sending inactivity email:', error);
        return { success: false, error };
    }
};

/**
 * Check for inactive users and send reminder emails
 */
export const checkAndSendInactivityEmails = async () => {
    try {
        console.log('🔍 Checking for inactive users...');

        // Get all student users
        const { data: students, error: studentsError } = await supabase
            .from('profiles')
            .select('id, email, full_name, last_login')
            .eq('role', 'student');

        if (studentsError) throw studentsError;
        if (!students || students.length === 0) {
            console.log('No students found');
            return;
        }

        const now = new Date();
        const inactivityThresholds = [3, 7, 14]; // days

        for (const student of students) {
            if (!student.last_login) continue;

            const lastLoginDate = new Date(student.last_login);
            const daysSinceLastActivity = Math.floor(
                (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Check if user has been inactive for exactly 3, 7, or 14 days
            for (const threshold of inactivityThresholds) {
                if (daysSinceLastActivity === threshold) {
                    // Check if we've already sent this specific reminder
                    const { data: existingLogs } = await supabase
                        .from('email_logs')
                        .select('*')
                        .eq('user_id', student.id)
                        .eq('email_type', `inactivity_${threshold}d`)
                        .gte('sent_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()); // Within last 24 hours

                    if (!existingLogs || existingLogs.length === 0) {
                        // Send reminder email
                        await sendInactivityEmail(
                            student.email,
                            student.full_name,
                            student.id,
                            threshold
                        );
                    } else {
                        console.log(`Already sent ${threshold}d reminder to ${student.email} recently`);
                    }
                }
            }
        }

        console.log('✅ Inactivity check completed');
    } catch (error) {
        console.error('Error checking inactive users:', error);
    }
};

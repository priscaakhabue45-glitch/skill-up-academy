import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.RESEND_API_KEY) {
    throw new Error('Missing Resend API key');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
    to: string | string[],
    subject: string,
    html: string
) => {
    try {
        const data = await resend.emails.send({
            from: 'Skill Up Academy <onboarding@skillupacademy.com>',
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
};

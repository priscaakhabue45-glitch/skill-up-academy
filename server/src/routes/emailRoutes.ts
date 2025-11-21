import express from 'express';
import { sendWelcomeEmail } from '../services/emailService';
import { runInactivityCheckNow } from '../jobs/inactivityEmailJob';

const router = express.Router();

/**
 * POST /api/email/welcome
 * Send welcome email to new user
 */
router.post('/welcome', async (req, res) => {
    try {
        const { userEmail, userName, userId } = req.body;

        if (!userEmail || !userName || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userEmail, userName, userId'
            });
        }

        const result = await sendWelcomeEmail(userEmail, userName, userId);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: 'Welcome email sent successfully'
            });
        } else {
            return res.status(500).json({
                success: false,
                error: 'Failed to send welcome email',
                details: result.error
            });
        }
    } catch (error) {
        console.error('Error in welcome email endpoint:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/email/check-inactivity
 * Manually trigger inactivity check (for testing)
 */
router.post('/check-inactivity', async (req, res) => {
    try {
        await runInactivityCheckNow();
        return res.status(200).json({
            success: true,
            message: 'Inactivity check completed'
        });
    } catch (error) {
        console.error('Error in inactivity check endpoint:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;

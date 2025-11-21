# Email Notification System - Setup Guide

## Overview
Your Skill Up Academy now has a complete email notification system using Resend that sends:
1. **Welcome emails** when users sign up
2. **Re-engagement emails** for inactive students (3 days, 1 week, 2 weeks)

## Setup Instructions

### 1. Get Your Resend API Key
1. Go to [resend.com](https://resend.com) and create an account
2. Verify your domain (or use their test domain for development)
3. Generate an API key from your dashboard
4. Copy the API key

### 2. Configure Environment Variables
Update your `server/.env` file with your Resend API key:

```env
RESEND_API_KEY=re_your_actual_api_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173
TZ=Africa/Lagos
```

### 3. Start the Backend Server
```bash
cd server
npm install  # if you haven't already
npm run dev
```

The server will start and automatically:
- ✅ Initialize the email notification system
- ✅ Schedule the daily inactivity check (runs at 9:00 AM every day)

### 4. Test Welcome Email
1. Go to `http://localhost:5173/register`
2. Create a new account
3. Check your email inbox for the welcome email

### 5. Test Inactivity Emails (Manual Trigger)
You can manually trigger the inactivity check using:

```bash
curl -X POST http://localhost:5000/api/email/check-inactivity
```

Or use Postman/Thunder Client to test.

## Features

### Welcome Email 🎉
- Sent immediately after user registration
- Beautiful HTML template with:
  - Personalized greeting
  - Course features overview
  - Call-to-action button to start learning
  - Branded design matching your app

### Inactivity Reminder Emails
- **3-Day Reminder** 👋 - "We Miss You!"
- **7-Day Reminder** ⏰ - "A Week Has Passed!"  
- **14-Day Reminder** 🔥 - "Your Goals Are Waiting!"

Each email includes:
- Personalized message
- Days since last activity counter
- Quick win suggestions
- Call-to-action button

### Automatic Scheduling
The system runs daily at 9:00 AM (configurable via TZ environment variable) and:
1. Checks all student users
2. Calculates days since last login
3. Sends appropriate reminder emails
4. Logs all emails in the database (`email_logs` table)

## Database Logging
All emails are logged in the `email_logs` table:
- `user_id` - Who received the email
- `email_type` - Type (welcome, inactivity_3d, inactivity_7d, inactivity_14d)
- `sent_at` - Timestamp
- `status` - sent/failed
- `error_message` - If failed, why

## API Endpoints

### Send Welcome Email
```bash
POST http://localhost:5000/api/email/welcome
Content-Type: application/json

{
  "userEmail": "student@example.com",
  "userName": "John Doe",
  "userId": "uuid-here"
}
```

### Trigger Inactivity Check
```bash
POST http://localhost:5000/api/email/check-inactivity
```

## Customization

### Change Email Sending Time
Edit `server/src/jobs/inactivityEmailJob.ts`:
```typescript
// Change '0 9 * * *' to your desired time (cron format)
cron.schedule('0 9 * * *', async () => {
    // Runs at 9:00 AM daily
});
```

### Customize Email Templates
Edit `server/src/templates/emailTemplates.ts` to modify:
- Email HTML design
- Colors and branding
- Content and messaging

### Change Inactivity  Thresholds
Edit `server/src/services/emailService.ts`:
```typescript
const inactivityThresholds = [3, 7, 14]; // Change to [2, 5, 10] etc.
```

## Troubleshooting

### Emails Not Sending
1. ✅ Check Resend API key is correct in `.env`
2. ✅ Verify your domain is verified in Resend dashboard
3. ✅ Check server logs for errors
4. ✅ Ensure backend server is running on port 5000

### Welcome Email Not Triggering
1. ✅ Check browser console for errors
2. ✅ Verify backend endpoint is accessible
3. ✅ Check that profile was created successfully

### Inactivity Emails Not Sending
1. ✅ Verify the cron job is scheduled (check server startup logs)
2. ✅ Ensure `last_login` is being updated in profiles table
3. ✅ Check `email_logs` table for sending attempts

## Production Deployment

### Important Changes for Production:
1. Update `FRONTEND_URL` in server `.env` to your production URL
2. Change email sender in `server/src/config/resend.ts` to your verified domain
3. Set up proper timezone in `TZ` environment variable
4. Consider using a job queue service for more reliable email delivery
5. Monitor `email_logs` table for failed sends

## Email Preview

### Welcome Email Features:
- 🎓 Branded header with gradient
- 👋 Personalized greeting
- 📋 Feature showcase
- 🎯 Clear call-to-action
- 📧 Professional footer

### Inactivity Email Features:
- 🎨 Eye-catching emoji based on urgency
- 📊 Days since activity counter
- ✅ Quick action suggestions
- 🚀 Re-engagement CTA

## Support
If you encounter any issues, check:
1. Server logs (`npm run dev` output)
2. Browser console
3. `email_logs` table in Supabase
4. Resend dashboard for delivery status

// Email Templates for Skill Up Academy
export const getWelcomeEmailTemplate = (userName: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #428dff 0%, #2c6dd6 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 24px;
            color: #111827;
            margin-bottom: 20px;
        }
        .message {
            color: #4b5563;
            line-height: 1.6;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #428dff 0%, #2c6dd6 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }
        .features {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .feature-item {
            margin: 10px 0;
            display: flex;
            align-items: center;
        }
        .feature-icon {
            font-size: 24px;
            margin-right: 12px;
        }
        .footer {
            background: #f3f4f6;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Skill Up Academy</h1>
        </div>
        <div class="content">
            <div class="greeting">Welcome, ${userName}! 🎉</div>
            <p class="message">
                We're thrilled to have you join Skill Up Academy! You've just taken the first step towards 
                transforming your career and unlocking your full potential.
            </p>
            <p class="message">
                Your learning journey starts now, and we're here to support you every step of the way.
            </p>
            
            <div class="features">
                <h3 style="color: #111827; margin-top: 0;">What's Next?</h3>
                <div class="feature-item">
                    <span class="feature-icon">📚</span>
                    <span>Access 14 weeks of comprehensive course modules</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🎥</span>
                    <span>Watch engaging video lessons at your own pace</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📝</span>
                    <span>Complete assignments to reinforce your learning</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">👥</span>
                    <span>Join our vibrant community of learners</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">✍️</span>
                    <span>Track your progress with daily accountability</span>
                </div>
            </div>

            <center>
                <a href="${process.env.FRONTEND_URL}/student" class="cta-button">
                    Start Learning Now →
                </a>
            </center>

            <p class="message" style="margin-top: 30px;">
                <strong>Pro Tip:</strong> Set aside dedicated time each day for your learning. 
                Consistency is key to success!
            </p>
        </div>
        <div class="footer">
            <p>Skill Up Academy | Transforming Lives Through Education</p>
            <p style="margin-top: 10px; font-size: 12px;">
                If you have any questions, reply to this email or reach out to our support team.
            </p>
        </div>
    </div>
</body>
</html>
`;

export const getInactivityEmailTemplate = (userName: string, daysSinceLastActivity: number) => {
    const isFirstReminder = daysSinceLastActivity === 3;
    const isSecondReminder = daysSinceLastActivity === 7;
    const isFinalReminder = daysSinceLastActivity === 14;

    let headline = '';
    let message = '';
    let emoji = '';

    if (isFirstReminder) {
        emoji = '👋';
        headline = 'We Miss You!';
        message = `It's been ${daysSinceLastActivity} days since we last saw you. Your learning journey is waiting!`;
    } else if (isSecondReminder) {
        emoji = '⏰';
        headline = 'A Week Has Passed!';
        message = `It's been a full week! Don't let your momentum slip. Just 15 minutes today can make a huge difference.`;
    } else if (isFinalReminder) {
        emoji = '🔥';
        headline = 'Your Goals Are Waiting!';
        message = `Two weeks without progress! Remember why you started. Let's get back on track together.`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #ffa800 0%, #d68d00 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 40px 30px;
        }
        .emoji {
            font-size: 48px;
            text-align: center;
            margin-bottom: 20px;
        }
        .headline {
            font-size: 24px;
            color: #111827;
            text-align: center;
            margin-bottom: 20px;
        }
        .message {
            color: #4b5563;
            line-height: 1.6;
            font-size: 16px;
            margin-bottom: 20px;
            text-align: center;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ffa800 0%, #d68d00 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }
        .stats-box {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .stat-number {
            font-size: 36px;
            font-weight: bold;
            color: #428dff;
        }
        .stat-label {
            color: #6b7280;
            font-size: 14px;
        }
        .footer {
            background: #f3f4f6;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 Skill Up Academy</h1>
        </div>
        <div class="content">
            <div class="emoji">${emoji}</div>
            <div class="headline">${headline}</div>
            <p class="message">
                Hi ${userName},<br><br>
                ${message}
            </p>
            
            <div class="stats-box">
                <div class="stat-number">${daysSinceLastActivity}</div>
                <div class="stat-label">Days Since Last Activity</div>
            </div>

            <p class="message">
                <strong>Quick Wins to Get Back on Track:</strong><br>
                ✅ Watch one 15-minute video today<br>
                ✅ Log your daily accountability<br>
                ✅ Join the community discussion
            </p>

            <center>
                <a href="${process.env.FRONTEND_URL}/student/modules" class="cta-button">
                    Resume Learning →
                </a>
            </center>

            <p class="message" style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
                Remember: Every expert was once a beginner who refused to give up. 
                You've got this! 💪
            </p>
        </div>
        <div class="footer">
            <p>Skill Up Academy | We're Here to Support You</p>
            <p style="margin-top: 10px; font-size: 12px;">
                Need help getting back on track? Reply to this email anytime.
            </p>
        </div>
    </div>
</body>
</html>
`;
};

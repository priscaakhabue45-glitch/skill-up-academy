import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './routes/emailRoutes';
import { scheduleInactivityEmailJob } from './jobs/inactivityEmailJob';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.send('Skill Up Academy API is running');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email routes
app.use('/api/email', emailRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);

    // Schedule the inactivity email job
    scheduleInactivityEmailJob();
    console.log('📧 Email notification system initialized');
});

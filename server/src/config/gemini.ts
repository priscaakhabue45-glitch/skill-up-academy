import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing Gemini API key');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiModel = () => {
    return genAI.getGenerativeModel({ model: 'gemini-pro' });
};

export const chatWithGemini = async (message: string, conversationHistory: any[] = []) => {
    try {
        const model = getGeminiModel();

        const systemPrompt = `You are a helpful AI assistant for Skill Up Academy, an online learning platform. 
Your role is to help students with:
- Navigating the platform (how to access modules, lectures, quizzes)
- Understanding how to use features (daily logging, progress tracking)
- Onboarding and getting started
- General platform support questions

You should NOT:
- Provide answers to quiz questions
- Share lecture content
- Make promises about course content you don't have access to

Be friendly, concise, and helpful. If you don't know something, direct them to contact their instructor or admin.`;

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood! I\'m here to help students navigate and use Skill Up Academy effectively. How can I assist you today?' }],
                },
                ...conversationHistory,
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to get AI response');
    }
};

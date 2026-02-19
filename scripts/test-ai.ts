import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

async function testAI() {
    try {
        console.log('Testing OpenRouter integration...');

        const apiKey = process.env.VITE_OPENROUTER_API_KEY; // Read from process.env via dotenv

        if (!apiKey) {
            console.error('❌ VITE_OPENROUTER_API_KEY is missing in .env');
            return;
        }

        const openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey: apiKey,
            headers: {
                "HTTP-Referer": process.env.VITE_SITE_URL || "http://localhost:5173",
                "X-Title": "Make Friends & Socialize Test Script",
            }
        });

        const model = openrouter('anthropic/claude-3-haiku');

        console.log('Sending request to OpenRouter...');
        const { text } = await generateText({
            model,
            prompt: 'Say "Hello, World!" and nothing else.',
        });

        console.log('Response:', text);

        if (text.includes('Hello, World!')) {
            console.log('✅ Integration successful!');
        } else {
            console.log('⚠️ Unexpected response.');
        }
    } catch (error) {
        console.error('❌ Error testing AI:', error);
    }
}

testAI();

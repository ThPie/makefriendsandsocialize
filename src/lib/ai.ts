import { createOpenAI } from '@ai-sdk/openai';

// Initialize OpenRouter provider
// detailed documentation: https://sdk.vercel.ai/providers/ai-sdk-providers/openrouter
export const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    headers: {
        "HTTP-Referer": import.meta.env.VITE_SITE_URL || "http://localhost:5173", // Optional, for including your app on openrouter.ai rankings
        "X-Title": "Make Friends & Socialize", // Optional, shows in rankings on openrouter.ai
    }
});

// Helper to get a model instance
export const getModel = (modelName: string = 'anthropic/claude-3-5-sonnet') => {
    return openrouter(modelName);
};

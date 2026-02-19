import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function analyzeDesign() {
    try {
        console.log('🔍 Gathering design files...');

        const filesToAnalyze = [
            'tailwind.config.ts',
            'src/index.css',
            'src/App.tsx',
            'src/components/layout/Layout.tsx',
            'src/components/layout/Header.tsx',
            'src/pages/HomePage.tsx',
            'src/pages/MembershipPage.tsx'
        ];

        let context = 'Here are the key design files for my React application:\n\n';

        for (const file of filesToAnalyze) {
            const filePath = path.join(projectRoot, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                context += `--- START FILE: ${file} ---\n${content}\n--- END FILE: ${file} ---\n\n`;
            } else {
                console.warn(`⚠️ File not found: ${file}`);
            }
        }

        console.log('🤖 Sending context to Claude via OpenRouter...');

        const apiKey = process.env.VITE_OPENROUTER_API_KEY;
        if (!apiKey) throw new Error('Missing VITE_OPENROUTER_API_KEY');

        const openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey,
            headers: {
                "HTTP-Referer": process.env.VITE_SITE_URL || "http://localhost:5173",
                "X-Title": "Make Friends & Socialize Design Analysis",
            }
        });

        const model = openrouter('anthropic/claude-3-5-sonnet'); // Using 3.5 Sonnet for good balance of cost/quality

        const prompt = `
      You are an expert UI/UX Designer and Frontend Engineer. 
      I am building a premium social networking web application called "Make Friends & Socialize".
      
      Please analyze the provided code files, specifically focusing on:
      1. **Visual Design System**: Review 'tailwind.config.ts' and 'index.css'. Are the color palettes, typography, and spacing consistent and premium?
      2. **Component Structure**: Look at the layout and pages. Are we using semantic HTML? Is the structure logical?
      3. **UX & Accessibility**: Are there obvious usability or accessibility gaps?
      4. **Code Quality**: Are there CSS/Tailwind best practices we are missing?

      Provide a concise summary of your findings and a list of 3-5 high-impact recommendations to improve the design and code quality.
      Focus on actionable advice to make the app feel more "luxury" and "polished" as per the brand identity.
      
      ${context}
    `;

        const { text } = await generateText({
            model,
            prompt,
        });

        console.log('\n✨ *** DESIGN ANALYSIS RESULTS *** ✨\n');
        console.log(text);
        console.log('\n----------------------------------------\n');

    } catch (error) {
        console.error('❌ Error analyzing design:', error);
    }
}

analyzeDesign();

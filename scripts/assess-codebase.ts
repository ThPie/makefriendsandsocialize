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
const reportDir = path.join(projectRoot, 'assessment_reports');

// Ensure report directory exists
if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir);
}

const modules = {
    core: {
        name: 'Core Configuration & Infrastructure',
        files: [
            'vite.config.ts',
            'tailwind.config.ts',
            'tsconfig.json',
            'package.json',
            'src/main.tsx',
            'src/App.tsx',
            'src/index.css',
            'src/lib/utils.ts',
            'src/lib/sentry.ts'
        ],
        focus: 'Architecture, dependency health, build configuration, global styles, and error handling.'
    },
    auth: {
        name: 'Authentication & Security',
        files: [
            'src/contexts/AuthContext.tsx',
            'src/hooks/useAuthRateLimit.ts',
            'src/hooks/useSessionManager.ts',
            'src/hooks/useSensitiveDataEncryption.ts',
            'src/lib/auth-redirect.ts',
            'src/integrations/supabase/client.ts',
            'src/pages/AuthPage.tsx'
        ],
        focus: 'Security vulnerabilities, authentication flow, session management, data protection, and rate limiting.'
    },
    ui_design: {
        name: 'Design System & UI Components',
        files: [
            'src/components/ui/button.tsx',
            'src/components/ui/card.tsx',
            'src/components/ui/input.tsx',
            'src/components/layout/Header.tsx',
            'src/components/layout/Footer.tsx',
            'src/components/layout/Layout.tsx',
            'src/components/ui/theme-toggle.tsx'
        ],
        focus: 'Visual consistency, accessibility (a11y), Tailwind usage, component reusability, and responsiveness.'
    },
    portal: {
        name: 'User Portal & Features',
        files: [
            'src/pages/portal/PortalDashboard.tsx',
            'src/pages/portal/PortalProfile.tsx',
            'src/components/portal/EventCard.tsx',
            'src/components/portal/PortalLayout.tsx',
            'src/hooks/useSubscription.ts'
        ],
        focus: 'User experience (UX), business logic, state management, and performance in the main application area.'
    },
    marketing: {
        name: 'Marketing & Landing Pages',
        files: [
            'src/pages/HomePage.tsx',
            'src/components/home/Hero.tsx',
            'src/components/home/EthosSection.tsx',
            'src/pages/MembershipPage.tsx',
            'src/components/home/PricingSection.tsx'
        ],
        focus: 'SEO best practices, conversion optimization, visual impact, and loading performance (Core Web Vitals).'
    }
};

async function assessModule(moduleKey: string, config: any) {
    try {
        console.log(`\n🔍 Assessing module: ${config.name}...`);

        let context = `Module: ${config.name}\nFocus Area: ${config.focus}\n\nFile Contents:\n`;

        for (const file of config.files) {
            const filePath = path.join(projectRoot, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                context += `\n--- START FILE: ${file} ---\n${content}\n--- END FILE: ${file} ---\n`;
            } else {
                console.warn(`⚠️ File not found: ${file}`);
            }
        }

        const apiKey = process.env.VITE_OPENROUTER_API_KEY;
        if (!apiKey) throw new Error('Missing VITE_OPENROUTER_API_KEY');

        const openrouter = createOpenAI({
            baseURL: 'https://openrouter.ai/api/v1',
            apiKey,
            headers: {
                "HTTP-Referer": process.env.VITE_SITE_URL || "http://localhost:5173",
                "X-Title": "Make Friends & Socialize Assessment",
            }
        });

        // List of models to try in order of preference
        const modelsToTry = [
            'anthropic/claude-3.5-sonnet',
            'anthropic/claude-3.5-sonnet:beta',
            'anthropic/claude-3-opus',
            'openai/gpt-4o'
        ];

        let text = null;
        let usedModel = '';

        for (const modelId of modelsToTry) {
            try {
                console.log(`   Trying model: ${modelId}...`);
                const model = openrouter(modelId);

                const prompt = `
            You are a Senior Principal Engineer and security expert performing a comprehensive code audit.
            
            Analyze the provided code module ('${config.name}') with a specific focus on: ${config.focus}.
            
            Output your report in the following MARKDOWN format:
            
            ## ${config.name} Assessment
            
            ### 1. Executive Summary
            (A brief 2-3 sentence overview of the module's health)
            
            ### 2. Critical Issues (Security/Bugs)
            (List any P0/P1 issues that need immediate attention. If none, explicitly state "No critical issues found.")
            
            ### 3. Improvements & Refactoring
            (Bulleted list of actionable code improvements, performance optimizations, or pattern corrections)
            
            ### 4. Design & UX Feedback (if applicable)
            (Specific UI/UX critiques or accessibility gaps)
            
            ### 5. Code Quality Rating (1-10)
            (Justify the score briefly)
            
            ---
            
            ${context}
            `;

                const result = await generateText({
                    model,
                    prompt,
                });

                text = result.text;
                usedModel = modelId;
                console.log(`   ✅ Success with ${modelId}`);
                break; // Stop if successful
            } catch (e: any) {
                console.warn(`   ⚠️ Failed with ${modelId}: ${e.message?.slice(0, 100)}...`);
                // Continue to next model
            }
        }

        if (!text) {
            throw new Error('All models failed to generate a response.');
        }

        const reportPath = path.join(reportDir, `${moduleKey}_report.md`);
        fs.writeFileSync(reportPath, text);
        console.log(`✅ Report generated: ${reportPath}`);
        return text;

    } catch (error) {
        console.error(`❌ Error assessing ${moduleKey}:`, error);
        return null;
    }
}

async function runAllAssessments() {
    console.log('🚀 Starting Comprehensive Codebase Assessment...');

    for (const [key, config] of Object.entries(modules)) {
        await assessModule(key, config);
    }

    console.log('\n✨ All assessments complete. Check the "assessment_reports" directory.');
}

runAllAssessments();

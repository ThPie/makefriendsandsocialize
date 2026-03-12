import { supabase } from '@/integrations/supabase/client';

/**
 * Call the server-side AI proxy edge function.
 * The OpenRouter API key is kept server-side — never exposed to the browser.
 */
export async function generateText({
    model,
    prompt,
    maxTokens,
}: {
    model?: string;
    prompt: string;
    maxTokens?: number;
}): Promise<{ text: string }> {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await supabase.functions.invoke('ai-proxy', {
        body: { model, prompt, maxTokens },
    });

    if (response.error) {
        throw new Error(response.error.message || 'AI request failed');
    }

    return { text: response.data?.text || '' };
}

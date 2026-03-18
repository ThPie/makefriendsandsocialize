
const ALLOWED_HEADERS = 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version';

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': ALLOWED_HEADERS,
};

export const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080',
    'https://makefriendsandsocialize.com',
    'https://www.makefriendsandsocialize.com',
    'https://makefriendsandsocialize.ca',
    'https://www.makefriendsandsocialize.ca',
    'https://makefriendsandsocializecom.lovable.app',
    'https://id-preview--c4cc7ef9-b4c3-4c97-8cd0-fc758a50847e.lovable.app',
];

export const getCorsHeaders = (req: Request) => {
    const origin = req.headers.get('origin');
    if (origin && allowedOrigins.some(o => origin === o || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com'))) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': ALLOWED_HEADERS,
        };
    }

    return {
        'Access-Control-Allow-Origin': 'https://makefriendsandsocialize.com',
        'Access-Control-Allow-Headers': ALLOWED_HEADERS,
    };
};

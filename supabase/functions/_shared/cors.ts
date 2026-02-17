
export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const allowedOrigins = [
    'http://localhost:3000',
    'https://makefriendsandsocialize.com',
    'https://www.makefriendsandsocialize.com',
];

export const getCorsHeaders = (req: Request) => {
    const origin = req.headers.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        };
    }

    return {
        'Access-Control-Allow-Origin': 'https://makefriendsandsocialize.com',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
};

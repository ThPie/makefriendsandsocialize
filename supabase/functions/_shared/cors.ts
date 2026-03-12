
export const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://makefriendsandsocialize.com',
    'https://www.makefriendsandsocialize.com',
];

export const getCorsHeaders = (req: Request) => {
    const origin = req.headers.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
        };
    }

    return {
        'Access-Control-Allow-Origin': 'https://makefriendsandsocialize.com',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
};

export const getApiUrl = () => {
    let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    
    // Remove trailing slash if present
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }
    
    // Append /api if it's not present at the end
    // This handles cases where the user sets the env var to the root domain or the full api path
    if (!baseUrl.endsWith('/api')) {
        baseUrl += '/api';
    }
    
    return baseUrl;
};

export const API_URL = getApiUrl();

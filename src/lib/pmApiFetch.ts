export async function pmApiFetch(
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const fullPath = `/api/password-generator${endpoint}`;
    const url = `${baseUrl}${fullPath}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `Request failed with status ${response.status}` }));
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return null; 

    } catch (error) {
        console.error(`Password Manager API Fetch Error for URL: ${url}`, error);
        throw error;
    }
}
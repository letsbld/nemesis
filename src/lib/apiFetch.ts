export async function apiFetch(endpoint: string, options?: RequestInit): Promise<any> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const url = endpoint.startsWith('/') ? `${apiUrl}${endpoint}` : `${apiUrl}/${endpoint}`;
    console.log(url, 'Urll here');
    const response = await fetch(url, options);

    let data;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        throw data || { error: 'API request failed' };
    }
    return data;
}

import { apiFetch } from '@/lib/apiFetch';

export type OidcClient = {
    id?: string;
    client_id?: string;
    client_name?: string;
    client_secret?: string;
    redirect_uris?: string[];
    post_logout_redirect_uris?: string[];
    grant_types?: string[];
    response_types?: string[];
    scope?: string;
    token_endpoint_auth_method?: 'none' | 'client_secret_post' | 'client_secret_basic';
    created_at?: string;
    updated_at?: string;
};

// NOTE: Adjust these endpoint paths if your backend differs.
const base = '/oidc/clients';

export async function listOidcClients(): Promise<OidcClient[]> {
    const res = await apiFetch(base, { method: 'GET', credentials: 'include' });
    // Handle response format: { success: true, count: 5, clients: [...] }
    if (res?.clients && Array.isArray(res.clients)) {
        return res.clients;
    }
    return Array.isArray(res) ? res : res?.items || [];
}

export async function createOidcClient(payload: OidcClient): Promise<OidcClient> {
    return apiFetch('/oidc/client/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

export async function deleteOidcClient(id: string): Promise<{ success: boolean } | any> {
    return apiFetch(`${base}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
    });
}

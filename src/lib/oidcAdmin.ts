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
    audience?: string[];
    owner?: string;
    policy_uri?: string;
    allowed_cors_origins?: string[];
    tos_uri?: string;
    client_uri?: string;
    logo_uri?: string;
    contacts?: string[] | null;
    client_secret_expires_at?: number;
    subject_type?: string;
    jwks?: Record<string, any>;
    token_endpoint_auth_method?: 'none' | 'client_secret_post' | 'client_secret_basic';
    userinfo_signed_response_alg?: string;
    created_at?: string;
    updated_at?: string;
    metadata?: Record<string, any>;
    registration_access_token?: string;
    registration_client_uri?: string;
    skip_consent?: boolean;
    skip_logout_consent?: boolean | null;
    // various lifespan overrides (nullable numbers)
    authorization_code_grant_access_token_lifespan?: number | null;
    authorization_code_grant_id_token_lifespan?: number | null;
    authorization_code_grant_refresh_token_lifespan?: number | null;
    client_credentials_grant_access_token_lifespan?: number | null;
    implicit_grant_access_token_lifespan?: number | null;
    implicit_grant_id_token_lifespan?: number | null;
    jwt_bearer_grant_access_token_lifespan?: number | null;
    refresh_token_grant_id_token_lifespan?: number | null;
    refresh_token_grant_access_token_lifespan?: number | null;
    refresh_token_grant_refresh_token_lifespan?: number | null;
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

export async function createOidcClient(payload: OidcClient): Promise<any> {
    return apiFetch('/oidc/client/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
}

export async function getOidcClient(id: string): Promise<any> {
    return apiFetch(`${base}/${encodeURIComponent(id)}`, {
        method: 'GET',
        credentials: 'include',
    });
}

export async function deleteOidcClient(id: string): Promise<{ success: boolean } | any> {
    return apiFetch(`${base}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
    });
}

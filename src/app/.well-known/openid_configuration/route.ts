import { NextResponse } from 'next/server';

export async function GET() {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const discovery = {
        issuer: baseUrl,
        authorization_endpoint: `${baseUrl}/api/oidc/auth`,
        token_endpoint: `${baseUrl}/api/oidc/token`,
        userinfo_endpoint: `${baseUrl}/api/oidc/userinfo`,
        jwks_uri: `${baseUrl}/api/oidc/jwks`,
        registration_endpoint: `${baseUrl}/api/oidc/register`,
        scopes_supported: ['openid', 'profile', 'email'],
        response_types_supported: [
            'code',
            'id_token',
            'token',
            'code id_token',
            'code token',
            'id_token token',
            'code id_token token',
        ],
        response_modes_supported: ['query', 'fragment', 'form_post'],
        grant_types_supported: ['authorization_code', 'implicit', 'refresh_token'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        token_endpoint_auth_methods_supported: ['client_secret_post', 'client_secret_basic'],
        claims_supported: [
            'sub',
            'iss',
            'aud',
            'exp',
            'iat',
            'name',
            'given_name',
            'family_name',
            'email',
            'email_verified',
            'preferred_username',
        ],
    };

    return NextResponse.json(discovery, {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const scope = searchParams.get('scope');
    const state = searchParams.get('state');
    const responseType = searchParams.get('response_type');

    // Validate required parameters
    if (!clientId || !redirectUri || !responseType) {
        return NextResponse.json(
            { error: 'invalid_request', error_description: 'Missing required parameters' },
            { status: 400 }
        );
    }

    // Validate client_id against registered service providers
    const serviceProviders = await getServiceProviders();
    const sp = serviceProviders.find((sp) => sp.clientId === clientId && sp.protocol === 'OIDC');

    if (!sp) {
        return NextResponse.json(
            { error: 'unauthorized_client', error_description: 'Invalid client_id' },
            { status: 401 }
        );
    }

    if (!sp.enabled) {
        return NextResponse.json(
            { error: 'access_denied', error_description: 'Service provider is disabled' },
            { status: 403 }
        );
    }

    // Validate redirect_uri
    if (!sp.redirectUris?.includes(redirectUri)) {
        return NextResponse.json(
            { error: 'invalid_request', error_description: 'Invalid redirect_uri' },
            { status: 400 }
        );
    }

    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        // Store auth request and redirect to login
        const authRequest = {
            clientId,
            redirectUri,
            scope,
            state,
            responseType,
            timestamp: Date.now(),
        };

        // Store in session or database
        const requestId = await storeAuthRequest(authRequest);

        return NextResponse.redirect(new URL(`/auth/login?oidc_request=${requestId}`, request.url));
    }

    // User is authenticated, evaluate policies
    const policyDecision = await evaluatePolicies({
        user: session.user,
        serviceProvider: sp,
        clientId,
        scopes: scope?.split(' ') || [],
    });

    if (policyDecision.decision === 'deny') {
        const errorUrl = new URL(redirectUri);
        errorUrl.searchParams.set('error', 'access_denied');
        errorUrl.searchParams.set(
            'error_description',
            policyDecision.reason || 'Access denied by policy'
        );
        if (state) errorUrl.searchParams.set('state', state);

        return NextResponse.redirect(errorUrl);
    }

    if (policyDecision.decision === 'require_mfa') {
        // Redirect to MFA challenge
        const mfaRequest = {
            clientId,
            redirectUri,
            scope,
            state,
            responseType,
            userId: (session.user as any).id,
            timestamp: Date.now(),
        };

        const mfaRequestId = await storeMfaRequest(mfaRequest);

        return NextResponse.redirect(
            new URL(`/auth/mfa?oidc_request=${mfaRequestId}`, request.url)
        );
    }

    // Generate authorization code
    const authCode = await generateAuthorizationCode({
        clientId,
        userId: (session.user as any).id,
        scope,
        redirectUri,
    });

    // Log the access request
    await logAccessRequest({
        userId: (session.user as any).id,
        serviceProvider: sp.name,
        protocol: 'OIDC',
        clientId,
        granted: true,
        timestamp: new Date(),
    });

    // Redirect back to service provider with authorization code
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('code', authCode);
    if (state) callbackUrl.searchParams.set('state', state);

    return NextResponse.redirect(callbackUrl);
}

// Helper functions (implement these based on your data storage)
async function getServiceProviders() {
    // For testing, return hardcoded providers including test client
    return [
        {
            id: 'test-client',
            name: 'Test OIDC Client',
            protocol: 'OIDC',
            clientId: 'test-client-123',
            clientSecret: 'test-secret',
            redirectUris: [
                'http://localhost:3000/test/oidc/callback',
                'https://your-domain.com/test/oidc/callback',
            ],
            scopes: ['openid', 'profile', 'email'],
            grantTypes: ['authorization_code'],
            enabled: true,
        },
        {
            id: 'aws-oidc',
            name: 'Amazon Web Services (OIDC)',
            protocol: 'OIDC',
            clientId: 'aws-console-client',
            clientSecret: 'aws-secret',
            redirectUris: ['https://signin.aws.amazon.com/oauth/callback'],
            scopes: ['openid', 'profile', 'email'],
            grantTypes: ['authorization_code'],
            enabled: true,
        },
    ];
}

async function storeAuthRequest(request: any) {
    // For testing, store in memory (use Redis/DB in production)
    const requestId = 'req_' + Math.random().toString(36).substr(2, 9);
    // Store request with expiry (implement proper storage)
    console.log('Storing auth request:', requestId, request);
    return requestId;
}

async function storeMfaRequest(request: any) {
    // Implement: store MFA request
    return 'mfa_request_id';
}

async function evaluatePolicies(context: any) {
    // For testing, implement simple policy evaluation
    console.log('Evaluating policies for:', context);

    // Example policy: require MFA for AWS admin access
    if (context.clientId === 'aws-console-client' && context.scopes.includes('admin')) {
        return {
            decision: 'require_mfa',
            reason: 'Admin access requires MFA',
        };
    }

    // Example policy: block access during maintenance hours
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 4) {
        return {
            decision: 'deny',
            reason: 'Access denied during maintenance window (2-4 AM)',
        };
    }

    return { decision: 'allow' };
}

async function generateAuthorizationCode(params: any) {
    const authCode = 'code_' + Math.random().toString(36).substr(2, 16);

    // Store code with params for later validation (implement proper storage)
    console.log('Generated auth code:', authCode, params);

    // In production, store in Redis with expiry
    if (typeof global !== 'undefined') {
        (global as any).authCodes = (global as any).authCodes || {};
        (global as any).authCodes[authCode] = {
            ...params,
            createdAt: Date.now(),
            used: false,
        };
    }

    return authCode;
}

async function logAccessRequest(logEntry: any) {
    // Implement: log to audit system
    console.log('Access request logged:', logEntry);
}

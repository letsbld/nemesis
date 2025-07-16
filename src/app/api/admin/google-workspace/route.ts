import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/backend/lib/auth-helpers';
import { GoogleWorkspaceService } from '@/backend/domains/google-workspace/services/google-workspace.service';

export async function GET(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth();
        if (!authResult.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const domain = searchParams.get('domain');
        const maxResults = parseInt(searchParams.get('maxResults') || '100');

        switch (action) {
            case 'test-connection':
                const testResult = await GoogleWorkspaceService.testConnection();
                return NextResponse.json(testResult);

            case 'fetch-users':
                const users = await GoogleWorkspaceService.fetchWorkspaceUsers(
                    domain || undefined,
                    maxResults
                );
                return NextResponse.json({
                    success: true,
                    users,
                    totalCount: users.length,
                });

            case 'get-domain':
                const adminDomain = await GoogleWorkspaceService.getAdminDomain();
                return NextResponse.json({
                    success: true,
                    domain: adminDomain,
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: test-connection, fetch-users, or get-domain' },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('Google Workspace API error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process Google Workspace request',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verify admin authentication
        const authResult = await verifyAdminAuth();
        if (!authResult.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        const {
            action,
            domain,
            maxResults = 100,
            createDefaultPassword = true,
        } = await request.json();

        switch (action) {
            case 'import-users':
                const importResult = await GoogleWorkspaceService.importUsers(
                    domain,
                    maxResults,
                    createDefaultPassword
                );

                return NextResponse.json({
                    success: importResult.success,
                    message: `Import completed. ${importResult.importedUsers} users imported, ${importResult.skippedUsers} skipped.`,
                    details: {
                        totalUsers: importResult.totalUsers,
                        importedUsers: importResult.importedUsers,
                        skippedUsers: importResult.skippedUsers,
                        errors: importResult.errors,
                    },
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: import-users' },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('Google Workspace import error:', error);
        return NextResponse.json(
            {
                error: 'Failed to import users from Google Workspace',
                details: error.message,
            },
            { status: 500 }
        );
    }
}

import { google } from 'googleapis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/services/auth.service';
import { AppDataSource } from '../../../shared/database/typeorm';
import { Admin } from '../../auth/entities/Admin.entity';

interface GoogleWorkspaceUser {
    id: string;
    primaryEmail: string;
    name: {
        familyName: string;
        givenName: string;
        fullName: string;
    };
    orgUnitPath: string;
    suspended: boolean;
    archived: boolean;
    isAdmin?: boolean;
    isDelegatedAdmin?: boolean;
    lastLoginTime?: string;
    creationTime: string;
    phones?: Array<{
        value: string;
        type: string;
    }>;
    organizations?: Array<{
        name: string;
        title: string;
        department: string;
        costCenter?: string;
    }>;
}

interface ImportResult {
    success: boolean;
    totalUsers: number;
    importedUsers: number;
    skippedUsers: number;
    errors: string[];
    users?: GoogleWorkspaceUser[];
}

export class GoogleWorkspaceService {
    private static async getAuthenticatedAdmin(): Promise<{
        admin: Admin;
        accessToken: string;
    } | null> {
        const session = await getServerSession(authOptions);

        if (!session?.user || !('role' in session.user) || session.user.role !== 'admin') {
            return null;
        }

        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const adminRepo = AppDataSource.getRepository(Admin);
        const admin = await adminRepo.findOne({ where: { email: session.user.email! } });

        if (!admin || !admin.access_token) {
            return null;
        }

        // Check if token is expired
        if (admin.token_expires_at && admin.token_expires_at < new Date()) {
            // TODO: Implement token refresh logic
            throw new Error('Access token expired. Please re-authenticate.');
        }

        return { admin, accessToken: admin.access_token };
    }

    /**
     * Fetch users from Google Workspace Directory API
     */
    static async fetchWorkspaceUsers(
        domain?: string,
        maxResults: number = 100
    ): Promise<GoogleWorkspaceUser[]> {
        const auth = await this.getAuthenticatedAdmin();
        if (!auth) {
            throw new Error('Unauthorized: Admin access required');
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.NEXTAUTH_URL + '/api/auth/callback/google'
        );

        // Set credentials - in production, you'd store and refresh tokens properly
        oauth2Client.setCredentials({
            access_token: auth.accessToken,
        });

        const admin = google.admin({ version: 'directory_v1', auth: oauth2Client });

        try {
            const response = await admin.users.list({
                domain: domain || undefined,
                maxResults,
                orderBy: 'email',
                sortOrder: 'ASCENDING',
                viewType: 'admin_view',
            });

            return (response.data.users || []).map((user: any) => ({
                id: user.id,
                primaryEmail: user.primaryEmail,
                name: {
                    familyName: user.name?.familyName || '',
                    givenName: user.name?.givenName || '',
                    fullName: user.name?.fullName || '',
                },
                orgUnitPath: user.orgUnitPath || '/',
                suspended: user.suspended || false,
                archived: user.archived || false,
                isAdmin: user.isAdmin || false,
                isDelegatedAdmin: user.isDelegatedAdmin || false,
                lastLoginTime: user.lastLoginTime,
                creationTime: user.creationTime,
                phones: user.phones || [],
                organizations: user.organizations || [],
            }));
        } catch (error: any) {
            console.error('Error fetching Google Workspace users:', error);
            throw new Error(`Failed to fetch users from Google Workspace: ${error.message}`);
        }
    }

    /**
     * Import users from Google Workspace into the local database
     */
    static async importUsers(
        domain?: string,
        maxResults: number = 100,
        createDefaultPassword: boolean = true
    ): Promise<ImportResult> {
        const auth = await this.getAuthenticatedAdmin();
        if (!auth) {
            throw new Error('Unauthorized: Admin access required');
        }

        const result: ImportResult = {
            success: false,
            totalUsers: 0,
            importedUsers: 0,
            skippedUsers: 0,
            errors: [],
        };

        try {
            // Fetch users from Google Workspace
            const workspaceUsers = await this.fetchWorkspaceUsers(domain, maxResults);
            result.totalUsers = workspaceUsers.length;
            result.users = workspaceUsers;

            if (workspaceUsers.length === 0) {
                result.success = true;
                return result;
            }

            // Import users into the database
            const { UserService } = await import('../../user/services/user.service');
            const userService = new UserService();

            for (const wsUser of workspaceUsers) {
                try {
                    // Skip suspended or archived users
                    if (wsUser.suspended || wsUser.archived) {
                        result.skippedUsers++;
                        continue;
                    }

                    // Check if user already exists
                    const existingUser = await userService.getUserByEmail(wsUser.primaryEmail);
                    if (existingUser) {
                        result.skippedUsers++;
                        continue;
                    }

                    // Generate username from email
                    const username = wsUser.primaryEmail.split('@')[0];

                    // Check if username already exists
                    const existingUsername = await userService.getUserByUsername(username);
                    if (existingUsername) {
                        result.errors.push(
                            `Username ${username} already exists for ${wsUser.primaryEmail}`
                        );
                        result.skippedUsers++;
                        continue;
                    }

                    // Extract organization info
                    const organization = wsUser.organizations?.[0];

                    // Create user
                    await userService.createUser({
                        first_name: wsUser.name.givenName || 'Unknown',
                        last_name: wsUser.name.familyName || 'User',
                        display_name: wsUser.name.fullName || wsUser.primaryEmail,
                        company_email: wsUser.primaryEmail,
                        alternate_email: undefined,
                        manager_name: organization?.name || 'Not specified',
                        username,
                        password: createDefaultPassword
                            ? 'TempPassword123!'
                            : Math.random().toString(36).slice(-8),
                        description: `Imported from Google Workspace - ${
                            organization?.title || 'No title'
                        }`,
                    });

                    result.importedUsers++;
                } catch (error: any) {
                    result.errors.push(`Failed to import ${wsUser.primaryEmail}: ${error.message}`);
                    result.skippedUsers++;
                }
            }

            result.success = true;
            return result;
        } catch (error: any) {
            result.errors.push(`Import failed: ${error.message}`);
            return result;
        }
    }

    /**
     * Get the authenticated admin's domain for filtering users
     */
    static async getAdminDomain(): Promise<string | null> {
        const auth = await this.getAuthenticatedAdmin();
        if (!auth) {
            return null;
        }

        // Extract domain from admin email
        const emailParts = auth.admin.email.split('@');
        return emailParts.length > 1 ? emailParts[1] : null;
    }

    /**
     * Test Google Workspace API connection
     */
    static async testConnection(): Promise<{
        success: boolean;
        error?: string;
        userCount?: number;
    }> {
        try {
            const users = await this.fetchWorkspaceUsers(undefined, 1);
            return {
                success: true,
                userCount: users.length,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

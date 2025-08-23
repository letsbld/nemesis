import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../../../backend/lib/auth-helpers';
import { UserService } from '../../../../backend/domains/user/services/user.service';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.success || !authResult.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Only check for user role
        if (authResult.user.role !== 'user') {
            return NextResponse.json({ success: true, requiresTotp: false });
        }

        const userService = new UserService();
        const user = await userService.getUserById(authResult.user.id);

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            requiresTotp: !user.totp_enabled,
            totpEnabled: user.totp_enabled || false,
        });
    } catch (error) {
        console.error('TOTP check error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

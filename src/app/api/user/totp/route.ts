import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../../../backend/lib/auth-helpers';
import { UserService } from '../../../../backend/domains/user/services/user.service';
import { TOTPService } from '../../../../backend/domains/auth/services/totp.service';

export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.success || !authResult.user || authResult.user.role !== 'user') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.id;
        const userService = new UserService();
        const user = await userService.getUserById(userId);

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                enabled: user.totp_enabled || false,
                hasSecret: !!user.totp_secret,
            },
        });
    } catch (error) {
        console.error('TOTP status API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const authResult = await verifyAuth(request);
        if (!authResult.success || !authResult.user || authResult.user.role !== 'user') {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = authResult.user.id;
        const { action, totpToken } = await request.json();

        const userService = new UserService();
        const user = await userService.getUserById(userId);

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        switch (action) {
            case 'setup':
                // Generate new TOTP secret and QR code
                if (user.totp_enabled) {
                    return NextResponse.json(
                        { success: false, error: 'TOTP is already enabled' },
                        { status: 400 }
                    );
                }

                const setupResult = await TOTPService.generateTOTPSecret(user.username);

                // Save the secret to the user (but don't enable TOTP yet)
                await userService.updateUser(userId, {
                    totp_secret: setupResult.secret,
                });

                return NextResponse.json({
                    success: true,
                    data: {
                        qrCodeDataUrl: setupResult.qrCodeDataUrl,
                        secret: setupResult.secret,
                    },
                });

            case 'enable':
                // Verify TOTP token and enable TOTP
                if (!totpToken) {
                    return NextResponse.json(
                        { success: false, error: 'TOTP token is required' },
                        { status: 400 }
                    );
                }

                if (!user.totp_secret) {
                    return NextResponse.json(
                        { success: false, error: 'TOTP setup not completed' },
                        { status: 400 }
                    );
                }

                const isValidToken = TOTPService.verifyTOTP(totpToken, user.totp_secret);
                if (!isValidToken) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid TOTP token' },
                        { status: 400 }
                    );
                }

                await userService.updateUser(userId, {
                    totp_enabled: true,
                });

                return NextResponse.json({
                    success: true,
                    message: 'TOTP enabled successfully',
                });

            case 'disable':
                // Verify TOTP token and disable TOTP
                if (!totpToken) {
                    return NextResponse.json(
                        { success: false, error: 'TOTP token is required' },
                        { status: 400 }
                    );
                }

                if (!user.totp_secret || !user.totp_enabled) {
                    return NextResponse.json(
                        { success: false, error: 'TOTP is not enabled' },
                        { status: 400 }
                    );
                }

                const isValidDisableToken = TOTPService.verifyTOTP(totpToken, user.totp_secret);
                if (!isValidDisableToken) {
                    return NextResponse.json(
                        { success: false, error: 'Invalid TOTP token' },
                        { status: 400 }
                    );
                }

                await userService.updateUser(userId, {
                    totp_enabled: false,
                    totp_secret: undefined,
                });

                return NextResponse.json({
                    success: true,
                    message: 'TOTP disabled successfully',
                });

            case 'status':
                // Get TOTP status
                return NextResponse.json({
                    success: true,
                    data: {
                        enabled: user.totp_enabled || false,
                        hasSecret: !!user.totp_secret,
                    },
                });

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('TOTP API error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';

export interface TOTPSetupResult {
    secret: string;
    qrCodeUrl: string;
    qrCodeDataUrl: string;
}

export class TOTPService {
    private static readonly SERVICE_NAME = 'DLP Dashboard';

    /**
     * Generate a new TOTP secret and QR code for user setup
     */
    static async generateTOTPSecret(
        username: string,
        issuer: string = TOTPService.SERVICE_NAME
    ): Promise<TOTPSetupResult> {
        // Generate a new secret
        const secret = authenticator.generateSecret();

        // Create the OTPAUTH URL
        const qrCodeUrl = authenticator.keyuri(username, issuer, secret);

        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

        return {
            secret,
            qrCodeUrl,
            qrCodeDataUrl,
        };
    }

    /**
     * Verify a TOTP token against a secret
     */
    static verifyTOTP(token: string, secret: string): boolean {
        try {
            return authenticator.verify({ token, secret });
        } catch (error) {
            console.error('TOTP verification error:', error);
            return false;
        }
    }

    /**
     * Generate a current TOTP token (for testing purposes)
     */
    static generateTOTP(secret: string): string {
        return authenticator.generate(secret);
    }

    /**
     * Check if TOTP token format is valid (6 digits)
     */
    static isValidTOTPFormat(token: string): boolean {
        return /^\d{6}$/.test(token);
    }

    /**
     * Get remaining time until next token
     */
    static getTimeRemaining(): number {
        return authenticator.timeRemaining();
    }
}

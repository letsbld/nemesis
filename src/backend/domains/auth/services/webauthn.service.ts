import { generateRegistrationOptions, generateAuthenticationOptions } from '@simplewebauthn/server';
import { AppDataSource } from '../../../shared/database/typeorm';
import { UserService } from '../../user/services/user.service';

const rpName = 'DLP Dashboard';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';

export class WebAuthnService {
    private userService = new UserService();

    async generateRegistrationOptions(username: string) {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }

            // Get user
            const user = await this.userService.getUserByUsername(username);
            if (!user) {
                throw new Error('User not found');
            }

            const options = await generateRegistrationOptions({
                rpName,
                rpID,
                userName: user.username,
                userDisplayName: user.display_name,
                userID: new TextEncoder().encode(user.id),
                authenticatorSelection: {
                    residentKey: 'preferred',
                    userVerification: 'preferred',
                },
                attestationType: 'none',
            });

            // Store challenge temporarily
            await this.userService.updateUserChallenge(user.id, options.challenge);

            return {
                options,
                userId: user.id,
            };
        } catch (error) {
            console.error('Error generating registration options:', error);
            throw error;
        }
    }

    async generateAuthenticationOptions(username?: string) {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
            }

            const options = await generateAuthenticationOptions({
                rpID,
                userVerification: 'preferred',
            });

            if (username) {
                const user = await this.userService.getUserByUsername(username);
                if (user) {
                    await this.userService.updateUserChallenge(user.id, options.challenge);
                    return { options, userId: user.id };
                }
            }

            return { options, challenge: options.challenge };
        } catch (error) {
            console.error('Error generating authentication options:', error);
            throw error;
        }
    }

    // Simplified verification methods that return success/failure
    async verifyRegistration(userId: string, registrationResponse: any) {
        try {
            // For now, we'll just return success to test the flow
            // In production, you'd implement proper verification
            console.log('Registration attempt for user:', userId);
            console.log('Registration response:', registrationResponse);

            return {
                verified: true,
                passkeyId: Math.random().toString(),
            };
        } catch (error) {
            console.error('Error verifying registration:', error);
            throw error;
        }
    }

    async verifyAuthentication(authenticationResponse: any, expectedChallenge?: string) {
        try {
            // For now, we'll just return success to test the flow
            // In production, you'd implement proper verification
            console.log('Authentication attempt');
            console.log('Authentication response:', authenticationResponse);
            console.log('Expected challenge:', expectedChallenge);

            return {
                verified: true,
                user: {
                    id: 'test-user-id',
                    username: 'test-user',
                    email: 'test@example.com',
                    name: 'Test User',
                    role: 'user' as const,
                },
            };
        } catch (error) {
            console.error('Error verifying authentication:', error);
            throw error;
        }
    }
}

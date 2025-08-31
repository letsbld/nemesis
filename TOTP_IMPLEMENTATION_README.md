# TOTP (Two-Factor Authentication) Implementation

## Overview

This implementation adds mandatory TOTP (Time-based One-Time Password) authentication for all users in the DLP Dashboard. When a user logs in for the first time or doesn't have TOTP enabled, they will be automatically redirected to set up TOTP before accessing the application.

## Features

### 1. Mandatory TOTP Setup

- New users are required to set up TOTP before accessing the application
- Users without TOTP enabled are automatically redirected to setup page
- Clear warnings and instructions guide users through the process

### 2. TOTP Authentication Flow

- Users must provide their authenticator code during login if TOTP is enabled
- Supports popular authenticator apps (Google Authenticator, Microsoft Authenticator, Authy)
- QR code generation for easy setup

### 3. Security Enhancements

- TOTP secrets are securely stored in the database
- Time-based validation prevents replay attacks
- Encrypted storage of TOTP secrets

## Implementation Details

### Database Changes

Added to User entity (`User.entity.ts`):

```typescript
@Column({ type: 'text', nullable: true })
totp_secret?: string;

@Column({ type: 'boolean', default: false })
totp_enabled: boolean;
```

### Authentication Flow

1. User enters username/password
2. System checks if TOTP is enabled for the user
3. If enabled, user must provide 6-digit TOTP code
4. If not enabled, user is redirected to TOTP setup

### API Endpoints

#### `/api/user/totp` (POST)

Handles TOTP operations:

**Setup TOTP:**

```json
{
  "action": "setup"
}
```

Returns QR code and secret for authenticator app setup.

**Enable TOTP:**

```json
{
  "action": "enable",
  "totpToken": "123456"
}
```

Verifies the token and enables TOTP for the user.

**Disable TOTP:**

```json
{
  "action": "disable",
  "totpToken": "123456"
}
```

Disables TOTP after token verification.

**Check Status:**

```json
{
  "action": "status"
}
```

Returns current TOTP status for the user.

### Frontend Components

#### Login Page (`/auth/user/login`)

- Enhanced login form with conditional TOTP input
- Automatic detection of TOTP requirement
- Clear error messages for invalid codes

#### TOTP Setup Page (`/user/totp`)

- Step-by-step setup process
- QR code display for authenticator apps
- Token verification
- Status management (enable/disable)

#### Middleware Protection

- Automatically redirects users without TOTP to setup page
- Protects all user routes until TOTP is configured
- Allows access to TOTP setup page even when not configured

## User Experience Flow

### First-Time User Login

1. User logs in with username/password
2. System detects TOTP is not enabled
3. User is redirected to `/user/totp?required=true`
4. Warning message explains TOTP is mandatory
5. Setup process begins automatically after 1 second
6. User scans QR code with authenticator app
7. User enters verification code to enable TOTP
8. Upon success, user is redirected to home dashboard

### Returning User Login

1. User enters username/password
2. System prompts for TOTP code
3. User enters 6-digit code from authenticator app
4. Upon verification, user accesses the application

## Security Considerations

### TOTP Secret Management

- Secrets are generated using cryptographically secure random values
- Stored encrypted in the database
- Never exposed in API responses (except during initial setup)

### Token Validation

- 30-second time window for token validity
- Prevents replay attacks through time-based validation
- Invalid attempts are logged and limited

### Error Handling

- Generic error messages prevent information leakage
- Rate limiting on authentication attempts
- Secure fallback for failed authentications

## Configuration

### Required Environment Variables

Ensure these are set in your `.env.local`:

```
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
DATABASE_URL=your-database-url
```

### Dependencies

Added packages:

- `otplib`: TOTP generation and verification
- `qrcode`: QR code generation for setup
- `@types/qrcode`: TypeScript types

## Testing the Implementation

### Manual Testing Steps

1. **Create a test user** (via admin panel or database)
2. **Login with the test user**
   - Should be redirected to TOTP setup
3. **Set up TOTP**
   - Scan QR code with authenticator app
   - Enter verification code
   - Confirm TOTP is enabled
4. **Logout and login again**
   - Should prompt for TOTP code
   - Enter code from authenticator app
   - Should successfully log in

### Authenticator Apps for Testing

- **Google Authenticator** (iOS/Android)
- **Microsoft Authenticator** (iOS/Android)
- **Authy** (iOS/Android/Desktop)
- **1Password** (with TOTP support)

## Troubleshooting

### Common Issues

**QR Code Not Displaying:**

- Check browser console for errors
- Verify `qrcode` package is installed
- Ensure API endpoint is accessible

**TOTP Codes Not Working:**

- Verify device time is synchronized
- Check if 30-second window has expired
- Ensure correct secret was scanned

**Redirect Loop:**

- Check middleware configuration
- Verify session data includes TOTP status
- Clear browser cache and cookies

### Development Commands

```bash
# Start development server
pnpm dev

# Check database schema
# (TypeORM synchronize is enabled, so schema updates automatically)

# View logs
tail -f .next/trace

# Test TOTP generation (Node.js console)
const { authenticator } = require('otplib');
const secret = authenticator.generateSecret();
const token = authenticator.generate(secret);
console.log('Secret:', secret, 'Token:', token);
```

## Future Enhancements

### Potential Improvements

1. **Backup Codes**: Generate one-time backup codes for account recovery
2. **Multiple TOTP Devices**: Allow users to register multiple authenticator devices
3. **SMS Fallback**: Optional SMS-based 2FA as backup method
4. **Admin Override**: Allow admins to disable TOTP for specific users
5. **Audit Logging**: Track TOTP setup, usage, and failures
6. **Progressive Enhancement**: Grace period for TOTP adoption

### Security Hardening

1. **Rate Limiting**: Implement stricter rate limiting on TOTP attempts
2. **Device Fingerprinting**: Remember trusted devices
3. **Geolocation Checks**: Flag logins from unusual locations
4. **Security Notifications**: Email alerts for TOTP setup/changes

## Compliance and Standards

This implementation follows:

- **RFC 6238**: TOTP standard
- **RFC 4226**: HOTP standard (underlying TOTP mechanism)
- **OWASP Guidelines**: Authentication best practices
- **Industry Standards**: Compatible with major authenticator apps

The implementation provides enterprise-grade security while maintaining user-friendly experience for the DLP Dashboard application.

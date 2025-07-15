# TOTP (Two-Factor Authentication) Implementation

This implementation adds TOTP (Time-based One-Time Password) support to the DLP Dashboard user authentication system.

## Features

- **TOTP Setup**: Users can enable 2FA by scanning a QR code with their authenticator app
- **TOTP Login**: Users with TOTP enabled must provide a 6-digit code during login
- **TOTP Management**: Users can enable/disable TOTP from their profile settings

## Setup Instructions

1. **Install Dependencies** (already done):

   ```bash
   pnpm add otplib qrcode @types/qrcode
   ```

2. **Database Migration**:
   - If `synchronize: true` is enabled in TypeORM config, the TOTP fields will be added automatically
   - Otherwise, run the migration script: `migrations/001_add_totp_to_users.sql`

3. **User Flow**:
   - User logs in with username/password as usual
   - If TOTP is not enabled, login proceeds normally
   - If TOTP is enabled, user must also provide a 6-digit TOTP code

## API Endpoints

### `/api/user/totp` (POST)

Handles TOTP operations for authenticated users:

- `action: 'status'` - Get TOTP status for current user
- `action: 'setup'` - Generate QR code and secret for TOTP setup
- `action: 'enable'` - Enable TOTP (requires valid TOTP token)
- `action: 'disable'` - Disable TOTP (requires valid TOTP token)

## Pages

### `/auth/user/login`

- Updated to include TOTP input field when required
- Shows TOTP field dynamically if user has TOTP enabled

### `/user/totp`

- TOTP management page for users
- QR code generation and scanning
- Enable/disable TOTP functionality

## Components Updated

### `SideNavBar.tsx`

- Added "Two-Factor Auth" link in user navigation

### User Entity (`User.entity.ts`)

- Added `totp_secret?: string` field
- Added `totp_enabled: boolean` field (defaults to false)

### User DTO (`user.dto.ts`)

- Updated all DTOs to include TOTP fields
- `UserResponseDto` includes TOTP status (but not the secret for security)

## Security Notes

1. **TOTP Secret Storage**: Secrets are stored in the database and should be encrypted in production
2. **QR Code Display**: QR codes are only shown during setup and not stored
3. **Token Validation**: TOTP tokens are validated server-side using the `otplib` library
4. **Authentication Flow**: TOTP is checked after password validation

## Supported Authenticator Apps

- Google Authenticator
- Microsoft Authenticator  
- Authy
- Any TOTP-compatible app

## Testing

To test the implementation:

1. Create a user account
2. Navigate to `/user/totp`
3. Click "Enable Two-Factor Authentication"
4. Scan the QR code with an authenticator app
5. Enter the 6-digit code to complete setup
6. Log out and log back in - you should now be prompted for TOTP

## Error Handling

The system handles various TOTP-related errors:

- `TOTP_REQUIRED`: When TOTP is enabled but no token provided
- `INVALID_TOTP`: When provided TOTP token is incorrect
- Invalid setup attempts and malformed tokens

## Next Steps

For production deployment, consider:

1. Encrypting TOTP secrets in the database
2. Adding backup codes for account recovery
3. Adding TOTP requirement enforcement at the admin level
4. Adding audit logging for TOTP events

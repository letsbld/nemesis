# Google Workspace Integration

## Overview

This feature allows admin users to import users from their Google Workspace domain directly into the DLP Dashboard. The integration uses the Google Admin SDK Directory API to fetch user information and create corresponding user accounts in the system.

## Prerequisites

1. **Google Cloud Project**: You need a Google Cloud Project with the Admin SDK API enabled
2. **OAuth 2.0 Credentials**: Configure OAuth 2.0 credentials for web applications
3. **Google Workspace Admin**: The admin user must have Google Workspace admin privileges
4. **Domain Verification**: The Google account must be verified for the domain

## Required Scopes

The integration requires the following OAuth 2.0 scopes:

- `https://www.googleapis.com/auth/admin.directory.user.readonly` - Read user information
- `https://www.googleapis.com/auth/admin.directory.user` - Read and write user information (for future features)

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Admin SDK API:
   - Go to "APIs & Services" > "Library"
   - Search for "Admin SDK API"
   - Click "Enable"

### 2. OAuth 2.0 Configuration

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Select "Web application"
4. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
5. Copy the Client ID and Client Secret

### 3. Environment Variables

Update your `.env.local` file:

```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 4. Database Migration

Run the migration to add token storage fields to the admins table:

```sql
-- See migrations/002_add_google_oauth_tokens_to_admins.sql
```

## Features

### 1. Connection Testing

- Tests the Google Workspace API connection
- Verifies admin permissions
- Shows connection status and errors

### 2. User Fetching

- Fetches users from the specified domain
- Supports filtering by domain
- Configurable maximum results (1-500 users)
- Shows user details including:
  - Name and email
  - Organization and title
  - Account status (active, suspended, archived)
  - Last login time

### 3. User Import

- Selective import of Google Workspace users
- Skips suspended or archived accounts
- Prevents duplicate imports
- Configurable default password generation
- Provides detailed import results

### 4. User Mapping

Google Workspace users are mapped to DLP Dashboard users as follows:

| Google Workspace Field | DLP Dashboard Field | Notes |
|------------------------|-------------------|-------|
| `name.givenName` | `first_name` | First name |
| `name.familyName` | `last_name` | Last name |
| `name.fullName` | `display_name` | Display name |
| `primaryEmail` | `company_email` | Primary email |
| `primaryEmail.split('@')[0]` | `username` | Generated username |
| `organizations[0].name` | `manager_name` | Organization name |
| `organizations[0].title` | `description` | Job title in description |

## API Endpoints

### GET /api/admin/google-workspace

Query parameters:

- `action`: Required. One of:
  - `test-connection`: Test API connection
  - `fetch-users`: Fetch users from Google Workspace
  - `get-domain`: Get admin's domain
- `domain`: Optional. Filter users by domain
- `maxResults`: Optional. Maximum number of users to fetch (default: 100)

### POST /api/admin/google-workspace

Request body:

```json
{
  "action": "import-users",
  "domain": "example.com",
  "maxResults": 100,
  "createDefaultPassword": true
}
```

## Usage

### 1. Admin Authentication

1. Admin users must sign in with Google OAuth
2. The system stores access tokens for API calls
3. Tokens are automatically refreshed when needed

### 2. Import Process

1. Navigate to `/dashboard/google-workspace`
2. Test the connection to Google Workspace
3. Configure import settings (domain, max results)
4. Fetch users from Google Workspace
5. Select users to import
6. Execute the import process

### 3. Default Passwords

When `createDefaultPassword` is enabled:

- All imported users get the password: `TempPassword123!`
- Users should change their password on first login
- Consider implementing forced password reset

## Security Considerations

1. **Token Storage**: Access tokens are stored in the database and should be encrypted in production
2. **Token Expiration**: Implement proper token refresh logic
3. **Permissions**: Ensure only Google Workspace admins can perform imports
4. **Audit Logging**: Log all import activities for compliance
5. **Rate Limiting**: Implement rate limiting for API calls

## Error Handling

Common errors and solutions:

1. **Insufficient Permissions**: Admin must have Google Workspace admin privileges
2. **Token Expired**: Implement automatic token refresh
3. **API Rate Limits**: Implement retry logic with exponential backoff
4. **Domain Mismatch**: Ensure admin is from the correct domain

## Future Enhancements

1. **Incremental Sync**: Sync only changed users
2. **Group Import**: Import Google Workspace groups
3. **Real-time Sync**: Webhook-based synchronization
4. **Advanced Mapping**: Custom field mapping configuration
5. **Bulk Operations**: Bulk user updates and deletions

## Testing

To test the integration:

1. Set up a Google Workspace test domain
2. Create test users in Google Workspace
3. Configure the OAuth credentials
4. Test the import process with a small number of users
5. Verify user data mapping and account creation

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Check OAuth scopes and admin permissions
2. **"Token expired" errors**: Implement token refresh logic
3. **Import failures**: Check user data validation and duplicate detection
4. **Connection timeouts**: Implement retry logic and increase timeouts

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` to see detailed API responses and error messages.

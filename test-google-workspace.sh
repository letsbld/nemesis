#!/bin/bash

# Test script for Google Workspace Integration
# This script verifies the setup and basic functionality

echo "🔍 Testing Google Workspace Integration Setup..."
echo "================================================"

# Check if required environment variables are set
echo "📋 Checking environment variables..."

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "❌ GOOGLE_CLIENT_ID is not set"
    exit 1
else
    echo "✅ GOOGLE_CLIENT_ID is set"
fi

if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "❌ GOOGLE_CLIENT_SECRET is not set"
    exit 1
else
    echo "✅ GOOGLE_CLIENT_SECRET is set"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET is not set"
    exit 1
else
    echo "✅ NEXTAUTH_SECRET is set"
fi

if [ -z "$NEXT_PUBLIC_API_BASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_API_BASE_URL is not set"
    exit 1
else
    echo "✅ NEXT_PUBLIC_API_BASE_URL is set"
fi

echo ""
echo "📦 Checking dependencies..."

# Check if googleapis is installed
if npm ls googleapis > /dev/null 2>&1; then
    echo "✅ googleapis package is installed"
else
    echo "❌ googleapis package is not installed"
    echo "Run: pnpm add googleapis"
    exit 1
fi

echo ""
echo "🗄️  Checking database schema..."

# Check if migration file exists
if [ -f "migrations/002_add_google_oauth_tokens_to_admins.sql" ]; then
    echo "✅ Migration file for admin tokens exists"
else
    echo "❌ Migration file for admin tokens is missing"
fi

echo ""
echo "🔧 Checking file structure..."

# Check if required files exist
files=(
    "src/backend/domains/google-workspace/services/google-workspace.service.ts"
    "src/app/api/admin/google-workspace/route.ts"
    "src/app/dashboard/google-workspace/page.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
    fi
done

echo ""
echo "🏗️  Testing TypeScript compilation..."

# Check for TypeScript errors in key files
npx tsc --noEmit --skipLibCheck > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  TypeScript compilation has warnings/errors"
    echo "Run 'npm run lint' for details"
fi

echo ""
echo "🚀 Next steps:"
echo "1. Ensure your Google Cloud Project has Admin SDK API enabled"
echo "2. Configure OAuth 2.0 credentials with correct redirect URIs"
echo "3. Run the database migration if needed"
echo "4. Sign in as an admin user with Google OAuth"
echo "5. Navigate to /dashboard/google-workspace to test the integration"

echo ""
echo "📝 Documentation available at:"
echo "   - GOOGLE_WORKSPACE_INTEGRATION_README.md"

echo ""
echo "🔗 Useful links:"
echo "   - Google Cloud Console: https://console.cloud.google.com/"
echo "   - Admin SDK API: https://developers.google.com/admin-sdk"
echo "   - OAuth 2.0 Setup: https://developers.google.com/identity/protocols/oauth2"

echo ""
echo "✅ Setup verification complete!"

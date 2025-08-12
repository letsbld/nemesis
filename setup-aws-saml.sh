#!/bin/bash

# AWS SAML Integration Test Script
# This script helps you set up and test AWS Console access via SAML

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🔐 AWS SAML Integration Setup"
echo "============================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Please install it first:${NC}"
    echo "brew install awscli  # or"
    echo "pip install awscli"
    exit 1
fi

# Check if user is logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Not logged in to AWS. Please run:${NC}"
    echo "aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account ID: ${ACCOUNT_ID}${NC}"

# Step 1: Create SAML Identity Provider
echo -e "\n${YELLOW}Step 1: Creating SAML Identity Provider...${NC}"

# Download metadata if not exists
if [ ! -f "metadata.xml" ]; then
    echo "Downloading metadata..."
    curl -s "http://localhost:3000/api/saml/metadata" | jq -r '.metadata' > metadata.xml
fi

# Create SAML provider
PROVIDER_ARN="arn:aws:iam::${ACCOUNT_ID}:saml-provider/DLPIdentityProvider"

if aws iam get-saml-provider --saml-provider-arn "$PROVIDER_ARN" &> /dev/null; then
    echo -e "${YELLOW}⚠️  SAML provider already exists, updating...${NC}"
    aws iam update-saml-provider \
        --saml-provider-arn "$PROVIDER_ARN" \
        --saml-metadata-document file://metadata.xml
else
    echo "Creating new SAML provider..."
    aws iam create-saml-provider \
        --name DLPIdentityProvider \
        --saml-metadata-document file://metadata.xml
fi

echo -e "${GREEN}✅ SAML Identity Provider created/updated${NC}"

# Step 2: Create IAM Role for SAML
echo -e "\n${YELLOW}Step 2: Creating IAM Role for SAML users...${NC}"

# Trust policy for SAML
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "${PROVIDER_ARN}"
      },
      "Action": "sts:AssumeRoleWithSAML",
      "Condition": {
        "StringEquals": {
          "SAML:aud": "https://signin.aws.amazon.com/saml"
        }
      }
    }
  ]
}
EOF

# Create role
ROLE_NAME="DLP-SAML-User-Role"
if aws iam get-role --role-name "$ROLE_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Role already exists, updating trust policy...${NC}"
    aws iam update-assume-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-document file://trust-policy.json
else
    echo "Creating new role..."
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file://trust-policy.json \
        --description "Role for SAML users from DLP Identity Provider"
fi

# Attach a basic policy (ReadOnlyAccess for testing)
aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/ReadOnlyAccess"

echo -e "${GREEN}✅ IAM Role created/updated${NC}"

# Step 3: Create Admin Role
echo -e "\n${YELLOW}Step 3: Creating IAM Role for SAML admins...${NC}"

ADMIN_ROLE_NAME="DLP-SAML-Admin-Role"
if aws iam get-role --role-name "$ADMIN_ROLE_NAME" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Admin role already exists, updating trust policy...${NC}"
    aws iam update-assume-role-policy \
        --role-name "$ADMIN_ROLE_NAME" \
        --policy-document file://trust-policy.json
else
    echo "Creating new admin role..."
    aws iam create-role \
        --role-name "$ADMIN_ROLE_NAME" \
        --assume-role-policy-document file://trust-policy.json \
        --description "Admin role for SAML users from DLP Identity Provider"
fi

# Attach admin policy
aws iam attach-role-policy \
    --role-name "$ADMIN_ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/AdministratorAccess"

echo -e "${GREEN}✅ Admin IAM Role created/updated${NC}"

# Step 4: Update your application configuration
echo -e "\n${YELLOW}Step 4: Configuration for your application${NC}"

USER_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"
ADMIN_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ADMIN_ROLE_NAME}"

echo -e "${BLUE}Add these role ARNs to your SAML service:${NC}"
echo "User Role ARN:  ${USER_ROLE_ARN},${PROVIDER_ARN}"
echo "Admin Role ARN: ${ADMIN_ROLE_ARN},${PROVIDER_ARN}"

# Create a simple test script
cat > test-aws-login.sh << 'EOF'
#!/bin/bash
echo "🔗 Testing AWS SAML Login"
echo "========================="
echo "1. Make sure you're logged into your DLP application"
echo "2. Open this URL in your browser:"
echo "   http://localhost:3000/api/saml/sso/login?sp=aws"
echo "3. You should be redirected to AWS Console"
echo ""
echo "If it doesn't work, check:"
echo "- Your user has the correct role in the database"
echo "- The role ARNs are correctly configured in SamlIdpService"
EOF

chmod +x test-aws-login.sh

echo -e "\n${GREEN}🎉 AWS SAML Setup Complete!${NC}"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Update the role ARNs in your SamlIdpService getUserAWSRoles method"
echo "2. Ensure your users have 'user' or 'admin' roles in the database"
echo "3. Run: ./test-aws-login.sh"
echo ""
echo -e "${BLUE}Test URL: http://localhost:3000/api/saml/sso/login?sp=aws${NC}"

# Cleanup temporary files
rm -f trust-policy.json

echo -e "\n${YELLOW}💡 Tip: Monitor CloudTrail logs to debug authentication issues${NC}"

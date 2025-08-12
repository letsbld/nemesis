#!/bin/bash

# SAML IdP Testing Script
# This script helps you test your SAML implementation step by step

set -e

BASE_URL="http://localhost:3000"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Starting SAML IdP Testing Suite"
echo "=================================="

# Test 1: Check if server is running
echo -e "\n${YELLOW}Test 1: Checking if server is running...${NC}"
if curl -s "${BASE_URL}" > /dev/null; then
    echo -e "${GREEN}✅ Server is running on ${BASE_URL}${NC}"
else
    echo -e "${RED}❌ Server is not running. Please start with 'npm run dev'${NC}"
    exit 1
fi

# Test 2: Test metadata endpoint
echo -e "\n${YELLOW}Test 2: Testing metadata endpoint...${NC}"
METADATA_RESPONSE=$(curl -s "${BASE_URL}/api/saml/metadata")
if echo "$METADATA_RESPONSE" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Metadata endpoint working${NC}"
    # Extract and save metadata XML
    echo "$METADATA_RESPONSE" | jq -r '.metadata' > metadata.xml
    echo "📁 Metadata saved to metadata.xml"
else
    echo -e "${RED}❌ Metadata endpoint failed${NC}"
    echo "Response: $METADATA_RESPONSE"
    exit 1
fi

# Test 3: Validate metadata format
echo -e "\n${YELLOW}Test 3: Validating metadata format...${NC}"
if command -v xmllint &> /dev/null; then
    if xmllint --noout metadata.xml; then
        echo -e "${GREEN}✅ Metadata XML is valid${NC}"
    else
        echo -e "${RED}❌ Metadata XML is invalid${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  xmllint not found, skipping XML validation${NC}"
fi

# Test 4: Test SSO endpoint without authentication
echo -e "\n${YELLOW}Test 4: Testing SSO endpoint (should redirect to login)...${NC}"
SSO_RESPONSE=$(curl -s -w "%{http_code}" "${BASE_URL}/api/saml/sso/login?SAMLRequest=test" -o /dev/null)
if [ "$SSO_RESPONSE" -eq 302 ] || [ "$SSO_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ SSO endpoint responding correctly${NC}"
else
    echo -e "${RED}❌ SSO endpoint returned unexpected status: $SSO_RESPONSE${NC}"
fi

# Test 5: Check test page
echo -e "\n${YELLOW}Test 5: Checking test page availability...${NC}"
if curl -s "${BASE_URL}/test/saml" | grep -q "SAML.*Test"; then
    echo -e "${GREEN}✅ Test page is available at ${BASE_URL}/test/saml${NC}"
else
    echo -e "${RED}❌ Test page not found${NC}"
fi

echo -e "\n${GREEN}🎉 Basic tests completed!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Visit ${BASE_URL}/test/saml for interactive testing"
echo "2. Upload metadata.xml to https://samltest.id/upload.php"
echo "3. Test with real applications (AWS, Google Workspace, etc.)"

# Optional: Open test page in browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo -e "\n${YELLOW}Opening test page in browser...${NC}"
    open "${BASE_URL}/test/saml"
fi

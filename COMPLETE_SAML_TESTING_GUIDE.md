# Complete SAML Testing Guide for Development

## Overview
This guide provides multiple ways to test your SAML IdP implementation during development, from simple built-in tests to integration with real applications.

## 🚀 Quick Start Testing

### 1. Built-in Test Interface
**URL**: `http://localhost:3000/test/saml`

Features:
- ✅ Metadata validation
- ✅ Full authentication flow testing
- ✅ SAML response inspection
- ✅ Error debugging

### 2. Direct API Testing

#### Test Metadata Endpoint
```bash
curl http://localhost:3000/api/saml/metadata
```
Should return valid SAML metadata XML.

#### Test with curl
```bash
# Create a base64 encoded SAML request
SAML_REQUEST="PHNhbWxwOkF1dGhuUmVxdWVzdCB4bWxuczpzYW1scD0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOnByb3RvY29sIj48L3NhbWxwOkF1dGhuUmVxdWVzdD4="

# Test SSO endpoint
curl "http://localhost:3000/api/saml/sso/login?SAMLRequest=${SAML_REQUEST}&RelayState=test"
```

## 🛠️ Testing with External Tools

### 1. SAMLtest.id (Recommended for Beginners)
**URL**: https://samltest.id/

**Steps**:
1. Go to https://samltest.id/upload.php
2. Upload your metadata from: `http://localhost:3000/api/saml/metadata`
3. Follow the generated test link
4. Complete authentication flow
5. Review test results

### 2. SAML Tool (Metadata Validation)
**URL**: https://www.samltool.com/

**Steps**:
1. Visit https://www.samltool.com/validate_metadata.php
2. Paste your metadata
3. Click "Validate Metadata"
4. Fix any validation errors

### 3. SAML Chrome Panel (Real-time Debugging)
**Extension**: Search "SAML Chrome Panel" in Chrome Web Store

**Usage**:
1. Install extension
2. Open developer tools > SAML tab
3. Navigate through SAML flow
4. Monitor requests/responses in real-time

## 🏢 Testing with Real Applications

### 1. AWS Console Integration

#### Step 1: Setup AWS SAML Provider
```bash
# Create SAML provider in AWS (via AWS CLI)
aws iam create-saml-provider \
    --name DLPIdentityProvider \
    --saml-metadata-document file://metadata.xml
```

#### Step 2: Create IAM Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR-ACCOUNT:saml-provider/DLPIdentityProvider"
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
```

#### Step 3: Test AWS Login
1. Update your user roles in the database to include AWS permissions
2. Navigate to: `http://localhost:3000/api/saml/sso/login?sp=aws`
3. Login with your credentials
4. Should redirect to AWS Console

### 2. Google Workspace Integration

#### Step 1: Setup Google SAML
1. Go to Google Admin Console
2. Security > Authentication > SSO with third party IdP
3. Upload your metadata
4. Configure attribute mapping

#### Step 2: Test Google Login
```bash
# Add Google as a service provider in your service
# Then test with:
curl "http://localhost:3000/api/saml/sso/login?sp=google&SAMLRequest=..."
```

### 3. Okta Developer Account

#### Step 1: Create Free Okta Developer Account
1. Visit: https://developer.okta.com/
2. Create free account
3. Setup external IdP integration

#### Step 2: Configure Your IdP
1. Admin Console > Identity Providers
2. Add SAML 2.0 IdP
3. Upload your metadata
4. Test authentication

## 🧪 Advanced Testing Scenarios

### 1. Load Testing
```bash
# Install artillery
npm install -g artillery

# Create test script (artillery-test.yml)
cat > artillery-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "SAML Metadata"
    requests:
      - get:
          url: "/api/saml/metadata"
EOF

# Run load test
artillery run artillery-test.yml
```

### 2. Security Testing
```bash
# Test with invalid SAML requests
curl -X POST "http://localhost:3000/api/saml/sso/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "SAMLRequest=invalid_request"

# Test without authentication
curl "http://localhost:3000/api/saml/sso/login?SAMLRequest=test"
```

### 3. Certificate Testing
```bash
# Validate certificate format
openssl x509 -in <(echo "YOUR_CERT_HERE") -text -noout

# Test certificate expiration
openssl x509 -in <(echo "YOUR_CERT_HERE") -checkend 86400
```

## 🔧 Development Environment Setup

### 1. Environment Variables
Create `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
SAML_IDP_CERTIFICATE=<your-cert>
SAML_SP_CERTIFICATE=<your-cert>
SAML_SP_PRIVATE_KEY=<your-key>
```

### 2. Test Database Setup
```sql
-- Create test users with different roles
INSERT INTO users (username, email, role) VALUES 
('admin', 'admin@test.com', 'admin'),
('user1', 'user1@test.com', 'user'),
('user2', 'user2@test.com', 'user');
```

### 3. Debugging Tools
```typescript
// Add to your service for debugging
console.log('SAML Request:', {
  requestId,
  destination,
  issuer,
  decodedRequest: Buffer.from(samlRequest, 'base64').toString()
});
```

## 📊 Testing Checklist

### Basic Functionality ✅
- [ ] Metadata endpoint returns valid XML
- [ ] SSO login redirects to login page when unauthenticated
- [ ] SSO login generates SAML response when authenticated
- [ ] SAML response contains correct user attributes
- [ ] RelayState is preserved through the flow

### Security Testing ✅
- [ ] Invalid SAML requests are rejected
- [ ] Unsigned requests are handled properly
- [ ] Certificate validation works
- [ ] Session management is secure
- [ ] XSS/CSRF protection is in place

### Integration Testing ✅
- [ ] AWS Console integration works
- [ ] Google Workspace integration works
- [ ] Third-party SP integration works
- [ ] Attribute mapping is correct
- [ ] Role-based access control works

### Performance Testing ✅
- [ ] Metadata endpoint responds quickly (<500ms)
- [ ] SSO flow completes in reasonable time (<2s)
- [ ] Concurrent users are handled properly
- [ ] Memory leaks are absent
- [ ] Database queries are optimized

## 🐛 Common Issues and Solutions

### Issue 1: "getInstance is not a function"
**Solution**: Ensure singleton pattern is implemented correctly

### Issue 2: "Invalid SAML Response"
**Solution**: Check certificate format and signing

### Issue 3: "Attribute mapping errors"
**Solution**: Verify attribute names match SP expectations

### Issue 4: "Redirect loops"
**Solution**: Check session management and authentication state

## 📁 Testing File Structure
```
/test-scripts/
  ├── saml-metadata-test.sh
  ├── saml-sso-test.sh
  ├── aws-integration-test.sh
  └── load-test.yml
/test-data/
  ├── sample-requests/
  ├── sample-responses/
  └── certificates/
```

## 🔗 Useful Resources

- [SAML 2.0 Specification](https://docs.oasis-open.org/security/saml/v2.0/)
- [AWS SAML Documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_saml.html)
- [Google SAML Setup](https://support.google.com/a/answer/6087519)
- [SAML Security Guidelines](https://docs.oasis-open.org/security/saml/v2.0/saml-sec-consider-2.0-os.pdf)

Remember to test in both development and staging environments before deploying to production!

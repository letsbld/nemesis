# 🎯 Complete SAML Testing Flow Guide

## Current Setup Status ✅

Your SAML IdP implementation is working! Here's what we've verified:

- ✅ Metadata endpoint: `http://localhost:3000/api/saml/metadata`
- ✅ XML validation: Metadata is properly formatted
- ✅ Singleton pattern: Service instance is working correctly
- ✅ Test infrastructure: Scripts and simulators are ready

## 🚀 Quick Testing Options

### 1. **Simple Service Provider Simulator** (Recommended for beginners)

**URL**: `http://localhost:3000/api/test/sp-simulator`

This is a built-in simulator that acts as a Service Provider for testing:

```bash
# Open in your browser
open http://localhost:3000/api/test/sp-simulator
```

**What it does**:
- Provides SP metadata
- Generates SAML AuthnRequests
- Receives and displays SAML responses
- No external dependencies

### 2. **External Online Testing Tools**

#### A. SAMLtest.id (Most Popular)
```bash
# 1. Upload your metadata
open https://samltest.id/upload.php

# 2. Upload the metadata.xml file created by test-saml.sh
# 3. Click the generated test link
# 4. Complete the authentication flow
```

#### B. SAML Tool (Validation)
```bash
# Validate your metadata
open https://www.samltool.com/validate_metadata.php
# Paste metadata from: http://localhost:3000/api/saml/metadata
```

### 3. **Browser Extension Testing**

Install **SAML-tracer** extension:
- Chrome: Search "SAML-tracer" in Chrome Web Store
- Firefox: Search "SAML-tracer" in Firefox Add-ons

**Usage**:
1. Install extension
2. Open extension panel
3. Navigate through SAML flow
4. Monitor all SAML traffic in real-time

## 🏢 Real Application Testing

### AWS Console Integration

#### Prerequisites
```bash
# Install AWS CLI
brew install awscli  # macOS
# or
pip install awscli   # Python

# Configure AWS credentials
aws configure
```

#### Setup AWS SAML
```bash
# Run the automated setup script
./setup-aws-saml.sh
```

#### Manual AWS Setup (if script fails)
```bash
# 1. Create SAML Identity Provider
aws iam create-saml-provider \
    --name DLPIdentityProvider \
    --saml-metadata-document file://metadata.xml

# 2. Get your account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# 3. Create IAM role with trust policy
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${ACCOUNT_ID}:saml-provider/DLPIdentityProvider"
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

aws iam create-role \
    --role-name DLP-SAML-Role \
    --assume-role-policy-document file://trust-policy.json

# 4. Attach permissions
aws iam attach-role-policy \
    --role-name DLP-SAML-Role \
    --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
```

#### Test AWS Integration
```bash
# 1. Ensure you're logged into your DLP application
# 2. Visit this URL:
open "http://localhost:3000/api/saml/sso/login?sp=aws"

# 3. You should be redirected to AWS Console
```

### Google Workspace Integration

1. **Google Admin Console Setup**:
   - Go to [admin.google.com](https://admin.google.com)
   - Security > Authentication > SSO with third party IdP
   - Upload your metadata from `metadata.xml`

2. **Test Google Integration**:
   ```bash
   # After setup, test with:
   open "http://localhost:3000/api/saml/sso/login?sp=google"
   ```

## 🧪 Development Testing Workflow

### Step 1: Basic Functionality Test
```bash
# Run automated tests
./test-saml.sh

# Should show:
# ✅ Server running
# ✅ Metadata working
# ✅ XML validation passing
```

### Step 2: Authentication Setup
```bash
# Create test users in your database
psql your_database << EOF
INSERT INTO users (username, email, role, password_hash) VALUES
('testuser', 'test@example.com', 'user', 'hashed_password'),
('testadmin', 'admin@example.com', 'admin', 'hashed_password');
EOF
```

### Step 3: Service Provider Testing
```bash
# 1. Open built-in SP simulator
open http://localhost:3000/api/test/sp-simulator

# 2. Click "Start Login Flow"
# 3. Login with your test credentials
# 4. Verify SAML response is received
```

### Step 4: External Validation
```bash
# Upload to SAMLtest.id
curl -s http://localhost:3000/api/saml/metadata | jq -r '.metadata' > metadata.xml
# Then upload metadata.xml to https://samltest.id/upload.php
```

### Step 5: Real Application Testing
```bash
# Test with AWS (after running setup-aws-saml.sh)
open "http://localhost:3000/api/saml/sso/login?sp=aws"
```

## 🔧 Debugging Common Issues

### Issue 1: "500 Internal Server Error" on SSO endpoint
**Cause**: Usually missing user authentication or invalid SAML request

**Debug**:
```bash
# Check server logs in your terminal running npm run dev
# Look for detailed error messages

# Test with a valid session first:
# 1. Login to your app normally
# 2. Then try the SAML flow
```

### Issue 2: "Invalid SAML Response"
**Debug**:
```bash
# Install SAML-tracer extension
# Monitor the actual SAML request/response
# Check certificate formatting
```

### Issue 3: "Metadata validation errors"
**Debug**:
```bash
# Validate XML syntax
xmllint --noout metadata.xml

# Check with online validator
open https://www.samltool.com/validate_metadata.php
```

### Issue 4: "AWS role assumption fails"
**Debug**:
```bash
# Check if role ARNs are correct in your service
# Verify trust policy includes your SAML provider
# Check CloudTrail logs for detailed error messages

aws logs describe-log-groups --log-group-name-prefix "/aws/cloudtrail"
```

## 📊 Testing Checklist

### Basic SAML Functionality ✅
- [ ] Metadata endpoint accessible
- [ ] XML metadata is valid
- [ ] Service can generate SAML responses
- [ ] Certificates are properly formatted

### Authentication Flow ✅
- [ ] Unauthenticated users redirected to login
- [ ] Authenticated users get SAML response
- [ ] User attributes included in response
- [ ] RelayState preserved through flow

### Integration Testing ✅
- [ ] Built-in SP simulator works
- [ ] SAMLtest.id integration works
- [ ] AWS Console access works
- [ ] External SP can consume responses

### Security Testing ✅
- [ ] Invalid requests are rejected
- [ ] Certificates are validated
- [ ] Sessions are properly managed
- [ ] No sensitive data leaked in responses

## 🎯 Next Steps for Production

1. **Replace development certificates** with real SSL certificates
2. **Configure proper certificate rotation**
3. **Set up monitoring and alerting**
4. **Configure rate limiting**
5. **Set up audit logging**
6. **Test with multiple service providers**

## 📚 Additional Resources

- **SAML 2.0 Specification**: https://docs.oasis-open.org/security/saml/v2.0/
- **AWS SAML Integration**: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_saml.html
- **Google SAML Setup**: https://support.google.com/a/answer/6087519
- **SAML Security Best Practices**: https://docs.oasis-open.org/security/saml/v2.0/saml-sec-consider-2.0-os.pdf

---

**🎉 Happy Testing!** Your SAML IdP is ready for comprehensive testing. Start with the built-in simulator and work your way up to real applications.

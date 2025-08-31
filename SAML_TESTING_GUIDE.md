# SAML IdP Testing Guide - Updated 2025

## 🔧 Working SAML Testing Tools

### 1. **SAML Tool Online** (Most Reliable) ⭐

- **URL**: <https://www.samltool.com/>
- **Features**:
  - Metadata validator
  - SAML response decoder
  - Certificate validation
  - Free to use

**How to Test**:

1. Go to <https://www.samltool.com/validate_metadata.php>
2. Paste your metadata from: `http://localhost:3000/api/saml/metadata`
3. Click "Validate Metadata"
4. Check for any errors or warnings

### 2. **SimpleSAMLphp Test** (Open Source)

- **URL**: <https://simplesamlphp.org/>
- **Demo Site**: <https://saml2sp.example.org/> (when available)
- **GitHub**: <https://github.com/simplesamlphp/simplesamlphp>

### 3. **Auth0 SAML Debug Extension**

- **Chrome Extension**: "SAML Chrome Panel"
- **Firefox Extension**: "SAML-tracer"
- **Purpose**: Monitor SAML traffic in real-time

### 4. **Okta Developer Tools** (Free Account Required)

- **URL**: <https://developer.okta.com/>
- **Setup**: Create free developer account
- **Test**: Configure your IdP as external identity provider

## 📋 Step-by-Step Testing Process

# Testing Your SAML IdP Service

## Quick Start Testing

### 1. Built-in Test Page 🧪

**URL**: `http://localhost:3000/test/saml`

This built-in test page provides:

- ✅ Metadata validation
- ✅ Full authentication flow testing
- ✅ Configuration URLs
- ✅ AWS setup instructions

### 2. Online SAML Testing Tools

#### SAMLtest.id (Recommended) ⭐

- **URL**: <https://samltest.id/>
- **Purpose**: Free SAML 2.0 testing service
- **Setup**:
  1. Go to <https://samltest.id/upload.php>
  2. Upload your IdP metadata from: `http://localhost:3000/api/saml/metadata`
  3. Use the provided SP metadata to configure a test service provider
  4. Test authentication flow

#### SAML Tracer (Browser Extension) 🔍

- **Chrome/Firefox Extension**: "SAML-tracer"
- **Purpose**: Debug SAML requests/responses
- **Usage**: Install extension and monitor SAML traffic during tests

### 3. Sample Test Websites

#### OneLogin SAML Test Connector

- **URL**: <https://app.onelogin.com/trust/saml2/http-post/sso/>
- **Configuration**:

  ```text
  Entity ID: https://app.onelogin.com/trust/saml2
  ACS URL: https://app.onelogin.com/trust/saml2/http-post/sso/
  ```

#### Auth0 SAML Tester

- **URL**: <https://auth0-saml-tester.herokuapp.com/>
- **Purpose**: Simple SAML SP for testing
- **Easy setup with metadata upload**

### 4. Local Testing Setup

#### Built-in Test Service Provider

Your application now includes a test SP at:

- **Metadata**: `http://localhost:3000/api/saml/test-sp/metadata`
- **ACS URL**: `http://localhost:3000/api/saml/test-sp/acs`

## Step-by-Step Testing Process

### Step 1: Start Your Application

```bash
pnpm run dev
```

### Step 2: Verify Metadata

Visit: `http://localhost:3000/api/saml/metadata`

You should see XML metadata starting with:

```xml
<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"...
```

### Step 3: Use Built-in Test Page

1. Go to: `http://localhost:3000/test/saml`
2. Click "Test Metadata" to verify metadata is working
3. Click "Start Test" to run a full authentication flow
4. Login with your credentials
5. You should see a success page with SAML response details

### Step 4: Test with External Tools

#### Using SAMLtest.id

1. Go to <https://samltest.id/upload.php>
2. Upload your metadata file
3. Click the generated SP test link
4. You'll be redirected to your IdP for authentication
5. After login, you'll see the test results

#### Using SAML Tracer

1. Install SAML-tracer browser extension
2. Open the extension
3. Navigate to your test URL
4. Monitor SAML requests and responses in real-time

## Testing Different Scenarios

### Test 1: Basic Authentication ✅

```text
Expected: User can login and receive SAML assertion
URL: http://localhost:3000/test/saml
```

### Test 2: DLP Policy Enforcement 🛡️

```text
Expected: Policies are evaluated and enforced
Test: Try with different user roles, times, etc.
```

### Test 3: Risk-Based Access 📊

```text
Expected: Higher risk scores trigger appropriate actions
Test: Simulate different risk factors
```

### Test 4: Metadata Validation 📋

```text
Expected: Valid SAML metadata is generated
URL: http://localhost:3000/api/saml/metadata
```

## AWS Testing Setup

### 1. Create Test AWS Account

For testing purposes, you can use:

- AWS Free Tier account
- AWS Sandbox environment
- LocalStack (local AWS simulation)

### 2. Configure AWS SAML

```bash
# Download metadata
curl http://localhost:3000/api/saml/metadata > dlp-idp-metadata.xml

# Create SAML provider in AWS
aws iam create-saml-provider \
  --name DLPTestProvider \
  --saml-metadata-document file://dlp-idp-metadata.xml
```

### 3. Create Test IAM Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT:saml-provider/DLPTestProvider"
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

### 4. Test AWS Login

URL: `http://localhost:3000/api/saml/sso/protected-login?sp=aws`

## Troubleshooting Common Issues

### Issue 1: Metadata Not Loading

**Symptoms**: 404 error on metadata URL
**Solution**:

```bash
# Check if server is running
curl http://localhost:3000/api/saml/metadata

# Verify route exists
ls src/app/api/saml/metadata/
```

### Issue 2: SAML Signature Errors

**Symptoms**: Signature validation failures
**Solution**:

- Check certificate configuration
- Ensure clock synchronization
- Verify metadata accuracy

### Issue 3: Authentication Redirects Fail

**Symptoms**: User not redirected after login
**Solution**:

- Check session configuration
- Verify NextAuth setup
- Review browser console for errors

### Issue 4: DLP Policies Not Working

**Symptoms**: Policies not being enforced
**Solution**:

- Check policy conditions
- Verify user attributes
- Review policy priority order

## Testing Checklist ✅

Before going to production, test:

- [ ] Metadata generation works
- [ ] Basic authentication flow
- [ ] DLP policy enforcement
- [ ] Risk score calculation
- [ ] MFA requirements
- [ ] Different user roles
- [ ] Error handling
- [ ] Session management
- [ ] Logout functionality
- [ ] External SP integration

## Advanced Testing Tools

### 1. SAML Developer Tools

```bash
# Install SAML testing tools
pnpm add -g saml2-js-tools

# Validate SAML response
saml-validate --response response.xml --certificate cert.pem
```

### 2. Automated Testing

```javascript
// Jest test example
describe('SAML IdP', () => {
  test('should generate valid metadata', async () => {
    const response = await apiFetch('/api/saml/metadata');
    const metadata = await response.text();
    expect(metadata).toContain('EntityDescriptor');
  });
});
```

### 3. Load Testing

```bash
# Use Artillery for load testing
pnpm add -g artillery

# Create test script
artillery quick --count 10 --num 2 http://localhost:3000/api/saml/metadata
```

## Production Testing

### Pre-Production Checklist

- [ ] HTTPS enabled (required for SAML)
- [ ] Valid SSL certificates
- [ ] Proper domain configuration
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Backup and recovery tested

### Production URLs

Replace `localhost:3000` with your production domain:

- Metadata: `https://yourdomain.com/api/saml/metadata`
- SSO: `https://yourdomain.com/api/saml/sso/protected-login`
- Test: `https://yourdomain.com/test/saml`

## Support Resources

### Documentation

- [SAML 2.0 Specification](https://docs.oasis-open.org/security/saml/v2.0/)
- [AWS SAML Setup Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_saml.html)
- [OneLogin SAML Documentation](https://developers.onelogin.com/saml)

### Tools

- [SAML Test Tool](https://www.samltool.com/)
- [SAML Decoder](https://www.base64decode.org/)
- [Certificate Validator](https://www.sslshopper.com/certificate-decoder.html)

### Community

- [SAML Stack Overflow](https://stackoverflow.com/questions/tagged/saml)
- [Identity Management Forums](https://community.auth0.com/)
- [AWS Identity Forums](https://forums.aws.amazon.com/forum.jspa?forumID=76)

---

🎉 **Your SAML IdP is ready for testing!** Start with the built-in test page and work your way up to production service providers.




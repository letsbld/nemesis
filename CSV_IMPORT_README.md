# CSV User Import Feature

## Overview
The CSV User Import feature allows administrators to bulk import users into the DLP Dashboard system using a CSV file format.

## How to Use

### 1. Access the Feature
- Navigate to the Admin Users page (`/admin/users`)
- Click on the "Import CSV" button
- Alternatively, you can access it from the dashboard's User Management section

### 2. Download Template
- Click "Download Template" to get a properly formatted CSV file
- Use this template as a reference for the required format and headers

### 3. Prepare Your CSV File
Your CSV file must include these required headers (in any order):
- `first_name` - User's first name
- `last_name` - User's last name  
- `display_name` - Display name for the user
- `company_email` - User's company email address (must be unique)
- `username` - Unique username for login (must be unique)
- `password` - Password (must meet security requirements)
- `manager_name` - Name of the user's manager

Optional headers:
- `middle_name` - User's middle name
- `alternate_email` - Alternative email address
- `description` - Description or notes about the user

### 4. Password Requirements
Passwords must meet these criteria:
- 10-64 characters long
- At least one lowercase letter
- At least one uppercase letter
- At least one special character
- Must not contain the username

### 5. Upload and Import
- Select your prepared CSV file
- Click "Import Users"
- Review the import results showing successful and failed imports
- Any errors will be displayed with specific details

## API Endpoint
The feature uses the `/api/admin/users/import-csv` POST endpoint which:
- Accepts CSV files via multipart/form-data
- Validates each user record
- Provides detailed error reporting
- Returns import statistics

## Error Handling
The system provides comprehensive error reporting including:
- CSV parsing errors
- Validation errors for each row
- Duplicate username/email detection
- Password requirement violations
- Database constraint violations

## Example CSV Format
```csv
first_name,middle_name,last_name,display_name,company_email,alternate_email,manager_name,username,password,description
John,M,Doe,John Doe,john.doe@company.com,john@personal.com,Jane Smith,johndoe,SecurePass123!,Sales representative
Jane,,Smith,Jane Smith,jane.smith@company.com,,John Doe,janesmith,StrongPwd456@,Marketing manager
```

## Security Considerations
- Only admin users can access the CSV import feature
- All password validation rules are enforced
- Duplicate detection prevents conflicts
- Failed imports don't affect successful ones
- Comprehensive logging of import activities

## File Requirements
- File must have `.csv` extension
- Must contain header row with required columns
- Maximum file size limits apply (check with system administrator)
- UTF-8 encoding recommended

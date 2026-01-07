# Authentication API Integration

This document describes the authentication flow using axios for the admin login and OTP verification.

## Files Created

### 1. `resources/js/lib/axios.ts`
- Axios instance with base configuration
- Request interceptor to add authentication tokens
- Response interceptor for error handling
- Automatically handles 401 (unauthorized) responses

### 2. `resources/js/services/authService.ts`
- **login(identifier)**: Sends OTP to user's email or phone
- **verifyOtp(identifier, otp)**: Verifies OTP and authenticates user
- **logout()**: Logs out user and clears stored data
- **getUser()**: Returns current authenticated user
- **isAuthenticated()**: Checks if user has valid auth token

## Authentication Flow

### Login Process:
1. User enters email on `/admin/login`
2. Click "Sign In" button
3. API sends OTP to the provided email
4. User is redirected to `/admin/otp`

### OTP Verification:
1. User enters 6-digit OTP
2. Click "Verify & Continue"
3. API validates the OTP
4. On success: Auth token is stored in localStorage and user is redirected to `/admin`
5. On failure: Error message is displayed

### Resend OTP:
1. User clicks "Resend Code" button
2. New OTP is sent to user's email
3. Timer resets to 5 minutes

## API Endpoints

All endpoints are prefixed with `/api`:

- `POST /api/login` - Send OTP to user
  - Body: `{ identifier: "email@example.com" }`
  - Response: `{ message: "OTP sent successfully" }`

- `POST /api/verify-otp` - Verify OTP and authenticate
  - Body: `{ identifier: "email@example.com", otp: "123456" }`
  - Response: `{ message: "Login successful", token: "...", user: {...} }`

## Storage

- **localStorage.auth_token**: Authentication token (Bearer token)
- **localStorage.user**: User object (JSON string)
- **sessionStorage.adminEmail**: Temporary storage for email during OTP flow

## Error Handling

Errors are caught and displayed in the UI:
- Network errors
- Invalid credentials
- Expired OTP
- Server errors

Error messages are extracted from API responses or default messages are shown.

## Usage Example

```typescript
import authService from '@/services/authService';

// Login
try {
  await authService.login({ identifier: 'admin@example.com' });
  // Navigate to OTP page
} catch (error) {
  // Handle error
}

// Verify OTP
try {
  const response = await authService.verifyOtp({
    identifier: 'admin@example.com',
    otp: '123456'
  });
  // Token is automatically stored
  // Navigate to admin dashboard
} catch (error) {
  // Handle error
}

// Check authentication
if (authService.isAuthenticated()) {
  // User is logged in
}

// Get current user
const user = authService.getUser();

// Logout
await authService.logout();
```

## Notes

- OTP expires after 5 minutes
- Password field is present in the UI but not currently used in the API (backend only uses identifier)
- The backend supports both email and phone number as identifier
- CSRF token handling is managed by Laravel

# Testing Guide for Admin Login & OTP

## Prerequisites

1. ✅ Backend server running: `php artisan serve`
2. ✅ Frontend dev server running: `npm run dev`
3. ✅ Database configured with users table
4. ✅ Email service configured (for OTP delivery)

## Test Scenarios

### ✅ Test 1: Successful Login Flow

**Steps:**
1. Navigate to `http://localhost:8000/admin/login`
2. Enter a valid admin email (e.g., `admin@tride.com`)
3. Enter any password (optional - not validated in backend)
4. Click "Sign In"

**Expected Results:**
- Loading spinner appears
- API call to `/api/login` is made
- If successful: Redirect to `/admin/otp` page
- Email with OTP is sent to the provided address

**Verification:**
- Check browser Network tab for `/api/login` request (status 200)
- Check email inbox for OTP
- Verify `adminEmail` is stored in sessionStorage

---

### ✅ Test 2: Login with Invalid Email

**Steps:**
1. Navigate to `/admin/login`
2. Enter invalid email format (e.g., `notanemail`)
3. Click "Sign In"

**Expected Results:**
- Error message: "Please enter a valid email address"
- No API call made
- Stay on login page

---

### ✅ Test 3: Login with Non-existent Email

**Steps:**
1. Enter email that doesn't exist in database
2. Click "Sign In"

**Expected Results:**
- Loading spinner appears
- API call made
- Error message: "User not found" (from backend)
- Stay on login page

---

### ✅ Test 4: OTP Verification - Success

**Steps:**
1. Complete successful login (Test 1)
2. On OTP page, enter the correct 6-digit OTP
3. Click "Verify & Continue"

**Expected Results:**
- Loading state appears on button
- API call to `/api/verify-otp` is made
- Auth token stored in `localStorage.auth_token`
- User object stored in `localStorage.user`
- Redirect to `/admin` dashboard

**Verification:**
- Open DevTools → Application → Local Storage
- Check for `auth_token` and `user` keys
- Network tab shows successful `/api/verify-otp` request

---

### ✅ Test 5: OTP Verification - Invalid OTP

**Steps:**
1. Complete successful login
2. Enter incorrect OTP (e.g., `111111`)
3. Click "Verify & Continue"

**Expected Results:**
- Error message: "Invalid or expired OTP"
- Stay on OTP page
- No token stored
- No redirect

---

### ✅ Test 6: OTP Expiration

**Steps:**
1. Complete successful login
2. Wait for 5+ minutes (timer shows 00:00)
3. Try to verify OTP

**Expected Results:**
- Timer shows as expired (red color)
- Error message shown
- "Resend Code" button becomes active

---

### ✅ Test 7: Resend OTP

**Steps:**
1. On OTP page, wait 1 minute or let OTP expire
2. Click "Resend Code"

**Expected Results:**
- Loading state on resend button
- New API call to `/api/login`
- New OTP sent to email
- Timer resets to 5:00
- OTP input fields cleared
- Focus returns to first input field

**Verification:**
- Check email for new OTP code
- Network tab shows new `/api/login` request

---

### ✅ Test 8: OTP Auto-Navigation

**Steps:**
1. Paste or type complete 6-digit OTP
2. Observe field auto-focus behavior

**Expected Results:**
- Each digit automatically moves focus to next field
- Backspace moves to previous field
- Arrow keys navigate between fields
- Paste functionality works (try Ctrl+V with 6-digit code)

---

### ✅ Test 9: Network Error Handling

**Steps:**
1. Turn off backend server (`php artisan serve`)
2. Try to login

**Expected Results:**
- Error message displayed
- Loading state stops
- No redirect
- User-friendly error: "Failed to send OTP. Please try again."

---

### ✅ Test 10: Session Persistence

**Steps:**
1. Complete full login flow (get token)
2. Refresh the page
3. Check localStorage

**Expected Results:**
- `auth_token` still present in localStorage
- `user` object still present
- Can access protected routes

---

## Debug Checklist

### If login fails:

- [ ] Check backend is running: `php artisan serve`
- [ ] Check frontend is running: `npm run dev`
- [ ] Check Network tab for error responses
- [ ] Verify user exists in database
- [ ] Check email configuration in `.env`
- [ ] Verify API routes in `routes/api.php`

### If OTP verification fails:

- [ ] Check OTP in email or database `otps` table
- [ ] Verify OTP hasn't expired (< 5 minutes)
- [ ] Check Network tab for error details
- [ ] Verify identifier matches (email used for login)

### If redirects don't work:

- [ ] Check browser console for errors
- [ ] Verify routes exist in `routes/web.php`
- [ ] Check for JavaScript errors in DevTools

---

## API Testing with Postman/Insomnia

### 1. Login (Send OTP)
```
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "identifier": "admin@tride.com"
}
```

**Expected Response:**
```json
{
  "message": "OTP sent successfully"
}
```

### 2. Verify OTP
```
POST http://localhost:8000/api/verify-otp
Content-Type: application/json

{
  "identifier": "admin@tride.com",
  "otp": "123456"
}
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@tride.com",
    "phone_number": "+1234567890"
  }
}
```

### 3. Logout (Authenticated)
```
POST http://localhost:8000/api/logout
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

## Browser DevTools Monitoring

### Console Logs to Add (Optional Debug)

Add these to `authService.ts` for debugging:

```typescript
async login(data: LoginRequest): Promise<OtpResponse> {
  console.log('🔐 Login attempt:', data);
  const response = await axiosInstance.post<OtpResponse>('/login', data);
  console.log('✅ OTP sent:', response.data);
  return response.data;
}

async verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
  console.log('🔍 Verifying OTP:', { identifier: data.identifier });
  const response = await axiosInstance.post<AuthResponse>('/verify-otp', data);
  console.log('✅ Auth successful:', response.data);
  return response.data;
}
```

### Network Tab Checklist

Monitor these requests:
- ✅ `POST /api/login` → Status 200
- ✅ `POST /api/verify-otp` → Status 200
- ✅ Request headers include `Content-Type: application/json`
- ✅ Response headers include proper CORS headers

---

## Known Issues & Solutions

### Issue: CSRF Token Mismatch
**Solution:** Laravel Sanctum/Passport already handles tokens

### Issue: CORS errors
**Solution:** Already handled by Laravel configuration

### Issue: Token not persisting
**Solution:** Check browser storage settings, ensure not in incognito mode

### Issue: OTP email not arriving
**Solution:** 
- Check `.env` mail configuration
- Check spam folder
- Check database `otps` table for generated code
- Verify mail service is working: `php artisan tinker` → `Mail::raw('test', function($msg) { $msg->to('test@test.com')->subject('Test'); })`

---

## Success Criteria

✅ All tests pass
✅ No console errors
✅ Clean network requests
✅ Proper error handling
✅ Tokens stored correctly
✅ Redirects work smoothly
✅ UI shows appropriate loading/error states

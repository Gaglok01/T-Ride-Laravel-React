# 🚀 Quick Reference: Admin Login & OTP Integration

## 📁 Files Overview

```
resources/js/
├── lib/
│   └── axios.ts                    # Axios instance configuration
├── services/
│   └── authService.ts              # Authentication API service
├── hooks/
│   └── useAuth.tsx                 # Auth utilities & hooks
├── pages/admin/
│   ├── login.tsx                   # Login page (updated)
│   └── otp.tsx                     # OTP verification page (updated)
└── docs/
    └── AUTH_API.md                 # Detailed API documentation
```

## 🔌 Quick Usage

### Login (Send OTP)
```typescript
import authService from '@/services/authService';

await authService.login({ 
  identifier: 'admin@tride.com' 
});
```

### Verify OTP
```typescript
await authService.verifyOtp({ 
  identifier: 'admin@tride.com',
  otp: '123456'
});
// Token automatically stored in localStorage
```

### Check Authentication
```typescript
if (authService.isAuthenticated()) {
  const user = authService.getUser();
  console.log(user.name);
}
```

### Logout
```typescript
await authService.logout();
// Clears localStorage and sessionStorage
```

### Protect Routes
```typescript
import { withAuth } from '@/hooks/useAuth';

export default withAuth(AdminDashboard);
```

### Use Auth Hook
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.name}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🛣️ API Endpoints

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/login` | POST | ❌ | Send OTP |
| `/api/verify-otp` | POST | ❌ | Verify OTP & Login |
| `/api/logout` | POST | ✅ | Logout user |

## 📦 Request/Response Formats

### Login Request
```json
{
  "identifier": "admin@tride.com"
}
```

### Login Response
```json
{
  "message": "OTP sent successfully"
}
```

### Verify OTP Request
```json
{
  "identifier": "admin@tride.com",
  "otp": "123456"
}
```

### Verify OTP Response
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1Qi...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@tride.com",
    "phone_number": "+1234567890"
  }
}
```

## 🔐 Storage Keys

| Key | Location | Purpose |
|-----|----------|---------|
| `auth_token` | localStorage | Bearer token for API calls |
| `user` | localStorage | User object (JSON) |
| `adminEmail` | sessionStorage | Temp email during OTP flow |

## ⚡ Quick Test

1. Start servers: `php artisan serve` & `npm run dev`
2. Navigate to: `http://localhost:8000/admin/login`
3. Enter email → Get OTP
4. Enter OTP → Get authenticated
5. Check DevTools → Application → Local Storage for `auth_token`

## 🐛 Debug Commands

```bash
# Check OTPs in database
php artisan tinker
>>> Otp::latest()->first()

# Clear OTPs
>>> Otp::truncate()

# Test email
>>> Mail::raw('test', function($msg) { 
      $msg->to('test@test.com')->subject('Test'); 
    })
```

## 🎯 Common Patterns

### Making Authenticated Requests
```typescript
import axiosInstance from '@/lib/axios';

// Token automatically added by interceptor
const response = await axiosInstance.get('/admin/users');
```

### Error Handling
```typescript
try {
  await authService.login({ identifier: email });
} catch (error: any) {
  const message = error.response?.data?.message || 'An error occurred';
  console.error(message);
}
```

## 📊 Flow Summary

```
1. User visits /admin/login
2. Enters email → Click "Sign In"
3. API sends OTP to email (5 min expiry)
4. User redirected to /admin/otp
5. Enters 6-digit OTP → Click "Verify"
6. API validates OTP
7. Token stored in localStorage
8. User redirected to /admin
```

## ⚙️ Configuration

### Vite Config (`vite.config.ts`)
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './resources/js'),
  },
}
```

### TypeScript Config (`tsconfig.json`)
```json
{
  "paths": {
    "@/*": ["./resources/js/*"]
  }
}
```

## 🔄 OTP Behavior

- **Expiry**: 5 minutes
- **Length**: 6 digits
- **Resend**: Available after 1 minute or on expiry
- **One-time use**: OTP marked as used after successful verification
- **Auto-focus**: Fields auto-advance during entry

## 📱 Browser Support

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 🎨 UI States

| State | Login Page | OTP Page |
|-------|------------|----------|
| **Loading** | "Signing in..." spinner | "Verifying..." spinner |
| **Error** | Red error banner | Red error banner |
| **Success** | Redirect to OTP | Redirect to admin |
| **Expired** | N/A | Red timer, "Resend" active |

## 🚨 Error Messages

| Error | Message |
|-------|---------|
| Empty fields | "Please fill in all fields" |
| Invalid email | "Please enter a valid email address" |
| User not found | "User not found" (from API) |
| Invalid OTP | "Invalid or expired OTP" |
| Expired OTP | "OTP has expired. Please request a new one." |
| Network error | "Failed to send OTP. Please try again." |

## 📚 Related Files

- Backend Controller: `app/Http/Controllers/Api/AuthController.php`
- API Routes: `routes/api.php`
- OTP Model: `app/Models/Otp.php`
- User Model: `app/Models/User.php`

## 🎓 Best Practices

1. ✅ Always use try-catch for API calls
2. ✅ Show loading states to users
3. ✅ Clear error messages on new input
4. ✅ Store email in sessionStorage during OTP flow
5. ✅ Clear sensitive data after use
6. ✅ Use TypeScript types from authService
7. ✅ Handle network errors gracefully

## 💡 Tips

- OTP is logged to email (or check database in development)
- Use browser DevTools Network tab to debug API calls
- Check localStorage in Application tab for tokens
- Use `authService` for all auth operations
- Don't manually set tokens - let the service handle it

---

**Need more help?** Check `AUTH_API.md` for detailed documentation or `TESTING_GUIDE.md` for comprehensive testing scenarios.

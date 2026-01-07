# OTP Email Template - Setup Complete ✅

## Problem Solved
**Error:** `View [emails.otp] not found`
**Solution:** Created email templates for OTP verification

## Files Created

1. **`resources/views/emails/otp.blade.php`**
   - Beautiful HTML email template
   - T-RIDE branding with dark header
   - Large, clear OTP display
   - Security warnings and instructions
   - Responsive design

2. **`resources/views/emails/otp-text.blade.php`**
   - Plain text version for email clients
   - Same information, text-only format

3. **Updated: `app/Mail/OtpMail.php`**
   - Added text version support
   - Both HTML and text emails will be sent

## Email Features

✅ **Professional Design**
- T-RIDE branding with logo
- Yellow/Gold gradient OTP box
- Large, easy-to-read OTP code (48px)
- Security warnings highlighted

✅ **Security Elements**
- Warning box with security notice
- "Don't share OTP" message
- Expiry time clearly shown (5 minutes)
- One-time use notice

✅ **User-Friendly**
- Clear instructions
- Visual hierarchy
- Responsive for mobile/desktop
- Supports both HTML and plain text

## How It Looks

The email includes:

1. **Header** - T-RIDE logo with dark background
2. **Greeting** - "Hello Admin!"
3. **OTP Box** - Large 6-digit code with timer
4. **Security Warning** - Yellow alert box
5. **Info List** - Key points about OTP
6. **Footer** - Copyright and disclaimer

## Test Email

Ab aap login kar sakte ho:

```bash
# Frontend par jao
http://localhost:8000/admin/login

# Email enter karo
admin@tride.com

# OTP email check karo
```

## Checking Sent Email

### Option 1: Real Email
Agar mail configuration sahi hai (SMTP setup), toh email inbox mein milega.

### Option 2: Laravel Log
Agar mail driver `log` pe hai, check karo:
```bash
storage/logs/laravel.log
```

### Option 3: MailHog (Development)
Agar MailHog use kar rahe ho:
```
http://localhost:8025
```

### Option 4: Database se OTP nikalo
```sql
SELECT * FROM otps 
WHERE identifier = 'admin@tride.com' 
ORDER BY created_at DESC 
LIMIT 1;
```

## Email Configuration Check

`.env` file mein ye settings check karo:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@tride.com
MAIL_FROM_NAME="${APP_NAME}"
```

### For Development (No Real Email):
```env
MAIL_MAILER=log
```
Emails will be logged to `storage/logs/laravel.log`

## Testing the Email

### Test 1: Send Test Email via Tinker
```bash
php artisan tinker

# Send a test OTP email
Mail::to('test@example.com')->send(new \App\Mail\OtpMail('123456'));
```

### Test 2: Through Login API
```bash
# Use Postman or browser
POST http://localhost:8000/api/login
{
  "identifier": "admin@tride.com"
}
```

## Troubleshooting

### Email Not Sending?

1. **Check Mail Configuration**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

2. **Check .env file**
   - Verify MAIL_* settings
   - For Gmail: Use App Password (not regular password)

3. **Check Logs**
   ```bash
   tail -f storage/logs/laravel.log
   ```

4. **Test Mail Connection**
   ```bash
   php artisan tinker
   Mail::raw('Test', function($msg) {
       $msg->to('test@test.com')->subject('Test');
   });
   ```

### Common Issues

| Issue | Solution |
|-------|----------|
| SMTP Error | Check MAIL_HOST, MAIL_PORT, credentials |
| SSL Error | Try MAIL_ENCRYPTION=tls instead of ssl |
| Auth Failed | For Gmail, use App Password |
| Timeout | Check firewall/network settings |

## Gmail Setup (For Development)

1. Enable 2-Factor Authentication
2. Generate App Password:
   - Google Account → Security → App Passwords
   - Select "Mail" and your device
   - Copy the generated password
3. Use in `.env`:
   ```env
   MAIL_USERNAME=youremail@gmail.com
   MAIL_PASSWORD=generated-app-password
   ```

## Email Preview

See the generated image above for how the email will look!

## Next Steps

✅ Email template created
✅ Both HTML and text versions ready
✅ Ready to send OTPs

Ab aap login kar sakte ho aur OTP email receive kar sakte ho!

---

**Need More Help?**
- Check Laravel logs: `storage/logs/laravel.log`
- Test in Postman: POST to `/api/login`
- Check database: `SELECT * FROM otps;`

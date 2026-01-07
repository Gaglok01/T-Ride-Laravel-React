<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification - T-RIDE</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 36px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: -1px;
            margin-bottom: 8px;
        }
        .logo-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #F59E0B;
            border-radius: 50%;
            margin-left: 4px;
            vertical-align: middle;
        }
        .tagline {
            color: #9ca3af;
            font-size: 14px;
        }
        .email-body {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 16px;
        }
        .message {
            font-size: 16px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        .otp-container {
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            border-radius: 12px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
        }
        .otp-label {
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            font-weight: 600;
        }
        .otp-code {
            font-size: 48px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            text-align: center;
            margin: 8px 0;
        }
        .otp-expiry {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.8);
            margin-top: 12px;
        }
        .warning-box {
            background-color: #fef3c7;
            border-left: 4px solid #F59E0B;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
        }
        .warning-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
        }
        .warning-text {
            font-size: 14px;
            color: #78350f;
            line-height: 1.5;
        }
        .info-list {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
        }
        .info-item {
            display: flex;
            align-items: start;
            margin-bottom: 12px;
            font-size: 14px;
            color: #4b5563;
        }
        .info-item:last-child {
            margin-bottom: 0;
        }
        .info-icon {
            color: #F59E0B;
            margin-right: 8px;
            font-weight: bold;
        }
        .email-footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-text {
            font-size: 13px;
            color: #9ca3af;
            line-height: 1.6;
        }
        .footer-link {
            color: #F59E0B;
            text-decoration: none;
        }
        .footer-link:hover {
            text-decoration: underline;
        }
        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <div class="logo">
                T-RIDE<span class="logo-dot"></span>
            </div>
            <div class="tagline">Admin Control Panel</div>
        </div>

        <!-- Body -->
        <div class="email-body">
            <div class="greeting">Hello Admin!</div>
            
            <div class="message">
                We received a request to sign in to your T-RIDE Admin account. Please use the verification code below to complete your login.
            </div>

            <!-- OTP Box -->
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">{{ $otp }}</div>
                <div class="otp-expiry">⏰ Valid for 5 minutes</div>
            </div>

            <!-- Security Warning -->
            <div class="warning-box">
                <div class="warning-title">
                    🔒 Security Notice
                </div>
                <div class="warning-text">
                    Never share this code with anyone. T-RIDE will never ask you for this code via phone, email, or any other means.
                </div>
            </div>

            <!-- Info List -->
            <div class="info-list">
                <div class="info-item">
                    <span class="info-icon">✓</span>
                    <span>This code can only be used once</span>
                </div>
                <div class="info-item">
                    <span class="info-icon">✓</span>
                    <span>Expires automatically after 5 minutes</span>
                </div>
                <div class="info-item">
                    <span class="info-icon">✓</span>
                    <span>If you didn't request this code, please ignore this email</span>
                </div>
            </div>

            <div class="divider"></div>

            <div class="message">
                If you did not request this code, please ignore this email or contact our support team immediately.
            </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <div class="footer-text">
                © {{ date('Y') }} T-RIDE. All rights reserved.<br>
                This is an automated message, please do not reply to this email.
            </div>
        </div>
    </div>
</body>
</html>

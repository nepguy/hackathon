# SMTP Configuration Script for Supabase + Resend.com

## 🎯 **Quick Setup Checklist**

Follow these exact steps to configure SMTP for your GuardNomad application:

### **Step 1: Supabase Dashboard SMTP Settings**

1. **Navigate to Supabase Dashboard**
   - Go to: [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your GuardNomad project

2. **Access Authentication Settings**
   - Click **Settings** (left sidebar)
   - Click **Authentication** 
   - Scroll down to **SMTP Settings**

3. **Configure SMTP Settings** (Copy these exact values):
   ```
   ✅ Enable custom SMTP: ON
   
   SMTP Host: smtp.resend.com
   SMTP Port: 587
   SMTP User: resend
   SMTP Password: [YOUR_RESEND_API_KEY]
   SMTP Sender Name: GuardNomad
   SMTP Sender Email: noreply@guardnomad.com
   ```

4. **Click Save** to apply changes

### **Step 2: URL Configuration**

Still in **Settings** → **Authentication**:

1. **Site URL Configuration**:
   ```
   Site URL: https://guardnomad.com
   ```
   
   For development:
   ```
   Site URL: http://localhost:5177
   ```

2. **Redirect URLs** (add all of these with wildcards):
   ```
   https://guardnomad.com/*
   https://*.guardnomad.com/*
   http://localhost:5177/*
   http://localhost:5176/*
   http://localhost:5175/*
   http://localhost:5174/*
   http://localhost:5173/*
   
   # Specific URLs (if wildcards don't work)
   https://guardnomad.com/auth
   https://guardnomad.com/password-reset
   http://localhost:5177/auth
   http://localhost:5177/password-reset
   ```

### **Step 3: Email Templates**

In **Settings** → **Authentication** → **Email Templates**:

#### **Confirm Signup Template**:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
    <div style="background-color: rgba(255,255,255,0.1); padding: 16px; border-radius: 16px; display: inline-block; margin-bottom: 20px;">
      <span style="font-size: 48px;">🛡️</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to GuardNomad!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your trusted companion for safe travels</p>
  </div>
  
  <div style="padding: 40px 20px;">
    <h2 style="color: #1f2937; margin-bottom: 20px;">Hi there!</h2>
    <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
      Welcome to GuardNomad - your trusted companion for safe travels worldwide! Please confirm your email address to activate your account.
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
        ✅ Confirm Email Address
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      This link will expire in 24 hours for security reasons.
    </p>
  </div>
  
  <div style="background-color: #f8fafc; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="color: #4b5563; margin: 0 0 8px 0;">Safe travels,</p>
    <p style="color: #1f2937; font-weight: bold; margin: 0;">The GuardNomad Team</p>
  </div>
  
  <div style="padding: 16px 20px; text-align: center; background-color: #1f2937;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      This email was sent to {{ .Email }}. If you have any questions, contact us at 
      <a href="mailto:support@guardnomad.com" style="color: #60a5fa;">support@guardnomad.com</a>
    </p>
  </div>
</div>
```

#### **Reset Password Template**:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%); padding: 32px 20px; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Reset Your Password</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">GuardNomad Security</p>
  </div>
  
  <div style="padding: 32px 20px;">
    <h2 style="color: #1f2937; margin-bottom: 16px;">Hi there,</h2>
    <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
      We received a request to reset the password for your GuardNomad account. Click the button below to create a new password:
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background-color: #ef4444; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
        🔑 Reset Password
      </a>
    </div>
    
    <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin: 24px 0; border: 1px solid #fecaca;">
      <p style="color: #dc2626; margin: 0; font-size: 14px;">
        <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, you can safely ignore this email.
      </p>
    </div>
  </div>
  
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="color: #4b5563; margin: 0;">
      Safe travels,<br>
      <strong>The GuardNomad Team</strong>
    </p>
  </div>
  
  <div style="padding: 16px 20px; text-align: center; background-color: #1f2937;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      This email was sent to {{ .Email }}. For support, contact us at 
      <a href="mailto:support@guardnomad.com" style="color: #60a5fa;">support@guardnomad.com</a>
    </p>
  </div>
</div>
```

#### **Magic Link Template**:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 32px 20px; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Sign in to GuardNomad</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Magic Link Authentication</p>
  </div>
  
  <div style="padding: 32px 20px;">
    <h2 style="color: #1f2937; margin-bottom: 16px;">Hi there,</h2>
    <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
      Click the button below to securely sign in to your GuardNomad account:
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
        🔐 Sign In to GuardNomad
      </a>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; text-align: center;">
      This link will expire in 1 hour for security reasons.
    </p>
  </div>
  
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="color: #4b5563; margin: 0;">
      Safe travels,<br>
      <strong>The GuardNomad Team</strong>
    </p>
  </div>
  
  <div style="padding: 16px 20px; text-align: center; background-color: #1f2937;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      This email was sent to {{ .Email }}. For support, contact us at 
      <a href="mailto:support@guardnomad.com" style="color: #60a5fa;">support@guardnomad.com</a>
    </p>
  </div>
</div>
```

### **Step 4: Environment Variables**

Add to your `.env` file:
```env
# Resend Configuration
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Update these with your actual domain
VITE_APP_URL=https://yourdomain.com
VITE_SUPPORT_EMAIL=support@guardnomad.com
```

### **Step 5: Test the Configuration**

1. **Test Email Confirmation**:
   - Create a new account at `/auth`
   - Check your email for confirmation
   - Click the confirmation link
   - Verify you're redirected properly

2. **Test Password Reset**:
   - Go to sign-in page
   - Click "Forgot password?"
   - Enter your email
   - Check email for reset link
   - Complete password reset flow

3. **Test Welcome Email** (if using custom service):
   ```typescript
   // In browser console or test component
   import { resendService } from './lib/resendService';
   await resendService.sendWelcomeEmail('test@example.com', 'Test User');
   ```

### **Step 6: Verify Configuration**

✅ **Checklist**:
- [ ] SMTP settings saved in Supabase
- [ ] Site URL configured correctly
- [ ] Redirect URLs added
- [ ] Email templates updated with branded content
- [ ] Environment variables added
- [ ] Email confirmation flow tested
- [ ] Password reset flow tested
- [ ] Welcome emails working (if enabled)

### **Step 7: Production Considerations**

1. **Custom Domain** (Recommended):
   - Verify your domain in Resend dashboard
   - Update `SMTP_SENDER_EMAIL` to use your domain
   - Set up SPF, DKIM, and DMARC records

2. **Rate Limits**:
   - Resend free tier: 3,000 emails/month
   - Paid plans: Higher limits available

3. **Monitoring**:
   - Check Resend dashboard for delivery rates
   - Monitor Supabase auth logs
   - Set up alerts for failed emails

### **Troubleshooting**

**Common Issues**:

1. **Emails not sending**:
   - Verify API key is correct in Supabase SMTP settings
   - Check Resend dashboard for errors
   - Ensure SMTP is enabled in Supabase

2. **Emails going to spam**:
   - Verify your domain in Resend
   - Set up proper DNS records
   - Use a professional from address

3. **Links not working**:
   - Check redirect URLs in Supabase
   - Verify site URL is correct
   - Test with both development and production URLs

**Debug Commands**:
```bash
# Test Resend API directly
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "GuardNomad <noreply@yourdomain.com>",
    "to": ["test@example.com"],
    "subject": "Test Email",
    "html": "<p>Test email from GuardNomad SMTP setup</p>"
  }'
```

### **Success Indicators**

When everything is working correctly, you should see:

1. ✅ Users receive branded confirmation emails
2. ✅ Password reset emails arrive promptly
3. ✅ Welcome emails sent after signup (if enabled)
4. ✅ All email links redirect properly
5. ✅ No SMTP errors in Supabase logs
6. ✅ Good delivery rates in Resend dashboard

Your SMTP setup is now complete! Users will receive professional, branded emails for all authentication flows. 
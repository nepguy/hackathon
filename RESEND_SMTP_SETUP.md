# Resend.com SMTP Setup with Supabase

## 🚀 **Complete SMTP Configuration Guide**

This guide will help you set up Resend.com as your SMTP provider for Supabase authentication emails (email confirmation, password reset, etc.).

## 📋 **Prerequisites**

- ✅ Supabase project created
- ✅ Resend.com account with API key
- ✅ Domain verification in Resend (optional but recommended)

## 🔧 **Step 1: Supabase SMTP Configuration**

### **1.1 Access Supabase Dashboard**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Authentication**
4. Scroll down to **SMTP Settings**

### **1.2 Configure SMTP Settings**
```
SMTP Host: smtp.resend.com
SMTP Port: 587 (or 465 for SSL)
SMTP User: resend
SMTP Password: [YOUR_RESEND_API_KEY]
SMTP Sender Name: Guard Nomand
SMTP Sender Email: noreply@guardnomand.com
```

### **1.3 Enable SMTP**
- Toggle **"Enable custom SMTP"** to ON
- Click **Save** to apply changes

## 🔑 **Step 2: Environment Variables**

Create or update your `.env` file:

```env
# Resend Configuration
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Configuration (existing)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# SMTP Configuration (for reference)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=GuardNomad
```

## 📧 **Step 3: Email Templates Configuration**

### **3.1 Confirmation Email Template**
In Supabase Dashboard → Authentication → Email Templates → Confirm signup:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
    <div style="background-color: rgba(255,255,255,0.1); padding: 16px; border-radius: 16px; display: inline-block; margin-bottom: 20px;">
      <span style="font-size: 48px;">🛡️</span>
    </div>
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Guard Nomand!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your trusted companion for safe travels</p>
  </div>
  
  <div style="padding: 40px 20px;">
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Hi there! 👋
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
      Welcome to Guard Nomand - your trusted companion for safe travels worldwide! We're excited to have you join our community of smart travelers.
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
      Please click the button below to confirm your email address and activate your account:
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
        ✅ Confirm Email Address
      </a>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 8px;">
      <p style="color: #92400e; margin: 0; font-size: 14px;">
        ⏰ <strong>Important:</strong> This link will expire in 24 hours for security reasons.
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0;">
      If you didn't create an account with Guard Nomand, you can safely ignore this email.
    </p>
  </div>
  
  <div style="background-color: #f8fafc; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="color: #4b5563; margin: 0 0 8px 0;">Safe travels,</p>
    <p style="color: #1f2937; font-weight: bold; margin: 0;">The Guard Nomand Team</p>
  </div>
  
  <div style="padding: 16px 20px; text-align: center; background-color: #1f2937;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      This email was sent to {{ .Email }}. If you have any questions, contact us at 
      <a href="mailto:support@guardnomand.com" style="color: #60a5fa;">support@guardnomand.com</a>
    </p>
  </div>
</div>
```

### **3.2 Password Reset Email Template**
In Supabase Dashboard → Authentication → Email Templates → Reset password:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%); padding: 32px 20px; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 16px;">🔐</div>
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Reset Your Guard Nomand Password</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Security</p>
  </div>
  
  <div style="padding: 32px 20px;">
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hi there,
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      We received a request to reset the password for your Guard Nomand account.
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 28px 0;">
      Click the button below to create a new password:
    </p>
    
    <div style="text-align: center; margin: 28px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
        🔑 Reset Password
      </a>
    </div>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 8px;">
      <p style="color: #991b1b; margin: 0; font-size: 14px;">
        ⏰ <strong>Security Notice:</strong> This link will expire in 1 hour for your protection.
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
      If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
    </p>
  </div>
  
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="color: #4b5563; margin: 0;">
      Safe travels,<br>
      <strong>The Guard Nomand Team</strong>
    </p>
  </div>
  
  <div style="padding: 16px 20px; text-align: center; background-color: #1f2937;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      This email was sent to {{ .Email }}. For support, contact us at 
      <a href="mailto:support@guardnomand.com" style="color: #60a5fa;">support@guardnomand.com</a>
    </p>
  </div>
</div>
```

### **3.3 Magic Link Email Template**
In Supabase Dashboard → Authentication → Email Templates → Magic Link:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 32px 20px; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
    <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Sign in to Guard Nomand</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Magic Link Authentication</p>
  </div>
  
  <div style="padding: 32px 20px;">
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hi there! 👋
    </p>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 28px 0;">
      Click the link below to sign in to your Guard Nomand account:
    </p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
        🔐 Sign In to Guard Nomand
      </a>
    </div>
    
    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 8px;">
      <p style="color: #065f46; margin: 0; font-size: 14px;">
        ⏰ <strong>Quick Access:</strong> This link will expire in 1 hour for security reasons.
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
      If you didn't request this sign-in link, you can safely ignore this email.
    </p>
  </div>
  
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="color: #4b5563; margin: 0;">
      Safe travels,<br>
      <strong>The Guard Nomand Team</strong>
    </p>
  </div>
  
  <div style="padding: 16px 20px; text-align: center; background-color: #1f2937;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      This email was sent to {{ .Email }}. For support, contact us at 
      <a href="mailto:support@guardnomand.com" style="color: #60a5fa;">support@guardnomand.com</a>
    </p>
  </div>
</div>
```

## 🛠 **Step 4: Resend Service Integration (Optional)**

Create a Resend service for additional email functionality:

```typescript
// src/lib/resendService.ts
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export interface EmailTemplate {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

export class ResendService {
  private static instance: ResendService;
  private resendClient: Resend;

  private constructor() {
    this.resendClient = resend;
  }

  public static getInstance(): ResendService {
    if (!ResendService.instance) {
      ResendService.instance = new ResendService();
    }
    return ResendService.instance;
  }

  async sendEmail(template: EmailTemplate): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const { data, error } = await this.resendClient.emails.send({
        from: template.from || 'GuardNomad <noreply@yourdomain.com>',
        to: template.to,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('Resend error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, id: data?.id };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const template: EmailTemplate = {
      to: [userEmail],
      subject: 'Welcome to GuardNomad - Your Safe Travel Journey Begins!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Welcome to GuardNomad, ${userName}!</h1>
          <p>We're excited to have you join our community of safe travelers.</p>
          <p>Here's what you can do with GuardNomad:</p>
          <ul>
            <li>🛡️ Get real-time safety alerts for your destinations</li>
            <li>🌍 Access travel information for 195+ countries</li>
            <li>📱 Receive weather updates and local event notifications</li>
            <li>👥 Connect with fellow travelers and share experiences</li>
          </ul>
          <p>Ready to start your safe travel journey?</p>
          <a href="${window.location.origin}/home" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Explore GuardNomad
          </a>
          <br><br>
          <p>Safe travels,<br>The GuardNomad Team</p>
        </div>
      `
    };

    await this.sendEmail(template);
  }

  // Travel alert notification
  async sendTravelAlert(userEmail: string, alert: {
    title: string;
    location: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }): Promise<void> {
    const severityColors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444'
    };

    const template: EmailTemplate = {
      to: [userEmail],
      subject: `🚨 ${alert.severity.toUpperCase()} Alert: ${alert.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${severityColors[alert.severity]}; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Travel Alert: ${alert.location}</h2>
          </div>
          <div style="border: 1px solid #e5e7eb; padding: 20px; border-radius: 0 0 8px 8px;">
            <h3>${alert.title}</h3>
            <p>${alert.description}</p>
            <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
            <p><strong>Location:</strong> ${alert.location}</p>
            <a href="${window.location.origin}/alerts" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              View All Alerts
            </a>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            This alert was sent because you have notifications enabled for ${alert.location}.
            <a href="${window.location.origin}/profile-settings">Manage your notification preferences</a>
          </p>
        </div>
      `
    };

    await this.sendEmail(template);
  }
}

export const resendService = ResendService.getInstance();
```

## 📦 **Step 5: Install Resend Package**

```bash
npm install resend
npm install -D @types/resend
```

## 🔗 **Step 6: Update AuthContext for Welcome Emails**

```typescript
// In src/contexts/AuthContext.tsx - add after successful signup
import { resendService } from '../lib/resendService';

// After successful user creation
if (data.user && !error) {
  // Send welcome email
  try {
    await resendService.sendWelcomeEmail(
      data.user.email!,
      userData?.full_name || data.user.email!.split('@')[0]
    );
  } catch (emailError) {
    console.error('Failed to send welcome email:', emailError);
    // Don't fail the signup process if email fails
  }
}
```

## ⚙️ **Step 7: Supabase URL Configuration**

### **7.1 Site URL**
In Supabase Dashboard → Authentication → URL Configuration:
```
Site URL: https://guardnomand.com
```

### **7.2 Redirect URLs**
Add these redirect URLs:
```
https://guardnomand.com/*
https://*.guardnomand.com/*
http://localhost:5177/*
http://localhost:5176/*
http://localhost:5175/*
http://localhost:5174/*
http://localhost:5173/*
http://localhost:3000/*

# Specific URLs (if wildcards don't work)
https://guardnomand.com/auth
https://guardnomand.com/password-reset
http://localhost:5177/auth
http://localhost:5177/password-reset
```

## 🧪 **Step 8: Testing**

### **8.1 Test Email Confirmation**
1. Create a new account
2. Check email for confirmation link
3. Click link and verify redirect works
4. Ensure user is marked as confirmed in Supabase

### **8.2 Test Password Reset**
1. Go to sign-in page
2. Click "Forgot password?"
3. Enter email and submit
4. Check email for reset link
5. Click link and set new password
6. Sign in with new password

### **8.3 Test Custom Emails**
```typescript
// Test welcome email
await resendService.sendWelcomeEmail('test@example.com', 'Test User');

// Test alert email
await resendService.sendTravelAlert('test@example.com', {
  title: 'Weather Alert',
  location: 'Tokyo, Japan',
  severity: 'medium',
  description: 'Heavy rainfall expected in the next 24 hours.'
});
```

## 🔒 **Security Best Practices**

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Email Verification**
   - Always verify email addresses before sending
   - Implement rate limiting for email sends
   - Use proper unsubscribe mechanisms

3. **Domain Authentication**
   - Set up SPF, DKIM, and DMARC records
   - Verify your domain in Resend
   - Use a dedicated sending domain

## 📊 **Monitoring & Analytics**

### **Resend Dashboard**
- Monitor email delivery rates
- Check bounce and complaint rates
- View email logs and analytics

### **Supabase Dashboard**
- Monitor authentication events
- Check user confirmation rates
- Review error logs

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Emails not sending**
   - Check API key is correct
   - Verify SMTP settings in Supabase
   - Check Resend dashboard for errors

2. **Emails going to spam**
   - Set up domain authentication
   - Use a verified sending domain
   - Check email content for spam triggers

3. **Reset links not working**
   - Verify redirect URLs in Supabase
   - Check URL configuration
   - Ensure proper routing in app

### **Debug Commands**
```bash
# Check environment variables
echo $VITE_RESEND_API_KEY

# Test SMTP connection
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@yourdomain.com","to":["test@example.com"],"subject":"Test","html":"<p>Test email</p>"}'
```

## ✅ **Verification Checklist**

- [ ] Resend API key added to environment variables
- [ ] SMTP configured in Supabase dashboard
- [ ] Email templates updated with branded content
- [ ] Redirect URLs configured properly
- [ ] Domain verified in Resend (if using custom domain)
- [ ] Welcome email service implemented
- [ ] Email confirmation flow tested
- [ ] Password reset flow tested
- [ ] Error handling implemented
- [ ] Rate limiting considered
- [ ] Monitoring set up

## 🎯 **Next Steps**

1. **Production Setup**
   - Use a custom domain for sending
   - Set up proper DNS records
   - Configure webhook endpoints for delivery tracking

2. **Advanced Features**
   - Email templates with dynamic content
   - Automated travel alert notifications
   - Newsletter functionality
   - Email preferences management

3. **Analytics Integration**
   - Track email open rates
   - Monitor conversion rates
   - A/B test email templates

## 🔧 **Environment Configuration**

Add to your `.env` file:
```env
# Resend Configuration
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Update these with your actual domain
VITE_APP_URL=https://guardnomand.com
VITE_SUPPORT_EMAIL=support@guardnomand.com
```

Your SMTP setup with Resend.com is now complete! Users will receive professional, branded emails for all authentication flows.
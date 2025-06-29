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
        from: template.from || 'Guard Nomand <noreply@guardnomand.com>',
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
      subject: 'Welcome to Guard Nomand - Your Safe Travel Journey Begins!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
            <div style="background-color: rgba(255,255,255,0.1); padding: 16px; border-radius: 16px; display: inline-block; margin-bottom: 20px;">
              <span style="font-size: 48px;">🛡️</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Guard Nomand!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your trusted companion for safe travels</p>
          </div>
          
          <div style="padding: 40px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${userName}!</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              We're excited to have you join our community of safe travelers. Guard Nomand is here to help you explore the world with confidence and peace of mind.
            </p>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
              <h3 style="color: #1f2937; margin-bottom: 16px; font-size: 18px;">🌟 What you can do with Guard Nomand:</h3>
              <div style="margin-bottom: 12px;">
                <span style="color: #3b82f6; font-weight: bold;">🛡️</span>
                <span style="color: #4b5563; margin-left: 8px;">Get real-time safety alerts for your destinations</span>
              </div>
              <div style="margin-bottom: 12px;">
                <span style="color: #10b981; font-weight: bold;">🌍</span>
                <span style="color: #4b5563; margin-left: 8px;">Access travel information for 195+ countries</span>
              </div>
              <div style="margin-bottom: 12px;">
                <span style="color: #f59e0b; font-weight: bold;">📱</span>
                <span style="color: #4b5563; margin-left: 8px;">Receive weather updates and local event notifications</span>
              </div>
              <div style="margin-bottom: 0;">
                <span style="color: #8b5cf6; font-weight: bold;">👥</span>
                <span style="color: #4b5563; margin-left: 8px;">Connect with fellow travelers and share experiences</span>
              </div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://guardnomand.com/home" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                🚀 Start Your Safe Journey
              </a>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 32px;">
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">
                <strong>Quick Tips to Get Started:</strong>
              </p>
              <ul style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Add your travel destinations to receive location-specific alerts</li>
                <li>Enable notifications for real-time safety updates</li>
                <li>Explore travel stories from our community</li>
                <li>Check weather and local events before you travel</li>
              </ul>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #4b5563; margin: 0 0 8px 0;">Safe travels,</p>
            <p style="color: #1f2937; font-weight: bold; margin: 0;">The Guard Nomand Team</p>
          </div>
          
          <div style="padding: 16px 20px; text-align: center; background-color: #1f2937;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This email was sent to ${userEmail}. If you have any questions, contact us at 
              <a href="mailto:support@guardnomand.com" style="color: #60a5fa;">support@guardnomand.com</a>
            </p>
          </div>
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
    const severityConfig = {
      low: { color: '#10b981', emoji: '💡', label: 'INFO' },
      medium: { color: '#f59e0b', emoji: '⚠️', label: 'WARNING' },
      high: { color: '#ef4444', emoji: '🚨', label: 'URGENT' }
    };

    const config = severityConfig[alert.severity];

    const template: EmailTemplate = {
      to: [userEmail],
      subject: `${config.emoji} ${config.label}: ${alert.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background-color: ${config.color}; color: white; padding: 24px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 12px;">${config.emoji}</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${config.label} ALERT</h1>
            <p style="margin: 8px 0 0 0; font-size: 18px; opacity: 0.9;">${alert.location}</p>
          </div>
          
          <div style="padding: 32px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 16px; font-size: 22px;">${alert.title}</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
              ${alert.description}
            </p>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <div style="margin-bottom: 12px;">
                <span style="color: ${config.color}; font-weight: bold; margin-right: 8px;">📍</span>
                <span style="color: #1f2937; font-weight: bold;">Location:</span>
                <span style="color: #4b5563; margin-left: 8px;">${alert.location}</span>
              </div>
              <div>
                <span style="color: ${config.color}; font-weight: bold; margin-right: 8px;">⚡</span>
                <span style="color: #1f2937; font-weight: bold;">Severity:</span>
                <span style="color: ${config.color}; margin-left: 8px; font-weight: bold;">${config.label}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://guardnomand.com/alerts" 
                 style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                📱 View All Alerts
              </a>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>💡 Stay Safe:</strong> Always check local conditions and follow official guidance when traveling. 
                Keep your emergency contacts updated in your profile.
              </p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
              This alert was sent because you have notifications enabled for ${alert.location}.
              <br>
              <a href="https://guardnomand.com/profile-settings" 
                 style="color: #3b82f6; text-decoration: none;">Manage your notification preferences</a>
            </p>
          </div>
        </div>
      `
    };

    await this.sendEmail(template);
  }

  // Email confirmation reminder
  async sendConfirmationReminder(userEmail: string, userName: string): Promise<void> {
    const template: EmailTemplate = {
      to: [userEmail],
      subject: 'Please confirm your Guard Nomand account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 32px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Account Confirmation Needed</h1>
          </div>
          
          <div style="padding: 32px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Hi ${userName},</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              We noticed you haven't confirmed your Guard Nomand account yet. To access all features and receive important safety alerts, please confirm your email address.
            </p>
            
            <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <h3 style="color: #92400e; margin-bottom: 12px;">🔒 Why confirm your account?</h3>
              <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                <li>Receive critical safety alerts for your destinations</li>
                <li>Access personalized travel recommendations</li>
                <li>Connect with the travel community</li>
                <li>Secure your account and travel data</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <p style="color: #4b5563; margin-bottom: 16px;">
                Check your email for the confirmation link, or click below to resend:
              </p>
              <a href="https://guardnomand.com/auth" 
                 style="background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                📧 Resend Confirmation
              </a>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    };

    await this.sendEmail(template);
  }

  // Password reset success notification
  async sendPasswordResetSuccess(userEmail: string, userName: string): Promise<void> {
    const template: EmailTemplate = {
      to: [userEmail],
      subject: 'Your Guard Nomand password has been reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 32px 20px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Password Reset Successful</h1>
          </div>
          
          <div style="padding: 32px 20px;">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Hi ${userName},</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Your Guard Nomand password has been successfully reset. You can now sign in with your new password.
            </p>
            
            <div style="background-color: #ecfdf5; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #d1fae5;">
              <h3 style="color: #047857; margin-bottom: 12px;">🔐 Security Tips:</h3>
              <ul style="color: #047857; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Use a strong, unique password for your account</li>
                <li>Don't share your password with anyone</li>
                <li>Consider enabling two-factor authentication</li>
                <li>Contact support if you notice any suspicious activity</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://guardnomand.com/auth" 
                 style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                🔑 Sign In Now
              </a>
            </div>
            
            <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin: 24px 0; border: 1px solid #fecaca;">
              <p style="color: #dc2626; margin: 0; font-size: 14px;">
                <strong>⚠️ Important:</strong> If you didn't reset your password, please contact our support team immediately at 
                <a href="mailto:support@guardnomand.com" style="color: #dc2626;">support@guardnomand.com</a>
              </p>
            </div>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #4b5563; margin: 0;">
              Safe travels,<br>
              <strong>The Guard Nomand Team</strong>
            </p>
          </div>
        </div>
      `
    };

    await this.sendEmail(template);
  }
}

export const resendService = ResendService.getInstance();
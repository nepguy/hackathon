// Secure email service that uses Supabase Edge Functions
// This prevents exposing API keys in the frontend

export interface EmailTemplate {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

export class ResendService {
  private static instance: ResendService;
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  private constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Validate required environment variables
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      console.warn('⚠️ Missing Supabase configuration. Email functionality will be limited.');
    }
  }

  public static getInstance(): ResendService {
    if (!ResendService.instance) {
      ResendService.instance = new ResendService();
    }
    return ResendService.instance;
  }

  private async callEmailFunction(type: string, to: string, data: any): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      if (!this.supabaseUrl || !this.supabaseAnonKey) {
        console.error('Missing Supabase configuration for email function');
        return { success: false, error: 'Email service not configured' };
      }

      const response = await fetch(`${this.supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          to,
          data
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Email function error:', result);
        return { success: false, error: result.error || 'Failed to send email' };
      }

      return result;
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: 'Failed to send email' };
    }
  }

  async sendEmail(template: EmailTemplate): Promise<{ success: boolean; id?: string; error?: string }> {
    // This method is deprecated - use specific email methods instead
    console.warn('sendEmail method is deprecated. Use specific email methods instead.');
    return { success: false, error: 'Method deprecated' };
  }

  // Welcome email for new users
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    await this.callEmailFunction('welcome', userEmail, { userName });
  }

  // Travel alert notification
  async sendTravelAlert(userEmail: string, alert: {
    title: string;
    location: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }): Promise<void> {
    await this.callEmailFunction('travel_alert', userEmail, alert);
  }

  // Email confirmation reminder
  async sendConfirmationReminder(userEmail: string, userName: string): Promise<void> {
    await this.callEmailFunction('confirmation_reminder', userEmail, { userName });
  }

  // Password reset success notification
  async sendPasswordResetSuccess(userEmail: string, userName: string): Promise<void> {
    await this.callEmailFunction('password_reset_success', userEmail, { userName });
  }
}

export const resendService = ResendService.getInstance();
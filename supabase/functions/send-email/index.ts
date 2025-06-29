import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  type: 'welcome' | 'travel_alert' | 'confirmation_reminder' | 'password_reset_success'
  to: string
  data: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, to, data }: EmailRequest = await req.json()

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    let emailTemplate: any = {}

    switch (type) {
      case 'welcome':
        emailTemplate = {
          from: 'Guard Nomad <noreply@guardnomad.com>',
          to: [to],
          subject: 'Welcome to Guard Nomad - Your Safe Travel Journey Begins!',
          html: generateWelcomeEmail(data.userName)
        }
        break

      case 'travel_alert':
        emailTemplate = {
          from: 'Guard Nomad <alerts@guardnomad.com>',
          to: [to],
          subject: `${getSeverityEmoji(data.severity)} ${getSeverityLabel(data.severity)}: ${data.title}`,
          html: generateTravelAlertEmail(data)
        }
        break

      case 'confirmation_reminder':
        emailTemplate = {
          from: 'Guard Nomad <noreply@guardnomad.com>',
          to: [to],
          subject: 'Please confirm your Guard Nomad account',
          html: generateConfirmationReminderEmail(data.userName)
        }
        break

      case 'password_reset_success':
        emailTemplate = {
          from: 'Guard Nomad <security@guardnomad.com>',
          to: [to],
          subject: 'Your Guard Nomad password has been reset',
          html: generatePasswordResetSuccessEmail(data.userName)
        }
        break

      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailTemplate),
    })

    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Resend API error: ${response.status} - ${errorData}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Email sending error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function getSeverityEmoji(severity: string): string {
  const severityConfig = {
    low: '💡',
    medium: '⚠️',
    high: '🚨'
  }
  return severityConfig[severity as keyof typeof severityConfig] || '💡'
}

function getSeverityLabel(severity: string): string {
  const severityConfig = {
    low: 'INFO',
    medium: 'WARNING',
    high: 'URGENT'
  }
  return severityConfig[severity as keyof typeof severityConfig] || 'INFO'
}

function getSeverityColor(severity: string): string {
  const severityConfig = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  }
  return severityConfig[severity as keyof typeof severityConfig] || '#10b981'
}

function generateWelcomeEmail(userName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
        <div style="background-color: rgba(255,255,255,0.1); padding: 16px; border-radius: 16px; display: inline-block; margin-bottom: 20px;">
          <span style="font-size: 48px;">🛡️</span>
        </div>
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Guard Nomad!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your trusted companion for safe travels</p>
      </div>
      
      <div style="padding: 40px 20px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Hi ${userName}!</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          We're excited to have you join our community of safe travelers. Guard Nomad is here to help you explore the world with confidence and peace of mind.
        </p>
        
        <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <h3 style="color: #1f2937; margin-bottom: 16px; font-size: 18px;">🌟 What you can do with Guard Nomad:</h3>
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
          <a href="https://guardnomad.com/home" 
             style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
            🚀 Start Your Safe Journey
          </a>
        </div>
      </div>
      
      <div style="background-color: #f8fafc; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #4b5563; margin: 0 0 8px 0;">Safe travels,</p>
        <p style="color: #1f2937; font-weight: bold; margin: 0;">The Guard Nomad Team</p>
      </div>
    </div>
  `
}

function generateTravelAlertEmail(alert: any): string {
  const config = {
    color: getSeverityColor(alert.severity),
    emoji: getSeverityEmoji(alert.severity),
    label: getSeverityLabel(alert.severity)
  }

  return `
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
          <a href="https://guardnomad.com/alerts" 
             style="background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            📱 View All Alerts
          </a>
        </div>
      </div>
    </div>
  `
}

function generateConfirmationReminderEmail(userName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 32px 20px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Account Confirmation Needed</h1>
      </div>
      
      <div style="padding: 32px 20px;">
        <h2 style="color: #1f2937; margin-bottom: 16px;">Hi ${userName},</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          We noticed you haven't confirmed your Guard Nomad account yet. To access all features and receive important safety alerts, please confirm your email address.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://guardnomad.com/auth" 
             style="background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            📧 Resend Confirmation
          </a>
        </div>
      </div>
    </div>
  `
}

function generatePasswordResetSuccessEmail(userName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 32px 20px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Password Reset Successful</h1>
      </div>
      
      <div style="padding: 32px 20px;">
        <h2 style="color: #1f2937; margin-bottom: 16px;">Hi ${userName},</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
          Your Guard Nomad password has been successfully reset. You can now sign in with your new password.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://guardnomad.com/auth" 
             style="background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            🔑 Sign In Now
          </a>
        </div>
      </div>
    </div>
  `
}
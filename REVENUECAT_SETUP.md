# RevenueCat Setup Guide for GuardNomad

This guide will help you configure RevenueCat for subscription management in your GuardNomad travel safety application.

## Prerequisites

1. **RevenueCat Account**: Sign up at [app.revenuecat.com](https://app.revenuecat.com)
2. **App Store Connect Account** (for iOS)
3. **Google Play Console Account** (for Android)
4. **Stripe Account** (for web billing)

## Step 1: RevenueCat Dashboard Setup

### 1.1 Create a Project
1. Log in to RevenueCat dashboard
2. Click "Create new project"
3. Name it "GuardNomad" or your preferred name
4. Select your primary platform

### 1.2 Add Your App
1. Go to "Project Settings" → "Apps"
2. Click "Add new app"
3. Choose your platform (iOS/Android/Web)
4. Enter your app's bundle ID/package name

### 1.3 Configure Store Connections

#### For iOS (App Store):
1. Go to "Project Settings" → "Store Settings" → "App Store Connect"
2. Upload your App Store Connect API key (.p8 file)
3. Enter Key ID and Issuer ID
4. Test the connection

#### For Android (Google Play):
1. Go to "Project Settings" → "Store Settings" → "Google Play"
2. Upload your Google Play service account JSON file
3. Test the connection

#### For Web (Stripe):
1. Go to "Project Settings" → "Store Settings" → "Stripe"
2. Connect your Stripe account
3. Configure webhook endpoints

## Step 2: Products and Entitlements Setup

### 2.1 Create Entitlements
1. Go to "Entitlements" in the dashboard
2. Create an entitlement called "premium"
3. Add description: "Premium access to all GuardNomad features"

### 2.2 Create Products
Create the following products in your respective app stores:

#### Monthly Subscription:
- **Product ID**: `guardnomad_premium_monthly`
- **Price**: $9.99/month
- **Title**: "GuardNomad Premium Monthly"
- **Description**: "Premium monthly subscription with unlimited alerts and features"

#### Yearly Subscription:
- **Product ID**: `guardnomad_premium_yearly`
- **Price**: $99.99/year
- **Title**: "GuardNomad Premium Yearly"
- **Description**: "Premium yearly subscription with unlimited alerts and features (2 months free!)"

### 2.3 Create Offerings
1. Go to "Offerings" in RevenueCat dashboard
2. Create a new offering called "default"
3. Add packages:
   - Monthly package with the monthly product
   - Yearly package with the yearly product
4. Attach both packages to the "premium" entitlement

## Step 3: Environment Configuration

### 3.1 Get API Keys
1. Go to "Project Settings" → "API Keys"
2. Copy the **Public API Key** for your environment:
   - Use **Sandbox** key for development
   - Use **Production** key for production builds

### 3.2 Add to Environment Variables
Add your RevenueCat API key to your `.env` file:

```env
# RevenueCat Configuration
VITE_REVENUECAT_API_KEY=your_sandbox_or_production_api_key_here
```

## Step 4: Testing

### 4.1 Sandbox Testing
1. Create sandbox test users in App Store Connect (iOS) or Google Play Console (Android)
2. Use these accounts to test purchases
3. Verify purchases appear in RevenueCat dashboard

### 4.2 Development Mode
The GuardNomad app includes a development mode that simulates purchases:
- Purchases are stored in localStorage
- No real money is charged
- Perfect for UI testing and development

## Step 5: Features Included

The RevenueCat integration in GuardNomad includes:

### ✅ Core Features
- [x] Subscription status checking
- [x] Trial period management
- [x] Purchase processing
- [x] Purchase restoration
- [x] Development simulation mode
- [x] Error handling and fallbacks

### ✅ Premium Features Unlocked
- Unlimited travel alerts
- Advanced safety analytics
- Priority customer support
- AI-enhanced alert insights
- Offline map access
- Custom notification settings

## Step 6: Production Deployment

### 6.1 Switch to Production Keys
1. Update `VITE_REVENUECAT_API_KEY` with production key
2. Test with real App Store/Google Play accounts
3. Verify webhook endpoints are working

### 6.2 App Store Review
- Ensure "Restore Purchases" functionality is implemented
- Include subscription terms in your app
- Add privacy policy covering subscription data

## Troubleshooting

### Common Issues

1. **Products not showing up**
   - Wait 2-4 hours after creating products in App Store Connect
   - Ensure products are marked "Ready for Sale"
   - Check RevenueCat logs for sync issues

2. **Purchases not working in sandbox**
   - Use a physical device (not simulator)
   - Sign out of personal Apple ID
   - Sign in with sandbox test account

3. **API Key errors**
   - Verify you're using the correct environment key
   - Check API key permissions in RevenueCat dashboard

### Debug Mode
Enable debug logging by setting:
```javascript
console.log('🔧 RevenueCat Debug Mode Enabled');
```

## Support

- **RevenueCat Docs**: [docs.revenuecat.com](https://docs.revenuecat.com)
- **Community**: [community.revenuecat.com](https://community.revenuecat.com)
- **Support**: support@revenuecat.com

## Security Notes

⚠️ **Important Security Practices**:
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys periodically
- Monitor usage in RevenueCat dashboard
- Set up alerts for unusual activity

---

*This setup guide ensures your GuardNomad application has robust subscription management with RevenueCat's proven infrastructure.* 
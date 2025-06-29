# 🔗 Auth URL Configuration for Supabase

## ✅ **Frontend Code Updated**

The frontend code has been updated to use the correct redirect URLs:

### **Sign-Up Confirmation**
```typescript
// In AuthContext.tsx
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: metadata,
    emailRedirectTo: 'https://guardnomand.com/auth'
  },
})
```

### **Password Reset**
```typescript
// In AuthContext.tsx and AuthPage.tsx
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://guardnomand.com/password-reset'
})
```

## 🔧 **Supabase Dashboard Configuration Required**

### **Step 1: Navigate to URL Configuration**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your GuardNomad project
3. Go to **Settings** → **Authentication** → **URL Configuration**

### **Step 2: Set Site URL**
```
Site URL: https://guardnomand.com
```

For development testing:
```
Site URL: http://localhost:5177
```

### **Step 3: Add Redirect URLs**

**With Wildcards (Recommended):**
```
https://guardnomand.com/*
https://*.guardnomand.com/*
http://localhost:5177/*
http://localhost:5176/*
http://localhost:5175/*
http://localhost:5174/*
http://localhost:5173/*
```

**Specific URLs (Fallback if wildcards don't work):**
```
https://guardnomand.com/auth
https://guardnomand.com/password-reset
http://localhost:5177/auth
http://localhost:5177/password-reset
http://localhost:5176/auth
http://localhost:5176/password-reset
http://localhost:5175/auth
http://localhost:5175/password-reset
http://localhost:5174/auth
http://localhost:5174/password-reset
http://localhost:5173/auth
http://localhost:5173/password-reset
```

## 🧪 **Testing the Configuration**

After configuring the URLs in Supabase:

### **1. Test Email Confirmation**
1. Create a new account
2. Check email for confirmation link
3. Click link → Should redirect to `https://guardnomand.com/auth`
4. Verify account is confirmed

### **2. Test Password Reset**
1. Go to sign-in page
2. Click "Forgot password?"
3. Enter email and submit
4. Check email for reset link
5. Click link → Should redirect to `https://guardnomand.com/password-reset`
6. Complete password reset

### **3. Development Testing**
For local development, the same flows should work with:
- `http://localhost:5177/auth`
- `http://localhost:5177/password-reset`

## ⚠️ **Important Notes**

1. **Domain Consistency**: All redirect URLs use `guardnomand.com`
2. **HTTPS Required**: Production URLs must use HTTPS
3. **Wildcard Support**: Using wildcards (`/*`) covers all possible routes
4. **Multiple Ports**: Added support for different development ports (5173-5177)
5. **Case Sensitive**: URLs are case-sensitive, ensure exact matches

## 🔍 **Troubleshooting**

### **If redirects don't work:**
1. Check that URLs are exactly as shown above
2. Verify Site URL is set correctly
3. Try specific URLs instead of wildcards
4. Check browser console for redirect errors
5. Ensure HTTPS for production URLs

### **Common Issues:**
- **Wrong domain**: Make sure it's `guardnomand.com`
- **Missing protocol**: Always include `https://` or `http://`
- **Port mismatch**: Your dev server might be on a different port
- **Case sensitivity**: URLs must match exactly

## ✅ **Verification Checklist**

- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added with wildcards
- [ ] Email confirmation flow tested
- [ ] Password reset flow tested
- [ ] Development URLs working
- [ ] Production URLs ready
- [ ] No console errors during auth flows

Your authentication URL configuration is now properly set up for both development and production! 
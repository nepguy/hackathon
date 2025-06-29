# 🚀 Deployment Guide for guardnomand.com

## 🎯 **Quick Deployment Steps**

### **1. Build the App**
```bash
npm run build
```

### **2. Upload to Your Domain**
Upload the `dist/` folder contents to your web hosting:
- **guardnomand.com** root directory
- Or subdomain if preferred

### **3. Environment Variables for Production**
Create `.env.production` with your production URLs:
```bash
# Production Environment
VITE_SUPABASE_URL=https://rsbtzmqvgiuvmrocozpp.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_key
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBcnjNfH1nBeLWwFhAx6vBEfXvVWopAC3A
```

### **4. Configure Domain Restrictions**
Update your Google Maps API key restrictions:
- **Allowed domains**: 
  - `guardnomand.com/*`
  - `*.guardnomand.com/*`

### **5. Supabase Production Settings**
In your Supabase project settings:
- **Site URL**: `https://guardnomand.com`
- **Additional redirect URLs**: `https://guardnomand.com/auth/callback`

## 🛠️ **Hosting Options**

### **Option A: Static Hosting (Recommended)**
- **Netlify**: Drag & drop `dist/` folder
- **Vercel**: Connect GitHub repo
- **GitHub Pages**: Push `dist/` to gh-pages branch

### **Option B: VPS/Dedicated Server**
- Upload `dist/` to `/var/www/guardnomand.com/`
- Configure Nginx/Apache

## 🔧 **Production Build Commands**
```bash
# Clean build
rm -rf dist/
npm run build

# Test locally before deployment
npm run preview

# Check build size
du -sh dist/
```

## 🌐 **CDN & Performance**
For better performance:
- Enable gzip compression
- Set cache headers for static assets
- Consider CloudFlare for CDN

## 🔐 **Security Checklist**
- ✅ API keys restricted to your domain
- ✅ HTTPS enabled on guardnomad.com
- ✅ Environment variables not exposed
- ✅ Supabase RLS policies active

## 📱 **Mobile PWA (Optional)**
Your app is PWA-ready! Just add to web app manifest:
```json
{
  "name": "GuardNomad",
  "short_name": "GuardNomad", 
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4285f4"
}
```

Ready to deploy! 🚀 
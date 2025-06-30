# 🔐 Security Guidelines for GuardNomad

## ⚠️ API Key Security Rules

### ✅ **DO's**
- Store ALL API keys in `.env` file only
- Use placeholders like `your_api_key_here` in documentation
- Add `.env` to `.gitignore` (already done)
- Use environment variables in code: `import.meta.env.VITE_API_KEY`
- Set up API key restrictions (IP, referrer, usage limits)
- Regularly rotate API keys (monthly/quarterly)

### ❌ **DON'Ts**
- **NEVER** commit real API keys to version control
- **NEVER** put real keys in .md files
- **NEVER** share API keys via chat/email
- **NEVER** hardcode keys in source code
- **NEVER** commit .env files to git

## 🛡️ Environment Variable Security

### **.env File Structure**
```env
# ✅ CORRECT - Only in .env file
VITE_SUPABASE_URL=your_actual_url_here
VITE_SUPABASE_ANON_KEY=your_actual_key_here
VITE_GOOGLE_MAPS_API_KEY=your_actual_key_here
VITE_EXA_API_KEY=your_actual_key_here
```

### **Documentation Examples**
```env
# ✅ CORRECT - Use placeholders in .md files
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_EXA_API_KEY=your_exa_api_key
```

## 🔍 Security Checklist

### **Before Every Commit:**
- [ ] Check that `.env` is in `.gitignore`
- [ ] Scan .md files for exposed keys: `grep -r "AIza\|eyJ\|sk-\|pk_" *.md`
- [ ] Verify all keys in docs use placeholder values
- [ ] Run: `git status` to ensure .env isn't staged

### **API Key Management:**
- [ ] Google Maps: Set HTTP referrer restrictions
- [ ] Supabase: Use RLS policies, monitor usage
- [ ] Exa.ai: Set usage limits and alerts
- [ ] All keys: Enable usage monitoring and alerts

### **Regular Security Tasks:**
- [ ] Monthly: Review API key usage and costs
- [ ] Quarterly: Rotate API keys
- [ ] Check for exposed secrets: `git log --grep="API\|KEY\|SECRET"`

## 🚨 Security Incident Response

### **If API Key Exposed:**
1. **Immediately** revoke/regenerate the exposed key
2. Check API usage logs for unauthorized access
3. Update all applications with new key
4. Review billing for unexpected charges
5. Add additional security restrictions
6. Document the incident and prevention measures

### **Emergency Contacts:**
- Google Cloud Support: [support.google.com](https://support.google.com)
- Supabase Support: [supabase.com/support](https://supabase.com/support)
- GitHub Security: `security@github.com` (if public repo)

## 🔒 Additional Security Measures

### **Git Security:**
```bash
# Remove sensitive data from git history
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env' \
--prune-empty --tag-name-filter cat -- --all

# Alternative: Use BFG Repo-Cleaner
java -jar bfg.jar --delete-files .env
```

### **Environment Detection:**
```typescript
// ✅ Safe environment detection
const isDevelopment = import.meta.env.MODE === 'development'
const isProduction = import.meta.env.PROD

// ❌ Never log API keys
console.log('API Key:', import.meta.env.VITE_API_KEY) // NEVER DO THIS
```

### **API Key Validation:**
```typescript
// ✅ Validate keys exist without exposing them
const requiredKeys = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_EXA_API_KEY'
]

const missingKeys = requiredKeys.filter(key => !import.meta.env[key])
if (missingKeys.length > 0) {
  console.error('Missing required environment variables:', missingKeys)
}
```

## 📚 Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [GitHub Secrets Detection](https://docs.github.com/en/code-security/secret-scanning)
- [Supabase Security Guide](https://supabase.com/docs/guides/auth)

---

**Remember**: Security is everyone's responsibility. When in doubt, assume the key is compromised and regenerate it. 
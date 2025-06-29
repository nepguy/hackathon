# Development Workflow Guide - GuardNomad Travel App

## 🚀 Preventing Merge Conflicts

### **File Ownership Strategy**
- **Pages**: One developer per page (AlertsPage, ProfilePage, etc.)
- **Services**: API services should be modified by one person at a time
- **Components**: Split large components into smaller, focused ones

### **Branch Strategy**
```bash
# Feature branches for major changes
git checkout -b feature/exa-api-integration
git checkout -b feature/profile-improvements
git checkout -b bugfix/alerts-page-crash

# Environment-specific branches
git checkout -b local-development    # For local VS Code work
git checkout -b bolt-development     # For Bolt.new work
```

### **Before Starting Work**
```bash
# 1. Always pull latest changes
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make small, focused commits
git add specific-file.tsx
git commit -m "Fix: Add null checks for alert recommendations"

# 4. Push frequently
git push origin feature/your-feature-name
```

### **High-Risk Files (Avoid Simultaneous Edits)**
- `src/pages/AlertsPage.tsx` - Complex state management
- `src/lib/exaUnifiedService.ts` - API integration
- `src/contexts/AuthContext.tsx` - Authentication logic
- `src/lib/supabase.ts` - Database configuration

### **Safe Parallel Development Areas**
- Different page components
- Individual service files
- Separate utility functions
- Documentation files

### **Communication Protocol**
1. **Announce major changes** in team chat
2. **Lock files** when doing major refactoring
3. **Merge frequently** to avoid drift
4. **Test after every merge**

### **Emergency Conflict Resolution**
```bash
# If you encounter conflicts:
git status                    # See what's conflicted
git mergetool                # Use VS Code to resolve
git add resolved-file.tsx     # Mark as resolved
git commit                   # Complete the merge
npm run dev                  # Test immediately
```

### **File Structure for Conflict Prevention**
```
src/pages/AlertsPage/
├── index.tsx              # Main component (minimal)
├── hooks/
│   ├── useNewsData.ts     # News logic
│   ├── useScamData.ts     # Scam alerts logic
│   └── useSafetyData.ts   # Safety alerts logic
├── components/
│   ├── NewsTab.tsx        # News rendering
│   ├── ScamTab.tsx        # Scam rendering
│   └── SafetyTab.tsx      # Safety rendering
└── types.ts               # Type definitions
```

This structure makes it less likely for multiple developers to edit the same file simultaneously.

## 🛠️ Tools Setup

### **Git Configuration** (Already applied)
- VS Code as merge tool
- Rebase on pull for cleaner history
- Pre-commit hooks to catch conflict markers

### **Development Commands**
```bash
# Safe development cycle
npm run dev          # Start development server
npm run build        # Check for TypeScript errors
npm run lint         # Check for linting issues
git add .
git commit -m "Description"
git push origin branch-name
```

## 📝 Best Practices Summary

1. **Small, frequent commits** over large changes
2. **Feature branches** for all non-trivial work
3. **Pull before push** always
4. **Communicate** when working on shared files
5. **Test immediately** after resolving conflicts
6. **Split large files** into smaller, focused modules

Following this workflow will dramatically reduce merge conflicts in your travel app development! 🎯 
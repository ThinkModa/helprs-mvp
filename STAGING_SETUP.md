# 🚀 Helprs Staging Environment Setup

## **Overview**
This guide sets up a complete staging environment for both the mobile and desktop apps with automatic deployments.

## **📱 Mobile App (Expo)**
- **Access URL**: `exp://exp.host/@helprs_dev/helprs-worker`
- **Updates**: Automatic via EAS Update
- **Deployment**: Push to `staging` branch

## **💻 Desktop App (Next.js)**
- **Access URL**: `https://your-staging-app.vercel.app`
- **Updates**: Automatic via Vercel
- **Deployment**: Push to `staging` branch

## **🔧 Setup Instructions**

### **Step 1: Supabase Credentials (Already Found!)**
✅ **Project Name**: helprs-dev  
✅ **Project URL**: `https://wgwlbfyviiljkcbevpaq.supabase.co`  
✅ **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnd2xiZnl2aWlsamtjYmV2cGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODQ0NzcsImV4cCI6MjA3MDc2MDQ3N30.68KWeW1uMZNoLdNA6d-C_Du1-stMn_iy5t3XoTOgfR4`

### **Step 2: Configure GitHub Secrets**
In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add:

#### **Required Secrets:**
```
STAGING_SUPABASE_URL=https://wgwlbfyviiljkcbevpaq.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnd2xiZnl2aWlsamtjYmV2cGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODQ0NzcsImV4cCI6MjA3MDc2MDQ3N30.68KWeW1uMZNoLdNA6d-C_Du1-stMn_iy5t3XoTOgfR4
EXPO_TOKEN=your-expo-token
```

#### **For Vercel (Desktop App):**
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

### **Step 3: Get Expo Token**
```bash
npx expo login
npx expo whoami
# Copy the token from your Expo account
```

### **Step 4: Get Vercel Tokens**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings → Tokens**
3. Create a new token
4. Get Project ID from your Vercel project settings

## **🚀 Deployment Workflow**

### **For Developers:**
```bash
# Make changes
git add .
git commit -m "New feature"
git push origin staging

# Both apps deploy automatically!
```

### **For Testers:**
- **Mobile**: Open Expo Go → Enter URL → `exp://exp.host/@helprs_dev/helprs-worker`
- **Desktop**: Visit your Vercel staging URL

## **📊 Monitoring**
- **Mobile**: https://expo.dev/accounts/helprs_dev/projects/helprs-worker/updates
- **Desktop**: Your Vercel dashboard
- **Database**: https://supabase.com/dashboard/project/wgwlbfyviiljkcbevpaq

## **🔄 Environment Variables**

### **Mobile App (.env)**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://wgwlbfyviiljkcbevpaq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnd2xiZnl2aWlsamtjYmV2cGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODQ0NzcsImV4cCI6MjA3MDc2MDQ3N30.68KWeW1uMZNoLdNA6d-C_Du1-stMn_iy5t3XoTOgfR4
EXPO_PUBLIC_APP_ENV=staging
```

### **Desktop App (.env)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://wgwlbfyviiljkcbevpaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnd2xiZnl2aWlsamtjYmV2cGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODQ0NzcsImV4cCI6MjA3MDc2MDQ3N30.68KWeW1uMZNoLdNA6d-C_Du1-stMn_iy5t3XoTOgfR4
NEXT_PUBLIC_APP_ENV=staging
```

## **✅ Testing Checklist**
- [ ] Mobile app loads in Expo Go
- [ ] Desktop app loads in browser
- [ ] Database connection works
- [ ] Authentication works
- [ ] Data syncs between apps
- [ ] Updates deploy automatically

## **🚨 Troubleshooting**

### **Mobile App Issues:**
- Check Expo token in GitHub secrets
- Verify Supabase credentials
- Check EAS project configuration

### **Desktop App Issues:**
- Check Vercel tokens in GitHub secrets
- Verify build logs in Vercel dashboard
- Check environment variables

### **Database Issues:**
- Verify Supabase project is active
- Check RLS policies
- Verify API keys are correct

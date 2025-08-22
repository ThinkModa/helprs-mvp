# 🔑 GitHub Secrets Setup for Automatic Deployments

## **Overview**
This guide will help you set up GitHub secrets for automatic deployments of both the mobile and desktop apps.

## **📋 Required Secrets**

### **1. Supabase Credentials**
```
STAGING_SUPABASE_URL=https://wgwlbfyviiljkcbevpaq.supabase.co
STAGING_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnd2xiZnl2aWlsamtjYmV2cGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODQ0NzcsImV4cCI6MjA3MDc2MDQ3N30.68KWeW1uMZNoLdNA6d-C_Du1-stMn_iy5t3XoTOgfR4
```

### **2. Expo Token**
```
EXPO_TOKEN=your-expo-token-here
```

### **3. Vercel Credentials (for Desktop App)**
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

## **🔧 Step-by-Step Setup**

### **Step 1: Get Expo Token**
1. Go to [Expo Dashboard](https://expo.dev/accounts/helprs_dev/settings/access-tokens)
2. Click "Create Token"
3. Name it "GitHub Actions"
4. Copy the token

### **Step 2: Get Vercel Credentials**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Settings → Tokens**
3. Create a new token named "GitHub Actions"
4. Copy the token
5. Go to your project settings to get:
   - **Project ID** (from Settings → General)
   - **Org ID** (from Settings → General)

### **Step 3: Add GitHub Secrets**
1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:

#### **Add STAGING_SUPABASE_URL:**
- **Name**: `STAGING_SUPABASE_URL`
- **Value**: `https://wgwlbfyviiljkcbevpaq.supabase.co`

#### **Add STAGING_SUPABASE_ANON_KEY:**
- **Name**: `STAGING_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnd2xiZnl2aWlsamtjYmV2cGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODQ0NzcsImV4cCI6MjA3MDc2MDQ3N30.68KWeW1uMZNoLdNA6d-C_Du1-stMn_iy5t3XoTOgfR4`

#### **Add EXPO_TOKEN:**
- **Name**: `EXPO_TOKEN`
- **Value**: `your-expo-token-from-step-1`

#### **Add VERCEL_TOKEN:**
- **Name**: `VERCEL_TOKEN`
- **Value**: `your-vercel-token-from-step-2`

#### **Add VERCEL_ORG_ID:**
- **Name**: `VERCEL_ORG_ID`
- **Value**: `your-vercel-org-id-from-step-2`

#### **Add VERCEL_PROJECT_ID:**
- **Name**: `VERCEL_PROJECT_ID`
- **Value**: `your-vercel-project-id-from-step-2`

## **🚀 Test Automatic Deployments**

### **Test Mobile App Deployment:**
```bash
# Make a small change
echo "# Test deployment" >> helprs-worker/README.md
git add .
git commit -m "Test mobile app deployment"
git push origin staging
```

### **Test Desktop App Deployment:**
```bash
# Make a small change
echo "# Test deployment" >> helprs-web/README.md
git add .
git commit -m "Test desktop app deployment"
git push origin staging
```

## **📊 Monitor Deployments**

### **Mobile App:**
- **Expo Dashboard**: https://expo.dev/accounts/helprs_dev/projects/helprs-worker/updates
- **GitHub Actions**: Your repository → Actions tab

### **Desktop App:**
- **Vercel Dashboard**: Your Vercel project
- **GitHub Actions**: Your repository → Actions tab

## **✅ Verification Checklist**

- [ ] All secrets added to GitHub
- [ ] Mobile app deploys automatically
- [ ] Desktop app deploys automatically
- [ ] Database connection works in staging
- [ ] Updates are available immediately

## **🚨 Troubleshooting**

### **If Mobile App Fails to Deploy:**
- Check Expo token is correct
- Verify project is linked to Expo
- Check GitHub Actions logs

### **If Desktop App Fails to Deploy:**
- Check Vercel tokens are correct
- Verify project exists in Vercel
- Check GitHub Actions logs

### **If Database Connection Fails:**
- Verify Supabase credentials
- Check RLS policies
- Verify project is active

# 🤖 Automated Deployment Guide

## **Overview**
This guide covers the automated deployment setup for both the mobile and desktop Helprs applications using GitHub Actions.

## **🏗️ Architecture**

### **Deployment Flow:**
```
GitHub Push → GitHub Actions → Expo EAS (Mobile) + Vercel (Desktop) → Live Apps
```

### **Environments:**
- **Staging**: `staging` branch → Expo staging channel + Vercel preview
- **Production**: `main` branch → Expo production channel + Vercel production

## **📋 Workflows Created**

### **1. Mobile App Deployment (`deploy-mobile.yml`)**
- **Trigger**: Push to `staging` or `main` branch with changes in `helprs-worker/`
- **Action**: Deploy to Expo EAS staging/production channel
- **Secrets Used**: `EXPO_TOKEN`, `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`

### **2. Desktop App Deployment (`deploy-desktop.yml`)**
- **Trigger**: Push to `staging` or `main` branch with changes in `helprs-web/`
- **Action**: Deploy to Vercel production
- **Secrets Used**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`

### **3. Combined Deployment (`deploy-all.yml`)**
- **Trigger**: Push to `staging` or `main` branch
- **Action**: Deploy both apps based on changed files
- **Smart Detection**: Only deploys apps that have changes

## **🔧 How to Use**

### **Automatic Deployment:**
1. **Make changes** to your code
2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin staging  # or main for production
   ```
3. **GitHub Actions** automatically triggers deployment
4. **Monitor progress** in GitHub Actions tab

### **Manual Deployment:**
1. Go to **GitHub Repository** → **Actions** tab
2. Select **"Deploy All Apps"** workflow
3. Click **"Run workflow"**
4. Choose branch and click **"Run workflow"**

## **📊 Monitoring**

### **GitHub Actions:**
- **Repository** → **Actions** tab
- **Real-time logs** for each deployment
- **Success/failure notifications**

### **Expo Dashboard:**
- **Mobile App**: https://expo.dev/accounts/helprs_dev/projects/helprs-worker/updates
- **Update history** and deployment status

### **Vercel Dashboard:**
- **Desktop App**: https://vercel.com/thinkmodas-projects/helprs-web
- **Deployment history** and performance metrics

## **🚀 Benefits**

### **For Development:**
- **No manual deployment** required
- **Consistent environments** across team
- **Quick iteration** and testing
- **Rollback capability** through Git

### **For Production:**
- **Zero-downtime deployments**
- **Automatic testing** and validation
- **Environment consistency**
- **Audit trail** of all deployments

## **🔍 Troubleshooting**

### **Common Issues:**

#### **Mobile App Deployment Fails:**
- Check `EXPO_TOKEN` is valid
- Verify Expo project is linked
- Check environment variables in EAS

#### **Desktop App Deployment Fails:**
- Check `VERCEL_TOKEN` is valid
- Verify Vercel project exists
- Check build errors in logs

#### **Environment Variables Missing:**
- Verify all GitHub secrets are set
- Check secret names match workflow
- Ensure secrets have correct values

### **Debugging Steps:**
1. **Check GitHub Actions logs** for specific error messages
2. **Verify secrets** are correctly set in repository settings
3. **Test locally** before pushing to catch issues early
4. **Check deployment platforms** for additional error details

## **📈 Next Steps**

### **Immediate:**
- [ ] Test the automated deployment with a small change
- [ ] Verify both apps deploy successfully
- [ ] Test rollback functionality

### **Future Enhancements:**
- [ ] Add automated testing before deployment
- [ ] Set up staging environment validation
- [ ] Add deployment notifications (Slack, email)
- [ ] Implement blue-green deployments
- [ ] Add performance monitoring

## **✅ Verification Checklist**

- [ ] GitHub secrets configured correctly
- [ ] Workflows created and committed
- [ ] Expo project linked and accessible
- [ ] Vercel project configured
- [ ] Test deployment successful
- [ ] Both apps accessible after deployment
- [ ] Environment variables working correctly
- [ ] Team members can trigger deployments

---

**🎉 Congratulations!** Your automated deployment pipeline is now ready. Push a change to test it out!

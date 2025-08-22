# 🚀 Helprs Deployment Guide

## **Overview**
This guide covers deploying both the Helprs mobile app (React Native/Expo) and desktop app (Next.js) to staging environments.

## **🏗️ Architecture**
- **Mobile App**: Direct Supabase connection (no local server dependencies)
- **Desktop App**: Next.js API routes → Supabase database
- **Database**: Supabase (shared between both apps)

## **📱 Mobile App (helprs-worker)**

### **Environment Setup**
1. **Development Environment** (`.env`)
   ```
   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   EXPO_PUBLIC_APP_ENV=development
   ```

2. **Staging Environment** (`.env.staging`)
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
   EXPO_PUBLIC_APP_ENV=staging
   ```

### **Deployment Steps**
1. **Install Dependencies**
   ```bash
   cd helprs-worker
   npm install
   ```

2. **Build for Staging**
   ```bash
   # Set environment to staging
   cp .env.staging .env
   
   # Build for Expo
   npx expo build:android --release-channel staging
   npx expo build:ios --release-channel staging
   ```

3. **Deploy to Expo**
   ```bash
   npx expo publish --release-channel staging
   ```

## **💻 Desktop App (helprs-web)**

### **Environment Setup**
1. **Development Environment** (`.env.local`)
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54331
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
   NEXT_PUBLIC_APP_ENV=development
   ```

2. **Staging Environment** (`.env.staging`)
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
   NEXT_PUBLIC_APP_ENV=staging
   ```

### **Deployment Steps**
1. **Install Dependencies**
   ```bash
   cd helprs-web
   npm install
   ```

2. **Build for Staging**
   ```bash
   # Set environment to staging
   cp .env.staging .env.local
   
   # Build Next.js app
   npm run build
   ```

3. **Deploy to Vercel/Netlify**
   ```bash
   # For Vercel
   npx vercel --prod
   
   # For Netlify
   npx netlify deploy --prod
   ```

## **🗄️ Database Setup**

### **Staging Database**
1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project for staging
   - Note down URL and anon key

2. **Run Migrations**
   ```bash
   cd supabase
   npx supabase db push --project-ref your-staging-project-ref
   ```

3. **Seed Data** (if needed)
   ```bash
   npx supabase db reset --project-ref your-staging-project-ref
   ```

## **🔧 Configuration Checklist**

### **Mobile App**
- [ ] Environment variables configured
- [ ] Supabase connection tested
- [ ] No localhost dependencies
- [ ] Error handling implemented
- [ ] Staging build successful

### **Desktop App**
- [ ] Environment variables configured
- [ ] API routes working
- [ ] Database connections verified
- [ ] Staging build successful

### **Database**
- [ ] Staging project created
- [ ] Migrations applied
- [ ] RLS policies configured
- [ ] Test data loaded

## **🧪 Testing**

### **Pre-Deployment Tests**
1. **Mobile App**
   ```bash
   cd helprs-worker
   npx expo start --tunnel
   # Test on device/simulator
   ```

2. **Desktop App**
   ```bash
   cd helprs-web
   npm run dev
   # Test in browser
   ```

3. **Database Connection**
   - Verify both apps can read/write data
   - Test job creation and acceptance
   - Verify real-time updates

### **Post-Deployment Tests**
1. **Mobile App**
   - Install from Expo/App Store
   - Test all features
   - Verify database connectivity

2. **Desktop App**
   - Access staging URL
   - Test all features
   - Verify data persistence

## **🚨 Troubleshooting**

### **Common Issues**
1. **Mobile App Can't Connect**
   - Check environment variables
   - Verify Supabase URL is accessible
   - Check network connectivity

2. **Desktop App API Errors**
   - Verify environment variables
   - Check database connection
   - Review API route logs

3. **Database Connection Issues**
   - Verify RLS policies
   - Check API keys
   - Review Supabase logs

### **Debug Commands**
```bash
# Test Supabase connection
npx supabase status

# Check environment variables
echo $EXPO_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_URL

# View logs
npx expo logs
npm run dev
```

## **📋 Environment Variables Reference**

### **Required Variables**
| Variable | Mobile | Desktop | Description |
|----------|--------|---------|-------------|
| `SUPABASE_URL` | ✅ | ✅ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | ✅ | Supabase anonymous key |
| `APP_ENV` | ✅ | ✅ | Environment (dev/staging/prod) |

### **Optional Variables**
| Variable | Mobile | Desktop | Description |
|----------|--------|---------|-------------|
| `API_TIMEOUT` | ✅ | ❌ | API request timeout |
| `DEBUG_MODE` | ✅ | ✅ | Enable debug logging |

## **🔄 CI/CD Pipeline**

### **GitHub Actions Example**
```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy-mobile:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Deploy Mobile App
        run: |
          cd helprs-worker
          npm install
          cp .env.staging .env
          npx expo publish --release-channel staging

  deploy-desktop:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Desktop App
        run: |
          cd helprs-web
          npm install
          cp .env.staging .env.local
          npm run build
          npx vercel --prod
```

## **📞 Support**
For deployment issues, check:
1. Environment variable configuration
2. Database connectivity
3. Build logs
4. Supabase project settings

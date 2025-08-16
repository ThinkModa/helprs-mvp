# 🚀 Helprs Deployment Guide

This guide will help you deploy the Helprs workforce scheduling platform to your own environment.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- Supabase account (free tier available)
- Expo account (for mobile app)

## 🔐 Environment Variables Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and API keys
3. Run the database migrations (see Database Setup below)

### Step 2: Web Dashboard Environment Variables

1. Navigate to `helprs-web/` directory
2. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```
3. Edit `.env.local` with your actual values:

```env
# Required: Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Required: Database URL (from Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres

# Required: Authentication Secret
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000

# Optional: Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional: Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Optional: File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Mobile App Environment Variables

1. Navigate to `helprs-worker/` directory
2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` with your actual values:

```env
# Required: Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: Push Notifications
EXPO_PUBLIC_PUSH_NOTIFICATION_TOKEN=your_token_here

# Optional: Google Maps API
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional: Analytics
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## 🗄️ Database Setup

### Step 1: Run Migrations

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   cd supabase
   supabase link --project-ref your-project-id
   ```

4. Run migrations:
   ```bash
   supabase db push
   ```

### Step 2: Seed Data (Optional)

Run the seed script to add test data:
```bash
supabase db reset
```

## 🖥️ Web Dashboard Deployment

### Local Development

1. Install dependencies:
   ```bash
   cd helprs-web
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Access at: http://localhost:3000

### Production Deployment

#### Option 1: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

#### Option 2: Netlify

1. Connect your GitHub repository to Netlify
2. Add environment variables in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `.next`

#### Option 3: Self-hosted

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## 📱 Mobile App Deployment

### Development Testing

1. Install dependencies:
   ```bash
   cd helprs-worker
   npm install
   ```

2. Start Expo development server:
   ```bash
   npm start
   ```

3. Scan QR code with Expo Go app

### Production Build

1. Build for iOS:
   ```bash
   eas build --platform ios
   ```

2. Build for Android:
   ```bash
   eas build --platform android
   ```

3. Submit to app stores:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

## 🔧 Configuration Files

### Supabase Configuration

The project includes these Supabase files:
- `supabase/config.toml` - Project configuration
- `supabase/migrations/` - Database migrations
- `supabase/seed.sql` - Initial data

### Environment Variable Security

⚠️ **Important Security Notes:**

1. **Never commit `.env` files** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** for security
4. **Use environment-specific** configurations

## 🚀 Quick Start Script

Create a `setup.sh` script for easy deployment:

```bash
#!/bin/bash

# Clone the repository
git clone https://github.com/ThinkModa/helprs-workforce-platform.git
cd helprs-workforce-platform

# Setup web dashboard
cd helprs-web
cp .env.example .env.local
echo "Please edit .env.local with your Supabase credentials"
npm install

# Setup mobile app
cd ../helprs-worker
cp .env.example .env
echo "Please edit .env with your Supabase credentials"
npm install

# Setup database
cd ../supabase
supabase db push

echo "Setup complete! Edit environment files and start servers."
```

## 🔍 Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Ensure `.env.local` is in the correct directory
   - Restart the development server after changes

2. **Database connection errors**
   - Verify Supabase project is active
   - Check DATABASE_URL format
   - Ensure RLS policies are configured

3. **Mobile app not connecting**
   - Verify EXPO_PUBLIC_ variables are set
   - Check network connectivity
   - Ensure Supabase project allows anonymous access

### Support

For deployment issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review [Next.js deployment guide](https://nextjs.org/docs/deployment)
3. Check [Expo deployment docs](https://docs.expo.dev/distribution/introduction/)

## 📞 Getting Help

If you encounter issues during deployment:
1. Check the troubleshooting section above
2. Review the environment variable setup
3. Ensure all prerequisites are met
4. Contact the development team for support

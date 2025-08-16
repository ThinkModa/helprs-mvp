# Helprs - Workforce Scheduling Platform

A complete workforce scheduling platform that empowers organizations to manage hourly workers and contractors with automated admin functions.

## 🚀 Features

### Web Dashboard (Org Admin)
- **Appointments Management** - Create and manage job appointments
- **Forms Builder** - Create custom forms and attach to appointments
- **Calendar Management** - Schedule and organize appointments
- **Worker Management** - Manage team members and assignments
- **Customer Management** - Track customer information and history
- **Payment Processing** - Handle payments and worker payouts
- **Reports & Analytics** - View performance metrics and reports

### Mobile App (Workers)
- **Job Listings** - View available jobs and accept assignments
- **Real-time Notifications** - Get updates on job changes
- **Profile Management** - Update personal information and availability
- **Time Tracking** - Clock in/out for jobs
- **Communication** - Chat with team members and customers

## 🛠 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Native** - Mobile app development
- **Expo** - Mobile app framework

### Backend
- **Supabase** - Database, authentication, and real-time features
- **PostgreSQL** - Primary database
- **Row Level Security (RLS)** - Multi-tenant data isolation

### Key Libraries
- **@supabase/supabase-js** - Database client
- **@react-navigation/native** - Mobile navigation
- **Lucide React** - Icon library
- **Class Variance Authority** - Component variants

## 📁 Project Structure

```
helprs-clean/
├── helprs-web/                 # Web dashboard (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/      # Admin dashboard pages
│   │   │   ├── auth/          # Authentication pages
│   │   │   └── api/           # API routes
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts
│   │   ├── lib/              # Utility functions
│   │   └── types/            # TypeScript types
│   └── public/               # Static assets
├── helprs-worker/             # Mobile app (React Native)
│   ├── src/
│   │   ├── screens/          # Mobile app screens
│   │   ├── services/         # API services
│   │   ├── styles/           # Global styles
│   │   └── types/            # TypeScript types
│   └── assets/               # Mobile app assets
├── supabase/                 # Database migrations and config
├── helprs-schema.sql         # Complete database schema
└── database-documentation.md # Database documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Supabase account

### Web Dashboard Setup
```bash
cd helprs-web
npm install
npm run dev
```

### Mobile App Setup
```bash
cd helprs-worker
npm install
npm start
```

### Database Setup
1. Create a Supabase project
2. Run the migrations in `supabase/migrations/`
3. Update environment variables

## 🔐 Environment Variables

### Web Dashboard (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Mobile App (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📊 Database Schema

The platform uses a multi-tenant architecture with the following core tables:
- **companies** - Organization data
- **users** - User accounts and roles
- **workers** - Worker profiles and availability
- **customers** - Customer information
- **jobs** - Job/appointment data
- **appointments** - Scheduled appointments
- **forms** - Custom form definitions
- **payments** - Payment processing
- **ratings** - Feedback and ratings

## 🔒 Security

- **Row Level Security (RLS)** - Data isolation between companies
- **Role-based Access Control** - Super Admin, Org Admin, Worker roles
- **Multi-tenant Architecture** - Complete data separation
- **Environment Variable Protection** - Secure configuration management

## 📱 Mobile App Features

- **Expo Go Compatible** - Test on physical devices
- **Real-time Updates** - Live job notifications
- **Offline Support** - Work without internet connection
- **Push Notifications** - Instant job updates
- **Location Services** - Job location mapping

## 🌐 Web Dashboard Features

- **Responsive Design** - Works on all devices
- **Real-time Data** - Live updates across all users
- **Advanced Scheduling** - Calendar integration
- **Form Builder** - Custom form creation
- **Analytics Dashboard** - Performance metrics
- **Payment Integration** - Stripe payment processing

## 📈 Current Status

✅ **Complete Web Dashboard** - All admin features implemented
✅ **Mobile App** - Worker interface with job management
✅ **Database Schema** - Full multi-tenant structure
✅ **Authentication** - User management and roles
✅ **Real-time Features** - Live updates and notifications

## 🎯 Next Steps

- [ ] Payment processing integration
- [ ] Advanced analytics and reporting
- [ ] Customer mobile app
- [ ] Background check integration
- [ ] Advanced scheduling algorithms
- [ ] Performance optimization

## 📄 License

This project is proprietary software for Helprs workforce management platform.

## 🤝 Support

For support and questions, contact the Helprs development team.

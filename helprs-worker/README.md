# Helprs Worker App

A React Native mobile application for workers to manage jobs, track time, and communicate with team members.

## Features

### 🏠 Home Screen
- Welcome message with worker's name
- Upcoming jobs with earnings potential
- Real-time notifications
- Quick access to job details

### 📅 Schedule Screen
- Available Jobs | My Jobs | All Jobs tabs
- Weekly calendar view
- Job cards with location, time, and worker assignments
- Search functionality

### 📋 Job Details Screen
- Interactive map view of job location
- Job information and requirements
- Team member profiles with chat access
- Customer information (after accepting job)
- Clock in/out functionality
- Form fields for job notes and instructions

### 👤 Profile Screen
- Worker profile with photo and stats
- Job History | Payments | Stats tabs
- Personal information management
- Performance metrics and earnings

### 🔐 Authentication
- Secure login with email/password
- Password reset functionality
- Session management

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for routing
- **Supabase** for backend and authentication
- **Expo Vector Icons** for UI icons

## Database Integration

The app connects to the Helprs Supabase database with the following key tables:
- `users` - Authentication and user profiles
- `workers` - Worker-specific data
- `jobs` - Job assignments and details
- `job_workers` - Worker-job relationships
- `time_entries` - Clock in/out tracking
- `notifications` - Real-time alerts
- `messages` - Worker-to-worker chat

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

## Project Structure

```
src/
├── screens/           # Screen components
│   ├── HomeScreen.tsx
│   ├── ScheduleScreen.tsx
│   ├── JobDetailsScreen.tsx
│   ├── ProfileScreen.tsx
│   └── LoginScreen.tsx
├── types/             # TypeScript type definitions
│   └── database.ts
├── lib/               # Utility libraries
│   └── supabase.ts
└── styles/            # Global styles
    └── GlobalStyles.ts
```

## UI/UX Design

The app follows a modern, minimalist design with:
- Clean, card-based layouts
- Consistent color scheme (blue primary, green success, etc.)
- Intuitive navigation with bottom tabs
- Responsive design for different screen sizes
- Accessibility considerations

## Key Features Implemented

✅ **Navigation Structure** - Bottom tabs and stack navigation
✅ **Home Dashboard** - Job cards and notifications
✅ **Schedule View** - Calendar and job filtering
✅ **Job Details** - Complete job information and actions
✅ **Profile Management** - Worker stats and information
✅ **Authentication UI** - Login screen and form validation
✅ **Database Types** - Full TypeScript integration
✅ **Global Styling** - Consistent design system

## Next Steps

- [ ] Implement Supabase authentication
- [ ] Add real-time notifications
- [ ] Integrate Google Maps for location
- [ ] Add offline support
- [ ] Implement push notifications
- [ ] Add image upload for profile pictures
- [ ] Integrate with payment system

## Development Notes

- The app currently uses mock data for development
- Authentication is simulated for UI testing
- Database integration is ready but not yet connected
- All screens are fully functional with placeholder data

## Contributing

This is part of the Helprs MVP platform. For development guidelines and contribution information, please refer to the main project documentation.


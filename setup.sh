#!/bin/bash

echo "🚀 Helprs Workforce Platform Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Setup Web Dashboard
echo ""
echo "📱 Setting up Web Dashboard..."
cd helprs-web

# Copy environment template
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✅ Created .env.local template"
    echo "⚠️  Please edit helprs-web/.env.local with your Supabase credentials"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing web dashboard dependencies..."
npm install

cd ..

# Setup Mobile App
echo ""
echo "📱 Setting up Mobile App..."
cd helprs-worker

# Copy environment template
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env template"
    echo "⚠️  Please edit helprs-worker/.env with your Supabase credentials"
else
    echo "✅ .env already exists"
fi

# Install dependencies
echo "📦 Installing mobile app dependencies..."
npm install

cd ..

# Setup Database
echo ""
echo "🗄️  Setting up Database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📦 Installing Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI version: $(supabase --version)"

cd supabase

echo ""
echo "🔧 Next Steps:"
echo "=============="
echo ""
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Edit helprs-web/.env.local with your Supabase credentials:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "3. Edit helprs-worker/.env with your Supabase credentials:"
echo "   - EXPO_PUBLIC_SUPABASE_URL"
echo "   - EXPO_PUBLIC_SUPABASE_ANON_KEY"
echo ""
echo "4. Link your Supabase project:"
echo "   supabase link --project-ref YOUR_PROJECT_ID"
echo ""
echo "5. Run database migrations:"
echo "   supabase db push"
echo ""
echo "6. Start the web dashboard:"
echo "   cd helprs-web && npm run dev"
echo ""
echo "7. Start the mobile app:"
echo "   cd helprs-worker && npm start"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Setup complete!"

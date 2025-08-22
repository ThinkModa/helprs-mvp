#!/bin/bash

echo "🚀 Starting Helprs Worker App..."
echo "📱 This will give you a URL to use in Expo Go"
echo ""

# Start the Expo development server with tunnel
npx expo start --tunnel

echo ""
echo "✅ App is running!"
echo "📱 Open Expo Go on your phone and:"
echo "   1. Tap 'Enter URL manually'"
echo "   2. Paste the URL shown above"
echo "   3. Tap 'Connect'"
echo ""
echo "🔄 The app will update automatically when you make changes!"

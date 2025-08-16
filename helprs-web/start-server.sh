#!/bin/bash

# Start Next.js server in background
cd /Users/kingrah/Helprs_MVP/helprs-web

# Kill any existing Next.js processes
pkill -f "next dev" 2>/dev/null || true

# Start the server and redirect output to log file
nohup npm run dev > server.log 2>&1 &

# Get the process ID
SERVER_PID=$!

# Save the PID to a file for later reference
echo $SERVER_PID > server.pid

echo "Next.js server started with PID: $SERVER_PID"
echo "Log file: server.log"
echo "PID file: server.pid"

# Wait a moment for server to start
sleep 3

# Test if server is responding
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Server is running and responding on http://localhost:3000"
else
    echo "❌ Server may not be fully started yet. Check server.log for details."
fi

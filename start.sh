#!/bin/bash

# Campus Lost & Found - Startup Script
# This script starts both the frontend and backend servers

echo "================================"
echo "Campus Lost & Found - Starting..."
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js found${NC}"

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Install backend dependencies if backend/node_modules doesn't exist
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend
    npm install
    cd ..
fi

echo ""
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Warning: .env.local not found. Creating from template...${NC}"
    cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:3001/api
VITE_FIREBASE_API_KEY=AIzaSyAkkSz8FqXbj7eF_qRqrxJ6ktVXJPYT_oQ
VITE_FIREBASE_AUTH_DOMAIN=zetech-lost-found.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=zetech-lost-found
VITE_FIREBASE_STORAGE_BUCKET=zetech-lost-found.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdefghij
EOF
    echo -e "${GREEN}✓ Created .env.local${NC}"
fi

if [ ! -f "backend/.env.local" ]; then
    echo -e "${YELLOW}Warning: backend/.env.local not found. Creating from template...${NC}"
    mkdir -p backend
    cat > backend/.env.local << 'EOF'
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/zetech-lost-found
JWT_SECRET=campus-lost-found-secret-key-change-in-production
FRONTEND_URL=http://localhost:5173
EOF
    echo -e "${GREEN}✓ Created backend/.env.local${NC}"
fi

echo ""
echo -e "${GREEN}Starting servers...${NC}"
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo "Backend will be available at: http://localhost:3001"
echo ""
echo -e "${YELLOW}Make sure MongoDB is running on localhost:27017${NC}"
echo ""

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# Start frontend
npm run dev

# Clean up background process when frontend exits
kill $BACKEND_PID 2>/dev/null || true

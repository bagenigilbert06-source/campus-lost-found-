#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Campus Lost & Found - Diagnostics${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check if .env.local exists
echo -e "${YELLOW}Checking environment configuration...${NC}"
if [ -f .env.local ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"
    
    # Check for required variables
    if grep -q "MONGODB_URI" .env.local; then
        MONGODB_VALUE=$(grep "MONGODB_URI" .env.local | cut -d'=' -f2)
        if [ -z "$MONGODB_VALUE" ]; then
            echo -e "${RED}✗ MONGODB_URI is empty${NC}"
            echo -e "${YELLOW}  Add your MongoDB connection string to .env.local${NC}"
        else
            echo -e "${GREEN}✓ MONGODB_URI is set${NC}"
            # Show masked connection string
            MASKED=$(echo "$MONGODB_VALUE" | sed 's/:[^:]*@/:*****@/g')
            echo -e "  ${BLUE}$MASKED${NC}"
        fi
    else
        echo -e "${RED}✗ MONGODB_URI not found in .env.local${NC}"
        echo -e "${YELLOW}  Add: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname${NC}"
    fi
    
    if grep -q "FIREBASE_PROJECT_ID" .env.local; then
        echo -e "${GREEN}✓ FIREBASE_PROJECT_ID is set${NC}"
    else
        echo -e "${RED}✗ FIREBASE_PROJECT_ID not found${NC}"
    fi
else
    echo -e "${RED}✗ .env.local not found${NC}"
    echo -e "${YELLOW}  Run: cp .env.local.example .env.local${NC}"
fi

echo ""

# Check Node.js and npm versions
echo -e "${YELLOW}Checking dependencies...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
fi

if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo -e "${GREEN}✓ pnpm ${PNPM_VERSION}${NC}"
else
    echo -e "${RED}✗ pnpm not found${NC}"
    echo -e "${YELLOW}  Install with: npm install -g pnpm${NC}"
fi

echo ""

# Check backend dependencies
echo -e "${YELLOW}Checking backend dependencies...${NC}"
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓ Backend node_modules installed${NC}"
else
    echo -e "${RED}✗ Backend dependencies not installed${NC}"
    echo -e "${YELLOW}  Run: cd backend && pnpm install${NC}"
fi

# Check frontend dependencies
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ Frontend node_modules installed${NC}"
else
    echo -e "${RED}✗ Frontend dependencies not installed${NC}"
    echo -e "${YELLOW}  Run: pnpm install${NC}"
fi

echo ""

# Check ports
echo -e "${YELLOW}Checking ports...${NC}"
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 3001 is in use (backend)${NC}"
else
    echo -e "${GREEN}✓ Port 3001 is available${NC}"
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Port 5173 is in use (frontend)${NC}"
else
    echo -e "${GREEN}✓ Port 5173 is available${NC}"
fi

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Diagnostics Complete${NC}"
echo -e "${BLUE}================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Ensure .env.local has valid MONGODB_URI"
echo "2. Run: cd backend && pnpm run dev"
echo "3. In another terminal: pnpm run dev"
echo "4. Check http://localhost:3001/health"

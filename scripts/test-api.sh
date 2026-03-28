#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"
API_URL="$BASE_URL/api"

echo -e "${YELLOW}=== API Health Check ===${NC}"

# Test 1: Health endpoint
echo -e "\n${YELLOW}[1/5] Testing health endpoint...${NC}"
response=$(curl -s -w "\n%{http_code}" "$BASE_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" == "200" ]; then
  echo -e "${GREEN}✓ Health check passed${NC}"
  echo "  Response: $body"
else
  echo -e "${RED}✗ Health check failed (HTTP $http_code)${NC}"
fi

# Test 2: Test 404 for non-existent route
echo -e "\n${YELLOW}[2/5] Testing 404 error handling...${NC}"
response=$(curl -s -w "\n%{http_code}" "$API_URL/nonexistent")
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" == "404" ]; then
  echo -e "${GREEN}✓ 404 handling works${NC}"
else
  echo -e "${RED}✗ 404 handling failed (HTTP $http_code)${NC}"
fi

# Test 3: MongoDB connection
echo -e "\n${YELLOW}[3/5] Checking MongoDB connection...${NC}"
echo "  Check the server logs for MongoDB connection status"

# Test 4: Firebase initialization
echo -e "\n${YELLOW}[4/5] Checking Firebase initialization...${NC}"
echo "  Check the server logs for Firebase initialization status"

# Test 5: Auth endpoints
echo -e "\n${YELLOW}[5/5] Testing auth endpoints (should require auth)...${NC}"
response=$(curl -s -w "\n%{http_code}" \
  -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","displayName":"Test"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" == "401" ]; then
  echo -e "${GREEN}✓ Auth endpoint requires authentication (HTTP 401)${NC}"
elif [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
  echo -e "${YELLOW}⚠ Auth endpoint responded without proper authentication${NC}"
else
  echo -e "${RED}✗ Auth endpoint error (HTTP $http_code)${NC}"
  echo "  Response: $body"
fi

echo -e "\n${YELLOW}=== API Test Complete ===${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Check that MongoDB is connected"
echo "2. Check that Firebase is initialized"
echo "3. Test with valid Firebase tokens from the frontend"

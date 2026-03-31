# E2E and Unit Test Suite - Campus Lost & Found Platform

This document provides comprehensive instructions for running the complete test suite.

## Overview

The test suite includes:
- **E2E Tests (Playwright)**: Browser automation tests for complete user workflows
- **Unit Tests (Jest)**: API endpoint and business logic tests
- **Integration Tests**: Cross-component and full-stack testing

## Prerequisites

### Installation

```bash
# Install test dependencies
pnpm install:all && pnpm exec playwright install

# Or for backend only
cd backend
pnpm install && pnpm exec playwright install

cd ../frontend
pnpm install
```

## Running Tests

### 1. Start the Application

Before running tests, ensure both frontend and backend are running:

```bash
# Terminal 1: Backend
cd backend
pnpm run dev

# Terminal 2: Frontend
cd frontend  
pnpm run dev

# Terminal 3: Run tests (any location)
```

### 2. Run All E2E Tests

```bash
# Run all E2E tests
pnpm run test:e2e

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run tests matching pattern
npx playwright test --grep "should login"

# Run with UI mode (visual test runner)
npx playwright test --ui

# Debug mode
pnpm run test:e2e:debug

# Show detailed trace on failure
pnpm run test:e2e (already includes trace on failure)
```

### 3. Run Backend Unit Tests

```bash
# Run all API tests
pnpm run test:api

# Run with verbose output
cd backend && pnpm test -- --verbose

# Run specific test suite
cd backend && pnpm test -- --testNamePattern="Authentication"

# Run with coverage
pnpm run test:coverage
```

### 4. Run Tests by Category

```bash
# Authentication tests only
pnpm run test:e2e:auth

# Student workflow tests only
pnpm run test:e2e:student

# Admin workflow tests only
pnpm run test:e2e:admin

# Edge cases and error handling only
pnpm run test:e2e:edge

# API tests only
pnpm run test:api
```

## Test Files Overview

### Frontend E2E Tests

#### `tests/e2e/auth.spec.ts` - Authentication (15 tests)
- ✅ Student signup with validation
- ✅ Student login/logout
- ✅ Admin login
- ✅ Session management
- ✅ Error handling (invalid credentials, weak passwords, etc.)

**Expected Time**: 2-3 minutes

#### `tests/e2e/student-workflow.spec.ts` - Student Features (18 tests)
- ✅ Search and filter items
- ✅ View item details
- ✅ Post lost/found items
- ✅ Manage posted items (edit, delete)
- ✅ Claim items
- ✅ Messaging system
- ✅ Bookmark items
- ✅ Dashboard view

**Expected Time**: 3-5 minutes

#### `tests/e2e/admin-workflow.spec.ts` - Admin Features (18 tests)
- ✅ Admin dashboard
- ✅ Inventory management (CRUD)
- ✅ Claims management (approve, reject)
- ✅ Messaging
- ✅ Activity logs
- ✅ Reports and analytics
- ✅ Settings

**Expected Time**: 3-5 minutes

#### `tests/e2e/edge-cases.spec.ts` - Error Handling (25+ tests)
- ✅ Form validation
- ✅ Network error handling
- ✅ Concurrent operations
- ✅ Session expiration
- ✅ File upload validation
- ✅ Data integrity
- ✅ Responsive design (mobile, tablet, desktop)

**Expected Time**: 5-7 minutes

### Backend Unit Tests

#### `tests/unit/api.test.ts` - API Endpoints (50+ tests)
- ✅ Authentication endpoints
- ✅ Items CRUD operations
- ✅ Search functionality
- ✅ Claims management
- ✅ Messages handling
- ✅ Notifications
- ✅ Bookmarks
- ✅ User profiles
- ✅ Error handling
- ✅ Data validation

**Expected Time**: 2-3 minutes

## Test Results and Reports

### View HTML Report
```bash
pnpm run test:report
```

### Generate Coverage Report
```bash
pnpm run test:coverage
```

### CI/CD Integration

The tests are configured to run in CI environments. GitHub Actions workflow:

```yaml
- name: Run E2E Tests
  run: pnpm run test:e2e

- name: Upload Artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Test Data

Tests use temporary data that is automatically cleaned:
- Student accounts with unique timestamps
- Items with test prefixes
- Temporary claims and messages

Admin login uses:
- Email: `admin@zetech.ac.ke`
- Password: Set via `ADMIN_PASSWORD` env variable

## Troubleshooting

### Tests fail with "Browser not found"
```bash
# Install browser binaries
npx playwright install
```

### Tests timeout on slower machines
Adjust timeout in `playwright.config.ts`:
```typescript
timeout: 120000, // 2 minutes
expect: { timeout: 15000 } // 15 seconds per assertion
```

### Backend API not responding
```bash
# Check backend is running
curl http://localhost:3001/health

# Check frontend port
curl http://localhost:5173
```

### Tests fail with "Element not found"
- Try using `[data-testid]` attributes instead of text locators
- Add more explicit waits: `await page.waitForTimeout(500)`
- Check if page structure changed

## Performance Metrics

Benchmark for successful test run:
- **Total Duration**: 15-20 minutes
- **E2E Tests**: 12-17 minutes (76 tests)
- **API Tests**: 2-3 minutes (50+ tests)
- **Success Rate**: >95% expected

## Common Test Scenarios Covered

### Student Journey
1. Sign up → Login → Dashboard
2. Search items → Filter → View details
3. Post item → Upload images → Edit → Delete
4. Claim item → Send proof → Track status
5. Message admin → Check reply

### Admin Journey
1. Login → Dashboard → View stats
2. Add item → Update status → Track
3. View claims → Approve/Reject → Send message
4. View messages → Reply → Track conversation
5. Generate reports → View activity logs

### Error Scenarios
- Network failures and retries
- Form validation and constraints
- Permission-based access control
- Session expiration
- File upload limits
- Concurrent operations
- Invalid data handling

## Continuous Improvement

### Test Maintenance
- Update selectors when UI changes
- Add new tests for new features
- Fix flaky tests with better waits
- Monitor test performance

### Coverage Goals
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## Dependencies

- `@playwright/test`: Browser automation
- `jest`: Test runner
- `ts-jest`: TypeScript support for Jest
- `axios`: HTTP client for API tests

## Environment Variables

```bash
# .env or .env.test
ADMIN_PASSWORD=your_admin_password
API_URL=http://localhost:3001/api
BASE_URL=http://localhost:5173
CI=false
```

## Support and Questions

For test failures:
1. Check individual test output
2. Review screenshots/videos in `test-results/`
3. Enable debug mode: `npx playwright test --debug`
4. Add custom logging to tests

## Next Steps

After tests pass:
1. Deploy to staging environment
2. Run smoke tests
3. Perform user acceptance testing
4. Monitor production logs

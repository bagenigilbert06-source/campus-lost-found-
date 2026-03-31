# Quick Reference - E2E Testing Commands

## 📦 Installation

```bash
# Install all dependencies (frontend + backend) with pnpm
pnpm install:all

# Or install individually:
pnpm install                    # Frontend
cd backend && pnpm install      # Backend

# Install Playwright browsers
pnpm exec playwright install
```

## 🚀 Start Services

Open three terminals:

**Terminal 1 - Backend**
```bash
cd backend
pnpm run dev
# Should show: Server running on http://localhost:3001
```

**Terminal 2 - Frontend**
```bash
pnpm run dev
# Should show: Local: http://localhost:5173
```

**Terminal 3 - Run Tests**
(From root directory or any location)

## ✅ Run All Tests

```bash
# Run ALL tests (E2E + Unit)
pnpm test

# Just E2E tests
pnpm exec playwright test

# Just API tests
cd backend && pnpm test
```

## 📋 Run by Test Category

### Authentication Tests
```bash
pnpm exec playwright test auth.spec.ts
```

### Student Workflow Tests
```bash
pnpm exec playwright test student-workflow.spec.ts
```

### Admin Workflow Tests
```bash
pnpm exec playwright test admin-workflow.spec.ts
```

### Edge Cases & Error Handling
```bash
pnpm exec playwright test edge-cases.spec.ts
```

### Backend API Tests
```bash
cd backend
pnpm test
pnpm run test:api            # Same as above
pnpm run test:watch         # Watch mode
pnpm run test:verbose       # Detailed output
pnpm run test:coverage      # Coverage report
```

## 🎮 Interactive Testing

### UI Mode (Recommended for Development)
```bash
pnpm exec playwright test --ui
```
This opens an interactive test runner where you can:
- Click to run individual tests
- See test execution step-by-step
- Inspect elements
- View console logs

### Debug Mode
```bash
pnpm exec playwright test --debug
```
Opens Playwright Inspector for debugging specific tests.

### Run Specific Test
```bash
# By test name
pnpm exec playwright test -g "should login"

# By filename and test name  
pnpm exec playwright test auth.spec.ts -g "admin"
```

## 📊 Reports

```bash
# View HTML report
pnpm exec playwright show-report

# Generate coverage
cd backend && pnpm run test:coverage

# View coverage report (if generated)
open backend/coverage/index.html
```

## 🎯 pnpm Scripts

All testing scripts from package.json:

```bash
pnpm test                # Run all E2E tests
pnpm run test:e2e       # Run all E2E tests
pnpm run test:e2e:ui    # Interactive UI mode
pnpm run test:e2e:debug # Debug mode
pnpm run test:e2e:auth     # Authentication tests only
pnpm run test:e2e:student  # Student workflow tests
pnpm run test:e2e:admin    # Admin workflow tests
pnpm run test:e2e:edge     # Edge cases tests
pnpm run test:api       # API/Unit tests
pnpm run test:coverage  # Coverage report
pnpm run test:report    # View results
```

**Quick Commands:**
```bash
pnpm test                  # Run all E2E tests
pnpm run test:e2e:ui      # Interactive UI
pnpm run test:e2e:student # Just student tests
pnpm run test:api         # Just API tests
pnpm run test:report      # View results
```

## 📁 Test Files Created

```
tests/
├── e2e/
│   ├── auth.spec.ts                    (15 tests)
│   ├── student-workflow.spec.ts        (18 tests)
│   ├── admin-workflow.spec.ts          (18 tests)
│   ├── edge-cases.spec.ts              (25+ tests)
│   └── README.md
│
├── unit/
│   └── api.test.ts                     (50+ tests)
│
└── setup.ts                            (Jest setup)

Configuration Files:
├── playwright.config.ts                (E2E config)
└── backend/jest.config.js             (Unit test config)

Documentation:
├── TEST_GUIDE.md                       (Detailed guide)
├── COMPLETE_TEST_SUITE.md             (Full documentation)
└── QUICK_REFERENCE.md                 (This file)
```

## 🔍 Test Coverage

### E2E Tests (76 total)
- **Authentication** (15): signup, login, logout, session
- **Student Features** (18): search, post, claim, message, bookmark
- **Admin Features** (18): inventory, claims, messaging, reports
- **Edge Cases** (25+): validation, errors, responsive, security

### Unit Tests (50+)
- **Auth Endpoints**: register, login, verify token
- **Items CRUD**: all create/read/update/delete operations
- **Search**: keyword, filters, location-based
- **Claims**: submit, approve, reject
- **Messages**: send, read, reply
- **Notifications**: get, preferences
- **Bookmarks**: add, remove

## ⏱️ Execution Time

- **E2E Tests**: 12-17 minutes (76 tests)
- **Unit Tests**: 2-3 minutes (50+ tests)
- **Full Suite**: 15-20 minutes total

## ✨ Key Features

✅ **Comprehensive** - 126+ test cases covering all features
✅ **Robust** - Error handling, validation, edge cases
✅ **Fast** - Parallel execution, 20 min full suite
✅ **Reliable** - Retry logic, proper wait conditions
✅ **Developer-Friendly** - UI mode, debug mode, clear names
✅ **Production-Ready** - CI/CD compatible, HTML reports

## 🚨 Troubleshooting

### Tests fail to start
```bash
# Ensure services are running
curl http://localhost:3001/health
curl http://localhost:5173

# Install Playwright browsers if missing
pnpm exec playwright install
```

### Timeout errors
Edit `playwright.config.ts`:
```typescript
timeout: 120000  // 2 minutes instead of 60 seconds
```

### Need fresh database
```bash
cd backend
pnpm run seed  # Reset database with initial data
```

### Admin login fails
```bash
ADMIN_PASSWORD=your_password pnpm test
```

## 📚 Documentation Files

1. **TEST_GUIDE.md** - Detailed testing instructions
2. **COMPLETE_TEST_SUITE.md** - Full test documentation
3. **QUICK_REFERENCE.md** - This file (command reference)
4. **playwright.config.ts** - E2E configuration
5. **backend/jest.config.js** - Unit test configuration

## 🎉 Expected Results

When all tests pass:
```
E2E Tests: ✓ 76 passed
Unit Tests: ✓ 50+ passed
Report: HTML at playwright-report/index.html
Duration: 15-20 minutes
Success Rate: >95%
```

## 🔗 Quick Links

- **Test Files**: `tests/` directory
- **Backend Config**: `backend/jest.config.js`
- **Frontend Config**: `playwright.config.ts`
- **Documentation**: `TEST_GUIDE.md` and `COMPLETE_TEST_SUITE.md`

## 💡 Pro Tips

1. **Start with UI mode**: `npm run test:e2e:ui` to see tests visually
2. **Use test names**: `npx playwright test -g "keyword"` to run specific tests
3. **Debug selector issues**: Use `--debug` flag
4. **Check reports**: Always review HTML report after runs
5. **Fix one test at a time**: Start with `auth` tests, then `student`, then `admin`

---

**That's it! Your complete E2E test suite is ready to go. 🚀**

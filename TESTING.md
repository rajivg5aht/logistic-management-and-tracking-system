# Automated testing

The repository keeps the assignment test total below the 250-test limit while
covering the API, reusable UI behavior, and complete browser journeys.

| Suite | Tooling | Tests |
| --- | --- | ---: |
| REST API | Jest and Supertest | 190 |
| UI components | Vitest, React Testing Library, jest-dom, and jsdom | 40 |
| Browser journeys | Playwright (Chromium) | 18 |
| **Total** |  | **248 / 250** |

The commands below provide the evidence that the declared tests actually pass.

## Backend

```bash
cd backend
npm ci
npm test
npm run test:coverage
npm run build
```

The backend tests require MongoDB. Set `MONGO_URI_TEST` when the test database is
not available at `mongodb://localhost:27017/logistics_test`. Use a dedicated test
database because integration tests create and clean test records.

Coverage includes API integrations, controllers, services, repositories,
middleware, validation schemas, models, types, and utilities. Migration scripts,
socket behavior, and several defensive controller branches remain outside the
current automated paths.

## Frontend

```bash
cd frontend
npm ci
npm test
npm run test:coverage
npm run build
npx playwright install chromium
npm run test:e2e
npm run lint
```

Vitest covers synchronous component behavior in jsdom. Playwright covers the
public, customer, driver, and administrator journeys against a production Next.js
build. API responses are intercepted with endpoint-shaped fixtures so browser
tests remain deterministic and do not alter a real database.

Vitest line coverage does not include the Playwright browser execution. Read the
Vitest percentage as component-unit coverage, and the Playwright result as the
separate end-to-end requirement; do not add the percentages together.

## Latest verified results

These results were produced locally on 22 July 2026:

| Check | Result |
| --- | --- |
| Backend Jest | 23 suites, 190 tests passed |
| Backend coverage | 60.58% statements, 34.52% branches, 66% functions, 61.6% lines |
| Frontend Vitest | 3 files, 40 tests passed |
| Frontend Vitest coverage | 5% statements, 3.8% branches, 7.36% functions, 5.22% lines |
| Frontend Playwright | 18 Chromium tests passed |
| Backend TypeScript build | Passed |
| Frontend production build | Passed (40 routes) |
| Frontend ESLint | Passed with 0 errors and 3 existing image warnings |

The suite meets the agreed 248-test allocation and gives broad automated testing
evidence. The raw coverage percentages above are intentionally recorded as-is;
they do not yet represent literal full source-code coverage.

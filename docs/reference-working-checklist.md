# Reference Working Checklist

Use this checklist when auditing or improving the SmartBooks Accounting App as a senior software architect, full-stack developer, QA lead, cybersecurity reviewer, and product design reviewer.

Review the app from the perspectives of functionality, architecture, maintainability, UI/UX, data structure, performance, security, testing, scalability, and deployment readiness.

## 1. Code Structure And Architecture

- [ ] Review folder structure, file organization, naming conventions, and separation of concerns.
- [ ] Check whether the app follows a clean and scalable architecture.
- [ ] Identify duplicated code, overly complex logic, hardcoded values, unused files, unused dependencies, and refactor candidates.
- [ ] Check whether the application is structured properly for future backend, database, API, authentication, authorization, and third-party integration.

## 2. Functional Correctness

- [ ] Check whether all pages, routes, navigation links, buttons, forms, modals, filters, tables, dashboards, charts, file uploads, exports, and user actions work as intended.
- [ ] Identify broken features, missing event handlers, stale state issues, incorrect data flows, inconsistent behavior, and incomplete workflows.
- [ ] Verify whether displayed data, calculations, statuses, summaries, and reports are generated dynamically or hardcoded.
- [ ] Review whether the application handles empty states, loading states, error states, invalid inputs, and edge cases properly.

## 3. UI/UX Review

- [ ] Review layout consistency, spacing, alignment, typography, responsiveness, readability, accessibility, and visual hierarchy.
- [ ] Check whether the app provides a professional, modern, and user-friendly interface.
- [ ] Identify confusing user flows, unclear labels, weak call-to-action buttons, inconsistent design patterns, and incomplete screens.
- [ ] Review whether the app works properly on desktop, tablet, and mobile screen sizes.
- [ ] Check whether the app provides clear feedback after user actions such as save, submit, delete, upload, update, or export.

## 4. Data Model And Business Logic

- [ ] Review whether the data structure supports the intended business logic and user workflows.
- [ ] Check whether entities, relationships, statuses, calculations, permissions, and process flows are logically designed.
- [ ] Identify where mock data, hardcoded data, or temporary logic should be replaced with database-backed data.
- [ ] Recommend improvements to the data model, API design, validation logic, and state management.
- [ ] Check whether the app separates presentation logic, business logic, and data access logic properly.

## 5. Security And Privacy

- [ ] Identify security risks such as exposed secrets, API keys, tokens, unsafe input handling, weak authentication assumptions, insecure authorization logic, excessive client-side trust, or insecure API patterns.
- [ ] Review whether the app protects sensitive user data and business data properly.
- [ ] Check whether role-based access control, session handling, password handling, file upload validation, and API request validation are properly considered.
- [ ] Identify risks related to injection attacks, XSS, CSRF, insecure direct object references, insecure storage, and sensitive data exposure.
- [ ] Recommend practical security improvements before production deployment.

## 6. Performance And Scalability

- [ ] Identify unnecessary re-renders, inefficient loops, oversized components, heavy client-side processing, unoptimized API calls, large bundle size, or slow-loading pages.
- [ ] Review whether the app can scale with more users, more records, more modules, and more complex workflows.
- [ ] Recommend improvements such as pagination, lazy loading, caching, memoization, database indexing, API optimization, and component splitting.
- [ ] Check whether the app is designed for maintainable growth instead of short-term demo use only.

## 7. Maintainability And Developer Experience

- [ ] Review whether the code is easy to read, modify, test, and extend.
- [ ] Identify unclear naming, weak comments, inconsistent patterns, duplicated logic, and tightly coupled components.
- [ ] Recommend where to introduce reusable components, shared utilities, service layers, custom hooks, state management, configuration files, and type definitions.
- [ ] Check whether the project setup, scripts, environment variables, linting, formatting, and documentation are clear for future developers.

## 8. Testing And QA

- [ ] Identify missing unit tests, integration tests, end-to-end tests, API tests, UI tests, and regression tests.
- [ ] Recommend practical test cases for key user flows, forms, calculations, permissions, dashboard data, table filtering, routing, data updates, and error handling.
- [ ] Suggest a minimum QA checklist before deployment.
- [ ] Identify high-risk areas that should be tested first.

## 9. Deployment And Production Readiness

- [ ] Review whether the app can be built and deployed cleanly.
- [ ] Check environment variable setup, build scripts, routing configuration, dependency issues, production configuration, logging, monitoring, and error reporting.
- [ ] Identify what must be fixed before connecting the app to a real backend, database, authentication system, payment system, or external APIs.
- [ ] Recommend deployment improvements for reliability, rollback, backup, observability, and maintainability.

## 10. Product And Business Readiness

- [ ] Review whether the app's features match the intended user needs and business use case.
- [ ] Identify missing workflows, incomplete modules, weak reporting, poor user guidance, or gaps that would prevent real users from adopting the app.
- [ ] Recommend improvements to make the app more business-ready, scalable, and user-friendly.
- [ ] Distinguish between demo-ready features and production-ready features.

## Audit Output Format

Use this structure when reporting findings.

### A. Executive Summary

Provide a concise summary of the overall code quality, product maturity, major risks, and production readiness.

### B. Critical Issues

List high-priority bugs, broken features, security risks, or architectural problems that must be fixed first.

### C. Module-by-Module Findings

Review each major page, module, component, service, or workflow. Explain what is working, what is weak, and what should be improved.

### D. UI/UX Findings

Summarize design, usability, responsiveness, accessibility, and user-flow issues.

### E. Security And Privacy Risks

List risks related to authentication, authorization, data handling, file uploads, API design, exposed secrets, and sensitive information.

### F. Data And Architecture Recommendations

Recommend improvements to the data model, state management, API structure, backend readiness, and system architecture.

### G. Refactoring Recommendations

Provide specific code-level recommendations. Reference exact files, components, functions, and code patterns where possible.

### H. Missing Or Incomplete Features

Identify features, workflows, validations, reports, settings, permissions, or integrations that appear missing or incomplete.

### I. Testing Recommendations

Provide a practical testing plan, including unit tests, integration tests, end-to-end tests, regression tests, and manual QA checks.

### J. Deployment Readiness Checklist

List what must be completed before production deployment.

### K. Suggested Improvement Roadmap

- [ ] Phase 1: Fix critical bugs and broken UI.
- [ ] Phase 2: Refactor structure, state management, and reusable components.
- [ ] Phase 3: Improve data model, API readiness, and backend integration.
- [ ] Phase 4: Add authentication, authorization, testing, logging, and monitoring.
- [ ] Phase 5: Prepare for production deployment and user adoption.

### L. Final Score

Give the app a score out of 10 for:

- [ ] Functionality
- [ ] UI/UX
- [ ] Architecture
- [ ] Maintainability
- [ ] Security
- [ ] Performance
- [ ] Scalability
- [ ] Testing readiness
- [ ] Production readiness

Be specific, practical, and direct. Do not provide only general advice. Reference exact files, components, functions, and workflows wherever possible. Clearly separate critical issues from nice-to-have improvements.

# Business Requirements Document (BRD)

## Project: SplitEasy — Shared Expense & Bill Splitting Application

| | |
|---|---|
| **Document Version** | 1.0 |
| **Date** | 2026-07-02 |
| **Prepared For** | SplitEasy Product Team |
| **Application Codebase** | React 19 + Vite + Tailwind CSS (web), packaged with Capacitor for Android |
| **Status** | Draft (reverse-engineered from existing implementation) |

---

## 1. Executive Summary

SplitEasy is a mobile-first web application (deployed as an Android app via Capacitor) that helps
groups of people — roommates, trip companions, friends dining out, etc. — track shared expenses
and know **who owes whom, and how much**. It replicates the core value proposition of products
like Splitwise: users record an expense once, the app splits it among participants using a chosen
method, and running balances are maintained per friend and per group.

SplitEasy is explicitly **not** a payment gateway. It does not move real money between users. All
actual repayment happens outside the app (cash, UPI, bank transfer, etc.); the app only tracks the
ledger and lets users **manually mark** amounts as settled/paid.

## 2. Business Objectives

1. Give users a fast, low-friction way to log shared expenses within a group or with an individual
   friend, without needing a shared bank account or payment integration.
2. Eliminate the "who owes what" confusion in shared-living, travel, and social spending scenarios
   by maintaining an always-up-to-date, transparent balance ledger.
3. Support flexible expense-splitting logic (equal, percentage, shares, custom amounts) to cover
   real-world splitting scenarios (e.g., one person orders more food, one person skips a round).
4. Provide a lightweight social/request layer so a user can proactively **request money** from a
   friend or group member rather than only reacting to expenses others log.
5. Give administrators operational visibility (user/group/transaction counts, platform-wide
   transaction volume) to monitor adoption and health of the platform.
6. Support multi-currency display so the product is usable by an international/expat user base
   (initial supported currencies: AED, INR, USD, EUR, GBP).

## 3. Business Scope

### 3.1 In Scope
- User registration, login, and OTP-based email verification.
- Personal profile and account settings management (name, avatar color, password, notification
  preferences, language, display currency).
- Creation and management of expense-sharing **Groups** (e.g., "Goa Trip", "Flatmates").
- Logging of shared **Expenses** within a group, split using Equal / Percentage / Shares / Custom
  methods, with the ability to exclude specific members from a given split.
- One-to-one (friend-to-friend) expense/payment/request tracking outside of any group.
- **Money Request** workflow — a user can ask a friend or group member to pay them a specific
  amount, which the recipient can Accept or Decline.
- Manual **settlement** — marking an individual's share, a pairwise balance, or an entire
  transaction as paid/settled, without moving real funds.
- Consolidated **Audit / Activity report** across all groups and friends (sent vs. received vs.
  expenses, with totals).
- **Admin** oversight dashboard: platform-wide totals and a list of registered users.
- Session security via idle-timeout auto-logout.
- Android app packaging (Capacitor) for installation as a native mobile app, in addition to the
  responsive web experience.

### 3.2 Out of Scope (for current release)
- Real-money transfer / payment gateway integration (explicitly a design decision — see disclaimer
  in-app: "Actual settlement is done manually outside the app").
- Multi-currency **transaction-level** conversion — the display currency is app-wide and cosmetic
  only; it does not currently affect the currency actually recorded against a transaction (see
  Section 6, Known Gap #1).
- Push/email/SMS notification delivery (the settings UI collects preferences but no delivery
  mechanism exists yet).
- "Repayment Requests" as a distinct tracked feature (currently a placeholder screen with no
  business logic — see Section 6, Known Gap #3).
- A generic "Building CRUD" module found in the codebase is unrelated scaffolding, not linked to
  any navigation, and is **not** part of the SplitEasy product scope.
- iOS packaging (only Android native packaging exists today).

## 4. Stakeholders

| Role | Interest |
|---|---|
| End User (regular) | Wants to track shared/group expenses and settle up with friends easily. |
| Group Admin / Group Creator | Creates and manages groups, adds/removes members. |
| Platform Administrator | Monitors overall platform usage; needs visibility into users, groups, transaction volume. |
| Product Owner | Owns feature roadmap and prioritization. |
| Development Team | Builds and maintains the React/Capacitor application and backend API. |

## 5. Business Requirements (High Level)

| ID | Business Requirement |
|---|---|
| BR-01 | The system shall allow a person to register an account and verify their identity via a one-time password (OTP) sent to their email before gaining full access. |
| BR-02 | The system shall allow a registered user to securely log in and remain logged in across sessions until an idle timeout or explicit logout. |
| BR-03 | The system shall allow a user to create a "Group" representing a shared spending context (trip, household, event) and add other platform users as members. |
| BR-04 | The system shall allow any group member to record a shared expense and split its cost among chosen members using Equal, Percentage, Shares, or Custom methods. |
| BR-05 | The system shall continuously compute and display, for every group and every friend relationship, how much the current user owes others and how much others owe the current user. |
| BR-06 | The system shall allow a user to request a specific amount of money from a friend or group member, and allow the recipient to accept or decline that request. |
| BR-07 | The system shall allow users to manually mark an amount (an individual expense share, a pairwise group balance, or a 1:1 transaction) as settled, once real-world repayment has occurred. |
| BR-08 | The system shall provide a consolidated, filterable history/audit view of all financial activity (expenses, payments, requests) involving the current user, across all groups and friends. |
| BR-09 | The system shall allow a user to manage their own profile (name, avatar, password) and application preferences (notification channels, language, display currency). |
| BR-10 | The system shall support a distinct "Administrator" role with a dashboard summarizing platform-wide usage: total users, total groups, total transactions, and total transaction value. |
| BR-11 | The system shall support configuring a platform-wide display currency (choice of AED, INR, USD, EUR, GBP), restricted to administrators. |
| BR-12 | The system shall automatically log out a user after a period of inactivity, to protect financial data on shared/unattended devices. |
| BR-13 | The system shall be distributable as a native Android application in addition to being accessible as a responsive web app. |

## 6. Known Gaps / Risks Identified in Current Implementation

These were identified while reverse-engineering the existing codebase and should be reviewed by
the business/product owner and either accepted, scheduled for a fix, or formally descoped.
Items marked **Fixed (2026-07-02)** have already been corrected in the codebase.

1. ~~**Currency mismatch**~~ — **Fixed (2026-07-02).** New group expenses (`GroupSpliPage.jsx`)
   and money requests (`RequestMoneyPage.jsx`) previously submitted a hardcoded `"AED"` currency
   to the backend regardless of the user's selected display currency. Both screens now submit the
   currently active app currency symbol (`state.currency.symbol`), consistent with what the rest
   of the UI displays.
2. **Payment Summary screen uses mock data**: `PaymentSummaryPage` is not connected to live data
   and should either be wired to the real API or removed to avoid confusing users with stale
   demo numbers. *(Not yet fixed — requires a product decision on API wiring vs. removal.)*
3. **Repayment Requests is a stub**: The `/repayments` screen exists but has no functionality and
   is not linked from any menu. Decide whether to build it out or remove the route. *(Not yet
   fixed — requires a product decision.)*
4. **Notification preferences are not enforced**: Users can toggle push/email/SMS preferences, but
   no backend delivery integration currently exists. *(Not yet fixed — requires backend/delivery
   provider work.)*
5. ~~**Currency Settings page has a code defect**~~ — **Fixed (2026-07-02).**
   `CurrencySettingsPage.jsx` referenced `DEFAULT_CURRENCY` without importing it from
   `constants/currencies.js`, which would throw a `ReferenceError` if a currency lookup failed.
   The missing import has been added.
6. **Branding vs. package identity mismatch**: the app is marketed to users as "SplitEasy" but the
   underlying package/app ID (`Split App` / `com.example.app`) still reflects default
   scaffolding. This should be corrected before any public Android/Play Store release, since
   `com.example.app` is not an acceptable production package ID. *(Not yet fixed — requires a
   product/branding decision plus a native project rename.)*
7. **Forgot Password** link on the login screen is currently non-functional (no flow implemented).
   *(Not yet fixed — requires a new screen/flow and backend support.)*

## 7. Assumptions

- A backend REST API (separate from this frontend codebase) provides authentication, persistence,
  and business-rule enforcement (e.g., balance calculation) that this frontend consumes.
- Users are expected to have an internet connection; no offline mode is currently implemented.
- All monetary settlement is a social/manual trust process between users; the platform does not
  hold custody of funds and bears no payment-processing liability under the current model.

## 8. Success Criteria

- Users can complete the full lifecycle — create group → add expense → view balance → settle —
  without needing external spreadsheets or manual calculation.
- Balance calculations (equal/percentage/shares/custom splits, pairwise settlement) are accurate
  and consistent between group and friend views.
- Admins can, at a glance, assess platform adoption (user/group/transaction counts).
- The application functions equivalently on mobile web and the packaged Android app.

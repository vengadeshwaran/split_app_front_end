# Functional Requirements Document (FRD)

## Project: SplitEasy — Shared Expense & Bill Splitting Application

| | |
|---|---|
| **Document Version** | 1.0 |
| **Date** | 2026-07-02 |
| **Related Document** | [BRD.md](./BRD.md) |
| **Status** | Draft (reverse-engineered from existing implementation) |

### Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-02 | Initial document, reverse-engineered from codebase. |
| 1.1 | 2026-07-02 | Bug fixes applied: FR-GRP-14 and FR-FRND-08 added (transaction currency now follows the app-wide currency setting instead of a hardcoded value); FR-SET-06 defect (undefined `DEFAULT_CURRENCY` reference in Currency Settings) resolved. |

---

## 1. Introduction

This document describes the detailed functional requirements of the SplitEasy application,
derived from the current React/Capacitor frontend implementation and its API contract. Each
requirement is identified with an ID (`FR-<module>-<number>`) for traceability.

## 2. User Roles / Actors

| Actor | Description |
|---|---|
| **Guest / Unauthenticated User** | Can access Login, Sign Up, and OTP Verification screens only. |
| **User (Member)** | Authenticated regular user; default role. Can manage groups they belong to, friends, expenses, requests, and their own profile. |
| **Administrator** | A `User` with `is_admin = true`. Has all Member capabilities plus access to the Admin Dashboard and Currency Settings. |

## 3. Functional Requirements by Module

### 3.1 Authentication & Onboarding

| ID | Requirement |
|---|---|
| FR-AUTH-01 | The system shall provide a Login screen accepting email and password, with a "Remember Me" option that persists the entered email locally for future visits. |
| FR-AUTH-02 | The system shall provide a Sign Up screen accepting full name, email, password, and password confirmation. |
| FR-AUTH-03 | After successful login or registration, the system shall receive and store an authentication token (JWT), the user's `user_id`, `name`, `email`, `login_id`, and `is_admin` flag, and mark the session as authenticated. |
| FR-AUTH-04 | The system shall provide an OTP Verification screen accepting a 6-digit numeric code, with auto-advance between digit fields, paste support, and a 30-second cooldown before allowing "Resend OTP". |
| FR-AUTH-05 | The system shall reject access to any authenticated route (`/dashboard/*`) for a user whose session is not authenticated, redirecting to the Login screen. |
| FR-AUTH-06 | The system shall provide a "Forgot Password" entry point on the Login screen. *(Currently a non-functional placeholder — no reset flow implemented; flagged for follow-up.)* |
| FR-AUTH-07 | If an API call returns an "account not activated" or "unauthorized" error, the system shall mark the local session as deactivated and broadcast this state so the app can react (e.g., forced logout), without requiring a page reload. |
| FR-AUTH-08 | The system shall automatically log out a user after a period of inactivity (default 24 hours, or a user-configurable number of minutes), redirecting to the Login screen. |
| FR-AUTH-09 | The system shall provide a Logout action (in the header) that clears the session and returns the user to the Login screen. |

### 3.2 Dashboard (Home)

| ID | Requirement |
|---|---|
| FR-DASH-01 | Upon login, the system shall display a Dashboard with quick-action shortcuts: "Create Group" and "Personal Transaction". |
| FR-DASH-02 | The Dashboard shall display a horizontally scrollable list of the user's Groups. |
| FR-DASH-03 | The Dashboard shall display a horizontally scrollable list of recently active Friends. |
| FR-DASH-04 | On load of the authenticated app shell, the system shall fetch and apply the platform's current display currency setting. |

### 3.3 Groups Module

| ID | Requirement |
|---|---|
| FR-GRP-01 | The system shall allow a user to view a list of all Groups they are a member of. |
| FR-GRP-02 | The system shall allow a user to create a new Group by specifying a name, a color tag, and selecting one or more members from the platform's user directory. |
| FR-GRP-03 | Upon successful Group creation, the system shall navigate the user directly to the Edit Group screen for that group (to finalize members/name). |
| FR-GRP-04 | The system shall allow a user to edit an existing Group's name and color. |
| FR-GRP-05 | The system shall allow a user to remove a member from a Group, or leave a Group themselves. |
| FR-GRP-06 | The system shall display a Group Transaction screen with two views: a **Chat** view (chronological feed of expense/payment messages plus pending money requests with Accept/Decline actions) and an **Expenses** view (pairwise balance summary showing "You Owe" and "Owed to You" per member, with a settle action). |
| FR-GRP-07 | The system shall allow a group member to add a new shared expense specifying: title/description, amount, category, split type, and (for Custom/Percent/Shares) per-member values. |
| FR-GRP-08 | The system shall support four split types when adding a group expense: **Equal** (amount ÷ active members), **Percentage** (per-member % of total, must sum to 100%), **Shares** (per-member weight, proportion of total), and **Custom** (per-member fixed amount, must sum to total). |
| FR-GRP-09 | The system shall allow the expense creator to exclude specific members from a given split, zeroing their share for that expense. |
| FR-GRP-10 | The system shall validate that Percentage splits sum to 100% (± 0.01) and Custom splits sum to the total amount (± 0.01) before allowing submission. |
| FR-GRP-11 | The system shall allow a user to view the detail of a single group expense: who paid, the split type used, each member's share and settled/unsettled status, and a progress indicator of amount collected vs. pending. |
| FR-GRP-12 | The system shall allow the payer (or authorized user) to mark an individual member's share of an expense as settled ("Mark as Paid"). |
| FR-GRP-13 | The system shall allow a user to settle an entire pairwise balance with another group member in one action, rather than settling expense-by-expense. |
| FR-GRP-14 | When a group expense is submitted, the system shall record it using the currently active app-wide display currency (not a fixed/hardcoded currency). *(Fixed 2026-07-02 — previously hardcoded to "AED".)* |

### 3.4 Friends / One-to-One Module

| ID | Requirement |
|---|---|
| FR-FRND-01 | The system shall allow a user to search the full platform user directory to find and start a 1:1 activity with any other user ("Friend"). |
| FR-FRND-02 | The system shall display a list of friends with whom the user has recent 1:1 financial activity. |
| FR-FRND-03 | The system shall display a chat-style ledger of all expenses, payments, and requests between the current user and a selected friend. |
| FR-FRND-04 | The system shall allow a user to request a specific amount of money from a friend, providing an amount and a reason/description. |
| FR-FRND-05 | The system shall allow the recipient of a money request to **Accept** or **Decline** it. |
| FR-FRND-06 | The system shall allow the sender of a pending payment to mark it as **Complete** (self-declared settlement) once real-world payment has been made. |
| FR-FRND-07 | 1:1 transactions shall follow a status lifecycle: pending → completed, or pending → declined. |
| FR-FRND-08 | When a money request is submitted to a friend, the system shall record it using the currently active app-wide display currency (not a fixed/hardcoded currency). *(Fixed 2026-07-02 — previously hardcoded to "AED".)* |

### 3.5 Reporting Module

| ID | Requirement |
|---|---|
| FR-RPT-01 | The system shall provide a unified Audit/Activity report combining all group and friend financial activity for the current user. |
| FR-RPT-02 | The Audit report shall support filtering by activity type: All, Sent, Received, Expenses. |
| FR-RPT-03 | The Audit report shall group activity by date and display running totals for "Total Paid" and "Total Requested". |
| FR-RPT-04 | Each audit entry shall indicate its source (Group or Personal), the counterparty name/color, and (for group entries) the group name. |

### 3.6 Settings Module

| ID | Requirement |
|---|---|
| FR-SET-01 | The system shall allow a user to edit their profile: display name and avatar color (from presets or a custom hex value). |
| FR-SET-02 | The system shall allow a user to change their account password. |
| FR-SET-03 | The system shall allow a user to configure notification channel preferences (push/email/SMS). *(UI only in current build — no delivery backend wired yet.)* |
| FR-SET-04 | The system shall allow a user to select a display language. *(UI only in current build.)* |
| FR-SET-05 | The system shall show a shortcut to Currency Settings, visible only to users with the Administrator role. |
| FR-SET-06 | The system shall allow an Administrator to set the platform's display currency, choosing from: AED (default), INR, USD, EUR, GBP, with a live preview of the formatted amount. *(Defect fixed 2026-07-02 — a missing `DEFAULT_CURRENCY` import previously caused a runtime `ReferenceError` in this screen.)* |

### 3.7 Admin Module

| ID | Requirement |
|---|---|
| FR-ADM-01 | The system shall restrict access to an Admin Dashboard to users with `is_admin = true`; the navigation entry shall only be shown to such users. |
| FR-ADM-02 | The Admin Dashboard shall display platform-wide totals: total users, total groups, total transactions, and total transaction amount. |
| FR-ADM-03 | The Admin Dashboard shall display a list of recently registered users with a visual badge distinguishing Admin vs. regular User accounts. |

### 3.8 Cross-Cutting / Non-Functional Requirements

| ID | Requirement |
|---|---|
| FR-NFR-01 | All amount input fields shall restrict entry to numeric values with at most 2 decimal places. |
| FR-NFR-02 | Money request amounts shall be capped at 100,000 (in the active currency unit). |
| FR-NFR-03 | The application shall be responsive and optimized for mobile viewports, with a bottom navigation bar on mobile and a sidebar on desktop; the bottom/side nav shall be hidden on detail/chat-style screens to maximize content space. |
| FR-NFR-04 | The application shall be packaged as a native Android app via Capacitor, in addition to running as a standard responsive web app. |
| FR-NFR-05 | All authenticated API requests shall include a Bearer token in the `Authorization` header, except for `auth/*` endpoints. |
| FR-NFR-06 | The system shall display context-appropriate headers: a back button and screen title on detail/chat screens, and the app logo with a Logout action on primary list screens. |

## 4. Data Entities (Functional View)

| Entity | Key Attributes |
|---|---|
| **User** | id, name, email, password (hashed, server-side), color_code (avatar), is_admin |
| **Group** | id, name, color_code, member_count, members[] |
| **Group Message** (Expense or Payment) | id, type, from_user, description, amount, created_at, has_splits, members[] with per-member share/settled/is_payer |
| **Group Balance** | per counterpart: pending, total_settled, total_owed (I Owe / Owed to Me) |
| **Group Money Request** | id, from_user, description, currency, amount |
| **Transaction (1:1)** | id, from_user, to_user, type (expense/payment/request), status (pending/completed/declined), description, amount, currency, created_at |
| **Currency Setting** | name, symbol (platform-wide, admin-configurable) |
| **Admin Overview** | total_users, total_groups, total_transactions, total_amount, recent_users[] |

## 5. Business Rules Summary

1. A user cannot be added to a group twice; group membership is a set of distinct users.
2. Equal split: `share = total_amount / count(active_members)`.
3. Percentage split: `share = total_amount * (member_percent / 100)`; all percentages must sum to 100%.
4. Shares split: `share = total_amount * (member_shares / sum_of_all_active_shares)`.
5. Custom split: user-entered per-member amounts must sum exactly to `total_amount` (± 0.01 tolerance).
6. A member excluded from a split has their share forced to zero and is not included in the submitted split payload.
7. Only members with a computed share greater than zero (and who are not the payer) are submitted as recipients of a split.
8. A money request must be explicitly Accepted or Declined by its recipient; it cannot be auto-settled.
9. Settlement is always a manual, user-initiated acknowledgment — the system never automates fund transfer.
10. Session expires after a configurable idle period; all in-memory session data is cleared on logout or idle-timeout.

## 6. Out of Scope / Explicitly Excluded (this release)

- Real payment processing / gateway integration.
- Automated push, email, or SMS notification delivery.
- Password-reset ("Forgot Password") flow.
- The "Repayment Requests" feature (currently unimplemented stub, not linked in navigation).
- The "Payment Summary" screen backed by live data (currently uses mock/local data only).
- iOS packaging.
- The "Building CRUD" module present in the codebase (unrelated scaffolding, not part of product scope).

## 7. Traceability to Business Requirements

| BRD Requirement | Related FRD Requirements |
|---|---|
| BR-01, BR-02 | FR-AUTH-01 – FR-AUTH-09 |
| BR-03 | FR-GRP-01 – FR-GRP-05 |
| BR-04 | FR-GRP-07 – FR-GRP-10 |
| BR-05 | FR-GRP-06, FR-GRP-11, FR-GRP-13, FR-GRP-14, FR-FRND-03 |
| BR-06 | FR-FRND-04, FR-FRND-05, FR-FRND-08, FR-GRP-06 (group requests) |
| BR-07 | FR-GRP-12, FR-GRP-13, FR-FRND-06 |
| BR-08 | FR-RPT-01 – FR-RPT-04 |
| BR-09 | FR-SET-01 – FR-SET-04 |
| BR-10 | FR-ADM-01 – FR-ADM-03 |
| BR-11 | FR-SET-05, FR-SET-06 |
| BR-12 | FR-AUTH-08 |
| BR-13 | FR-NFR-04 |

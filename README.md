# STACK — Enterprise PG & Hostel Management SaaS

> **A Next-Generation, Multi-Property SaaS Platform for PG Owners, Hostel Operators, Facility Managers, and Residents.**

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, and a decoupled service architecture (`UI -> Service -> Repository -> Database`) supporting Supabase PostgreSQL or a drop-in migration to Node.js/Express + MySQL.

---

## 🌟 Key Features

### 1. Multi-Property & Space Management
- **Hierarchical Fleet:** Organization $\to$ Properties $\to$ Buildings $\to$ Floors $\to$ Rooms $\to$ Beds.
- **Visual Room Map:** Color-coded occupancy matrix (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`) with instant filter by floor and bed sharing tier.
- **Room Types:** Single, Double, Triple, Four Sharing, Five Sharing, Dormitory, and Custom.

### 2. Full Tenant Lifecycle
- **Tenant Directory & Onboarding:** Searchable by name, phone, room, or bed with active/notice/pending status badges.
- **Atomic Digital Check-In:** 3-step wizard allocating available beds, setting rent, capturing security deposits, and logging activity.
- **Digital KYC Locker:** Aadhaar, PAN, Passport, police verification, and 11-month lease agreement storage.
- **Settlement & Checkout:** Automated deduction of pending rent, damage charges, utility dues, and deposit refund processing.

### 3. Automated Rent Engine & Payments
- **Monthly Invoicing:** One-click monthly rent schedule generator across all active tenants.
- **Multi-Method Collections:** UPI, Cash, Bank Transfer, Debit/Credit Card, and Cheques.
- **GST-Compliant Payment Vouchers:** Printable receipt modal with instant download and printer styling.
- **Immutable Payment Audit Trail:** Void and refund operations tracked with old/new state diffs and performer audit logs.

### 4. Operations & Facilities Management
- **Real-Time Helpdesk & Grievances:** Categories for Electricity, Plumbing, Wi-Fi, Food, Housekeeping, and Security with SLA priorities.
- **Operational Expense Tracker:** Filter by 10 expense categories with vendor invoice logging.
- **Visitor Log:** Check-in/check-out tracking with host tenant linkage and purpose records.
- **Staff Attendance & Roles:** Manager, Security, Cleaner, Cook, and Maintenance staff roster.
- **Noticeboard:** Digital broadcasting across properties, buildings, or floors.

### 5. Financial Reporting & BI Analytics
- **Executive KPI Dashboard:** Real-time metrics for Bed Occupancy, Monthly Revenue, Pending Dues, and Net Income.
- **Revenue & Collections:** Historical monthly collection vs target tracking.
- **Space & Bed Occupancy:** Bed distribution by room category and occupancy rates.
- **Rent Aging Analysis:** 0-7 days, 8-15 days, 16-30 days, and 30+ days overdue aging breakdown.
- **Profit & Loss Statement:** Net margin calculation with downloadable CSV exports.

### 6. Tenant Self-Service Portal (`/portal`)
- **Resident Dashboard:** Current room number, bed allocation, floor amenities, and gate curfew rules.
- **Roommate Directory:** View fellow room residents with quick contact actions.
- **Online Rent Invoicing:** Self-service payment simulation and printable tax receipts.
- **Digital KYC Locker & Helpdesk:** Direct ticket lodging and real-time status tracking.

### 7. SaaS Subscriptions & Super Admin Console (`/superadmin`)
- **Centralized Plans:** Starter (50 Beds), Growth (300 Beds), Pro (Unlimited), and Enterprise.
- **Usage Limit Enforcer:** Prevents over-allocation of properties, rooms, beds, tenants, or staff.
- **Fleet Oversight:** Multi-organization dashboard with instant tier override, infrastructure telemetry, and client support desk.

---

## 🏗️ Architecture & Decoupled Service Layer

STACK is architected to guarantee that the UI never directly couples to database implementations or vendor-specific SDKs:

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 16 UI Layer                  │
│       (App Router, Server/Client Components, Forms)    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Service Layer                      │
│   (IPropertyService, ITenantService, IRentService...)  │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌───────────────────────────┐┌───────────────────────────┐
│     Mock Relational DB    ││    Supabase PostgreSQL    │
│  (Client-side Demo / Dev) ││   (RLS, Triggers, Storage)│
└───────────────────────────┘└───────────────────────────┘
              │                            │
              └─────────────┬──────────────┘
                            │ (Future Drop-in Migration)
                            ▼
┌────────────────────────────────────────────────────────┐
│            Node.js + Express API Backend               │
│               MySQL on Hostinger cPanel                │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/hariharan-developer-31/PG-main.git
cd PG-main
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 👥 Demo Role Switcher

You can test any role instantly using the demo switcher in the top navigation bar or the landing page:
- **⚡ Super Admin:** Fleet KPIs, organization plan management, and client support desk.
- **👑 Owner:** Full access to all branches, financial analytics, staff management, and settings.
- **👔 Manager:** Daily check-ins, bed assignments, payment recording, and complaints.
- **🛠️ Staff:** Operational views for complaints and room maintenance.
- **🏠 Tenant:** Self-service portal at `/portal` for rent payment and grievance tracking.

---

## 📜 Database Schema & Migrations

PostgreSQL / Supabase migration files are located in `supabase/migrations/`:
- `00001_initial_schema.sql`: 24 core normalized tables, indexes, check constraints, and initial RLS policies.
- `00002_operations_saas_hardening.sql`: Granular RBAC tables, maintenance tickets, checkout settlements, support desk, and storage security policies.
- `seed.sql`: Realistic seed data with 3 PG properties (Urban Nest, Green View, Blue Haven), 100+ beds, active tenants, and financial records.

For full production deployment instructions and Hostinger/MySQL migration procedures, see [DEPLOYMENT.md](file:///d:/WEBSITES/PGM/DEPLOYMENT.md).

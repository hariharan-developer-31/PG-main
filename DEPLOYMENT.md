# StaySync — Production Deployment & Migration Guide

This document outlines the complete deployment procedure for **StaySync PG Management SaaS**, covering:
1. **Cloud Deployment (Vercel + Supabase)**
2. **Database Hardening & Storage Security**
3. **Architecture Migration: Supabase $\to$ Node.js/Express + MySQL on Hostinger**

---

## 1. Cloud Deployment (Vercel + Supabase)

### Step 1: Provision Supabase PostgreSQL Database
1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Run the migrations in chronological order:
   - `supabase/migrations/00001_initial_schema.sql` (Core relational tables, constraints, indexes, initial RLS)
   - `supabase/migrations/00002_operations_saas_hardening.sql` (RBAC, storage buckets, checkout settlements, support desk, tenant portal RLS)
   - *(Optional Demo Data)* `supabase/seed.sql` (Populates Urban Nest PG, Green View PG, and Blue Haven PG)

### Step 2: Configure Storage Buckets
Ensure the following buckets are present in Supabase Storage:
- `tenant-documents` (Private, Signed URLs required)
- `tenant-photos` (Private)
- `property-images` (Public CDN)
- `expense-receipts` (Private)
- `complaint-attachments` (Private)
- `avatars` (Public CDN)

### Step 3: Deploy Frontend to Vercel
1. Push repository to GitHub/GitLab.
2. In Vercel, import the repository:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
3. Add Production Environment Variables in Vercel Project Settings:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key-server-only>
   NEXT_PUBLIC_APP_NAME="StaySync SaaS"
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```
4. Click **Deploy**. Vercel will build and distribute all 23 static and dynamic routes globally across edge locations.

---

## 2. Security & RLS Compliance

StaySync enforces multi-tenant isolation via **Row Level Security (RLS)** in PostgreSQL:

- **Organization Tenant Isolation:**
  ```sql
  CREATE OR REPLACE FUNCTION current_user_org_id()
  RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
  $$ LANGUAGE sql STABLE SECURITY DEFINER;
  ```
  Every table with an `organization_id` column restricts read and write operations exclusively to authenticated members of that organization.

- **Tenant Self-Service Portal Isolation:**
  Residents authenticate with the `TENANT` role and are granted select access strictly to their own assigned bed, room, rent invoices, and grievance complaints.

- **Storage Security:**
  Private storage objects (Aadhaar cards, tenancy agreements, expense receipts) can never be accessed via static public URLs. The service layer requests time-limited signed URLs (`supabase.storage.from(...).createSignedUrl(path, 3600)`) before presenting previews in the UI.

---

## 3. Architecture Migration: Supabase $\to$ Hostinger (Node.js + Express + MySQL)

A core requirement of StaySync is that **the frontend never directly depends on Supabase client calls or internal data formats**. All data fetching flows through the decoupled interface layer:

$$\text{UI Layer} \longrightarrow \text{Service Layer} \longrightarrow \text{API / Database Layer}$$

### Step 1: Backend Architecture (Node.js + Express on Hostinger)

Deploy an Express REST API server to your Hostinger VPS or Cloud Hosting:

```
[ Next.js Frontend ] 
       │ HTTP / JSON
       ▼
[ Node.js + Express REST API ]
  ├── /api/auth/*        (JWT cookie-based authentication)
  ├── /api/properties/*  (Multi-property management)
  ├── /api/rooms/*       (Floors, rooms, bed matrix)
  ├── /api/tenants/*     (Check-in wizard, KYC, checkout)
  ├── /api/rent/*        (Monthly schedules, automated billing)
  ├── /api/payments/*    (Receipts, audit trail)
  ├── /api/operations/*  (Expenses, complaints, staff, visitors)
  └── /api/reports/*     (Financial aggregation & CSV export)
       │ mysql2 / Prisma / Drizzle
       ▼
[ MySQL 8.0 on Hostinger ]
```

### Step 2: REST API Contract Specification

The Node.js backend must implement the exact method signatures defined in [`src/services/interfaces/index.ts`](file:///d:/WEBSITES/PGM/src/services/interfaces/index.ts):

| HTTP Method | Route | Service Equivalent |
|---|---|---|
| `GET` | `/api/properties` | `IPropertyService.getAll()` |
| `POST` | `/api/properties` | `IPropertyService.create(data)` |
| `GET` | `/api/rooms?propertyId=:id` | `IRoomService.getByProperty(propertyId)` |
| `POST` | `/api/rooms` | `IRoomService.createRoom(data)` |
| `PUT` | `/api/rooms/beds/:id/status`| `IRoomService.updateBedStatus(id, status)` |
| `GET` | `/api/tenants` | `ITenantService.getAll(propertyId)` |
| `POST` | `/api/tenants/check-in` | `ITenantService.checkIn(dto)` |
| `POST` | `/api/tenants/:id/checkout` | `ITenantService.checkOut(tenantId, settlement)` |
| `GET` | `/api/rent/records` | `IRentService.getRecords(propertyId, month)` |
| `POST` | `/api/rent/generate` | `IRentService.generateMonthlyRent(propertyId, month)` |
| `POST` | `/api/payments` | `IPaymentService.recordPayment(dto)` |
| `POST` | `/api/payments/:id/void` | `IPaymentService.voidPayment(id, reason)` |
| `GET` | `/api/reports/executive` | `IReportService.getExecutiveKPIs(propertyId)` |
| `GET` | `/api/reports/pnl` | `IReportService.getPnLReport(propertyId, year)` |

### Step 3: MySQL 8.0 Schema Conversion

In MySQL, convert PostgreSQL types as follows:
- `UUID` $\longrightarrow$ `VARCHAR(36)` or `BINARY(16)` with `UUID()` default.
- `TIMESTAMPTZ` $\longrightarrow$ `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.
- `JSONB` $\longrightarrow$ `JSON`.
- `TEXT[]` (amenities array) $\longrightarrow$ `JSON` array or a normalized join table `room_amenities`.
- `NUMERIC(10, 2)` $\longrightarrow$ `DECIMAL(10, 2)`.

Example MySQL Table Definition:
```sql
CREATE TABLE properties (
  id VARCHAR(36) PRIMARY KEY,
  organization_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_prop_org (organization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### Step 4: Drop-in Frontend Client (`HttpService`)

To switch the Next.js frontend from Supabase/Mock to the Hostinger Node.js backend:
1. Create `src/services/http/HttpPropertyService.ts`:
   ```typescript
   import { IPropertyService } from "@/services/interfaces";
   import { Property } from "@/types";

   export class HttpPropertyService implements IPropertyService {
     async getAll(orgId?: string): Promise<Property[]> {
       const res = await fetch(`/api/properties${orgId ? `?orgId=${orgId}` : ""}`);
       if (!res.ok) throw new Error("Failed to fetch properties");
       return res.json();
     }
     async getById(id: string): Promise<Property | null> {
       const res = await fetch(`/api/properties/${id}`);
       return res.ok ? res.json() : null;
     }
     async create(data: Partial<Property>): Promise<Property> {
       const res = await fetch("/api/properties", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(data),
       });
       return res.json();
     }
     // ...remaining methods
   }
   ```
2. Update `src/services/index.ts` to instantiate `HttpPropertyService` instead of `MockPropertyService`.
3. **Zero changes are required in any page or UI component.**

---

## 4. Performance & Disaster Recovery

- **Database Backup Cron (Hostinger MySQL / PostgreSQL):**
  Schedule daily automated dumps:
  ```bash
  mysqldump -u staysync_user -p staysync_prod | gzip > /backups/staysync_$(date +\%F).sql.gz
  ```
- **Prerendering & Caching:**
  All 23 dashboard and management routes leverage Next.js static generation with on-demand revalidation.
- **Client-Side Optimization:**
  Icons imported from `lucide-react` are tree-shaken, and Recharts charts render client-side with clean responsive containers.

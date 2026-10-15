-- ==============================================================================
-- STACK PG MANAGEMENT SAAS: MIGRATION 00002 (OPERATIONS, RBAC & STORAGE HARDENING)
-- ==============================================================================

-- 1. RBAC PERMISSIONS SCHEMA
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(100) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(50) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(100) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Seed Standard Roles
INSERT INTO roles (id, name, description) VALUES
('SUPER_ADMIN', 'Super Admin', 'Platform operator with global fleet access'),
('OWNER', 'PG Owner', 'Organization owner with full administrative privileges'),
('ADMIN', 'Property Administrator', 'Senior operational administrator across all branches'),
('MANAGER', 'Property Manager', 'Manager for day-to-day hostel check-ins, rent, and complaints'),
('STAFF', 'Operations Staff', 'Housekeeping, security, and maintenance technician access'),
('TENANT', 'Hostel Resident', 'Resident self-service portal access')
ON CONFLICT (id) DO NOTHING;

-- Seed Granular Permissions
INSERT INTO permissions (id, category, description) VALUES
('properties.view', 'Properties', 'View property listings and details'),
('properties.create', 'Properties', 'Create new PG properties'),
('properties.update', 'Properties', 'Edit existing property configurations'),
('properties.delete', 'Properties', 'Delete or archive properties'),
('rooms.view', 'Rooms', 'View floors, rooms, and bed statuses'),
('rooms.create', 'Rooms', 'Add rooms and configure bed sharing tiers'),
('rooms.update', 'Rooms', 'Update room status, amenities, and rent'),
('rooms.delete', 'Rooms', 'Delete rooms and beds'),
('tenants.view', 'Tenants', 'View tenant directory and profiles'),
('tenants.create', 'Tenants', 'Execute check-in and onboard new tenants'),
('tenants.update', 'Tenants', 'Edit tenant contact and KYC info'),
('tenants.delete', 'Tenants', 'Process tenant checkout and refund deposit'),
('payments.view', 'Finance', 'View rent billing and payment collections'),
('payments.create', 'Finance', 'Record manual payments and generate receipts'),
('payments.update', 'Finance', 'Void, refund, or adjust payment transactions'),
('expenses.view', 'Finance', 'View operational expenditure records'),
('expenses.create', 'Finance', 'Log bills, invoices, and utility expenses'),
('complaints.view', 'Operations', 'View maintenance and tenant grievance tickets'),
('complaints.create', 'Operations', 'Lodge new complaint ticket'),
('complaints.update', 'Operations', 'Assign, update status, and resolve complaints'),
('reports.view', 'Analytics', 'Access occupancy, revenue, and P&L financial reports'),
('users.manage', 'Administration', 'Invite, modify, and remove staff members'),
('settings.manage', 'Administration', 'Manage organization billing and property rules')
ON CONFLICT (id) DO NOTHING;

-- Grant Full Permissions to OWNER
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'OWNER', id FROM permissions
ON CONFLICT DO NOTHING;

-- Grant Manager Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'MANAGER', id FROM permissions
WHERE id IN (
  'properties.view',
  'rooms.view', 'rooms.update',
  'tenants.view', 'tenants.create', 'tenants.update', 'tenants.delete',
  'payments.view', 'payments.create',
  'expenses.view', 'expenses.create',
  'complaints.view', 'complaints.create', 'complaints.update',
  'reports.view'
)
ON CONFLICT DO NOTHING;

-- Grant Staff Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'STAFF', id FROM permissions
WHERE id IN ('rooms.view', 'complaints.view', 'complaints.update')
ON CONFLICT DO NOTHING;

-- Grant Tenant Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'TENANT', id FROM permissions
WHERE id IN ('complaints.view', 'complaints.create')
ON CONFLICT DO NOTHING;

-- 2. ORGANIZATION MEMBERS (MULTI-USER TENANCY)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id VARCHAR(50) NOT NULL REFERENCES roles(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- 3. COMPLAINT COMMENTS & ACTIVITY THREADS
CREATE TABLE IF NOT EXISTS complaint_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(50) NOT NULL,
  comment TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaint_comments_ticket ON complaint_comments(complaint_id);

-- 4. MAINTENANCE TICKETS (ASSETS & PREVENTIVE INFRASTRUCTURE)
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  estimated_cost NUMERIC(10, 2) DEFAULT 0,
  actual_cost NUMERIC(10, 2) DEFAULT 0,
  completion_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maint_tickets_org ON maintenance_tickets(organization_id);
CREATE INDEX IF NOT EXISTS idx_maint_tickets_property ON maintenance_tickets(property_id);

-- 5. TENANT CHECKOUT & SETTLEMENT AUDIT
CREATE TABLE IF NOT EXISTS tenant_checkout_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bed_id UUID NOT NULL REFERENCES beds(id),
  checkout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  held_deposit NUMERIC(10, 2) NOT NULL,
  pending_rent_deducted NUMERIC(10, 2) NOT NULL DEFAULT 0,
  damage_charges NUMERIC(10, 2) NOT NULL DEFAULT 0,
  utility_dues NUMERIC(10, 2) NOT NULL DEFAULT 0,
  refund_payable NUMERIC(10, 2) NOT NULL,
  refund_status VARCHAR(50) NOT NULL DEFAULT 'PROCESSED',
  settled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SAAS CLIENT SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  last_message TEXT NOT NULL,
  admin_reply TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_org ON support_tickets(organization_id);

-- 7. SUPABASE STORAGE BUCKETS CONFIGURATION
-- (Executed via Supabase Storage API or SQL in self-hosted installations)
INSERT INTO storage.buckets (id, name, public) VALUES 
('tenant-documents', 'tenant-documents', false),
('tenant-photos', 'tenant-photos', false),
('property-images', 'property-images', true),
('expense-receipts', 'expense-receipts', false),
('complaint-attachments', 'complaint-attachments', false),
('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Security Policies
-- Private buckets require organization ownership or signed URLs:
CREATE POLICY "Tenant Documents Private Access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'tenant-documents' 
  AND auth.uid() IN (SELECT id FROM profiles)
);

CREATE POLICY "Expense Receipts Org Protected"
ON storage.objects FOR ALL
USING (
  bucket_id = 'expense-receipts'
  AND auth.uid() IN (SELECT id FROM profiles WHERE role IN ('OWNER', 'ADMIN', 'MANAGER'))
);

-- 8. TENANT SELF-SERVICE ROW LEVEL SECURITY (PORTAL ISOLATION)
CREATE POLICY "Tenants can view only their own record"
ON tenants FOR SELECT
USING (
  id = auth.uid() 
  OR user_id = auth.uid() 
  OR organization_id = current_user_org_id()
);

CREATE POLICY "Tenants can view only their assigned room"
ON rooms FOR SELECT
USING (
  id IN (SELECT room_id FROM tenant_assignments WHERE tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()))
  OR organization_id = current_user_org_id()
);

CREATE POLICY "Tenants can view only their rent invoices"
ON rent_records FOR SELECT
USING (
  tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  OR organization_id = current_user_org_id()
);

CREATE POLICY "Tenants can view only their payments"
ON payments FOR SELECT
USING (
  tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  OR organization_id = current_user_org_id()
);

CREATE POLICY "Tenants can create and view their complaints"
ON complaints FOR ALL
USING (
  tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  OR organization_id = current_user_org_id()
);

CREATE POLICY "Tenants can view announcements"
ON announcements FOR SELECT
USING (
  organization_id = current_user_org_id() 
  OR organization_id IN (SELECT organization_id FROM tenants WHERE user_id = auth.uid())
);

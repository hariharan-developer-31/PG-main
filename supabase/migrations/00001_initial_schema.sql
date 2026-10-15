-- ==============================================================================
-- STACK PG MANAGEMENT SAAS: PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_properties INT NOT NULL DEFAULT 1,
  max_beds INT NOT NULL DEFAULT 50,
  max_tenants INT NOT NULL DEFAULT 50,
  max_staff INT NOT NULL DEFAULT 2,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ORGANIZATIONS (SAAS TENANTS)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
  rent_due_day INT NOT NULL DEFAULT 5 CHECK (rent_due_day BETWEEN 1 AND 28),
  late_fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
  receipt_prefix VARCHAR(10) NOT NULL DEFAULT 'REC',
  subscription_plan_id VARCHAR(50) REFERENCES subscription_plans(id) DEFAULT 'STARTER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. USER PROFILES & ROLES
CREATE TYPE user_role_enum AS ENUM (
  'SUPER_ADMIN',
  'OWNER',
  'ADMIN',
  'MANAGER',
  'STAFF',
  'TENANT'
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY, -- matches auth.users.id
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  role user_role_enum NOT NULL DEFAULT 'MANAGER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. PROPERTIES
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  image_url TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_property_org_code UNIQUE (organization_id, code)
);

CREATE INDEX idx_properties_org ON properties(organization_id);

CREATE TRIGGER set_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. BUILDINGS
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  address TEXT,
  total_floors INT NOT NULL DEFAULT 1 CHECK (total_floors >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_building_code UNIQUE (property_id, code)
);

CREATE INDEX idx_buildings_property ON buildings(property_id);

CREATE TRIGGER set_buildings_updated_at
BEFORE UPDATE ON buildings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. FLOORS
CREATE TABLE IF NOT EXISTS floors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  floor_number INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_floor_building_number UNIQUE (building_id, floor_number)
);

CREATE INDEX idx_floors_building ON floors(building_id);

-- 9. ROOMS
CREATE TYPE room_type_enum AS ENUM (
  'SINGLE',
  'DOUBLE',
  'TRIPLE',
  'FOUR_SHARING',
  'FIVE_SHARING',
  'DORMITORY',
  'CUSTOM'
);

CREATE TYPE room_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type room_type_enum NOT NULL DEFAULT 'DOUBLE',
  capacity INT NOT NULL DEFAULT 2 CHECK (capacity >= 1),
  monthly_rent NUMERIC(10, 2) NOT NULL CHECK (monthly_rent >= 0),
  security_deposit NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (security_deposit >= 0),
  amenities TEXT[] DEFAULT '{}',
  status room_status_enum NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_room_number UNIQUE (floor_id, room_number)
);

CREATE INDEX idx_rooms_property ON rooms(property_id);
CREATE INDEX idx_rooms_floor ON rooms(floor_id);

-- 10. BEDS
CREATE TYPE bed_status_enum AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE');

CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_number VARCHAR(50) NOT NULL,
  status bed_status_enum NOT NULL DEFAULT 'AVAILABLE',
  monthly_rent NUMERIC(10, 2) NOT NULL CHECK (monthly_rent >= 0),
  current_tenant_id UUID,
  joining_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_bed_room_number UNIQUE (room_id, bed_number)
);

CREATE INDEX idx_beds_room ON beds(room_id);
CREATE INDEX idx_beds_property ON beds(property_id);
CREATE INDEX idx_beds_status ON beds(status);

-- 11. TENANTS
CREATE TYPE tenant_status_enum AS ENUM ('ACTIVE', 'PENDING_CHECKIN', 'INACTIVE', 'NOTICE_PERIOD');
CREATE TYPE id_proof_enum AS ENUM ('AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE');

CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  id_proof_type id_proof_enum NOT NULL DEFAULT 'AADHAAR',
  id_proof_number VARCHAR(100) NOT NULL,
  permanent_address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  emergency_contact_name VARCHAR(255) NOT NULL,
  emergency_contact_phone VARCHAR(50) NOT NULL,
  emergency_contact_relation VARCHAR(100) NOT NULL,
  company_or_college VARCHAR(255),
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  leaving_date DATE,
  status tenant_status_enum NOT NULL DEFAULT 'ACTIVE',
  assigned_bed_id UUID REFERENCES beds(id) ON DELETE SET NULL,
  monthly_rent NUMERIC(10, 2) NOT NULL CHECK (monthly_rent >= 0),
  security_deposit NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (security_deposit >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenants_property ON tenants(property_id);
CREATE INDEX idx_tenants_org ON tenants(organization_id);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_phone ON tenants(phone);

-- 12. TENANT ASSIGNMENTS (HISTORICAL & ACTIVE)
CREATE TABLE IF NOT EXISTS tenant_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_id UUID NOT NULL REFERENCES beds(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  agreed_rent NUMERIC(10, 2) NOT NULL,
  deposit_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. TENANT DOCUMENTS
CREATE TABLE IF NOT EXISTS tenant_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. RENT RECORDS
CREATE TYPE rent_status_enum AS ENUM ('PAID', 'PARTIAL', 'PENDING', 'OVERDUE', 'WAIVED');

CREATE TABLE IF NOT EXISTS rent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- e.g. '2026-10'
  base_rent NUMERIC(10, 2) NOT NULL CHECK (base_rent >= 0),
  additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  late_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  pending_amount NUMERIC(10, 2) NOT NULL CHECK (pending_amount >= 0),
  due_date DATE NOT NULL,
  status rent_status_enum NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_rent_tenant_month UNIQUE (tenant_id, month)
);

CREATE INDEX idx_rent_records_property ON rent_records(property_id);
CREATE INDEX idx_rent_records_status ON rent_records(status);
CREATE INDEX idx_rent_records_due_date ON rent_records(due_date);

-- 15. PAYMENTS
CREATE TYPE payment_method_enum AS ENUM ('UPI', 'CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE');
CREATE TYPE payment_status_enum AS ENUM ('COMPLETED', 'VOIDED', 'REFUNDED', 'REVERSED');

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rent_record_id UUID REFERENCES rent_records(id) ON DELETE SET NULL,
  receipt_number VARCHAR(100) NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method payment_method_enum NOT NULL DEFAULT 'UPI',
  transaction_id VARCHAR(100),
  notes TEXT,
  status payment_status_enum NOT NULL DEFAULT 'COMPLETED',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_property ON payments(property_id);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- 16. PAYMENT AUDIT / ADJUSTMENTS
CREATE TABLE IF NOT EXISTS payment_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  old_data JSONB NOT NULL,
  new_data JSONB NOT NULL,
  reason TEXT NOT NULL,
  performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. DEPOSITS
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  status VARCHAR(50) NOT NULL DEFAULT 'HELD',
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  refund_date DATE,
  refund_amount NUMERIC(10, 2) DEFAULT 0,
  deductions NUMERIC(10, 2) DEFAULT 0,
  deduction_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. EXPENSES
CREATE TYPE expense_category_enum AS ENUM (
  'ELECTRICITY',
  'WATER',
  'FOOD',
  'MAINTENANCE',
  'STAFF',
  'INTERNET',
  'CLEANING',
  'REPAIRS',
  'SUPPLIES',
  'OTHER'
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  category expense_category_enum NOT NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  vendor VARCHAR(255),
  description TEXT NOT NULL,
  receipt_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_property ON expenses(property_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(date);

-- 19. COMPLAINTS & MAINTENANCE
CREATE TYPE complaint_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'EMERGENCY');
CREATE TYPE complaint_status_enum AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(50) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority complaint_priority_enum NOT NULL DEFAULT 'MEDIUM',
  status complaint_status_enum NOT NULL DEFAULT 'OPEN',
  attachment_url TEXT,
  assigned_staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaints_property ON complaints(property_id);
CREATE INDEX idx_complaints_status ON complaints(status);

-- 20. VISITORS
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  visitor_name VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(50) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  id_number VARCHAR(100),
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'CHECKED_IN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. STAFF
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'MAINTENANCE',
  salary NUMERIC(10, 2) NOT NULL DEFAULT 0,
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  target_audience VARCHAR(50) NOT NULL DEFAULT 'ALL',
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. ACTIVITY AUDIT LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_org ON activity_logs(organization_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Organization isolation policy helper
CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Organization RLS
CREATE POLICY "Users can view their organization"
ON organizations FOR SELECT
USING (id = current_user_org_id());

-- Properties RLS
CREATE POLICY "Org members can view properties"
ON properties FOR SELECT
USING (organization_id = current_user_org_id());

CREATE POLICY "Owners and managers can manage properties"
ON properties FOR ALL
USING (organization_id = current_user_org_id());

-- Tenants RLS
CREATE POLICY "Org members can view tenants"
ON tenants FOR SELECT
USING (organization_id = current_user_org_id());

CREATE POLICY "Staff & Managers can manage tenants"
ON tenants FOR ALL
USING (organization_id = current_user_org_id());

-- Payments RLS
CREATE POLICY "Org members can view payments"
ON payments FOR SELECT
USING (organization_id = current_user_org_id());

CREATE POLICY "Managers can insert payments"
ON payments FOR INSERT
WITH CHECK (organization_id = current_user_org_id());

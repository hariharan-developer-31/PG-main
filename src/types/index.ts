// ==========================================
// CORE ROLES & PERMISSIONS
// ==========================================

export type UserRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "STAFF"
  | "TENANT";

export type Permission =
  | "properties.view"
  | "properties.create"
  | "properties.update"
  | "properties.delete"
  | "rooms.view"
  | "rooms.create"
  | "rooms.update"
  | "rooms.delete"
  | "tenants.view"
  | "tenants.create"
  | "tenants.update"
  | "tenants.delete"
  | "payments.view"
  | "payments.create"
  | "payments.update"
  | "expenses.view"
  | "expenses.create"
  | "complaints.view"
  | "complaints.create"
  | "complaints.resolve"
  | "maintenance.manage"
  | "visitors.manage"
  | "staff.manage"
  | "reports.view"
  | "users.manage"
  | "settings.manage";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "properties.view", "properties.create", "properties.update", "properties.delete",
    "rooms.view", "rooms.create", "rooms.update", "rooms.delete",
    "tenants.view", "tenants.create", "tenants.update", "tenants.delete",
    "payments.view", "payments.create", "payments.update",
    "expenses.view", "expenses.create",
    "complaints.view", "complaints.create", "complaints.resolve",
    "maintenance.manage", "visitors.manage", "staff.manage",
    "reports.view", "users.manage", "settings.manage"
  ],
  OWNER: [
    "properties.view", "properties.create", "properties.update", "properties.delete",
    "rooms.view", "rooms.create", "rooms.update", "rooms.delete",
    "tenants.view", "tenants.create", "tenants.update", "tenants.delete",
    "payments.view", "payments.create", "payments.update",
    "expenses.view", "expenses.create",
    "complaints.view", "complaints.create", "complaints.resolve",
    "maintenance.manage", "visitors.manage", "staff.manage",
    "reports.view", "users.manage", "settings.manage"
  ],
  ADMIN: [
    "properties.view", "properties.update",
    "rooms.view", "rooms.create", "rooms.update",
    "tenants.view", "tenants.create", "tenants.update",
    "payments.view", "payments.create", "payments.update",
    "expenses.view", "expenses.create",
    "complaints.view", "complaints.create", "complaints.resolve",
    "maintenance.manage", "visitors.manage", "staff.manage",
    "reports.view"
  ],
  MANAGER: [
    "properties.view",
    "rooms.view", "rooms.update",
    "tenants.view", "tenants.create", "tenants.update",
    "payments.view", "payments.create",
    "expenses.view", "expenses.create",
    "complaints.view", "complaints.create", "complaints.resolve",
    "maintenance.manage", "visitors.manage",
    "reports.view"
  ],
  STAFF: [
    "rooms.view",
    "complaints.view", "complaints.resolve",
    "maintenance.manage", "visitors.manage"
  ],
  TENANT: [
    "payments.view",
    "complaints.view", "complaints.create"
  ]
};

// ==========================================
// SAAS ORGANIZATION & MULTI-TENANCY
// ==========================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  currency: string;
  timezone: string;
  rent_due_day: number;
  late_fee_amount: number;
  receipt_prefix: string;
  subscription_plan_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: "STARTER" | "GROWTH" | "PRO" | "ENTERPRISE";
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  max_properties: number;
  max_beds: number;
  max_tenants: number;
  max_staff: number;
  features: string[];
}

export interface SuperAdminMetrics {
  totalOrganizations: number;
  activeSubscriptions: number;
  totalProperties: number;
  totalBeds: number;
  totalTenants: number;
  monthlyRecurringRevenue: number;
  systemHealth: {
    status: "HEALTHY" | "DEGRADED" | "DOWN";
    uptimePercentage: number;
    databaseLatencyMs: number;
    activeConnections: number;
    storageUsedGB: number;
  };
}

export interface SaaSSupportTicket {
  id: string;
  organization_id: string;
  organization_name: string;
  user_name: string;
  user_email: string;
  subject: string;
  category: "BILLING" | "TECHNICAL" | "FEATURE_REQUEST" | "ONBOARDING";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  message: string;
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// PROPERTIES, BUILDINGS, FLOORS, ROOMS, BEDS
// ==========================================

export interface Property {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  image_url?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
  manager_id?: string;
  total_buildings?: number;
  total_rooms?: number;
  total_beds?: number;
  occupied_beds?: number;
  available_beds?: number;
  monthly_revenue?: number;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: string;
  property_id: string;
  organization_id: string;
  name: string;
  code: string;
  address?: string;
  total_floors: number;
  created_at: string;
  updated_at: string;
}

export interface Floor {
  id: string;
  building_id: string;
  property_id: string;
  organization_id: string;
  floor_number: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export type RoomType =
  | "SINGLE"
  | "DOUBLE"
  | "TRIPLE"
  | "FOUR_SHARING"
  | "FIVE_SHARING"
  | "DORMITORY"
  | "CUSTOM";

export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";

export interface Room {
  id: string;
  floor_id: string;
  building_id: string;
  property_id: string;
  organization_id: string;
  room_number: string;
  room_type: RoomType;
  capacity: number;
  monthly_rent: number;
  security_deposit: number;
  amenities: string[];
  status: RoomStatus;
  beds?: Bed[];
  created_at: string;
  updated_at: string;
}

export type BedStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";

export interface Bed {
  id: string;
  room_id: string;
  property_id: string;
  organization_id: string;
  bed_number: string;
  status: BedStatus;
  monthly_rent: number;
  current_tenant_id?: string;
  current_tenant_name?: string;
  joining_date?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// TENANTS & ALLOCATIONS
// ==========================================

export type TenantStatus = "ACTIVE" | "PENDING_CHECKIN" | "INACTIVE" | "NOTICE_PERIOD";

export interface Tenant {
  id: string;
  organization_id: string;
  property_id: string;
  user_id?: string;
  name: string;
  photo_url?: string;
  phone: string;
  email: string;
  id_proof_type: "AADHAAR" | "PAN" | "PASSPORT" | "VOTER_ID" | "DRIVING_LICENSE";
  id_proof_number: string;
  permanent_address: string;
  city?: string;
  state?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  company_or_college?: string;
  joining_date: string;
  leaving_date?: string;
  status: TenantStatus;
  assigned_bed_id?: string;
  assigned_bed_number?: string;
  assigned_room_id?: string;
  assigned_room_number?: string;
  assigned_property_name?: string;
  monthly_rent: number;
  security_deposit: number;
  created_at: string;
  updated_at: string;
}

export interface TenantAssignment {
  id: string;
  tenant_id: string;
  bed_id: string;
  room_id: string;
  property_id: string;
  organization_id: string;
  start_date: string;
  end_date?: string;
  agreed_rent: number;
  deposit_amount: number;
  status: "ACTIVE" | "TERMINATED";
  created_at: string;
}

export interface TenantDocument {
  id: string;
  tenant_id: string;
  document_type: "ID_PROOF" | "ADDRESS_PROOF" | "AGREEMENT" | "PHOTO" | "POLICE_VERIFICATION" | "OTHER";
  title: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

// ==========================================
// RENT & PAYMENTS
// ==========================================

export type RentStatus = "PAID" | "PARTIAL" | "PENDING" | "OVERDUE" | "WAIVED";

export interface RentRecord {
  id: string;
  organization_id: string;
  property_id: string;
  tenant_id: string;
  tenant_name?: string;
  room_number?: string;
  month: string; // e.g. "2026-10"
  base_rent: number;
  additional_charges: number;
  discount: number;
  late_fee: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  due_date: string;
  status: RentStatus;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = "UPI" | "CASH" | "BANK_TRANSFER" | "CARD" | "CHEQUE";
export type PaymentStatus = "COMPLETED" | "VOIDED" | "REFUNDED" | "REVERSED";

export interface Payment {
  id: string;
  receipt_number: string;
  organization_id: string;
  property_id: string;
  tenant_id: string;
  tenant_name?: string;
  rent_record_id?: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_id?: string;
  notes?: string;
  status: PaymentStatus;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentAudit {
  id: string;
  payment_id: string;
  action: "VOID" | "REVERSE" | "REFUND" | "ADJUSTMENT";
  old_data: Record<string, unknown>;
  new_data: Record<string, unknown>;
  reason: string;
  performed_by: string;
  created_at: string;
}

export interface DepositRecord {
  id: string;
  organization_id: string;
  property_id: string;
  tenant_id: string;
  amount: number;
  status: "HELD" | "REFUNDED" | "FORFEITED" | "PARTIALLY_REFUNDED";
  received_date: string;
  refund_date?: string;
  refund_amount?: number;
  deductions?: number;
  deduction_notes?: string;
  created_at: string;
}

// ==========================================
// EXPENSES & FINANCIALS
// ==========================================

export type ExpenseCategory =
  | "ELECTRICITY"
  | "WATER"
  | "FOOD"
  | "MAINTENANCE"
  | "STAFF"
  | "INTERNET"
  | "CLEANING"
  | "REPAIRS"
  | "SUPPLIES"
  | "OTHER";

export interface Expense {
  id: string;
  organization_id: string;
  property_id: string;
  property_name?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  vendor?: string;
  description: string;
  receipt_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// COMPLAINTS & MAINTENANCE
// ==========================================

export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
export type ComplaintStatus = "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Complaint {
  id: string;
  ticket_number: string;
  organization_id: string;
  property_id: string;
  property_name?: string;
  room_id?: string;
  room_number?: string;
  tenant_id: string;
  tenant_name: string;
  tenant_phone?: string;
  category: "ELECTRICITY" | "WATER" | "PLUMBING" | "CLEANING" | "FOOD" | "INTERNET" | "FURNITURE" | "SECURITY" | "OTHER";
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  attachment_url?: string;
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTicket {
  id: string;
  ticket_number: string;
  organization_id: string;
  property_id: string;
  room_id?: string;
  issue: string;
  category: string;
  priority: ComplaintPriority;
  assigned_staff_id?: string;
  assigned_staff_name?: string;
  estimated_cost: number;
  actual_cost?: number;
  status: ComplaintStatus;
  completion_date?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// VISITORS, STAFF, ANNOUNCEMENTS
// ==========================================

export interface Visitor {
  id: string;
  organization_id: string;
  property_id: string;
  tenant_id: string;
  tenant_name?: string;
  room_number?: string;
  visitor_name: string;
  visitor_phone: string;
  purpose: string;
  id_number?: string;
  check_in_time: string;
  check_out_time?: string;
  status: "CHECKED_IN" | "CHECKED_OUT";
  created_at: string;
}

export interface StaffMember {
  id: string;
  organization_id: string;
  property_id: string;
  name: string;
  photo_url?: string;
  phone: string;
  email?: string;
  role: "MANAGER" | "SECURITY" | "CLEANER" | "COOK" | "MAINTENANCE" | "RECEPTION" | "OTHER";
  salary: number;
  joining_date: string;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  created_at: string;
}

export interface Announcement {
  id: string;
  organization_id: string;
  property_id?: string;
  title: string;
  description: string;
  target_audience: "ALL" | "PROPERTY" | "FLOOR";
  priority: "NORMAL" | "URGENT";
  start_date: string;
  end_date: string;
  status: "ACTIVE" | "EXPIRED";
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "RENT_DUE" | "RENT_OVERDUE" | "PAYMENT_RECEIVED" | "COMPLAINT_UPDATE" | "MAINTENANCE" | "ANNOUNCEMENT" | "SYSTEM";
  read: boolean;
  link_url?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  organization_id: string;
  property_id?: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  entity: string;
  entity_id: string;
  details?: string;
  created_at: string;
}

// ==========================================
// DASHBOARD & ANALYTICS METRICS
// ==========================================

export interface DashboardMetrics {
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  maintenance_beds: number;
  occupancy_rate: number;
  monthly_revenue: number;
  pending_rent: number;
  expenses: number;
  net_income: number;
  revenue_trend_percentage: number;
  occupancy_trend_percentage: number;
  pending_rent_trend_percentage: number;
  expenses_trend_percentage: number;
  revenue_chart_data: Array<{
    period: string;
    revenue: number;
    expenses: number;
    collection: number;
  }>;
  occupancy_distribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  recent_activity: ActivityLog[];
  recent_payments: Payment[];
  open_complaints: Complaint[];
}

// ==========================================
// PHASE 6: REPORTS & BUSINESS INTELLIGENCE
// ==========================================

export interface OccupancyReport {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  occupancyRate: number;
  propertyBreakdown: Array<{
    propertyId: string;
    propertyName: string;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyRate: number;
  }>;
  roomTypeBreakdown: Array<{
    roomType: string;
    totalBeds: number;
    occupiedBeds: number;
    occupancyRate: number;
  }>;
}

export interface RevenueReport {
  totalBilled: number;
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  monthlyTrend: Array<{
    month: string;
    billed: number;
    collected: number;
    pending: number;
    collectionRate: number;
  }>;
  paymentMethodDistribution: Array<{
    method: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
}

export interface ExpenseReport {
  totalExpenses: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    amount: number;
  }>;
}

export interface ProfitLossStatement {
  month: string;
  grossRentalIncome: number;
  lateFees: number;
  otherIncome: number;
  totalRevenue: number;
  operatingExpenses: Record<string, number>;
  totalExpenses: number;
  netOperatingIncome: number;
  operatingMargin: number;
}

export interface TenantAgingReport {
  totalPending: number;
  currentDues: number;
  days30Dues: number;
  days60Dues: number;
  days90PlusDues: number;
  delinquentTenants: Array<{
    tenantId: string;
    tenantName: string;
    roomNumber: string;
    propertyName: string;
    phone: string;
    pendingAmount: number;
    overdueDays: number;
    status: string;
  }>;
}


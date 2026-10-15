import {
  UserProfile,
  Organization,
  Property,
  Building,
  Floor,
  Room,
  Bed,
  Tenant,
  TenantDocument,
  RentRecord,
  Payment,
  PaymentAudit,
  Expense,
  Complaint,
  MaintenanceTicket,
  Visitor,
  StaffMember,
  Announcement,
  NotificationItem,
  ActivityLog,
  DashboardMetrics,
  OccupancyReport,
  RevenueReport,
  ExpenseReport,
  ProfitLossStatement,
  TenantAgingReport,
  SubscriptionPlan,
  SuperAdminMetrics,
  SaaSSupportTicket,
} from "@/types";

export interface AuthSession {
  user: UserProfile | null;
  token?: string;
}

export interface IAuthService {
  login(email: string, password?: string): Promise<UserProfile>;
  signup(data: {
    email: string;
    fullName: string;
    organizationName: string;
    phone: string;
  }): Promise<{ user: UserProfile; organization: Organization }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<UserProfile | null>;
  resetPassword(email: string): Promise<boolean>;
  switchDemoRole(role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "STAFF" | "TENANT"): Promise<UserProfile>;
}

export interface IOrganizationService {
  getOrganization(id: string): Promise<Organization | null>;
  updateOrganization(id: string, data: Partial<Organization>): Promise<Organization>;
}

export interface IPropertyService {
  getProperties(orgId?: string): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | null>;
  createProperty(data: Omit<Property, "id" | "created_at" | "updated_at">): Promise<Property>;
  updateProperty(id: string, data: Partial<Property>): Promise<Property>;
  deleteProperty(id: string): Promise<boolean>;
}

export interface IBuildingService {
  getBuildings(propertyId?: string): Promise<Building[]>;
  createBuilding(data: Omit<Building, "id" | "created_at" | "updated_at">): Promise<Building>;
  updateBuilding(id: string, data: Partial<Building>): Promise<Building>;
}

export interface IFloorService {
  getFloors(propertyId?: string, buildingId?: string): Promise<Floor[]>;
  createFloor(data: Omit<Floor, "id" | "created_at" | "updated_at">): Promise<Floor>;
}

export interface IRoomService {
  getRooms(propertyId?: string, floorId?: string): Promise<Room[]>;
  getRoomById(id: string): Promise<Room | null>;
  createRoom(data: Omit<Room, "id" | "created_at" | "updated_at">): Promise<Room>;
  updateRoom(id: string, data: Partial<Room>): Promise<Room>;
  deleteRoom(id: string): Promise<boolean>;
}

export interface IBedService {
  getBeds(roomId?: string, propertyId?: string): Promise<Bed[]>;
  getBedById(id: string): Promise<Bed | null>;
  createBed(data: Omit<Bed, "id" | "created_at" | "updated_at">): Promise<Bed>;
  updateBedStatus(bedId: string, status: Bed["status"], tenantId?: string, tenantName?: string): Promise<Bed>;
  vacateBed(bedId: string): Promise<Bed>;
}

export interface ITenantService {
  getTenants(propertyId?: string, search?: string, status?: string): Promise<Tenant[]>;
  getTenantById(id: string): Promise<Tenant | null>;
  getTenantByEmail(email: string): Promise<Tenant | null>;
  createTenant(data: Partial<Tenant>): Promise<Tenant>;
  updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant>;
  deleteTenant(id: string): Promise<boolean>;
  checkInTenant(data: {
    tenantData: Partial<Tenant>;
    bedId: string;
    roomId: string;
    propertyId: string;
    rent: number;
    deposit: number;
    joiningDate: string;
  }): Promise<Tenant>;
  checkoutTenant(data: {
    tenantId: string;
    checkoutDate: string;
    deductions: number;
    deductionNotes?: string;
    refundAmount: number;
  }): Promise<boolean>;
  getTenantDocuments(tenantId: string): Promise<TenantDocument[]>;
  uploadTenantDocument(data: Omit<TenantDocument, "id" | "created_at">): Promise<TenantDocument>;
  getTenantActivity(tenantId: string): Promise<ActivityLog[]>;
}

export interface IRentService {
  getRentRecords(propertyId?: string, month?: string, status?: string, search?: string): Promise<RentRecord[]>;
  getRentRecordById(id: string): Promise<RentRecord | null>;
  generateMonthlyRent(propertyId: string, month: string): Promise<number>;
  adjustRent(data: {
    rentRecordId: string;
    discount?: number;
    lateFee?: number;
    waiverReason?: string;
  }): Promise<RentRecord>;
}

export interface IPaymentService {
  getPayments(propertyId?: string, search?: string, status?: string): Promise<Payment[]>;
  getPaymentById(id: string): Promise<Payment | null>;
  recordPayment(data: {
    tenantId: string;
    propertyId: string;
    amount: number;
    paymentMethod: Payment["payment_method"];
    transactionId?: string;
    notes?: string;
    rentRecordId?: string;
  }): Promise<Payment>;
  voidPayment(paymentId: string, reason: string): Promise<boolean>;
  getPaymentAudits(paymentId?: string): Promise<PaymentAudit[]>;
}

export interface IExpenseService {
  getExpenses(propertyId?: string, category?: string, search?: string): Promise<Expense[]>;
  addExpense(data: Omit<Expense, "id" | "created_at" | "updated_at">): Promise<Expense>;
  deleteExpense(id: string): Promise<boolean>;
  getProfitAndLoss(propertyId?: string, month?: string): Promise<{
    revenue: number;
    otherIncome: number;
    expenses: number;
    netProfit: number;
    expenseBreakdown: Record<string, number>;
  }>;
}

export interface IComplaintService {
  getComplaints(propertyId?: string, status?: string, priority?: string, search?: string): Promise<Complaint[]>;
  createComplaint(data: Omit<Complaint, "id" | "ticket_number" | "created_at" | "updated_at">): Promise<Complaint>;
  updateComplaintStatus(id: string, status: Complaint["status"], notes?: string, assignedStaffId?: string, assignedStaffName?: string): Promise<Complaint>;
}

export interface IMaintenanceService {
  getMaintenanceTickets(propertyId?: string, status?: string): Promise<MaintenanceTicket[]>;
  createMaintenanceTicket(data: Omit<MaintenanceTicket, "id" | "ticket_number" | "created_at" | "updated_at">): Promise<MaintenanceTicket>;
  updateMaintenanceTicket(id: string, data: Partial<MaintenanceTicket>): Promise<MaintenanceTicket>;
}

export interface IVisitorService {
  getVisitors(propertyId?: string, status?: string, search?: string): Promise<Visitor[]>;
  checkInVisitor(data: Omit<Visitor, "id" | "created_at" | "status" | "check_in_time">): Promise<Visitor>;
  checkOutVisitor(id: string): Promise<boolean>;
}

export interface IStaffService {
  getStaff(propertyId?: string, role?: string, search?: string): Promise<StaffMember[]>;
  addStaff(data: Omit<StaffMember, "id" | "created_at">): Promise<StaffMember>;
  updateStaffStatus(id: string, status: StaffMember["status"]): Promise<StaffMember>;
}

export interface IAnnouncementService {
  getAnnouncements(propertyId?: string): Promise<Announcement[]>;
  createAnnouncement(data: Omit<Announcement, "id" | "created_at" | "status">): Promise<Announcement>;
}

export interface INotificationService {
  getNotifications(userId: string): Promise<NotificationItem[]>;
  markAsRead(id: string): Promise<boolean>;
}

export interface IDashboardService {
  getMetrics(propertyId?: string): Promise<DashboardMetrics>;
  searchGlobal(query: string): Promise<{
    tenants: Array<{ id: string; title: string; subtitle: string; url: string }>;
    rooms: Array<{ id: string; title: string; subtitle: string; url: string }>;
    payments: Array<{ id: string; title: string; subtitle: string; url: string }>;
    complaints: Array<{ id: string; title: string; subtitle: string; url: string }>;
  }>;
}

export interface IReportService {
  getOccupancyReport(propertyId?: string): Promise<OccupancyReport>;
  getRevenueReport(propertyId?: string, year?: string): Promise<RevenueReport>;
  getExpenseReport(propertyId?: string, year?: string): Promise<ExpenseReport>;
  getProfitLossStatement(propertyId?: string, month?: string): Promise<ProfitLossStatement>;
  getTenantAgingReport(propertyId?: string): Promise<TenantAgingReport>;
}

export interface ISubscriptionService {
  getCurrentSubscription(orgId?: string): Promise<{
    plan: SubscriptionPlan;
    usage: { properties: number; beds: number; tenants: number; staff: number };
    limits: { properties: number; beds: number; tenants: number; staff: number };
  }>;
  getAvailablePlans(): Promise<SubscriptionPlan[]>;
  changePlan(orgId: string, planId: string): Promise<boolean>;
}

export interface ISuperAdminService {
  getSystemMetrics(): Promise<SuperAdminMetrics>;
  getOrganizations(): Promise<
    Array<{
      id: string;
      name: string;
      ownerName: string;
      planId: string;
      propertiesCount: number;
      bedsCount: number;
      tenantsCount: number;
      mrr: number;
      status: "ACTIVE" | "PAST_DUE" | "TRIAL";
      created_at: string;
    }>
  >;
  getSupportTickets(): Promise<SaaSSupportTicket[]>;
  updateSupportTicket(
    id: string,
    status: SaaSSupportTicket["status"],
    adminResponse?: string
  ): Promise<SaaSSupportTicket>;
  changeOrgPlan(orgId: string, planId: string): Promise<boolean>;
}



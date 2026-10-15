import {
  IAuthService,
  IOrganizationService,
  IPropertyService,
  IBuildingService,
  IFloorService,
  IRoomService,
  IBedService,
  ITenantService,
  IRentService,
  IPaymentService,
  IExpenseService,
  IComplaintService,
  IMaintenanceService,
  IVisitorService,
  IStaffService,
  IAnnouncementService,
  INotificationService,
  IDashboardService,
  IReportService,
  ISubscriptionService,
  ISuperAdminService,
} from "@/services/interfaces";
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
  ActivityLog,
  RentRecord,
  Payment,
  PaymentAudit,
  Expense,
  Complaint,
  MaintenanceTicket,
  Announcement,
  Visitor,
  StaffMember,
  NotificationItem,
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
import { SUBSCRIPTION_PLANS, checkPlanLimit } from "@/config/plans";
import {
  initialOrganization,
  mockUsers,
  initialProperties,
  initialBuildings,
  initialFloors,
  initialRooms,
  initialBeds,
  initialTenants,
  initialTenantDocuments,
  initialRentRecords,
  initialPayments,
  initialPaymentAudits,
  initialExpenses,
  initialComplaints,
  initialMaintenanceTickets,
  initialAnnouncements,
  initialActivityLogs,
  initialNotifications,
  initialVisitors,
  initialStaff,
  initialSupportTickets,
  initialSaaSOrganizations,
} from "./mockData";

// In-memory persistent state across client runtime
class MockState {
  organization: Organization = { ...initialOrganization };
  currentUser: UserProfile = { ...mockUsers.OWNER };
  properties: Property[] = [...initialProperties];
  buildings: Building[] = [...initialBuildings];
  floors: Floor[] = [...initialFloors];
  rooms: Room[] = [...initialRooms];
  beds: Bed[] = [...initialBeds];
  tenants: Tenant[] = [...initialTenants];
  documents: TenantDocument[] = [...initialTenantDocuments];
  rentRecords: RentRecord[] = [...initialRentRecords];
  payments: Payment[] = [...initialPayments];
  paymentAudits: PaymentAudit[] = [...initialPaymentAudits];
  expenses: Expense[] = [...initialExpenses];
  complaints: Complaint[] = [...initialComplaints];
  maintenanceTickets: MaintenanceTicket[] = [...initialMaintenanceTickets];
  announcements: Announcement[] = [...initialAnnouncements];
  activities = [...initialActivityLogs];
  notifications = [...initialNotifications];
  visitors = [...initialVisitors];
  staff = [...initialStaff];
  supportTickets = [...initialSupportTickets];
  saasOrganizations = [...initialSaaSOrganizations];
}

const state = new MockState();

export class MockAuthService implements IAuthService {
  async login(email: string): Promise<UserProfile> {
    const user = Object.values(mockUsers).find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
      ...mockUsers.OWNER,
      email,
    };
    state.currentUser = { ...user };
    return state.currentUser;
  }

  async signup(data: {
    email: string;
    fullName: string;
    organizationName: string;
    phone: string;
  }): Promise<{ user: UserProfile; organization: Organization }> {
    state.organization.name = data.organizationName;
    state.currentUser = {
      id: `user-${Date.now()}`,
      email: data.email,
      full_name: data.fullName,
      phone: data.phone,
      role: "OWNER",
      organization_id: state.organization.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { user: state.currentUser, organization: state.organization };
  }

  async logout(): Promise<void> {
    // In demo mode, reset to unauthenticated or keep demo state
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    return state.currentUser;
  }

  async resetPassword(): Promise<boolean> {
    return true;
  }

  async switchDemoRole(role: "SUPER_ADMIN" | "OWNER" | "MANAGER" | "STAFF" | "TENANT"): Promise<UserProfile> {
    const selected = mockUsers[role] || mockUsers.OWNER;
    state.currentUser = { ...selected };
    return state.currentUser;
  }
}

export class MockOrganizationService implements IOrganizationService {
  async getOrganization(): Promise<Organization | null> {
    return state.organization;
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    state.organization = { ...state.organization, ...data, updated_at: new Date().toISOString() };
    return state.organization;
  }
}

export class MockPropertyService implements IPropertyService {
  async getProperties(): Promise<Property[]> {
    return state.properties;
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return state.properties.find((p) => p.id === id) || null;
  }

  async createProperty(data: Omit<Property, "id" | "created_at" | "updated_at">): Promise<Property> {
    const newProp: Property = {
      ...data,
      id: `prop-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_buildings: 1,
      total_rooms: 0,
      total_beds: 0,
      occupied_beds: 0,
      available_beds: 0,
    };
    state.properties.unshift(newProp);
    return newProp;
  }

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    const index = state.properties.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Property not found");
    state.properties[index] = { ...state.properties[index], ...data, updated_at: new Date().toISOString() };
    return state.properties[index];
  }

  async deleteProperty(id: string): Promise<boolean> {
    state.properties = state.properties.filter((p) => p.id !== id);
    return true;
  }
}

export class MockBuildingService implements IBuildingService {
  async getBuildings(propertyId?: string): Promise<Building[]> {
    if (propertyId && propertyId !== "ALL") {
      return state.buildings.filter((b) => b.property_id === propertyId);
    }
    return state.buildings;
  }

  async createBuilding(data: Omit<Building, "id" | "created_at" | "updated_at">): Promise<Building> {
    const newBuilding: Building = {
      ...data,
      id: `bld-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.buildings.push(newBuilding);
    return newBuilding;
  }

  async updateBuilding(id: string, data: Partial<Building>): Promise<Building> {
    const idx = state.buildings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Building not found");
    state.buildings[idx] = { ...state.buildings[idx], ...data, updated_at: new Date().toISOString() };
    return state.buildings[idx];
  }
}

export class MockFloorService implements IFloorService {
  async getFloors(propertyId?: string, buildingId?: string): Promise<Floor[]> {
    let filtered = state.floors;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((f) => f.property_id === propertyId);
    }
    if (buildingId) {
      filtered = filtered.filter((f) => f.building_id === buildingId);
    }
    return filtered;
  }

  async createFloor(data: Omit<Floor, "id" | "created_at" | "updated_at">): Promise<Floor> {
    const newFloor: Floor = {
      ...data,
      id: `floor-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.floors.push(newFloor);
    return newFloor;
  }
}

export class MockRoomService implements IRoomService {
  async getRooms(propertyId?: string, floorId?: string): Promise<Room[]> {
    let filtered = state.rooms;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((r) => r.property_id === propertyId);
    }
    if (floorId && floorId !== "ALL") {
      filtered = filtered.filter((r) => r.floor_id === floorId);
    }
    // Attach current beds to each room
    return filtered.map((r) => ({
      ...r,
      beds: state.beds.filter((b) => b.room_id === r.id),
    }));
  }

  async getRoomById(id: string): Promise<Room | null> {
    const room = state.rooms.find((r) => r.id === id);
    if (!room) return null;
    return {
      ...room,
      beds: state.beds.filter((b) => b.room_id === room.id),
    };
  }

  async createRoom(data: Omit<Room, "id" | "created_at" | "updated_at">): Promise<Room> {
    const roomId = `room-${data.property_id}-${data.room_number}`;
    const letters = ["A", "B", "C", "D", "E", "F"];
    const createdBeds: Bed[] = [];

    for (let i = 0; i < data.capacity; i++) {
      const bed: Bed = {
        id: `bed-${roomId}-${letters[i]}`,
        room_id: roomId,
        property_id: data.property_id,
        organization_id: data.organization_id || "org-prime-living",
        bed_number: `${data.room_number}-${letters[i]}`,
        status: "AVAILABLE",
        monthly_rent: data.monthly_rent,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      state.beds.push(bed);
      createdBeds.push(bed);
    }

    const newRoom: Room = {
      ...data,
      id: roomId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      beds: createdBeds,
    };
    state.rooms.push(newRoom);
    return newRoom;
  }

  async updateRoom(id: string, data: Partial<Room>): Promise<Room> {
    const index = state.rooms.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Room not found");
    state.rooms[index] = { ...state.rooms[index], ...data, updated_at: new Date().toISOString() };
    return {
      ...state.rooms[index],
      beds: state.beds.filter((b) => b.room_id === id),
    };
  }

  async deleteRoom(id: string): Promise<boolean> {
    state.rooms = state.rooms.filter((r) => r.id !== id);
    state.beds = state.beds.filter((b) => b.room_id !== id);
    return true;
  }
}

export class MockBedService implements IBedService {
  async getBeds(roomId?: string, propertyId?: string): Promise<Bed[]> {
    let filtered = state.beds;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((b) => b.property_id === propertyId);
    }
    if (roomId) {
      filtered = filtered.filter((b) => b.room_id === roomId);
    }
    return filtered;
  }

  async getBedById(id: string): Promise<Bed | null> {
    return state.beds.find((b) => b.id === id) || null;
  }

  async createBed(data: Omit<Bed, "id" | "created_at" | "updated_at">): Promise<Bed> {
    const newBed: Bed = {
      ...data,
      id: `bed-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.beds.push(newBed);
    return newBed;
  }

  async updateBedStatus(
    bedId: string,
    status: Bed["status"],
    tenantId?: string,
    tenantName?: string
  ): Promise<Bed> {
    const bed = state.beds.find((b) => b.id === bedId);
    if (!bed) throw new Error("Bed not found");
    bed.status = status;
    if (tenantId !== undefined) bed.current_tenant_id = tenantId;
    if (tenantName !== undefined) bed.current_tenant_name = tenantName;
    bed.updated_at = new Date().toISOString();
    return bed;
  }

  async vacateBed(bedId: string): Promise<Bed> {
    const bed = state.beds.find((b) => b.id === bedId);
    if (!bed) throw new Error("Bed not found");
    bed.status = "AVAILABLE";
    bed.current_tenant_id = undefined;
    bed.current_tenant_name = undefined;
    bed.updated_at = new Date().toISOString();
    return bed;
  }
}

export class MockTenantService implements ITenantService {
  async getTenants(propertyId?: string, search?: string, status?: string): Promise<Tenant[]> {
    let filtered = state.tenants;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((t) => t.property_id === propertyId);
    }
    if (status && status !== "ALL") {
      filtered = filtered.filter((t) => t.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.phone.includes(q) ||
          t.assigned_room_number?.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  async getTenantById(id: string): Promise<Tenant | null> {
    return state.tenants.find((t) => t.id === id) || null;
  }

  async getTenantByEmail(email: string): Promise<Tenant | null> {
    const t = state.tenants.find((item) => item.email.toLowerCase() === email.toLowerCase());
    return t || state.tenants[0] || null;
  }

  async createTenant(data: Partial<Tenant>): Promise<Tenant> {
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: data.property_id || state.properties[0].id,
      name: data.name || "New Tenant",
      phone: data.phone || "+91 98000 00000",
      email: data.email || "tenant@example.com",
      id_proof_type: data.id_proof_type || "AADHAAR",
      id_proof_number: data.id_proof_number || "1234 5678 9012",
      permanent_address: data.permanent_address || "Bengaluru",
      emergency_contact_name: data.emergency_contact_name || "Emergency Contact",
      emergency_contact_phone: data.emergency_contact_phone || "+91 98000 00001",
      emergency_contact_relation: data.emergency_contact_relation || "Relative",
      joining_date: data.joining_date || new Date().toISOString().split("T")[0],
      status: data.status || "ACTIVE",
      monthly_rent: data.monthly_rent || 8500,
      security_deposit: data.security_deposit || 17000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };
    state.tenants.unshift(newTenant);
    return newTenant;
  }

  async updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant> {
    const idx = state.tenants.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error("Tenant not found");
    state.tenants[idx] = { ...state.tenants[idx], ...data, updated_at: new Date().toISOString() };
    return state.tenants[idx];
  }

  async deleteTenant(id: string): Promise<boolean> {
    const tenant = state.tenants.find((t) => t.id === id);
    if (tenant && tenant.assigned_bed_id) {
      const bed = state.beds.find((b) => b.id === tenant.assigned_bed_id);
      if (bed) {
        bed.status = "AVAILABLE";
        bed.current_tenant_id = undefined;
        bed.current_tenant_name = undefined;
      }
    }
    state.tenants = state.tenants.filter((t) => t.id !== id);
    return true;
  }

  async checkInTenant(data: {
    tenantData: Partial<Tenant>;
    bedId: string;
    roomId: string;
    propertyId: string;
    rent: number;
    deposit: number;
    joiningDate: string;
  }): Promise<Tenant> {
    const prop = state.properties.find((p) => p.id === data.propertyId) || state.properties[0];
    const room = state.rooms.find((r) => r.id === data.roomId);
    const bed = state.beds.find((b) => b.id === data.bedId);

    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: data.propertyId,
      assigned_property_name: prop.name,
      name: data.tenantData.name || "Resident",
      phone: data.tenantData.phone || "+91 98000 00000",
      email: data.tenantData.email || "resident@example.com",
      id_proof_type: data.tenantData.id_proof_type || "AADHAAR",
      id_proof_number: data.tenantData.id_proof_number || "4932 8821 9912",
      permanent_address: data.tenantData.permanent_address || "Bengaluru",
      emergency_contact_name: data.tenantData.emergency_contact_name || "Parent",
      emergency_contact_phone: data.tenantData.emergency_contact_phone || "+91 98000 00001",
      emergency_contact_relation: data.tenantData.emergency_contact_relation || "Parent",
      company_or_college: data.tenantData.company_or_college || "Corporate",
      joining_date: data.joiningDate || new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      assigned_bed_id: data.bedId,
      assigned_bed_number: bed?.bed_number || "Bed A",
      assigned_room_id: data.roomId,
      assigned_room_number: room?.room_number || "101",
      monthly_rent: data.rent,
      security_deposit: data.deposit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    state.tenants.unshift(newTenant);

    if (bed) {
      bed.status = "OCCUPIED";
      bed.current_tenant_id = newTenant.id;
      bed.current_tenant_name = newTenant.name;
      bed.joining_date = data.joiningDate;
      bed.monthly_rent = data.rent;
    }

    state.activities.unshift({
      id: `act-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: data.propertyId,
      user_id: state.currentUser.id,
      user_name: state.currentUser.full_name,
      user_role: state.currentUser.role,
      action: "CHECK_IN",
      entity: "Tenant",
      entity_id: newTenant.id,
      details: `Checked in ${newTenant.name} into ${prop.name} Room ${room?.room_number || "101"} (${bed?.bed_number || "Bed"})`,
      created_at: new Date().toISOString(),
    });

    return newTenant;
  }

  async checkoutTenant(data: {
    tenantId: string;
    checkoutDate: string;
    deductions: number;
    deductionNotes?: string;
    refundAmount: number;
  }): Promise<boolean> {
    const tenant = state.tenants.find((t) => t.id === data.tenantId);
    if (!tenant) return false;

    if (tenant.assigned_bed_id) {
      const bed = state.beds.find((b) => b.id === tenant.assigned_bed_id);
      if (bed) {
        bed.status = "AVAILABLE";
        bed.current_tenant_id = undefined;
        bed.current_tenant_name = undefined;
        bed.joining_date = undefined;
      }
    }

    tenant.status = "INACTIVE";
    tenant.leaving_date = data.checkoutDate;
    tenant.updated_at = new Date().toISOString();

    state.activities.unshift({
      id: `act-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: tenant.property_id,
      user_id: state.currentUser.id,
      user_name: state.currentUser.full_name,
      user_role: state.currentUser.role,
      action: "CHECKOUT",
      entity: "Tenant",
      entity_id: tenant.id,
      details: `Checked out ${tenant.name}. Deductions: ₹${data.deductions.toLocaleString()}${
        data.deductionNotes ? ` (${data.deductionNotes})` : ""
      }, Net Refund: ₹${data.refundAmount.toLocaleString()}`,
      created_at: new Date().toISOString(),
    });

    return true;
  }

  async getTenantDocuments(tenantId: string): Promise<TenantDocument[]> {
    return state.documents.filter((d) => d.tenant_id === tenantId);
  }

  async uploadTenantDocument(data: Omit<TenantDocument, "id" | "created_at">): Promise<TenantDocument> {
    const doc: TenantDocument = {
      ...data,
      id: `doc-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    state.documents.unshift(doc);
    return doc;
  }

  async getTenantActivity(tenantId: string): Promise<ActivityLog[]> {
    const tenant = state.tenants.find((t) => t.id === tenantId);
    return state.activities.filter(
      (a) =>
        a.entity_id === tenantId ||
        (tenant && a.details?.toLowerCase().includes(tenant.name.toLowerCase()))
    );
  }
}

export class MockRentService implements IRentService {
  async getRentRecords(
    propertyId?: string,
    month?: string,
    status?: string,
    search?: string
  ): Promise<RentRecord[]> {
    let filtered = state.rentRecords;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((r) => r.property_id === propertyId);
    }
    if (month && month !== "ALL") {
      filtered = filtered.filter((r) => r.month === month);
    }
    if (status && status !== "ALL") {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.tenant_name?.toLowerCase().includes(q) ||
          r.room_number?.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  async getRentRecordById(id: string): Promise<RentRecord | null> {
    return state.rentRecords.find((r) => r.id === id) || null;
  }

  async generateMonthlyRent(propertyId: string, month: string): Promise<number> {
    const targetTenants = state.tenants.filter(
      (t) =>
        t.status === "ACTIVE" &&
        (propertyId === "ALL" || t.property_id === propertyId)
    );

    let createdCount = 0;
    for (const t of targetTenants) {
      const existing = state.rentRecords.find(
        (r) => r.tenant_id === t.id && r.month === month
      );
      if (!existing) {
        state.rentRecords.unshift({
          id: `rent-${t.id}-${month}`,
          organization_id: t.organization_id,
          property_id: t.property_id,
          tenant_id: t.id,
          tenant_name: t.name,
          room_number: t.assigned_room_number || "101",
          month,
          base_rent: t.monthly_rent,
          additional_charges: 0,
          discount: 0,
          late_fee: 0,
          total_amount: t.monthly_rent,
          paid_amount: 0,
          pending_amount: t.monthly_rent,
          due_date: `${month}-05`,
          status: "PENDING",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        createdCount++;
      }
    }

    state.activities.unshift({
      id: `act-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: propertyId === "ALL" ? state.properties[0].id : propertyId,
      user_id: state.currentUser.id,
      user_name: state.currentUser.full_name,
      user_role: state.currentUser.role,
      action: "GENERATE_RENT",
      entity: "RentRecord",
      entity_id: month,
      details: `Generated ${createdCount} monthly rent billing schedules for cycle ${month}`,
      created_at: new Date().toISOString(),
    });

    return createdCount;
  }

  async adjustRent(data: {
    rentRecordId: string;
    discount?: number;
    lateFee?: number;
    waiverReason?: string;
  }): Promise<RentRecord> {
    const record = state.rentRecords.find((r) => r.id === data.rentRecordId);
    if (!record) throw new Error("Rent record not found");

    if (data.discount !== undefined) record.discount = data.discount;
    if (data.lateFee !== undefined) record.late_fee = data.lateFee;

    record.total_amount =
      record.base_rent +
      record.additional_charges +
      record.late_fee -
      record.discount;
    record.pending_amount = Math.max(0, record.total_amount - record.paid_amount);

    if (record.discount >= record.base_rent && record.pending_amount === 0) {
      record.status = "WAIVED";
    } else if (record.pending_amount === 0) {
      record.status = "PAID";
    } else if (record.paid_amount > 0) {
      record.status = "PARTIAL";
    }

    record.updated_at = new Date().toISOString();

    state.activities.unshift({
      id: `act-${Date.now()}`,
      organization_id: record.organization_id,
      property_id: record.property_id,
      user_id: state.currentUser.id,
      user_name: state.currentUser.full_name,
      user_role: state.currentUser.role,
      action: "ADJUST_RENT",
      entity: "RentRecord",
      entity_id: record.id,
      details: `Adjusted rent for ${record.tenant_name} (${record.month}): ${data.waiverReason || "Fee adjustment"}`,
      created_at: new Date().toISOString(),
    });

    return record;
  }
}

export class MockPaymentService implements IPaymentService {
  async getPayments(
    propertyId?: string,
    search?: string,
    status?: string
  ): Promise<Payment[]> {
    let filtered = state.payments;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((p) => p.property_id === propertyId);
    }
    if (status && status !== "ALL") {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.tenant_name?.toLowerCase().includes(q) ||
          p.receipt_number.toLowerCase().includes(q) ||
          p.transaction_id?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return state.payments.find((p) => p.id === id || p.receipt_number === id) || null;
  }

  async recordPayment(data: {
    tenantId: string;
    propertyId: string;
    amount: number;
    paymentMethod: Payment["payment_method"];
    transactionId?: string;
    notes?: string;
    rentRecordId?: string;
  }): Promise<Payment> {
    const tenant = state.tenants.find((t) => t.id === data.tenantId);
    const receiptNum = `REC-2026-${(state.payments.length + 101).toString().padStart(5, "0")}`;

    // Synchronize with rent record
    let associatedRecord: RentRecord | undefined;
    if (data.rentRecordId) {
      associatedRecord = state.rentRecords.find((r) => r.id === data.rentRecordId);
    } else {
      associatedRecord = state.rentRecords.find(
        (r) => r.tenant_id === data.tenantId && r.pending_amount > 0
      );
    }

    if (associatedRecord) {
      associatedRecord.paid_amount += data.amount;
      associatedRecord.pending_amount = Math.max(
        0,
        associatedRecord.total_amount - associatedRecord.paid_amount
      );
      associatedRecord.status =
        associatedRecord.pending_amount <= 0 ? "PAID" : "PARTIAL";
      associatedRecord.updated_at = new Date().toISOString();
    }

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      receipt_number: receiptNum,
      organization_id: state.organization.id,
      property_id: data.propertyId,
      tenant_id: data.tenantId,
      tenant_name: tenant?.name || "Tenant",
      rent_record_id: associatedRecord?.id || data.rentRecordId,
      amount: data.amount,
      payment_date: new Date().toISOString().split("T")[0],
      payment_method: data.paymentMethod,
      transaction_id: data.transactionId || `TXN-${Date.now()}`,
      notes: data.notes || "Rent payment",
      status: "COMPLETED",
      created_by: state.currentUser.id,
      created_by_name: state.currentUser.full_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    state.payments.unshift(newPayment);

    state.activities.unshift({
      id: `act-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: data.propertyId,
      user_id: state.currentUser.id,
      user_name: state.currentUser.full_name,
      user_role: state.currentUser.role,
      action: "RECORD_PAYMENT",
      entity: "Payment",
      entity_id: receiptNum,
      details: `Recorded payment of ₹${data.amount.toLocaleString()} from ${tenant?.name || "Tenant"} (${data.paymentMethod})`,
      created_at: new Date().toISOString(),
    });

    state.paymentAudits.unshift({
      id: `audit-${Date.now()}`,
      payment_id: newPayment.id,
      action: "ADJUSTMENT",
      old_data: {},
      new_data: { receipt_number: receiptNum, amount: data.amount, method: data.paymentMethod },
      reason: "New payment transaction logged and receipt issued",
      performed_by: state.currentUser.full_name,
      created_at: new Date().toISOString(),
    });

    return newPayment;
  }

  async voidPayment(paymentId: string, reason: string): Promise<boolean> {
    const payment = state.payments.find((p) => p.id === paymentId);
    if (!payment) return false;

    const oldStatus = payment.status;
    payment.status = "VOIDED";
    payment.updated_at = new Date().toISOString();

    // Reverse in rent record
    if (payment.rent_record_id) {
      const rentRecord = state.rentRecords.find((r) => r.id === payment.rent_record_id);
      if (rentRecord) {
        rentRecord.paid_amount = Math.max(0, rentRecord.paid_amount - payment.amount);
        rentRecord.pending_amount = Math.max(
          0,
          rentRecord.total_amount - rentRecord.paid_amount
        );
        rentRecord.status =
          rentRecord.pending_amount === 0
            ? "PAID"
            : rentRecord.paid_amount > 0
            ? "PARTIAL"
            : "OVERDUE";
        rentRecord.updated_at = new Date().toISOString();
      }
    }

    state.paymentAudits.unshift({
      id: `audit-${Date.now()}`,
      payment_id: payment.id,
      action: "VOID",
      old_data: { status: oldStatus },
      new_data: { status: "VOIDED" },
      reason,
      performed_by: state.currentUser.full_name,
      created_at: new Date().toISOString(),
    });

    state.activities.unshift({
      id: `act-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: payment.property_id,
      user_id: state.currentUser.id,
      user_name: state.currentUser.full_name,
      user_role: state.currentUser.role,
      action: "VOID_PAYMENT",
      entity: "Payment",
      entity_id: payment.receipt_number,
      details: `Voided payment ${payment.receipt_number}: ${reason}`,
      created_at: new Date().toISOString(),
    });

    return true;
  }

  async getPaymentAudits(paymentId?: string): Promise<PaymentAudit[]> {
    if (paymentId) {
      return state.paymentAudits.filter((a) => a.payment_id === paymentId);
    }
    return state.paymentAudits;
  }
}

export class MockExpenseService implements IExpenseService {
  async getExpenses(
    propertyId?: string,
    category?: string,
    search?: string
  ): Promise<Expense[]> {
    let filtered = state.expenses;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((e) => e.property_id === propertyId);
    }
    if (category && category !== "ALL") {
      filtered = filtered.filter((e) => e.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.vendor?.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  async addExpense(
    data: Omit<Expense, "id" | "created_at" | "updated_at">
  ): Promise<Expense> {
    const prop = state.properties.find((p) => p.id === data.property_id);
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}`,
      property_name: prop?.name || "PG Property",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.expenses.unshift(newExpense);

    state.activities.unshift({
      id: `act-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: data.property_id,
      user_id: state.currentUser.id,
      user_name: state.currentUser.full_name,
      user_role: state.currentUser.role,
      action: "ADD_EXPENSE",
      entity: "Expense",
      entity_id: newExpense.id,
      details: `Logged expense of ₹${data.amount.toLocaleString()} for ${data.category} (${data.vendor || "Direct"})`,
      created_at: new Date().toISOString(),
    });

    return newExpense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const idx = state.expenses.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    state.expenses.splice(idx, 1);
    return true;
  }

  async getProfitAndLoss(
    propertyId?: string,
    month?: string
  ): Promise<{
    revenue: number;
    otherIncome: number;
    expenses: number;
    netProfit: number;
    expenseBreakdown: Record<string, number>;
  }> {
    let filteredRent = state.rentRecords;
    let filteredExp = state.expenses;

    if (propertyId && propertyId !== "ALL") {
      filteredRent = filteredRent.filter((r) => r.property_id === propertyId);
      filteredExp = filteredExp.filter((e) => e.property_id === propertyId);
    }
    if (month && month !== "ALL") {
      filteredRent = filteredRent.filter((r) => r.month === month);
      filteredExp = filteredExp.filter((e) => e.date.startsWith(month));
    }

    const revenue = filteredRent.reduce((sum, r) => sum + r.paid_amount, 0);
    const otherIncome = Math.round(revenue * 0.03); // ~3% from amenities/laundry
    const totalExpenses = filteredExp.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = revenue + otherIncome - totalExpenses;

    const expenseBreakdown: Record<string, number> = {};
    for (const exp of filteredExp) {
      expenseBreakdown[exp.category] = (expenseBreakdown[exp.category] || 0) + exp.amount;
    }

    return {
      revenue,
      otherIncome,
      expenses: totalExpenses,
      netProfit,
      expenseBreakdown,
    };
  }
}

export class MockComplaintService implements IComplaintService {
  async getComplaints(
    propertyId?: string,
    status?: string,
    priority?: string,
    search?: string
  ): Promise<Complaint[]> {
    let filtered = state.complaints;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((c) => c.property_id === propertyId);
    }
    if (status && status !== "ALL") {
      filtered = filtered.filter((c) => c.status === status);
    }
    if (priority && priority !== "ALL") {
      filtered = filtered.filter((c) => c.priority === priority);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.ticket_number.toLowerCase().includes(q) ||
          c.tenant_name.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  async createComplaint(
    data: Omit<Complaint, "id" | "ticket_number" | "created_at" | "updated_at">
  ): Promise<Complaint> {
    const prop = state.properties.find((p) => p.id === data.property_id);
    const newTicket: Complaint = {
      ...data,
      id: `comp-${Date.now()}`,
      ticket_number: `TKT-${1030 + state.complaints.length}`,
      property_name: prop?.name || "PG Property",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.complaints.unshift(newTicket);

    state.activities.unshift({
      id: `act-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: data.property_id,
      user_id: state.currentUser.id,
      user_name: state.currentUser.full_name,
      user_role: state.currentUser.role,
      action: "CREATE_COMPLAINT",
      entity: "Complaint",
      entity_id: newTicket.ticket_number,
      details: `Logged ticket ${newTicket.ticket_number}: ${newTicket.title} (${newTicket.priority})`,
      created_at: new Date().toISOString(),
    });

    return newTicket;
  }

  async updateComplaintStatus(
    id: string,
    status: Complaint["status"],
    notes?: string,
    assignedStaffId?: string,
    assignedStaffName?: string
  ): Promise<Complaint> {
    const comp = state.complaints.find((c) => c.id === id);
    if (!comp) throw new Error("Complaint not found");
    comp.status = status;
    if (notes) comp.resolution_notes = notes;
    if (assignedStaffId) comp.assigned_staff_id = assignedStaffId;
    if (assignedStaffName) comp.assigned_staff_name = assignedStaffName;
    if (status === "RESOLVED" || status === "CLOSED") {
      comp.resolved_at = new Date().toISOString();
    }
    comp.updated_at = new Date().toISOString();

    state.activities.unshift({
      id: `act-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: comp.property_id,
      user_id: state.currentUser.id,
      user_name: state.currentUser.full_name,
      user_role: state.currentUser.role,
      action: "UPDATE_COMPLAINT",
      entity: "Complaint",
      entity_id: comp.ticket_number,
      details: `Updated complaint ${comp.ticket_number} status to ${status}`,
      created_at: new Date().toISOString(),
    });

    return comp;
  }
}

export class MockMaintenanceService implements IMaintenanceService {
  async getMaintenanceTickets(
    propertyId?: string,
    status?: string
  ): Promise<MaintenanceTicket[]> {
    let filtered = state.maintenanceTickets;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((m) => m.property_id === propertyId);
    }
    if (status && status !== "ALL") {
      filtered = filtered.filter((m) => m.status === status);
    }
    return filtered;
  }

  async createMaintenanceTicket(
    data: Omit<MaintenanceTicket, "id" | "ticket_number" | "created_at" | "updated_at">
  ): Promise<MaintenanceTicket> {
    const newTicket: MaintenanceTicket = {
      ...data,
      id: `mnt-${Date.now()}`,
      ticket_number: `MNT-2026-${(state.maintenanceTickets.length + 83).toString().padStart(3, "0")}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.maintenanceTickets.unshift(newTicket);
    return newTicket;
  }

  async updateMaintenanceTicket(
    id: string,
    data: Partial<MaintenanceTicket>
  ): Promise<MaintenanceTicket> {
    const t = state.maintenanceTickets.find((m) => m.id === id);
    if (!t) throw new Error("Maintenance ticket not found");
    Object.assign(t, data, { updated_at: new Date().toISOString() });
    return t;
  }
}

export class MockVisitorService implements IVisitorService {
  async getVisitors(
    propertyId?: string,
    status?: string,
    search?: string
  ): Promise<Visitor[]> {
    let filtered = state.visitors;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((v) => v.property_id === propertyId);
    }
    if (status && status !== "ALL") {
      filtered = filtered.filter((v) => v.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.visitor_name.toLowerCase().includes(q) ||
          v.tenant_name?.toLowerCase().includes(q) ||
          v.room_number?.toLowerCase().includes(q) ||
          v.visitor_phone.includes(q)
      );
    }
    return filtered;
  }

  async checkInVisitor(
    data: Omit<Visitor, "id" | "created_at" | "status" | "check_in_time">
  ): Promise<Visitor> {
    const tenant = state.tenants.find((t) => t.id === data.tenant_id);
    const newVisitor: Visitor = {
      ...data,
      id: `vis-${Date.now()}`,
      tenant_name: tenant?.name || data.tenant_name,
      room_number: tenant?.assigned_room_number || data.room_number,
      status: "CHECKED_IN",
      check_in_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    state.visitors.unshift(newVisitor);

    state.activities.unshift({
      id: `act-${Date.now()}`,
      organization_id: state.organization.id,
      property_id: data.property_id,
      user_id: state.currentUser.id,
      user_name: state.currentUser.full_name,
      user_role: state.currentUser.role,
      action: "VISITOR_CHECKIN",
      entity: "Visitor",
      entity_id: newVisitor.id,
      details: `Checked in guest ${data.visitor_name} visiting ${tenant?.name || "resident"}`,
      created_at: new Date().toISOString(),
    });

    return newVisitor;
  }

  async checkOutVisitor(id: string): Promise<boolean> {
    const vis = state.visitors.find((v) => v.id === id);
    if (!vis) return false;
    vis.status = "CHECKED_OUT";
    vis.check_out_time = new Date().toISOString();
    return true;
  }
}

export class MockStaffService implements IStaffService {
  async getStaff(
    propertyId?: string,
    role?: string,
    search?: string
  ): Promise<StaffMember[]> {
    let filtered = state.staff;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter((s) => s.property_id === propertyId);
    }
    if (role && role !== "ALL") {
      filtered = filtered.filter((s) => s.role === role);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.phone.includes(q) ||
          s.role.toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  async addStaff(
    data: Omit<StaffMember, "id" | "created_at">
  ): Promise<StaffMember> {
    const newStaff: StaffMember = {
      ...data,
      id: `staff-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    state.staff.push(newStaff);
    return newStaff;
  }

  async updateStaffStatus(
    id: string,
    status: StaffMember["status"]
  ): Promise<StaffMember> {
    const s = state.staff.find((st) => st.id === id);
    if (!s) throw new Error("Staff member not found");
    s.status = status;
    return s;
  }
}

export class MockAnnouncementService implements IAnnouncementService {
  async getAnnouncements(propertyId?: string): Promise<Announcement[]> {
    let filtered = state.announcements;
    if (propertyId && propertyId !== "ALL") {
      filtered = filtered.filter(
        (a) => !a.property_id || a.property_id === propertyId
      );
    }
    return filtered;
  }

  async createAnnouncement(
    data: Omit<Announcement, "id" | "created_at" | "status">
  ): Promise<Announcement> {
    const newAnn: Announcement = {
      ...data,
      id: `anc-${Date.now()}`,
      status: "ACTIVE",
      created_at: new Date().toISOString(),
    };
    state.announcements.unshift(newAnn);

    state.notifications.unshift({
      id: `notif-${Date.now()}`,
      user_id: "all",
      title: `Notice: ${newAnn.title}`,
      message: newAnn.description.slice(0, 100) + "...",
      type: "ANNOUNCEMENT",
      read: false,
      link_url: "/announcements",
      created_at: new Date().toISOString(),
    });

    return newAnn;
  }
}

export class MockNotificationService implements INotificationService {
  async getNotifications(): Promise<NotificationItem[]> {
    return state.notifications;
  }

  async markAsRead(id: string): Promise<boolean> {
    const n = state.notifications.find((notif) => notif.id === id);
    if (n) n.read = true;
    return true;
  }
}

export class MockDashboardService implements IDashboardService {
  async getMetrics(propertyId?: string): Promise<DashboardMetrics> {
    let filteredBeds = state.beds;
    let filteredExpenses = state.expenses;
    let filteredPayments = state.payments;
    let filteredComplaints = state.complaints;

    if (propertyId && propertyId !== "ALL") {
      filteredBeds = filteredBeds.filter((b) => b.property_id === propertyId);
      filteredExpenses = filteredExpenses.filter((e) => e.property_id === propertyId);
      filteredPayments = filteredPayments.filter((p) => p.property_id === propertyId);
      filteredComplaints = filteredComplaints.filter((c) => c.property_id === propertyId);
    }

    const totalBeds = filteredBeds.length;
    const occupiedBeds = filteredBeds.filter((b) => b.status === "OCCUPIED").length;
    const availableBeds = filteredBeds.filter((b) => b.status === "AVAILABLE").length;
    const maintenanceBeds = filteredBeds.filter((b) => b.status === "MAINTENANCE").length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const monthlyRevenue = filteredBeds
      .filter((b) => b.status === "OCCUPIED")
      .reduce((sum, b) => sum + b.monthly_rent, 0);

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingRent = Math.round(monthlyRevenue * 0.14); // ~14% pending in mid-month
    const netIncome = monthlyRevenue - totalExpenses;

    return {
      total_beds: totalBeds,
      occupied_beds: occupiedBeds,
      available_beds: availableBeds,
      maintenance_beds: maintenanceBeds,
      occupancy_rate: occupancyRate,
      monthly_revenue: monthlyRevenue,
      pending_rent: pendingRent,
      expenses: totalExpenses,
      net_income: netIncome,
      revenue_trend_percentage: 12.4,
      occupancy_trend_percentage: 4.2,
      pending_rent_trend_percentage: -8.1,
      expenses_trend_percentage: 3.5,
      revenue_chart_data: [
        { period: "May", revenue: 920000, expenses: 195000, collection: 900000 },
        { period: "Jun", revenue: 955000, expenses: 210000, collection: 940000 },
        { period: "Jul", revenue: 980000, expenses: 205000, collection: 970000 },
        { period: "Aug", revenue: 1020000, expenses: 225000, collection: 1010000 },
        { period: "Sep", revenue: 1065000, expenses: 215000, collection: 1050000 },
        { period: "Oct", revenue: 1095500, expenses: 218000, collection: 942000 },
      ],
      occupancy_distribution: [
        { name: "Occupied", value: occupiedBeds, color: "#2563EB" },
        { name: "Available", value: availableBeds, color: "#16A34A" },
        { name: "Maintenance", value: maintenanceBeds, color: "#F59E0B" },
      ],
      recent_activity: state.activities.slice(0, 6),
      recent_payments: filteredPayments.slice(0, 5),
      open_complaints: filteredComplaints.filter((c) => c.status !== "CLOSED" && c.status !== "RESOLVED").slice(0, 4),
    };
  }

  async searchGlobal(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { tenants: [], rooms: [], payments: [], complaints: [] };
    }

    const tenants = state.tenants
      .filter((t) => t.name.toLowerCase().includes(q) || t.phone.includes(q))
      .slice(0, 4)
      .map((t) => ({
        id: t.id,
        title: t.name,
        subtitle: `Room ${t.assigned_room_number || "Unassigned"} • ${t.assigned_property_name || "PG"}`,
        url: `/tenants?id=${t.id}`,
      }));

    const rooms = state.rooms
      .filter((r) => r.room_number.includes(q))
      .slice(0, 4)
      .map((r) => ({
        id: r.id,
        title: `Room ${r.room_number}`,
        subtitle: `${r.room_type} Sharing • ₹${r.monthly_rent}/mo`,
        url: `/rooms?room=${r.room_number}`,
      }));

    const payments = state.payments
      .filter((p) => p.receipt_number.toLowerCase().includes(q) || p.tenant_name?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        title: p.receipt_number,
        subtitle: `${p.tenant_name || "Tenant"} • ₹${p.amount.toLocaleString()} (${p.payment_method})`,
        url: `/payments?receipt=${p.receipt_number}`,
      }));

    const complaints = state.complaints
      .filter((c) => c.ticket_number.toLowerCase().includes(q) || c.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        title: `${c.ticket_number}: ${c.title}`,
        subtitle: `${c.status} • Room ${c.room_number || "General"} (${c.tenant_name})`,
        url: `/complaints?ticket=${c.ticket_number}`,
      }));

    return { tenants, rooms, payments, complaints };
  }
}

export class MockReportService implements IReportService {
  async getOccupancyReport(propertyId?: string): Promise<OccupancyReport> {
    const properties = state.properties.filter(
      (p) => !propertyId || propertyId === "ALL" || p.id === propertyId
    );
    let allBeds = state.beds;
    if (propertyId && propertyId !== "ALL") {
      allBeds = allBeds.filter((b) => b.property_id === propertyId);
    }
    const totalBeds = allBeds.length;
    const occupiedBeds = allBeds.filter((b) => b.status === "OCCUPIED").length;
    const availableBeds = allBeds.filter((b) => b.status === "AVAILABLE").length;
    const maintenanceBeds = allBeds.filter((b) => b.status === "MAINTENANCE").length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const propertyBreakdown = properties.map((p) => {
      const pBeds = state.beds.filter((b) => b.property_id === p.id);
      const pOcc = pBeds.filter((b) => b.status === "OCCUPIED").length;
      const pAvail = pBeds.filter((b) => b.status === "AVAILABLE").length;
      return {
        propertyId: p.id,
        propertyName: p.name,
        totalBeds: pBeds.length,
        occupiedBeds: pOcc,
        availableBeds: pAvail,
        occupancyRate: pBeds.length > 0 ? Math.round((pOcc / pBeds.length) * 100) : 0,
      };
    });

    const roomTypeMap: Record<string, { total: number; occupied: number }> = {};
    for (const r of state.rooms) {
      if (propertyId && propertyId !== "ALL" && r.property_id !== propertyId) continue;
      const rBeds = state.beds.filter((b) => b.room_id === r.id);
      const occ = rBeds.filter((b) => b.status === "OCCUPIED").length;
      if (!roomTypeMap[r.room_type]) {
        roomTypeMap[r.room_type] = { total: 0, occupied: 0 };
      }
      roomTypeMap[r.room_type].total += rBeds.length;
      roomTypeMap[r.room_type].occupied += occ;
    }

    const roomTypeBreakdown = Object.entries(roomTypeMap).map(([roomType, data]) => ({
      roomType,
      totalBeds: data.total,
      occupiedBeds: data.occupied,
      occupancyRate: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
    }));

    return {
      totalBeds,
      occupiedBeds,
      availableBeds,
      maintenanceBeds,
      occupancyRate,
      propertyBreakdown,
      roomTypeBreakdown,
    };
  }

  async getRevenueReport(propertyId?: string, year: string = "2026"): Promise<RevenueReport> {
    let records = state.rentRecords;
    if (propertyId && propertyId !== "ALL") {
      records = records.filter((r) => r.property_id === propertyId);
    }
    const totalBilled = records.reduce((sum, r) => sum + r.total_amount, 0);
    const totalCollected = records.reduce((sum, r) => sum + r.paid_amount, 0);
    const totalPending = records.reduce((sum, r) => sum + r.pending_amount, 0);
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    const months = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
    const monthNames: Record<string, string> = {
      "2026-05": "May",
      "2026-06": "Jun",
      "2026-07": "Jul",
      "2026-08": "Aug",
      "2026-09": "Sep",
      "2026-10": "Oct",
    };

    const monthlyTrend = months.map((m) => {
      const mRecords = records.filter((r) => r.month === m);
      const billed = mRecords.reduce((s, r) => s + r.total_amount, 0);
      const collected = mRecords.reduce((s, r) => s + r.paid_amount, 0);
      const pending = mRecords.reduce((s, r) => s + r.pending_amount, 0);
      return {
        month: monthNames[m] || m,
        billed: billed || 1050000,
        collected: collected || (billed ? Math.round(billed * 0.92) : 960000),
        pending: pending || (billed ? Math.round(billed * 0.08) : 90000),
        collectionRate: billed > 0 ? Math.round((collected / billed) * 100) : 92,
      };
    });

    let payments = state.payments.filter((p) => p.status === "COMPLETED");
    if (propertyId && propertyId !== "ALL") {
      payments = payments.filter((p) => p.property_id === propertyId);
    }
    const totalPayAmount = payments.reduce((s, p) => s + p.amount, 0) || 1;
    const methodMap: Record<string, { amount: number; count: number }> = {};
    for (const p of payments) {
      if (!methodMap[p.payment_method]) methodMap[p.payment_method] = { amount: 0, count: 0 };
      methodMap[p.payment_method].amount += p.amount;
      methodMap[p.payment_method].count += 1;
    }
    const paymentMethodDistribution = Object.entries(methodMap).map(([method, d]) => ({
      method,
      amount: d.amount,
      count: d.count,
      percentage: Math.round((d.amount / totalPayAmount) * 100),
    }));

    return {
      totalBilled,
      totalCollected,
      totalPending,
      collectionRate,
      monthlyTrend,
      paymentMethodDistribution: paymentMethodDistribution.length
        ? paymentMethodDistribution
        : [
            { method: "UPI", amount: 620000, count: 48, percentage: 65 },
            { method: "BANK_TRANSFER", amount: 240000, count: 18, percentage: 25 },
            { method: "CASH", amount: 95500, count: 8, percentage: 10 },
          ],
    };
  }

  async getExpenseReport(propertyId?: string, year: string = "2026"): Promise<ExpenseReport> {
    let expenses = state.expenses;
    if (propertyId && propertyId !== "ALL") {
      expenses = expenses.filter((e) => e.property_id === propertyId);
    }
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const catMap: Record<string, number> = {};
    for (const e of expenses) {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    }
    const categoryBreakdown = Object.entries(catMap).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }));

    const monthlyTrend = [
      { month: "May", amount: 195000 },
      { month: "Jun", amount: 210000 },
      { month: "Jul", amount: 205000 },
      { month: "Aug", amount: 225000 },
      { month: "Sep", amount: 215000 },
      { month: "Oct", amount: totalExpenses || 218000 },
    ];

    return {
      totalExpenses,
      categoryBreakdown,
      monthlyTrend,
    };
  }

  async getProfitLossStatement(propertyId?: string, month: string = "2026-10"): Promise<ProfitLossStatement> {
    let records = state.rentRecords.filter((r) => !month || r.month === month);
    if (propertyId && propertyId !== "ALL") {
      records = records.filter((r) => r.property_id === propertyId);
    }
    const grossRentalIncome = records.reduce((s, r) => s + r.paid_amount, 0);
    const lateFees = records.reduce((s, r) => s + r.late_fee, 0) || 7500;
    const otherIncome = 12000;
    const totalRevenue = grossRentalIncome + lateFees + otherIncome;

    let expenses = state.expenses;
    if (propertyId && propertyId !== "ALL") {
      expenses = expenses.filter((e) => e.property_id === propertyId);
    }
    const operatingExpenses: Record<string, number> = {};
    for (const e of expenses) {
      operatingExpenses[e.category] = (operatingExpenses[e.category] || 0) + e.amount;
    }
    const totalExpenses = Object.values(operatingExpenses).reduce((s, a) => s + a, 0);
    const netOperatingIncome = totalRevenue - totalExpenses;
    const operatingMargin = totalRevenue > 0 ? Math.round((netOperatingIncome / totalRevenue) * 100) : 0;

    return {
      month,
      grossRentalIncome,
      lateFees,
      otherIncome,
      totalRevenue,
      operatingExpenses,
      totalExpenses,
      netOperatingIncome,
      operatingMargin,
    };
  }

  async getTenantAgingReport(propertyId?: string): Promise<TenantAgingReport> {
    let overdueRecords = state.rentRecords.filter(
      (r) => r.status === "OVERDUE" || (r.status === "PENDING" && r.pending_amount > 0)
    );
    if (propertyId && propertyId !== "ALL") {
      overdueRecords = overdueRecords.filter((r) => r.property_id === propertyId);
    }

    const totalPending = overdueRecords.reduce((s, r) => s + r.pending_amount, 0);

    const delinquentTenants = overdueRecords.map((r, idx) => {
      const t = state.tenants.find((tenant) => tenant.id === r.tenant_id);
      const days = (idx + 1) * 7 + 3;
      return {
        tenantId: r.tenant_id,
        tenantName: r.tenant_name || t?.name || "Resident",
        roomNumber: r.room_number || t?.assigned_room_number || "101",
        propertyName: t?.assigned_property_name || "PG Property",
        phone: t?.phone || "+91 98765 43210",
        pendingAmount: r.pending_amount,
        overdueDays: days,
        status: r.status,
      };
    });

    const currentDues = delinquentTenants.filter((d) => d.overdueDays <= 15).reduce((s, d) => s + d.pendingAmount, 0);
    const days30Dues = delinquentTenants.filter((d) => d.overdueDays > 15 && d.overdueDays <= 30).reduce((s, d) => s + d.pendingAmount, 0);
    const days60Dues = delinquentTenants.filter((d) => d.overdueDays > 30 && d.overdueDays <= 60).reduce((s, d) => s + d.pendingAmount, 0);
    const days90PlusDues = delinquentTenants.filter((d) => d.overdueDays > 60).reduce((s, d) => s + d.pendingAmount, 0);

    return {
      totalPending,
      currentDues,
      days30Dues,
      days60Dues,
      days90PlusDues,
      delinquentTenants,
    };
  }
}

export class MockSubscriptionService implements ISubscriptionService {
  async getCurrentSubscription(orgId?: string) {
    const planId = state.organization.subscription_plan_id || "GROWTH";
    const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.GROWTH;
    const usage = {
      properties: state.properties.length,
      beds: state.beds.length,
      tenants: state.tenants.length,
      staff: state.staff.length,
    };
    const limits = {
      properties: plan.max_properties,
      beds: plan.max_beds,
      tenants: plan.max_tenants,
      staff: plan.max_staff,
    };
    return { plan, usage, limits };
  }

  async getAvailablePlans() {
    return Object.values(SUBSCRIPTION_PLANS);
  }

  async changePlan(orgId: string, planId: string): Promise<boolean> {
    state.organization.subscription_plan_id = planId;
    return true;
  }
}

export class MockSuperAdminService implements ISuperAdminService {
  async getSystemMetrics(): Promise<SuperAdminMetrics> {
    const totalOrg = state.saasOrganizations.length;
    const activeSubs = state.saasOrganizations.filter((o) => o.status === "ACTIVE").length;
    const totalProps = state.saasOrganizations.reduce((s, o) => s + o.propertiesCount, 0);
    const totalBeds = state.saasOrganizations.reduce((s, o) => s + o.bedsCount, 0);
    const totalTenants = state.saasOrganizations.reduce((s, o) => s + o.tenantsCount, 0);
    const mrr = state.saasOrganizations.reduce((s, o) => s + o.mrr, 0);
    return {
      totalOrganizations: totalOrg,
      activeSubscriptions: activeSubs,
      totalProperties: totalProps,
      totalBeds: totalBeds,
      totalTenants: totalTenants,
      monthlyRecurringRevenue: mrr,
      systemHealth: {
        status: "HEALTHY",
        uptimePercentage: 99.98,
        databaseLatencyMs: 14,
        activeConnections: 48,
        storageUsedGB: 18.4,
      },
    };
  }

  async getOrganizations() {
    return state.saasOrganizations;
  }

  async getSupportTickets(): Promise<SaaSSupportTicket[]> {
    return state.supportTickets;
  }

  async updateSupportTicket(
    id: string,
    status: SaaSSupportTicket["status"],
    adminResponse?: string
  ): Promise<SaaSSupportTicket> {
    const t = state.supportTickets.find((item) => item.id === id);
    if (!t) throw new Error("Support ticket not found");
    t.status = status;
    if (adminResponse) t.admin_response = adminResponse;
    t.updated_at = new Date().toISOString();
    return t;
  }

  async changeOrgPlan(orgId: string, planId: string): Promise<boolean> {
    const org = state.saasOrganizations.find((o) => o.id === orgId);
    if (org) {
      org.planId = planId;
      const p = SUBSCRIPTION_PLANS[planId];
      if (p) org.mrr = p.price_monthly;
    }
    if (orgId === state.organization.id) {
      state.organization.subscription_plan_id = planId;
    }
    return true;
  }
}



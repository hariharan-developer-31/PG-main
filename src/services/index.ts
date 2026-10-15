import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  MockAuthService,
  MockOrganizationService,
  MockPropertyService,
  MockBuildingService,
  MockFloorService,
  MockRoomService,
  MockBedService,
  MockTenantService,
  MockRentService,
  MockPaymentService,
  MockExpenseService,
  MockComplaintService,
  MockMaintenanceService,
  MockVisitorService,
  MockStaffService,
  MockAnnouncementService,
  MockNotificationService,
  MockDashboardService,
  MockReportService,
  MockSubscriptionService,
  MockSuperAdminService,
} from "./mock";
import { SupabaseAuthService, SupabasePropertyService } from "./supabase";
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
} from "./interfaces";

class ServiceContainer {
  public auth: IAuthService;
  public organization: IOrganizationService;
  public property: IPropertyService;
  public building: IBuildingService;
  public floor: IFloorService;
  public room: IRoomService;
  public bed: IBedService;
  public tenant: ITenantService;
  public rent: IRentService;
  public payment: IPaymentService;
  public expense: IExpenseService;
  public complaint: IComplaintService;
  public maintenance: IMaintenanceService;
  public visitor: IVisitorService;
  public staff: IStaffService;
  public announcement: IAnnouncementService;
  public notification: INotificationService;
  public dashboard: IDashboardService;
  public report: IReportService;
  public subscription: ISubscriptionService;
  public superadmin: ISuperAdminService;

  constructor() {
    if (isSupabaseConfigured) {
      this.auth = new SupabaseAuthService();
      this.property = new SupabasePropertyService();
      this.building = new MockBuildingService();
      this.floor = new MockFloorService();
      this.organization = new MockOrganizationService();
      this.room = new MockRoomService();
      this.bed = new MockBedService();
      this.tenant = new MockTenantService();
      this.rent = new MockRentService();
      this.payment = new MockPaymentService();
      this.expense = new MockExpenseService();
      this.complaint = new MockComplaintService();
      this.maintenance = new MockMaintenanceService();
      this.visitor = new MockVisitorService();
      this.staff = new MockStaffService();
      this.announcement = new MockAnnouncementService();
      this.notification = new MockNotificationService();
      this.dashboard = new MockDashboardService();
      this.report = new MockReportService();
      this.subscription = new MockSubscriptionService();
      this.superadmin = new MockSuperAdminService();
    } else {
      this.auth = new MockAuthService();
      this.organization = new MockOrganizationService();
      this.property = new MockPropertyService();
      this.building = new MockBuildingService();
      this.floor = new MockFloorService();
      this.room = new MockRoomService();
      this.bed = new MockBedService();
      this.tenant = new MockTenantService();
      this.rent = new MockRentService();
      this.payment = new MockPaymentService();
      this.expense = new MockExpenseService();
      this.complaint = new MockComplaintService();
      this.maintenance = new MockMaintenanceService();
      this.visitor = new MockVisitorService();
      this.staff = new MockStaffService();
      this.announcement = new MockAnnouncementService();
      this.notification = new MockNotificationService();
      this.dashboard = new MockDashboardService();
      this.report = new MockReportService();
      this.subscription = new MockSubscriptionService();
      this.superadmin = new MockSuperAdminService();
    }
  }
}

export const services = new ServiceContainer();
export * from "./interfaces";

import {
  Organization,
  UserProfile,
  Property,
  Building,
  Floor,
  Room,
  Bed,
  Tenant,
  RentRecord,
  RentStatus,
  Payment,
  PaymentAudit,
  Expense,
  Complaint,
  MaintenanceTicket,
  Announcement,
  Visitor,
  StaffMember,
  NotificationItem,
  ActivityLog,
  SaaSSupportTicket,
} from "@/types";

export const initialOrganization: Organization = {
  id: "org-prime-living",
  name: "Prime Living Hospitality",
  slug: "prime-living",
  phone: "+91 98765 43210",
  email: "contact@primeliving.com",
  address: "1204 100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038",
  currency: "INR",
  timezone: "Asia/Kolkata",
  rent_due_day: 5,
  late_fee_amount: 250,
  receipt_prefix: "REC",
  subscription_plan_id: "GROWTH",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-10-01T00:00:00Z",
};

export const mockUsers: Record<string, UserProfile> = {
  SUPER_ADMIN: {
    id: "user-super-admin",
    email: "admin@stack.com",
    full_name: "Platform SuperAdmin",
    phone: "+91 99999 00000",
    role: "SUPER_ADMIN",
    organization_id: "org-stack-cloud",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  OWNER: {
    id: "user-hari-owner",
    email: "hari@primeliving.com",
    full_name: "Hari Prasad",
    phone: "+91 98765 00001",
    role: "OWNER",
    organization_id: "org-prime-living",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  MANAGER: {
    id: "user-rajesh-mgr",
    email: "rajesh.mgr@primeliving.com",
    full_name: "Rajesh Sharma",
    phone: "+91 98765 00002",
    role: "MANAGER",
    organization_id: "org-prime-living",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  STAFF: {
    id: "user-suresh-staff",
    email: "suresh.staff@primeliving.com",
    full_name: "Suresh Gowda",
    phone: "+91 98765 00004",
    role: "STAFF",
    organization_id: "org-prime-living",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  TENANT: {
    id: "user-arun-tenant",
    email: "arun.kumar@gmail.com",
    full_name: "Arun Kumar",
    phone: "+91 98765 00003",
    role: "TENANT",
    organization_id: "org-prime-living",
    avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    created_at: "2026-04-10T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
};

export const initialProperties: Property[] = [
  {
    id: "prop-urban-nest",
    organization_id: "org-prime-living",
    name: "Urban Nest PG",
    code: "UN-01",
    address: "Plot 42, 4th Cross, Koramangala 5th Block",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560034",
    phone: "+91 98765 11001",
    email: "urbannest@primeliving.com",
    image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    total_buildings: 1,
    total_rooms: 25,
    total_beds: 60,
    occupied_beds: 51,
    available_beds: 7,
    monthly_revenue: 432500,
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "prop-green-view",
    organization_id: "org-prime-living",
    name: "Green View PG",
    code: "GV-02",
    address: "Tower B, Outer Ring Road, Bellandur",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560103",
    phone: "+91 98765 11002",
    email: "greenview@primeliving.com",
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
    total_buildings: 1,
    total_rooms: 20,
    total_beds: 50,
    occupied_beds: 43,
    available_beds: 5,
    monthly_revenue: 365000,
    created_at: "2026-02-15T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "prop-blue-haven",
    organization_id: "org-prime-living",
    name: "Blue Haven PG",
    code: "BH-03",
    address: "15th Main, HSR Layout Sector 4",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560102",
    phone: "+91 98765 11003",
    email: "bluehaven@primeliving.com",
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    total_buildings: 1,
    total_rooms: 16,
    total_beds: 40,
    occupied_beds: 35,
    available_beds: 4,
    monthly_revenue: 298000,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
];

export const initialBuildings: Building[] = [
  {
    id: "bld-prop-urban-nest",
    property_id: "prop-urban-nest",
    organization_id: "org-prime-living",
    name: "Block A - Main Tower",
    code: "UN-BLK-A",
    total_floors: 4,
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "bld-prop-urban-nest-b",
    property_id: "prop-urban-nest",
    organization_id: "org-prime-living",
    name: "Block B - Executive Suites",
    code: "UN-BLK-B",
    total_floors: 2,
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "bld-prop-green-view",
    property_id: "prop-green-view",
    organization_id: "org-prime-living",
    name: "Green View Premier Block",
    code: "GV-MAIN",
    total_floors: 4,
    created_at: "2026-02-15T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "bld-prop-blue-haven",
    property_id: "prop-blue-haven",
    organization_id: "org-prime-living",
    name: "Haven Residence Tower",
    code: "BH-MAIN",
    total_floors: 3,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  },
];

export const initialFloors: Floor[] = [
  { id: "floor-1", building_id: "bld-prop-urban-nest", property_id: "prop-urban-nest", organization_id: "org-prime-living", floor_number: 1, name: "Ground & First Floor", created_at: "2026-01-10T00:00:00Z", updated_at: "2026-10-01T00:00:00Z" },
  { id: "floor-2", building_id: "bld-prop-urban-nest", property_id: "prop-urban-nest", organization_id: "org-prime-living", floor_number: 2, name: "Second Floor", created_at: "2026-01-10T00:00:00Z", updated_at: "2026-10-01T00:00:00Z" },
  { id: "floor-3", building_id: "bld-prop-urban-nest", property_id: "prop-urban-nest", organization_id: "org-prime-living", floor_number: 3, name: "Third Floor", created_at: "2026-01-10T00:00:00Z", updated_at: "2026-10-01T00:00:00Z" },
  { id: "floor-4", building_id: "bld-prop-urban-nest", property_id: "prop-urban-nest", organization_id: "org-prime-living", floor_number: 4, name: "Fourth Floor (Terrace)", created_at: "2026-01-10T00:00:00Z", updated_at: "2026-10-01T00:00:00Z" },
];

// Helper to generate 150 beds and 50+ rooms
export function generateRoomsAndBeds(): { rooms: Room[]; beds: Bed[] } {
  const rooms: Room[] = [];
  const beds: Bed[] = [];

  const propertiesConfig = [
    { propId: "prop-urban-nest", roomCount: 25, startNum: 101 },
    { propId: "prop-green-view", roomCount: 20, startNum: 101 },
    { propId: "prop-blue-haven", roomCount: 16, startNum: 101 },
  ];

  propertiesConfig.forEach((cfg) => {
    for (let i = 0; i < cfg.roomCount; i++) {
      const floorNum = Math.floor(i / 6) + 1;
      const roomIndex = (i % 6) + 1;
      const roomNumber = `${floorNum}0${roomIndex}`;
      const roomId = `room-${cfg.propId}-${roomNumber}`;

      let capacity = 2;
      let roomType: Room["room_type"] = "DOUBLE";
      let rent = 8500;

      if (i % 5 === 0) {
        capacity = 1;
        roomType = "SINGLE";
        rent = 14000;
      } else if (i % 5 === 4) {
        capacity = 3;
        roomType = "TRIPLE";
        rent = 7000;
      }

      const roomBeds: Bed[] = [];
      const letters = ["A", "B", "C", "D"];

      for (let b = 0; b < capacity; b++) {
        const bedId = `bed-${roomId}-${letters[b]}`;
        // Determine status: predominantly occupied
        let status: Bed["status"] = "OCCUPIED";
        if (i === 2 && b === 0) status = "AVAILABLE";
        if (i === 5 && b === 1) status = "AVAILABLE";
        if (i === 11 && b === 0) status = "AVAILABLE";
        if (i === 14 && b === 1) status = "MAINTENANCE";

        const bed: Bed = {
          id: bedId,
          room_id: roomId,
          property_id: cfg.propId,
          organization_id: "org-prime-living",
          bed_number: `${roomNumber}-${letters[b]}`,
          status,
          monthly_rent: rent,
          created_at: "2026-01-15T00:00:00Z",
          updated_at: "2026-10-01T00:00:00Z",
        };
        beds.push(bed);
        roomBeds.push(bed);
      }

      rooms.push({
        id: roomId,
        building_id: `bld-${cfg.propId}`,
        floor_id: `floor-${floorNum}`,
        property_id: cfg.propId,
        organization_id: "org-prime-living",
        room_number: roomNumber,
        room_type: roomType,
        capacity,
        monthly_rent: rent,
        security_deposit: rent * 2,
        amenities: ["Attached Washroom", "High-Speed WiFi", "Wardrobe", "Air Conditioner"],
        status: roomBeds.every((b) => b.status === "OCCUPIED")
          ? "OCCUPIED"
          : roomBeds.some((b) => b.status === "MAINTENANCE")
          ? "MAINTENANCE"
          : "AVAILABLE",
        beds: roomBeds,
        created_at: "2026-01-15T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      });
    }
  });

  return { rooms, beds };
}

const { rooms: generatedRooms, beds: generatedBeds } = generateRoomsAndBeds();
export const initialRooms = generatedRooms;
export const initialBeds = generatedBeds;

// 50+ Tenants
const tenantNames = [
  "Arun Kumar", "Rohan Verma", "Priya Sharma", "Sneha Rao", "Aditya Nair",
  "Vikram Singh", "Ananya Deshmukh", "Karan Patel", "Divya Pillai", "Rahul Joshi",
  "Megha Kulkarni", "Manish Tiwari", "Tanvi Bhat", "Siddharth Jain", "Pooja Hegde",
  "Gautam Menon", "Rhea Sengupta", "Nikhil Chopra", "Swati Reddy", "Abhishek Dubey",
  "Shruti Saxena", "Varun Kapoor", "Kavya Murthy", "Deepak Rawat", "Neha Agarwal",
  "Saurabh Mishra", "Ishita Roy", "Harsh Vardhan", "Shreya Bhattacharya", "Mohit Bansal",
  "Aarti Nambiar", "Pranav Kulkarni", "Simran Kaur", "Tarun Goel", "Bhavna Chawla",
  "Raghav Gupta", "Ankit Mathur", "Sangeeta Rao", "Akash Shinde", "Pallavi Joshi",
  "Chetan Patil", "Preeti Varma", "Mayank Chauhan", "Rashmi Iyer", "Vikas Sheth",
  "Nandini Sen", "Kunal Grover", "Monika Das", "Ashish Somani", "Geeta Pillai",
  "Suraj Yadav", "Ritika Saxena", "Naveen Prasad", "Lata Sundaram"
];

export const initialTenants: Tenant[] = tenantNames.map((name, index) => {
  const propIndex = index % 3;
  const prop = initialProperties[propIndex];
  const assignedBed = initialBeds.filter((b) => b.property_id === prop.id)[index] || initialBeds[0];
  const rent = assignedBed?.monthly_rent || 8500;

  return {
    id: `tenant-${index + 1}`,
    organization_id: "org-prime-living",
    property_id: prop.id,
    assigned_property_name: prop.name,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    phone: `+91 98${(76000000 + index * 137).toString().slice(0, 8)}`,
    id_proof_type: index % 4 === 0 ? "PASSPORT" : "AADHAAR",
    id_proof_number: `4932 ${1000 + index * 3} ${7000 + index * 5}`,
    permanent_address: `${10 + index}, Green Avenue, Sector ${index % 9 + 1}`,
    city: "Bengaluru",
    state: "Karnataka",
    emergency_contact_name: `Parent of ${name.split(" ")[0]}`,
    emergency_contact_phone: "+91 98450 12345",
    emergency_contact_relation: "Parent",
    company_or_college: index % 2 === 0 ? "Infosys Ltd" : "Wipro Technologies",
    joining_date: "2026-03-01",
    status: index === 3 ? "NOTICE_PERIOD" : "ACTIVE",
    assigned_bed_id: assignedBed.id,
    assigned_bed_number: assignedBed.bed_number,
    assigned_room_number: assignedBed.bed_number.split("-")[0],
    monthly_rent: rent,
    security_deposit: rent * 2,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  };
});

// Tenant Identity Documents
export const initialTenantDocuments = [
  {
    id: "doc-1",
    tenant_id: "tenant-1",
    document_type: "ID_PROOF" as const,
    title: "Government Aadhaar Card (Front & Back)",
    file_url: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80",
    file_size: 1420000,
    mime_type: "application/pdf",
    created_at: "2026-03-01T10:00:00Z",
  },
  {
    id: "doc-2",
    tenant_id: "tenant-1",
    document_type: "AGREEMENT" as const,
    title: "11-Month PG Residency Tenancy Agreement",
    file_url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    file_size: 2150000,
    mime_type: "application/pdf",
    created_at: "2026-03-01T10:15:00Z",
  },
  {
    id: "doc-3",
    tenant_id: "tenant-1",
    document_type: "POLICE_VERIFICATION" as const,
    title: "Police Verification Acknowledgment Receipt",
    file_url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
    file_size: 890000,
    mime_type: "image/jpeg",
    created_at: "2026-03-05T14:20:00Z",
  },
  {
    id: "doc-4",
    tenant_id: "tenant-2",
    document_type: "ID_PROOF" as const,
    title: "Passport Copy & Address Proof",
    file_url: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&auto=format&fit=crop&q=80",
    file_size: 1250000,
    mime_type: "application/pdf",
    created_at: "2026-03-02T11:00:00Z",
  },
];

// Payments
export const initialPayments: Payment[] = [
  {
    id: "pay-101",
    receipt_number: "REC-2026-00101",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    tenant_id: "tenant-1",
    tenant_name: "Arun Kumar",
    amount: 8500,
    payment_date: "2026-10-03",
    payment_method: "UPI",
    transaction_id: "UPI/3294829384/OKICICI",
    notes: "October rent paid in full",
    status: "COMPLETED",
    created_by: "user-rajesh-mgr",
    created_by_name: "Rajesh Sharma",
    created_at: "2026-10-03T10:15:00Z",
    updated_at: "2026-10-03T10:15:00Z",
  },
  {
    id: "pay-102",
    receipt_number: "REC-2026-00102",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    tenant_id: "tenant-2",
    tenant_name: "Rohan Verma",
    amount: 14000,
    payment_date: "2026-10-04",
    payment_method: "BANK_TRANSFER",
    transaction_id: "NEFT-HDFC-99382",
    notes: "Single occupancy October fee",
    status: "COMPLETED",
    created_by: "user-rajesh-mgr",
    created_by_name: "Rajesh Sharma",
    created_at: "2026-10-04T11:45:00Z",
    updated_at: "2026-10-04T11:45:00Z",
  },
  {
    id: "pay-103",
    receipt_number: "REC-2026-00103",
    organization_id: "org-prime-living",
    property_id: "prop-green-view",
    tenant_id: "tenant-3",
    tenant_name: "Priya Sharma",
    amount: 8500,
    payment_date: "2026-10-04",
    payment_method: "UPI",
    transaction_id: "GPay-19283746",
    notes: "Room 102 Bed A October",
    status: "COMPLETED",
    created_by: "user-hari-owner",
    created_by_name: "Hari Prasad",
    created_at: "2026-10-04T14:30:00Z",
    updated_at: "2026-10-04T14:30:00Z",
  },
  {
    id: "pay-104",
    receipt_number: "REC-2026-00104",
    organization_id: "org-prime-living",
    property_id: "prop-blue-haven",
    tenant_id: "tenant-4",
    tenant_name: "Sneha Rao",
    amount: 7000,
    payment_date: "2026-10-05",
    payment_method: "CASH",
    notes: "Cash handed to property desk",
    status: "COMPLETED",
    created_by: "user-rajesh-mgr",
    created_by_name: "Rajesh Sharma",
    created_at: "2026-10-05T09:15:00Z",
    updated_at: "2026-10-05T09:15:00Z",
  },
  {
    id: "pay-105",
    receipt_number: "REC-2026-00105",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    tenant_id: "tenant-5",
    tenant_name: "Aditya Nair",
    amount: 8500,
    payment_date: "2026-10-05",
    payment_method: "UPI",
    transaction_id: "PhonePe-991823",
    notes: "Standard UPI",
    status: "COMPLETED",
    created_by: "user-rajesh-mgr",
    created_by_name: "Rajesh Sharma",
    created_at: "2026-10-05T12:00:00Z",
    updated_at: "2026-10-05T12:00:00Z",
  },
];

// Expenses
export const initialExpenses: Expense[] = [
  {
    id: "exp-1",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    property_name: "Urban Nest PG",
    category: "ELECTRICITY",
    amount: 42500,
    date: "2026-10-02",
    vendor: "BESCOM Bangalore",
    description: "Commercial meter electricity consumption for September",
    created_by: "user-hari-owner",
    created_at: "2026-10-02T10:00:00Z",
    updated_at: "2026-10-02T10:00:00Z",
  },
  {
    id: "exp-2",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    property_name: "Urban Nest PG",
    category: "FOOD",
    amount: 110000,
    date: "2026-10-03",
    vendor: "Annapurna Caterers",
    description: "Breakfast, lunch, and dinner monthly catering contract",
    created_by: "user-rajesh-mgr",
    created_at: "2026-10-03T11:00:00Z",
    updated_at: "2026-10-03T11:00:00Z",
  },
  {
    id: "exp-3",
    organization_id: "org-prime-living",
    property_id: "prop-green-view",
    property_name: "Green View PG",
    category: "WATER",
    amount: 18000,
    date: "2026-10-04",
    vendor: "Cauvery Water Tankers",
    description: "12 water tankers delivery for domestic storage tanks",
    created_by: "user-rajesh-mgr",
    created_at: "2026-10-04T12:00:00Z",
    updated_at: "2026-10-04T12:00:00Z",
  },
  {
    id: "exp-4",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    property_name: "Urban Nest PG",
    category: "INTERNET",
    amount: 12500,
    date: "2026-10-05",
    vendor: "ACT Fibernet Enterprise",
    description: "High speed commercial 1 Gbps dedicated leased line",
    created_by: "user-hari-owner",
    created_at: "2026-10-05T09:30:00Z",
    updated_at: "2026-10-05T09:30:00Z",
  },
  {
    id: "exp-5",
    organization_id: "org-prime-living",
    property_id: "prop-blue-haven",
    property_name: "Blue Haven PG",
    category: "CLEANING",
    amount: 35000,
    date: "2026-10-06",
    vendor: "CleanCare Facilities",
    description: "Daily housekeeping and sanitization staff payroll",
    created_by: "user-rajesh-mgr",
    created_at: "2026-10-06T15:00:00Z",
    updated_at: "2026-10-06T15:00:00Z",
  },
];

// Complaints
export const initialComplaints: Complaint[] = [
  {
    id: "comp-1",
    ticket_number: "TKT-1024",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    property_name: "Urban Nest PG",
    room_number: "204",
    tenant_id: "tenant-1",
    tenant_name: "Arun Kumar",
    tenant_phone: "+91 98765 00003",
    category: "ELECTRICITY",
    title: "Air Conditioner cooling efficiency low",
    description: "The 1.5-ton AC in room 204 takes over 2 hours to cool and makes a mild buzzing noise.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    assigned_staff_name: "Suresh Gowda (Maintenance)",
    created_at: "2026-10-10T08:30:00Z",
    updated_at: "2026-10-10T11:00:00Z",
  },
  {
    id: "comp-2",
    ticket_number: "TKT-1025",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    property_name: "Urban Nest PG",
    room_number: "102",
    tenant_id: "tenant-3",
    tenant_name: "Priya Sharma",
    category: "PLUMBING",
    title: "Geyser hot water flow restricted",
    description: "The bathroom geyser safety valve is dripping and the output stream is very thin.",
    priority: "HIGH",
    status: "OPEN",
    created_at: "2026-10-11T09:15:00Z",
    updated_at: "2026-10-11T09:15:00Z",
  },
  {
    id: "comp-3",
    ticket_number: "TKT-1020",
    organization_id: "org-prime-living",
    property_id: "prop-green-view",
    property_name: "Green View PG",
    room_number: "301",
    tenant_id: "tenant-5",
    tenant_name: "Aditya Nair",
    category: "INTERNET",
    title: "WiFi router 3rd floor repeater offline",
    description: "The hallway mesh repeater node had its red LED flashing since morning.",
    priority: "MEDIUM",
    status: "RESOLVED",
    assigned_staff_name: "Suresh Gowda",
    resolved_at: "2026-10-09T14:00:00Z",
    resolution_notes: "Reconfigured DHCP lease and power cycled mesh extender.",
    created_at: "2026-10-09T10:00:00Z",
    updated_at: "2026-10-09T14:00:00Z",
  },
];

// Activity Logs
export const initialActivityLogs: ActivityLog[] = [
  {
    id: "act-1",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    user_id: "user-rajesh-mgr",
    user_name: "Rajesh Sharma",
    user_role: "MANAGER",
    action: "RECORD_PAYMENT",
    entity: "Payment",
    entity_id: "REC-2026-00105",
    details: "Recorded ₹8,500 UPI payment from Aditya Nair (Room 201)",
    created_at: "2026-10-05T12:00:00Z",
  },
  {
    id: "act-2",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    user_id: "user-hari-owner",
    user_name: "Hari Prasad",
    user_role: "OWNER",
    action: "CREATE_TENANT",
    entity: "Tenant",
    entity_id: "tenant-54",
    details: "Checked in Lata Sundaram into Room 104 Bed B",
    created_at: "2026-10-04T15:30:00Z",
  },
  {
    id: "act-3",
    organization_id: "org-prime-living",
    property_id: "prop-green-view",
    user_id: "user-suresh-staff",
    user_name: "Suresh Gowda",
    user_role: "STAFF",
    action: "RESOLVE_COMPLAINT",
    entity: "Complaint",
    entity_id: "TKT-1020",
    details: "Resolved 3rd floor WiFi mesh repeater issue",
    created_at: "2026-10-09T14:00:00Z",
  },
  {
    id: "act-4",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    user_id: "user-hari-owner",
    user_name: "Hari Prasad",
    user_role: "OWNER",
    action: "ADD_EXPENSE",
    entity: "Expense",
    entity_id: "exp-1",
    details: "Recorded electricity utility bill payment ₹42,500",
    created_at: "2026-10-02T10:00:00Z",
  },
];

// Notifications
export const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    user_id: "user-hari-owner",
    title: "Monthly Rent Due Reminder",
    message: "12 tenants have rent pending for October. Send automated WhatsApp reminders?",
    type: "RENT_DUE",
    read: false,
    link_url: "/rent",
    created_at: "2026-10-05T08:00:00Z",
  },
  {
    id: "notif-2",
    user_id: "user-hari-owner",
    title: "New High Priority Complaint",
    message: "Priya Sharma reported Geyser leakage in Room 102 (Urban Nest PG)",
    type: "COMPLAINT_UPDATE",
    read: false,
    link_url: "/complaints",
    created_at: "2026-10-11T09:16:00Z",
  },
  {
    id: "notif-3",
    user_id: "user-hari-owner",
    title: "Payment Received ₹8,500",
    message: "Arun Kumar cleared rent for Room 204 via UPI",
    type: "PAYMENT_RECEIVED",
    read: true,
    link_url: "/payments",
    created_at: "2026-10-03T10:16:00Z",
  },
];

// Visitors
export const initialVisitors: Visitor[] = [
  {
    id: "vis-1",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    tenant_id: "tenant-1",
    tenant_name: "Arun Kumar",
    room_number: "204",
    visitor_name: "Karthik Raja",
    visitor_phone: "+91 99887 76655",
    purpose: "College project discussion",
    id_number: "AADHAAR 8832",
    check_in_time: "2026-10-15T10:30:00Z",
    status: "CHECKED_IN",
    created_at: "2026-10-15T10:30:00Z",
  },
  {
    id: "vis-2",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    tenant_id: "tenant-2",
    tenant_name: "Rohan Verma",
    room_number: "101",
    visitor_name: "Sunil Verma",
    visitor_phone: "+91 98112 23344",
    purpose: "Family visit / Parent",
    id_number: "DL DL04-2018",
    check_in_time: "2026-10-14T16:00:00Z",
    check_out_time: "2026-10-14T19:30:00Z",
    status: "CHECKED_OUT",
    created_at: "2026-10-14T16:00:00Z",
  },
];

// Staff
export const initialStaff: StaffMember[] = [
  {
    id: "staff-1",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    name: "Suresh Gowda",
    role: "MAINTENANCE",
    phone: "+91 98765 00004",
    email: "suresh@primeliving.com",
    salary: 24000,
    joining_date: "2025-06-01",
    status: "ACTIVE",
    created_at: "2025-06-01T00:00:00Z",
  },
  {
    id: "staff-2",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    name: "Ram Bahadur",
    role: "SECURITY",
    phone: "+91 98765 88990",
    salary: 19000,
    joining_date: "2025-08-15",
    status: "ACTIVE",
    created_at: "2025-08-15T00:00:00Z",
  },
  {
    id: "staff-3",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    name: "Laxmi Bai",
    role: "CLEANER",
    phone: "+91 98765 77665",
    salary: 16000,
    joining_date: "2025-09-01",
    status: "ACTIVE",
    created_at: "2025-09-01T00:00:00Z",
  },
];

// October 2026 Monthly Rent Roll
export const initialRentRecords: RentRecord[] = initialTenants.map((t, idx) => {
  const isPaid = idx % 5 === 0 || idx % 5 === 1;
  const isPartial = idx % 5 === 2;
  const isOverdue = idx % 5 === 3;

  let status: RentStatus = "PENDING";
  let paidAmount = 0;
  let lateFee = 0;
  let discount = 0;
  const additionalCharges = 0;

  if (isPaid) {
    status = "PAID";
    paidAmount = t.monthly_rent;
  } else if (isPartial) {
    status = "PARTIAL";
    paidAmount = Math.floor(t.monthly_rent * 0.5);
  } else if (isOverdue) {
    status = "OVERDUE";
    lateFee = 250;
    paidAmount = 0;
  } else if (idx === 4) {
    status = "WAIVED";
    discount = t.monthly_rent;
    paidAmount = 0;
  }

  const totalAmount = t.monthly_rent + additionalCharges + lateFee - discount;
  const pendingAmount = Math.max(0, totalAmount - paidAmount);

  return {
    id: `rent-${t.id}-2026-10`,
    organization_id: t.organization_id,
    property_id: t.property_id,
    tenant_id: t.id,
    tenant_name: t.name,
    room_number: t.assigned_room_number || "101",
    month: "2026-10",
    base_rent: t.monthly_rent,
    additional_charges: additionalCharges,
    discount,
    late_fee: lateFee,
    total_amount: totalAmount,
    paid_amount: paidAmount,
    pending_amount: pendingAmount,
    due_date: "2026-10-05",
    status,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
  };
});

// Audit trail for financial modifications & reversals
export const initialPaymentAudits: PaymentAudit[] = [
  {
    id: "audit-1",
    payment_id: "pay-101",
    action: "ADJUSTMENT",
    old_data: { notes: "October rent" },
    new_data: { notes: "October rent paid in full via UPI" },
    reason: "Updated transaction notes with bank UTR verification",
    performed_by: "Rajesh Sharma (Manager)",
    created_at: "2026-10-03T11:00:00Z",
  },
  {
    id: "audit-2",
    payment_id: "pay-104",
    action: "VOID",
    old_data: { status: "COMPLETED", amount: 7000 },
    new_data: { status: "VOIDED", amount: 7000 },
    reason: "Duplicate manual cash receipt entry for Sneha Rao",
    performed_by: "Hari Prasad (Owner)",
    created_at: "2026-10-05T16:30:00Z",
  },
];

// Maintenance Tickets
export const initialMaintenanceTickets: MaintenanceTicket[] = [
  {
    id: "mnt-1",
    ticket_number: "MNT-2026-081",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    issue: "Solar Water Heater Tank Descaling & Element Replacement",
    category: "PLUMBING",
    priority: "HIGH",
    assigned_staff_id: "staff-1",
    assigned_staff_name: "Suresh Gowda",
    estimated_cost: 8500,
    actual_cost: 8200,
    status: "IN_PROGRESS",
    created_at: "2026-10-12T09:00:00Z",
    updated_at: "2026-10-12T14:00:00Z",
  },
  {
    id: "mnt-2",
    ticket_number: "MNT-2026-082",
    organization_id: "org-prime-living",
    property_id: "prop-green-view",
    issue: "RO Water Purifier Filter Cartridge Routine Swap",
    category: "WATER",
    priority: "MEDIUM",
    assigned_staff_id: "staff-1",
    assigned_staff_name: "CleanCare Team",
    estimated_cost: 3200,
    status: "OPEN",
    created_at: "2026-10-14T11:00:00Z",
    updated_at: "2026-10-14T11:00:00Z",
  },
  {
    id: "mnt-3",
    ticket_number: "MNT-2026-079",
    organization_id: "org-prime-living",
    property_id: "prop-blue-haven",
    issue: "Elevator Annual Maintenance Safety Inspection & Lubrication",
    category: "LIFT",
    priority: "HIGH",
    assigned_staff_id: "staff-1",
    assigned_staff_name: "Otis Elevator Tech",
    estimated_cost: 15000,
    actual_cost: 15000,
    status: "RESOLVED",
    completion_date: "2026-10-08",
    created_at: "2026-10-08T08:00:00Z",
    updated_at: "2026-10-08T16:00:00Z",
  },
];

// Resident Announcements
export const initialAnnouncements: Announcement[] = [
  {
    id: "anc-1",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    title: "Diwali Celebration & Special Festive Dinner Buffet",
    description: "Join us for a grand festive celebration and traditional dinner buffet at the central dining hall on October 31st from 7:30 PM onwards.",
    target_audience: "ALL",
    priority: "NORMAL",
    start_date: "2026-10-15",
    end_date: "2026-11-02",
    status: "ACTIVE",
    created_at: "2026-10-15T09:00:00Z",
  },
  {
    id: "anc-2",
    organization_id: "org-prime-living",
    property_id: "prop-urban-nest",
    title: "Scheduled Water Tank Sanitization Maintenance",
    description: "Domestic water supply will be temporarily paused between 11:00 AM and 3:00 PM this Sunday for bi-monthly overhead tank chlorination.",
    target_audience: "PROPERTY",
    priority: "URGENT",
    start_date: "2026-10-14",
    end_date: "2026-10-19",
    status: "ACTIVE",
    created_at: "2026-10-14T08:00:00Z",
  },
];

export const initialSupportTickets: SaaSSupportTicket[] = [
  {
    id: "sup-101",
    organization_id: "org-prime-living",
    organization_name: "Prime Living Hospitality",
    user_name: "Hari Prasad",
    user_email: "hari@primeliving.com",
    subject: "Custom GST percentage field for catering invoices",
    category: "BILLING",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    message: "We need an option to separate 5% mess food GST from the 12% room stay GST on rent vouchers.",
    admin_response: "Under review by engineering. Scheduled for v2.4 rollout.",
    created_at: "2026-10-12T10:00:00Z",
    updated_at: "2026-10-13T14:30:00Z",
  },
  {
    id: "sup-102",
    organization_id: "org-comfort-stays",
    organization_name: "Comfort Stays Coliving",
    user_name: "Ramesh Iyer",
    user_email: "ramesh@comfortstays.in",
    subject: "Bulk CSV resident import with past payment history",
    category: "ONBOARDING",
    priority: "HIGH",
    status: "RESOLVED",
    message: "Migrating 180 residents from old Excel sheets, need assistance with column mapping.",
    admin_response: "Mapping template provided and 180 records migrated successfully into Comfort Stays database.",
    created_at: "2026-10-09T08:15:00Z",
    updated_at: "2026-10-10T11:00:00Z",
  },
  {
    id: "sup-103",
    organization_id: "org-metro-hostels",
    organization_name: "Metro Student Hostels",
    user_name: "Pooja Varma",
    user_email: "pooja@metrohostels.com",
    subject: "Biometric turnstile API webhook integration",
    category: "FEATURE_REQUEST",
    priority: "LOW",
    status: "OPEN",
    message: "Can we link our eSSL fingerprint turnstiles directly to STACK visitor and resident attendance?",
    created_at: "2026-10-14T16:20:00Z",
    updated_at: "2026-10-14T16:20:00Z",
  },
];

export const initialSaaSOrganizations = [
  {
    id: "org-prime-living",
    name: "Prime Living Hospitality",
    ownerName: "Hari Prasad",
    planId: "GROWTH",
    propertiesCount: 3,
    bedsCount: 121,
    tenantsCount: 54,
    mrr: 2499,
    status: "ACTIVE" as const,
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "org-comfort-stays",
    name: "Comfort Stays Coliving",
    ownerName: "Ramesh Iyer",
    planId: "PRO",
    propertiesCount: 8,
    bedsCount: 420,
    tenantsCount: 395,
    mrr: 4999,
    status: "ACTIVE" as const,
    created_at: "2026-02-10T00:00:00Z",
  },
  {
    id: "org-metro-hostels",
    name: "Metro Student Hostels",
    ownerName: "Pooja Varma",
    planId: "STARTER",
    propertiesCount: 1,
    bedsCount: 48,
    tenantsCount: 42,
    mrr: 999,
    status: "ACTIVE" as const,
    created_at: "2026-03-01T00:00:00Z",
  },
  {
    id: "org-zenith-pg",
    name: "Zenith Luxury PG Fleet",
    ownerName: "Vikram Malhotra",
    planId: "ENTERPRISE",
    propertiesCount: 22,
    bedsCount: 1850,
    tenantsCount: 1720,
    mrr: 11999,
    status: "ACTIVE" as const,
    created_at: "2026-04-12T00:00:00Z",
  },
];




import { SubscriptionPlan } from "@/types";

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  STARTER: {
    id: "STARTER",
    name: "STARTER",
    display_name: "Starter Tier",
    price_monthly: 999,
    price_yearly: 9990,
    max_properties: 1,
    max_beds: 50,
    max_tenants: 50,
    max_staff: 2,
    features: [
      "1 PG Property Branch",
      "Up to 50 Resident Beds",
      "Room & Bed Allocation",
      "Manual Rent Tracking",
      "Gate Security Log",
      "Standard Email Support",
    ],
  },
  GROWTH: {
    id: "GROWTH",
    name: "GROWTH",
    display_name: "Growth Tier",
    price_monthly: 2499,
    price_yearly: 24990,
    max_properties: 5,
    max_beds: 300,
    max_tenants: 300,
    max_staff: 10,
    features: [
      "Up to 5 PG Branches",
      "Up to 300 Resident Beds",
      "Automated Monthly Billing",
      "Self-Service Tenant Portal",
      "Helpdesk & Maintenance Work Orders",
      "P&L Accounting & Expense Tracking",
      "Priority WhatsApp & Email Support",
    ],
  },
  PRO: {
    id: "PRO",
    name: "PRO",
    display_name: "Professional Tier",
    price_monthly: 4999,
    price_yearly: 49990,
    max_properties: 15,
    max_beds: 1000,
    max_tenants: 1000,
    max_staff: 30,
    features: [
      "Up to 15 PG Branches",
      "Up to 1,000 Resident Beds",
      "Full Business Intelligence & Recharts",
      "Multi-Role Granular RBAC Permissions",
      "Custom GST Receipt Branding",
      "Visitor Pass & Gate Checkout App",
      "Dedicated 24/7 Account Manager",
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "ENTERPRISE",
    display_name: "Enterprise Fleet",
    price_monthly: 11999,
    price_yearly: 119990,
    max_properties: 999,
    max_beds: 99999,
    max_tenants: 99999,
    max_staff: 999,
    features: [
      "Unlimited PG Branches & Hostels",
      "Unlimited Beds & Resident Capacity",
      "Unlimited Staff & Manager Logins",
      "Custom Domain & White-label App",
      "Direct PostgreSQL / REST API Webhooks",
      "99.99% Guaranteed SLA Uptime",
      "Dedicated On-premise Migration Support",
    ],
  },
};

export type LimitMetric = "properties" | "beds" | "tenants" | "staff";

export function checkPlanLimit(
  planId: string,
  metric: LimitMetric,
  currentCount: number
): { allowed: boolean; limit: number; remaining: number } {
  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.GROWTH;
  let limit = 0;
  switch (metric) {
    case "properties":
      limit = plan.max_properties;
      break;
    case "beds":
      limit = plan.max_beds;
      break;
    case "tenants":
      limit = plan.max_tenants;
      break;
    case "staff":
      limit = plan.max_staff;
      break;
  }
  const remaining = Math.max(0, limit - currentCount);
  return {
    allowed: currentCount < limit,
    limit,
    remaining,
  };
}

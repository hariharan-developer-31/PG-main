import { getSupabaseClient } from "@/lib/supabase/client";
import {
  IAuthService,
  IPropertyService,
} from "@/services/interfaces";
import { UserProfile, Property } from "@/types";

export class SupabaseAuthService implements IAuthService {
  async login(email: string): Promise<UserProfile> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: "password123",
    });
    if (error) throw error;
    return {
      id: data.user.id,
      email: data.user.email || email,
      full_name: data.user.user_metadata?.full_name || "User",
      role: (data.user.user_metadata?.role as UserProfile["role"]) || "OWNER",
      organization_id: data.user.user_metadata?.organization_id || "org-1",
      created_at: data.user.created_at,
      updated_at: data.user.created_at,
    };
  }

  async signup(data: {
    email: string;
    fullName: string;
    organizationName: string;
    phone: string;
  }) {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: "password123",
      options: {
        data: {
          full_name: data.fullName,
          organization_name: data.organizationName,
          phone: data.phone,
          role: "OWNER",
        },
      },
    });
    if (error) throw error;
    const user: UserProfile = {
      id: authData.user?.id || `user-${Date.now()}`,
      email: data.email,
      full_name: data.fullName,
      phone: data.phone,
      role: "OWNER",
      organization_id: "org-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const organization = {
      id: "org-1",
      name: data.organizationName,
      slug: data.organizationName.toLowerCase().replace(/\s+/g, "-"),
      currency: "INR",
      timezone: "Asia/Kolkata",
      rent_due_day: 5,
      late_fee_amount: 250,
      receipt_prefix: "REC",
      subscription_plan_id: "GROWTH",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return { user, organization };
  }

  async logout(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return {
      id: data.user.id,
      email: data.user.email || "",
      full_name: data.user.user_metadata?.full_name || "User",
      role: (data.user.user_metadata?.role as UserProfile["role"]) || "OWNER",
      organization_id: data.user.user_metadata?.organization_id || "org-1",
      created_at: data.user.created_at,
      updated_at: data.user.created_at,
    };
  }

  async resetPassword(email: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return !error;
  }

  async switchDemoRole(): Promise<UserProfile> {
    throw new Error("Demo role switching is only available in mock provider mode.");
  }
}

export class SupabasePropertyService implements IPropertyService {
  async getProperties(orgId?: string): Promise<Property[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    let query = supabase.from("properties").select("*");
    if (orgId) {
      query = query.eq("organization_id", orgId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Property[];
  }

  async getPropertyById(id: string): Promise<Property | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase.from("properties").select("*").eq("id", id).single();
    if (error) return null;
    return data as Property;
  }

  async createProperty(data: Omit<Property, "id" | "created_at" | "updated_at">): Promise<Property> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data: result, error } = await supabase.from("properties").insert(data).select().single();
    if (error) throw error;
    return result as Property;
  }

  async updateProperty(id: string, data: Partial<Property>): Promise<Property> {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data: result, error } = await supabase
      .from("properties")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return result as Property;
  }

  async deleteProperty(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    return !error;
  }
}

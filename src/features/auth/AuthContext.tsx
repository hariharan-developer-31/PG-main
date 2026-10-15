"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, Organization, UserRole, Permission, ROLE_PERMISSIONS } from "@/types";
import { services } from "@/services";

interface AuthContextType {
  user: UserProfile | null;
  organization: Organization | null;
  selectedPropertyId: string;
  setSelectedPropertyId: (id: string) => void;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  signup: (data: { email: string; fullName: string; organizationName: string; phone: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await services.auth.getCurrentUser();
        setUser(currentUser);
        if (currentUser?.organization_id) {
          const org = await services.organization.getOrganization(currentUser.organization_id);
          setOrganization(org);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await services.auth.login(email);
      setUser(loggedUser);
      const org = await services.organization.getOrganization(loggedUser.organization_id);
      setOrganization(org);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: { email: string; fullName: string; organizationName: string; phone: string }) => {
    setIsLoading(true);
    try {
      const result = await services.auth.signup(data);
      setUser(result.user);
      setOrganization(result.organization);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await services.auth.logout();
    setUser(null);
  };

  const switchRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const switchedUser = await services.auth.switchDemoRole(
        role === "ADMIN" ? "OWNER" : role
      );
      setUser(switchedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const allowed = ROLE_PERMISSIONS[user.role] || [];
    return allowed.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        selectedPropertyId,
        setSelectedPropertyId,
        isLoading,
        login,
        signup,
        logout,
        switchRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

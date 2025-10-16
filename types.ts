// Fix: Define and export all necessary types for the application.
// This resolves circular dependencies and missing type definitions across the app.
export type Organization = {
  id: string;
  created_at: string;
  code: string;
  name: string;
  status: string;
};

export type Branch = {
  id: string;
  created_at: string;
  code: string;
  name: string;
  status: string;
  organization_id: string;
  organization?: { name: string } | null;
};

export type Warehouse = {
  id: string;
  created_at: string;
  code: string;
  name: string;
  address: string | null;
  status: string;
  branch_id: string;
  branch?: Branch | null;
};

export type Location = {
  id: string;
  created_at: string;
  code: string;
  name: string;
  status: string;
  warehouse_id: string;
  type: "storage" | "receiving" | "staging";
  capacity: number | null;
  allow_mixed_lot: boolean;
  warehouse?: { name: string } | null;
};

export interface Database {
  public: {
    Tables: {
      organization: {
        Row: Organization;
        // Fix: Add Insert and Update types to fix Supabase client type inference for mutations.
        Insert: {
          code: string;
          name: string;
        };
        Update: Partial<Omit<Organization, "id" | "created_at">>;
      };
      branch: {
        Row: Branch;
        // Fix: Add Insert and Update types to fix Supabase client type inference for mutations.
        Insert: {
          code: string;
          name: string;
          organization_id: string;
        };
        Update: Partial<Omit<Branch, "id" | "created_at" | "organization">>;
      };
      warehouse: {
        Row: Warehouse;
        // Fix: Add Insert and Update types to fix Supabase client type inference for mutations.
        Insert: {
          code: string;
          name: string;
          address?: string | null;
          branch_id: string;
        };
        Update: Partial<Omit<Warehouse, "id" | "created_at" | "branch">>;
      };
      location: {
        Row: Location;
        // Fix: Add Insert and Update types to fix Supabase client type inference for mutations.
        Insert: Omit<Location, "id" | "created_at" | "status" | "warehouse">;
        Update: Partial<Omit<Location, "id" | "created_at" | "warehouse">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

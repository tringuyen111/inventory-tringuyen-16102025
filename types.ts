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
  zone: string | null;
  bin: string | null;
  warehouse?: { name: string } | null;
};

export interface Database {
  public: {
    Tables: {
      organization: {
        Row: Organization;
      };
      branch: {
        Row: Branch;
      };
      warehouse: {
        Row: Warehouse;
      };
      location: {
        Row: Location;
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

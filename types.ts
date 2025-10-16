export type Organization = {
  id: string;
  code: string;
  name: string;
  status: string;
  created_at: string;
};

export type Warehouse = {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  address: string | null;
  status: string;
  created_at: string;
  organization?: Pick<Organization, 'name'>; // For joined data
};

// Simplified Supabase types for the purpose of this demo
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organization: {
        Row: Organization;
        // FIX: Replaced Omit with an explicit type for Insert.
        // The Supabase client expects optional properties for fields with database defaults (like id, created_at, status),
        // rather than having them completely omitted from the type. This fixes the type error on insert operations.
        Insert: {
          id?: string;
          code: string;
          name: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Organization>;
      },
      warehouse: {
        Row: Warehouse;
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          name: string;
          address?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Warehouse>;
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
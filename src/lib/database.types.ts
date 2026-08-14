/**
 * Hand-maintained mirror of `supabase/schema.sql`.
 *
 * Once the schema is live you can regenerate this file instead:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 *
 * Insert/Update shapes are written out longhand rather than derived with
 * `Omit`/`Partial` helpers — postgrest-js resolves its overloads against these
 * types directly, and intersection types make it fall back to `never`.
 */

export type PropertyType = "land" | "house" | "apartment" | "commercial";
export type PropertyStatus = "available" | "pending" | "sold";
export type UserRole = "admin" | "agent";

export type PropertyRow = {
  id: string;
  title: string;
  slug: string | null;
  type: PropertyType;
  price: number;
  price_unit: string;
  area: number | null;
  area_unit: string;
  address: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  status: PropertyStatus;
  description: string | null;
  road_access: string | null;
  featured: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyImageRow = {
  id: string;
  property_id: string;
  storage_path: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
};

export type InquiryRow = {
  id: string;
  property_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  handled: boolean;
  created_at: string;
};

export type SiteSettingsRow = {
  id: number;
  name: string;
  tagline: string | null;
  phone: string;
  whatsapp: string | null;
  email: string;
  address: string;
  lat: number | null;
  lng: number | null;
  updated_at: string;
};

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: PropertyRow;
        Insert: {
          id?: string;
          title: string;
          slug?: string | null;
          type: PropertyType;
          price: number;
          price_unit?: string;
          area?: number | null;
          area_unit?: string;
          address: string;
          city?: string | null;
          lat?: number | null;
          lng?: number | null;
          status?: PropertyStatus;
          description?: string | null;
          road_access?: string | null;
          featured?: boolean;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string | null;
          type?: PropertyType;
          price?: number;
          price_unit?: string;
          area?: number | null;
          area_unit?: string;
          address?: string;
          city?: string | null;
          lat?: number | null;
          lng?: number | null;
          status?: PropertyStatus;
          description?: string | null;
          road_access?: string | null;
          featured?: boolean;
          created_by?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      property_images: {
        Row: PropertyImageRow;
        Insert: {
          id?: string;
          property_id: string;
          storage_path: string;
          alt?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          storage_path?: string;
          alt?: string | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          name?: string;
          phone?: string | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          name?: string;
          phone?: string | null;
          role?: UserRole;
        };
        Relationships: [];
      };
      inquiries: {
        Row: InquiryRow;
        Insert: {
          id?: string;
          property_id?: string | null;
          name: string;
          phone: string;
          email?: string | null;
          message?: string | null;
          handled?: boolean;
          created_at?: string;
        };
        Update: {
          property_id?: string | null;
          name?: string;
          phone?: string;
          email?: string | null;
          message?: string | null;
          handled?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: SiteSettingsRow;
        Insert: {
          id?: number;
          name?: string;
          tagline?: string | null;
          phone?: string;
          whatsapp?: string | null;
          email?: string;
          address?: string;
          lat?: number | null;
          lng?: number | null;
          updated_at?: string;
        };
        Update: {
          name?: string;
          tagline?: string | null;
          phone?: string;
          whatsapp?: string | null;
          email?: string;
          address?: string;
          lat?: number | null;
          lng?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      can_edit_property: { Args: { p_id: string }; Returns: boolean };
    };
    Enums: {
      property_type: PropertyType;
      property_status: PropertyStatus;
      user_role: UserRole;
    };
    CompositeTypes: { [_ in never]: never };
  };
}

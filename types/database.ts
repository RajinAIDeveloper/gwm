export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      inquiries: {
        Row: {
          buyer_email: string;
          buyer_id: string;
          buyer_name: string | null;
          created_at: string;
          id: string;
          listing_id: string;
          message: string;
        };
        Insert: {
          buyer_email: string;
          buyer_id: string;
          buyer_name?: string | null;
          created_at?: string;
          id?: string;
          listing_id: string;
          message: string;
        };
        Update: {
          buyer_email?: string;
          buyer_id?: string;
          buyer_name?: string | null;
          created_at?: string;
          id?: string;
          listing_id?: string;
          message?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inquiries_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquiries_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      listings: {
        Row: {
          category: string;
          created_at: string;
          description: string;
          id: string;
          image_paths: string[];
          price_per_kg: string;
          quantity_kg: string;
          seller_id: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          description: string;
          id?: string;
          image_paths?: string[];
          price_per_kg: string;
          quantity_kg: string;
          seller_id: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string;
          id?: string;
          image_paths?: string[];
          price_per_kg?: string;
          quantity_kg?: string;
          seller_id?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: "seller" | "buyer" | "admin";
    };
    CompositeTypes: Record<string, never>;
  };
};

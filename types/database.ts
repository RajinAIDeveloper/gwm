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
          buyer_last_read_at: string | null;
          buyer_name: string | null;
          created_at: string;
          id: string;
          last_message_at: string;
          listing_id: string;
          message: string;
          seller_last_read_at: string | null;
        };
        Insert: {
          buyer_email: string;
          buyer_id: string;
          buyer_last_read_at?: string | null;
          buyer_name?: string | null;
          created_at?: string;
          id?: string;
          last_message_at?: string;
          listing_id: string;
          message: string;
          seller_last_read_at?: string | null;
        };
        Update: {
          buyer_email?: string;
          buyer_id?: string;
          buyer_last_read_at?: string | null;
          buyer_name?: string | null;
          created_at?: string;
          id?: string;
          last_message_at?: string;
          listing_id?: string;
          message?: string;
          seller_last_read_at?: string | null;
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
      inquiry_messages: {
        Row: {
          created_at: string;
          id: string;
          inquiry_id: string;
          message: string;
          sender_id: string;
          sender_role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          inquiry_id: string;
          message: string;
          sender_id: string;
          sender_role: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          created_at?: string;
          id?: string;
          inquiry_id?: string;
          message?: string;
          sender_id?: string;
          sender_role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [
          {
            foreignKeyName: "inquiry_messages_inquiry_id_fkey";
            columns: ["inquiry_id"];
            isOneToOne: false;
            referencedRelation: "inquiries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inquiry_messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      listing_wishlists: {
        Row: {
          buyer_id: string;
          created_at: string;
          id: string;
          listing_id: string;
        };
        Insert: {
          buyer_id: string;
          created_at?: string;
          id?: string;
          listing_id: string;
        };
        Update: {
          buyer_id?: string;
          created_at?: string;
          id?: string;
          listing_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_wishlists_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listing_wishlists_listing_id_fkey";
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
      seller_follows: {
        Row: {
          buyer_id: string;
          created_at: string;
          id: string;
          seller_id: string;
        };
        Insert: {
          buyer_id: string;
          created_at?: string;
          id?: string;
          seller_id: string;
        };
        Update: {
          buyer_id?: string;
          created_at?: string;
          id?: string;
          seller_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seller_follows_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "seller_follows_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      supplier_ratings: {
        Row: {
          buyer_id: string;
          created_at: string;
          id: string;
          rating: number;
          seller_id: string;
          updated_at: string;
        };
        Insert: {
          buyer_id: string;
          created_at?: string;
          id?: string;
          rating: number;
          seller_id: string;
          updated_at?: string;
        };
        Update: {
          buyer_id?: string;
          created_at?: string;
          id?: string;
          rating?: number;
          seller_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_ratings_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supplier_ratings_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
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

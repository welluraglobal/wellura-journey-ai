export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          price: number
          professional_id: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          price: number
          professional_id: string
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          price?: number
          professional_id?: string
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          professional_id: string | null
          read: boolean | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          professional_id?: string | null
          read?: boolean | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          professional_id?: string | null
          read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          availability: Json | null
          city: string | null
          company_name: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          email_confirmed: boolean | null
          expertise: string | null
          first_name: string | null
          id: string
          last_name: string | null
          lat: number | null
          lng: number | null
          main_goal: string | null
          monthly_earnings: number | null
          notification_preferences: Json | null
          phone: string | null
          quiz_data: Json | null
          rating: number | null
          response_time_avg: unknown | null
          service_areas: string | null
          state: string | null
          stripe_customer_id: string | null
          subscription_expires_at: string | null
          subscription_status: boolean | null
          total_jobs_completed: number | null
          total_ratings: number | null
          type: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          availability?: Json | null
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          email_confirmed?: boolean | null
          expertise?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          lat?: number | null
          lng?: number | null
          main_goal?: string | null
          monthly_earnings?: number | null
          notification_preferences?: Json | null
          phone?: string | null
          quiz_data?: Json | null
          rating?: number | null
          response_time_avg?: unknown | null
          service_areas?: string | null
          state?: string | null
          stripe_customer_id?: string | null
          subscription_expires_at?: string | null
          subscription_status?: boolean | null
          total_jobs_completed?: number | null
          total_ratings?: number | null
          type?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          availability?: Json | null
          city?: string | null
          company_name?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          email_confirmed?: boolean | null
          expertise?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          lat?: number | null
          lng?: number | null
          main_goal?: string | null
          monthly_earnings?: number | null
          notification_preferences?: Json | null
          phone?: string | null
          quiz_data?: Json | null
          rating?: number | null
          response_time_avg?: unknown | null
          service_areas?: string | null
          state?: string | null
          stripe_customer_id?: string | null
          subscription_expires_at?: string | null
          subscription_status?: boolean | null
          total_jobs_completed?: number | null
          total_ratings?: number | null
          type?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          professional_id: string | null
          professional_response: string | null
          professional_response_at: string | null
          rating: number
        }
        Insert: {
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          professional_id?: string | null
          professional_response?: string | null
          professional_response_at?: string | null
          rating: number
        }
        Update: {
          client_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          professional_id?: string | null
          professional_response?: string | null
          professional_response_at?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_matches: {
        Row: {
          created_at: string | null
          distance: number | null
          id: string
          professional_id: string | null
          service_request_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          distance?: number | null
          id?: string
          professional_id?: string | null
          service_request_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          distance?: number | null
          id?: string
          professional_id?: string | null
          service_request_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_matches_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_matches_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          address: string
          created_at: string | null
          customer_id: string | null
          id: string
          lat: number | null
          lng: number | null
          preferred_date: string | null
          requirements: string | null
          service_type: string
          status: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          preferred_date?: string | null
          requirements?: string | null
          service_type: string
          status?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          preferred_date?: string | null
          requirements?: string | null
          service_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          id: string
          price: number
          service_tupe: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          service_tupe: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          service_tupe?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          created_at: string
          days_per_week: number
          id: string
          is_active: boolean | null
          location: string
          main_goal: string | null
          plan_data: Json
          preferred_time: string
          training_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_per_week: number
          id?: string
          is_active?: boolean | null
          location: string
          main_goal?: string | null
          plan_data: Json
          preferred_time: string
          training_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_per_week?: number
          id?: string
          is_active?: boolean | null
          location?: string
          main_goal?: string | null
          plan_data?: Json
          preferred_time?: string
          training_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          location: string
          name: string
          subscription_status: boolean
          type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          location: string
          name: string
          subscription_status?: boolean
          type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          location?: string
          name?: string
          subscription_status?: boolean
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_subscription_status: {
        Args: { user_id: string }
        Returns: boolean
      }
      match_professionals: {
        Args: { request_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

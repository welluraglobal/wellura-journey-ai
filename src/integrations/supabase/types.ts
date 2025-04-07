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
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      match_professionals: {
        Args: {
          request_id: string
        }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

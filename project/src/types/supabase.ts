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
      polls: {
        Row: {
          id: string
          created_by: string
          title: string
          description: string | null
          is_anonymous: boolean
          is_public: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
          category: string | null
          subcategory: string | null
          points_enabled: boolean
          points_per_completion: number
          theme_id: string | null
          template_id: string | null
          conditional_logic: Json | null
        }
        Insert: {
          id?: string
          created_by: string
          title: string
          description?: string | null
          is_anonymous?: boolean
          is_public?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
          category?: string | null
          subcategory?: string | null
          points_enabled?: boolean
          points_per_completion?: number
          theme_id?: string | null
          template_id?: string | null
          conditional_logic?: Json | null
        }
        Update: {
          id?: string
          created_by?: string
          title?: string
          description?: string | null
          is_anonymous?: boolean
          is_public?: boolean
          expires_at?: string | null
          created_at?: string
          updated_at?: string
          category?: string | null
          subcategory?: string | null
          points_enabled?: boolean
          points_per_completion?: number
          theme_id?: string | null
          template_id?: string | null
          conditional_logic?: Json | null
        }
      }
      // Add other table types here
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
  }
}
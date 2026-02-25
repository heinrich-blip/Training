export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          criteria_type: string
          criteria_value: number
          description: string
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      custom_workouts: {
        Row: {
          created_at: string
          exercises: Json
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercises?: Json
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercises?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cycling_routes: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          distance: number | null
          elevation_data: Json | null
          id: string
          is_public: boolean | null
          name: string
          route_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          distance?: number | null
          elevation_data?: Json | null
          id?: string
          is_public?: boolean | null
          name: string
          route_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          distance?: number | null
          elevation_data?: Json | null
          id?: string
          is_public?: boolean | null
          name?: string
          route_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          current_value: number | null
          description: string | null
          goal_type: string
          id: string
          target_date: string | null
          target_value: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type: string
          id?: string
          target_date?: string | null
          target_value: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          goal_type?: string
          id?: string
          target_date?: string | null
          target_value?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_exercise_images: {
        Row: {
          id: string
          user_id: string
          exercise_name: string
          image_url: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_name: string
          image_url: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_name?: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      gym_challenge_progress: {
        Row: {
          challenge_start_date: string | null
          completed_days: number[] | null
          created_at: string
          current_day: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_start_date?: string | null
          completed_days?: number[] | null
          created_at?: string
          current_day?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_start_date?: string | null
          completed_days?: number[] | null
          created_at?: string
          current_day?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gym_exercises: {
        Row: {
          id: string
          name: string
          description: string | null
          instructions: string[] | null
          muscles_worked: string[] | null
          muscle_group: string
          image_url: string | null
          video_url: string | null
          difficulty: string | null
          equipment: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          instructions?: string[] | null
          muscles_worked?: string[] | null
          muscle_group: string
          image_url?: string | null
          video_url?: string | null
          difficulty?: string | null
          equipment?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          instructions?: string[] | null
          muscles_worked?: string[] | null
          muscle_group?: string
          image_url?: string | null
          video_url?: string | null
          difficulty?: string | null
          equipment?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      gym_workout_days: {
        Row: {
          id: string
          day_number: number
          name: string
          phase: number
          phase_label: string
          created_at: string
        }
        Insert: {
          id?: string
          day_number: number
          name: string
          phase: number
          phase_label: string
          created_at?: string
        }
        Update: {
          id?: string
          day_number?: number
          name?: string
          phase?: number
          phase_label?: string
          created_at?: string
        }
        Relationships: []
      }
      gym_workout_day_exercises: {
        Row: {
          id: string
          workout_day_id: string | null
          exercise_id: string | null
          sets: number
          reps: string
          rest_seconds: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_day_id?: string | null
          exercise_id?: string | null
          sets?: number
          reps?: string
          rest_seconds?: number
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_day_id?: string | null
          exercise_id?: string | null
          sets?: number
          reps?: string
          rest_seconds?: number
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_workout_day_exercises_workout_day_id_fkey"
            columns: ["workout_day_id"]
            referencedRelation: "gym_workout_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_workout_day_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            referencedRelation: "gym_exercises"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          calories: number | null
          created_at: string
          distance: number | null
          duration: number
          exercises: Json | null
          id: string
          intensity: number | null
          notes: string | null
          punches: number | null
          route_data: Json | null
          speed: number | null
          updated_at: string
          user_id: string
          workout_type: string
        }
        Insert: {
          calories?: number | null
          created_at?: string
          distance?: number | null
          duration?: number
          exercises?: Json | null
          id?: string
          intensity?: number | null
          notes?: string | null
          punches?: number | null
          route_data?: Json | null
          speed?: number | null
          updated_at?: string
          user_id: string
          workout_type: string
        }
        Update: {
          calories?: number | null
          created_at?: string
          distance?: number | null
          duration?: number
          exercises?: Json | null
          id?: string
          intensity?: number | null
          notes?: string | null
          punches?: number | null
          route_data?: Json | null
          speed?: number | null
          updated_at?: string
          user_id?: string
          workout_type?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
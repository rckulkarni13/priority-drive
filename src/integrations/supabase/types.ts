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
      comments: {
        Row: {
          content: string
          created_date: string
          id: string
          task_id: string
          updated_date: string
          user_id: string
        }
        Insert: {
          content: string
          created_date?: string
          id?: string
          task_id: string
          updated_date?: string
          user_id: string
        }
        Update: {
          content?: string
          created_date?: string
          id?: string
          task_id?: string
          updated_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_comments_task_id"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      domains: {
        Row: {
          created_date: string
          description: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_date?: string
          description?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_date?: string
          description?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      pillar_domains: {
        Row: {
          domain_id: string
          id: string
          pillar_id: string
        }
        Insert: {
          domain_id: string
          id?: string
          pillar_id: string
        }
        Update: {
          domain_id?: string
          id?: string
          pillar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pillar_products_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "strategic_pillars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pillar_products_product_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "domains"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_pillars: {
        Row: {
          created_date: string
          description: string | null
          id: string
          target_timeframe: string
          title: string
          user_id: string
        }
        Insert: {
          created_date?: string
          description?: string | null
          id?: string
          target_timeframe: string
          title: string
          user_id: string
        }
        Update: {
          created_date?: string
          description?: string | null
          id?: string
          target_timeframe?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      task_themes: {
        Row: {
          id: string
          task_id: string
          theme_id: string
        }
        Insert: {
          id?: string
          task_id: string
          theme_id: string
        }
        Update: {
          id?: string
          task_id?: string
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_themes_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_date: string
          description: string | null
          due_date: string | null
          id: string
          parent_task_id: string | null
          prioritized_date: string | null
          prioritized_end_date: string | null
          priority: Database["public"]["Enums"]["priority"]
          status: Database["public"]["Enums"]["status"]
          task_order: number
          title: string
          type: Database["public"]["Enums"]["task_type"]
          user_id: string
        }
        Insert: {
          created_date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          prioritized_date?: string | null
          prioritized_end_date?: string | null
          priority: Database["public"]["Enums"]["priority"]
          status?: Database["public"]["Enums"]["status"]
          task_order?: number
          title: string
          type?: Database["public"]["Enums"]["task_type"]
          user_id: string
        }
        Update: {
          created_date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          parent_task_id?: string | null
          prioritized_date?: string | null
          prioritized_end_date?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          status?: Database["public"]["Enums"]["status"]
          task_order?: number
          title?: string
          type?: Database["public"]["Enums"]["task_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_pillars: {
        Row: {
          id: string
          pillar_id: string
          theme_id: string
        }
        Insert: {
          id?: string
          pillar_id: string
          theme_id: string
        }
        Update: {
          id?: string
          pillar_id?: string
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_pillars_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "strategic_pillars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theme_pillars_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          associated_project: string | null
          created_date: string
          description: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          associated_project?: string | null
          created_date?: string
          description?: string | null
          id?: string
          title: string
          user_id: string
        }
        Update: {
          associated_project?: string | null
          created_date?: string
          description?: string | null
          id?: string
          title?: string
          user_id?: string
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
      priority: "critical" | "high" | "medium" | "low"
      status: "open" | "hold" | "completed"
      task_type: "task" | "subtask"
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
    Enums: {
      priority: ["critical", "high", "medium", "low"],
      status: ["open", "hold", "completed"],
      task_type: ["task", "subtask"],
    },
  },
} as const

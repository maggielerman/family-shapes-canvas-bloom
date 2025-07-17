export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      book_drafts: {
        Row: {
          characters: Json | null
          content: Json | null
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          characters?: Json | null
          content?: Json | null
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          characters?: Json | null
          content?: Json | null
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          role: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          role?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          role?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      family_flows: {
        Row: {
          created_at: string | null
          group_expanded: boolean | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          group_expanded?: boolean | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          group_expanded?: boolean | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      flow_edges: {
        Row: {
          animated: boolean | null
          created_at: string | null
          custom_relationship: string | null
          edge_id: string
          edge_type: string | null
          flow_id: string
          id: string
          label: string | null
          relationship_type: string | null
          relationships: Json | null
          source_node_id: string
          target_node_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          animated?: boolean | null
          created_at?: string | null
          custom_relationship?: string | null
          edge_id: string
          edge_type?: string | null
          flow_id: string
          id?: string
          label?: string | null
          relationship_type?: string | null
          relationships?: Json | null
          source_node_id: string
          target_node_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          animated?: boolean | null
          created_at?: string | null
          custom_relationship?: string | null
          edge_id?: string
          edge_type?: string | null
          flow_id?: string
          id?: string
          label?: string | null
          relationship_type?: string | null
          relationships?: Json | null
          source_node_id?: string
          target_node_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_edges_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "family_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      flow_nodes: {
        Row: {
          created_at: string | null
          draggable: boolean | null
          flow_id: string
          group_id: string | null
          id: string
          label: string
          node_id: string
          node_type: string | null
          position_x: number
          position_y: number
          style: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          draggable?: boolean | null
          flow_id: string
          group_id?: string | null
          id?: string
          label: string
          node_id: string
          node_type?: string | null
          position_x?: number
          position_y?: number
          style?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          draggable?: boolean | null
          flow_id?: string
          group_id?: string | null
          id?: string
          label?: string
          node_id?: string
          node_type?: string | null
          position_x?: number
          position_y?: number
          style?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flow_nodes_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "family_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
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

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      source: {
        Row: {
          id: number
          name: string | null
          suggested_at: string | null
          user_id: number | null
        }
        Insert: {
          id?: number
          name?: string | null
          suggested_at?: string | null
          user_id?: number | null
        }
        Update: {
          id?: number
          name?: string | null
          suggested_at?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      voice_actors: {
        Row: {
          awards: string | null
          bio: string | null
          date_of_birth: string | null
          firstname: string
          id: number
          lastname: string
          nationality: string | null
          social_media_links: Json | null
          years_active: string | null
        }
        Insert: {
          awards?: string | null
          bio?: string | null
          date_of_birth?: string | null
          firstname: string
          id?: number
          lastname: string
          nationality?: string | null
          social_media_links?: Json | null
          years_active?: string | null
        }
        Update: {
          awards?: string | null
          bio?: string | null
          date_of_birth?: string | null
          firstname?: string
          id?: number
          lastname?: string
          nationality?: string | null
          social_media_links?: Json | null
          years_active?: string | null
        }
        Relationships: []
      }
      work: {
        Row: {
          actor_id: number
          content_id: number
          content_type: string | null
          highlight: boolean | null
          id: number
          performance: string | null
          source_id: number | null
          status: string | null
          suggestions: string | null
          voice_actor_id: number | null
        }
        Insert: {
          actor_id: number
          content_id: number
          content_type?: string | null
          highlight?: boolean | null
          id?: number
          performance?: string | null
          source_id?: number | null
          status?: string | null
          suggestions?: string | null
          voice_actor_id?: number | null
        }
        Update: {
          actor_id?: number
          content_id?: number
          content_type?: string | null
          highlight?: boolean | null
          id?: number
          performance?: string | null
          source_id?: number | null
          status?: string | null
          suggestions?: string | null
          voice_actor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "work_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "source"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_voice_actor_id_fkey"
            columns: ["voice_actor_id"]
            isOneToOne: false
            referencedRelation: "voice_actors"
            referencedColumns: ["id"]
          },
        ]
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


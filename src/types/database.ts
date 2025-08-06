
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
      album_media: {
        Row: {
          album_id: string
          created_at: string
          id: string
          media_file_id: string
          sort_order: number
        }
        Insert: {
          album_id: string
          created_at?: string
          id?: string
          media_file_id: string
          sort_order?: number
        }
        Update: {
          album_id?: string
          created_at?: string
          id?: string
          media_file_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "album_media_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "media_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "album_media_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      connections: {
        Row: {
          created_at: string | null
          from_person_id: string | null
          group_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          relationship_type: string
          to_person_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_person_id?: string | null
          group_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          relationship_type: string
          to_person_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_person_id?: string | null
          group_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          relationship_type?: string
          to_person_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_from_person_id_fkey"
            columns: ["from_person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_from_person_id_fkey"
            columns: ["from_person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_from_person_id_fkey"
            columns: ["from_person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_trees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_to_person_id_fkey"
            columns: ["to_person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_to_person_id_fkey"
            columns: ["to_person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_to_person_id_fkey"
            columns: ["to_person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_backups: {
        Row: {
          created_at: string
          id: string
          payload: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          user_id?: string
        }
        Relationships: []
      }
      donor_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          donor_profile_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          donor_profile_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          donor_profile_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_activity_log_donor_profile_id_fkey"
            columns: ["donor_profile_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_message_threads: {
        Row: {
          created_at: string | null
          donor_profile_id: string | null
          id: string
          last_message_at: string | null
          metadata: Json | null
          recipient_user_id: string | null
          status: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          donor_profile_id?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          recipient_user_id?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          donor_profile_id?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          recipient_user_id?: string | null
          status?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_message_threads_donor_profile_id_fkey"
            columns: ["donor_profile_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          sender_id: string | null
          status: string | null
          thread_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          sender_id?: string | null
          status?: string | null
          thread_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          sender_id?: string | null
          status?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "donor_message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_profiles: {
        Row: {
          blood_type: string | null
          created_at: string | null
          cryobank_name: string | null
          donor_number: string | null
          donor_type: string | null
          education_level: string | null
          ethnicity: string | null
          eye_color: string | null
          hair_color: string | null
          height: string | null
          id: string
          interests: string | null
          is_anonymous: boolean | null
          last_health_update: string | null
          medical_history: Json | null
          occupation: string | null
          person_id: string | null
          personal_statement: string | null
          privacy_settings: Json | null
          updated_at: string | null
          user_id: string | null
          weight: string | null
        }
        Insert: {
          blood_type?: string | null
          created_at?: string | null
          cryobank_name?: string | null
          donor_number?: string | null
          donor_type?: string | null
          education_level?: string | null
          ethnicity?: string | null
          eye_color?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          interests?: string | null
          is_anonymous?: boolean | null
          last_health_update?: string | null
          medical_history?: Json | null
          occupation?: string | null
          person_id?: string | null
          personal_statement?: string | null
          privacy_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
          weight?: string | null
        }
        Update: {
          blood_type?: string | null
          created_at?: string | null
          cryobank_name?: string | null
          donor_number?: string | null
          donor_type?: string | null
          education_level?: string | null
          ethnicity?: string | null
          eye_color?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          interests?: string | null
          is_anonymous?: boolean | null
          last_health_update?: string | null
          medical_history?: Json | null
          occupation?: string | null
          person_id?: string | null
          personal_statement?: string | null
          privacy_settings?: Json | null
          updated_at?: string | null
          user_id?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_profiles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_recipient_connections: {
        Row: {
          connected_at: string | null
          connection_type: string | null
          created_at: string | null
          donor_profile_id: string | null
          id: string
          initiated_by: string | null
          metadata: Json | null
          organization_id: string | null
          recipient_user_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          connected_at?: string | null
          connection_type?: string | null
          created_at?: string | null
          donor_profile_id?: string | null
          id?: string
          initiated_by?: string | null
          metadata?: Json | null
          organization_id?: string | null
          recipient_user_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          connected_at?: string | null
          connection_type?: string | null
          created_at?: string | null
          donor_profile_id?: string | null
          id?: string
          initiated_by?: string | null
          metadata?: Json | null
          organization_id?: string | null
          recipient_user_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donor_recipient_connections_donor_profile_id_fkey"
            columns: ["donor_profile_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_recipient_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          blood_type: string | null
          created_at: string | null
          donor_number: string | null
          donor_type: string | null
          education_level: string | null
          ethnicity: string | null
          eye_color: string | null
          hair_color: string | null
          height: string | null
          id: string
          is_anonymous: boolean | null
          medical_history: Json | null
          metadata: Json | null
          notes: string | null
          person_id: string | null
          sperm_bank: string | null
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          blood_type?: string | null
          created_at?: string | null
          donor_number?: string | null
          donor_type?: string | null
          education_level?: string | null
          ethnicity?: string | null
          eye_color?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          is_anonymous?: boolean | null
          medical_history?: Json | null
          metadata?: Json | null
          notes?: string | null
          person_id?: string | null
          sperm_bank?: string | null
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          blood_type?: string | null
          created_at?: string | null
          donor_number?: string | null
          donor_type?: string | null
          education_level?: string | null
          ethnicity?: string | null
          eye_color?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          is_anonymous?: boolean | null
          medical_history?: Json | null
          metadata?: Json | null
          notes?: string | null
          person_id?: string | null
          sperm_bank?: string | null
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donors_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donors_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donors_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      family_invitations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          group_id: string
          id: string
          invitee_email: string
          invitee_id: string | null
          inviter_id: string
          message: string | null
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          group_id: string
          id?: string
          invitee_email: string
          invitee_id?: string | null
          inviter_id: string
          message?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          group_id?: string
          id?: string
          invitee_email?: string
          invitee_id?: string | null
          inviter_id?: string
          message?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      family_tree_folders: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          family_tree_id: string
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          family_tree_id: string
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          family_tree_id?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_tree_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "family_tree_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      family_tree_media: {
        Row: {
          added_by: string
          created_at: string
          description: string | null
          family_tree_id: string
          folder_id: string | null
          id: string
          media_file_id: string
          sort_order: number | null
          tags: string[] | null
        }
        Insert: {
          added_by: string
          created_at?: string
          description?: string | null
          family_tree_id: string
          folder_id?: string | null
          id?: string
          media_file_id: string
          sort_order?: number | null
          tags?: string[] | null
        }
        Update: {
          added_by?: string
          created_at?: string
          description?: string | null
          family_tree_id?: string
          folder_id?: string | null
          id?: string
          media_file_id?: string
          sort_order?: number | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "family_tree_media_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "family_tree_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_tree_media_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      family_tree_members: {
        Row: {
          added_by: string
          created_at: string
          family_tree_id: string
          id: string
          person_id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          added_by: string
          created_at?: string
          family_tree_id: string
          id?: string
          person_id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          added_by?: string
          created_at?: string
          family_tree_id?: string
          id?: string
          person_id?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_tree_members_family_tree_id_fkey"
            columns: ["family_tree_id"]
            isOneToOne: false
            referencedRelation: "family_trees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_tree_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_tree_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_tree_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      family_trees: {
        Row: {
          created_at: string
          description: string | null
          group_id: string | null
          id: string
          name: string
          organization_id: string | null
          settings: Json | null
          tree_data: Json | null
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id?: string | null
          id?: string
          name: string
          organization_id?: string | null
          settings?: Json | null
          tree_data?: Json | null
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          settings?: Json | null
          tree_data?: Json | null
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_trees_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_trees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      function_deployments: {
        Row: {
          changes_description: string | null
          deployed_at: string | null
          function_name: string
          id: string
          status: string | null
          version: string
        }
        Insert: {
          changes_description?: string | null
          deployed_at?: string | null
          function_name: string
          id?: string
          status?: string | null
          version: string
        }
        Update: {
          changes_description?: string | null
          deployed_at?: string | null
          function_name?: string
          id?: string
          status?: string | null
          version?: string
        }
        Relationships: []
      }
      group_donor_database: {
        Row: {
          created_at: string | null
          custom_fields: Json | null
          donor_id: string
          group_id: string
          id: string
          notes: string | null
          updated_at: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
          visibility: string
        }
        Insert: {
          created_at?: string | null
          custom_fields?: Json | null
          donor_id: string
          group_id: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string | null
          custom_fields?: Json | null
          donor_id?: string
          group_id?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_donor_database_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_donor_database_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          group_id: string | null
          id: string
          invitee_email: string
          inviter_id: string | null
          role: string | null
          status: string | null
          token: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          invitee_email: string
          inviter_id?: string | null
          role?: string | null
          status?: string | null
          token?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          group_id?: string | null
          id?: string
          invitee_email?: string
          inviter_id?: string | null
          role?: string | null
          status?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_media: {
        Row: {
          added_by: string
          created_at: string | null
          description: string | null
          folder_id: string | null
          group_id: string
          id: string
          media_file_id: string
          sort_order: number | null
          tags: string[] | null
        }
        Insert: {
          added_by: string
          created_at?: string | null
          description?: string | null
          folder_id?: string | null
          group_id: string
          id?: string
          media_file_id: string
          sort_order?: number | null
          tags?: string[] | null
        }
        Update: {
          added_by?: string
          created_at?: string | null
          description?: string | null
          folder_id?: string | null
          group_id?: string
          id?: string
          media_file_id?: string
          sort_order?: number | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "group_media_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_media_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      group_memberships: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          person_id: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          person_id?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          person_id?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_memberships_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_memberships_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_memberships_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      group_sibling_group_memberships: {
        Row: {
          id: string
          joined_at: string | null
          notification_preferences: Json | null
          person_id: string
          sibling_group_id: string
          status: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          notification_preferences?: Json | null
          person_id: string
          sibling_group_id: string
          status?: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          notification_preferences?: Json | null
          person_id?: string
          sibling_group_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_sibling_group_memberships_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_sibling_group_memberships_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_sibling_group_memberships_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_trees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_sibling_group_memberships_sibling_group_id_fkey"
            columns: ["sibling_group_id"]
            isOneToOne: false
            referencedRelation: "group_sibling_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_sibling_groups: {
        Row: {
          allow_contact_sharing: boolean | null
          allow_medical_sharing: boolean | null
          allow_photo_sharing: boolean | null
          auto_add_new_siblings: boolean | null
          created_at: string | null
          description: string | null
          donor_id: string
          group_id: string
          id: string
          name: string
          privacy_level: string
          updated_at: string | null
        }
        Insert: {
          allow_contact_sharing?: boolean | null
          allow_medical_sharing?: boolean | null
          allow_photo_sharing?: boolean | null
          auto_add_new_siblings?: boolean | null
          created_at?: string | null
          description?: string | null
          donor_id: string
          group_id: string
          id?: string
          name: string
          privacy_level?: string
          updated_at?: string | null
        }
        Update: {
          allow_contact_sharing?: boolean | null
          allow_medical_sharing?: boolean | null
          allow_photo_sharing?: boolean | null
          auto_add_new_siblings?: boolean | null
          created_at?: string | null
          description?: string | null
          donor_id?: string
          group_id?: string
          id?: string
          name?: string
          privacy_level?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_sibling_groups_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_sibling_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          description: string | null
          domain: string | null
          id: string
          label: string
          organization_id: string
          owner_id: string
          plan: string | null
          settings: Json | null
          slug: string | null
          subdomain: string | null
          type: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          label: string
          organization_id: string
          owner_id: string
          plan?: string | null
          settings?: Json | null
          slug?: string | null
          subdomain?: string | null
          type: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          label?: string
          organization_id?: string
          owner_id?: string
          plan?: string | null
          settings?: Json | null
          slug?: string | null
          subdomain?: string | null
          type?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_albums: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      media_files: {
        Row: {
          bucket_name: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          folder_id: string | null
          id: string
          mime_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bucket_name?: string
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          folder_id?: string | null
          id?: string
          mime_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bucket_name?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          folder_id?: string | null
          id?: string
          mime_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      media_folders: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          parent_folder_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_folder_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          invitee_email: string
          inviter_id: string | null
          organization_id: string | null
          role: string | null
          status: string | null
          token: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitee_email: string
          inviter_id?: string | null
          organization_id?: string | null
          role?: string | null
          status?: string | null
          token?: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitee_email?: string
          inviter_id?: string | null
          organization_id?: string | null
          role?: string | null
          status?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_media: {
        Row: {
          added_by: string
          created_at: string
          description: string | null
          folder_id: string | null
          id: string
          media_file_id: string
          organization_id: string
          sort_order: number | null
          tags: string[] | null
        }
        Insert: {
          added_by: string
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          media_file_id: string
          organization_id: string
          sort_order?: number | null
          tags?: string[] | null
        }
        Update: {
          added_by?: string
          created_at?: string
          description?: string | null
          folder_id?: string | null
          id?: string
          media_file_id?: string
          organization_id?: string
          sort_order?: number | null
          tags?: string[] | null
        }
        Relationships: []
      }
      organization_memberships: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          description: string | null
          domain: string | null
          id: string
          name: string
          owner_id: string
          plan: string | null
          settings: Json | null
          slug: string
          subdomain: string
          type: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          name: string
          owner_id: string
          plan?: string | null
          settings?: Json | null
          slug: string
          subdomain: string
          type: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          name?: string
          owner_id?: string
          plan?: string | null
          settings?: Json | null
          slug?: string
          subdomain?: string
          type?: string
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      person_media: {
        Row: {
          created_at: string
          id: string
          is_profile_photo: boolean
          media_file_id: string
          person_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_profile_photo?: boolean
          media_file_id: string
          person_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_profile_photo?: boolean
          media_file_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_media_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_media_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_media_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_media_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "persons_with_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      persons: {
        Row: {
          address: string | null
          birth_place: string | null
          created_at: string | null
          date_of_birth: string | null
          date_of_death: string | null
          death_place: string | null
          donor: boolean | null
          email: string | null
          fertility_treatments: Json | null
          gender: string | null
          id: string
          is_self: boolean | null
          metadata: Json | null
          name: string
          notes: string | null
          organization_id: string | null
          phone: string | null
          preferred_contact_method: string | null
          profile_photo_url: string | null
          social_media_links: Json | null
          status: string | null
          updated_at: string | null
          used_iui: boolean | null
          used_ivf: boolean | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          birth_place?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          date_of_death?: string | null
          death_place?: string | null
          donor?: boolean | null
          email?: string | null
          fertility_treatments?: Json | null
          gender?: string | null
          id?: string
          is_self?: boolean | null
          metadata?: Json | null
          name: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          profile_photo_url?: string | null
          social_media_links?: Json | null
          status?: string | null
          updated_at?: string | null
          used_iui?: boolean | null
          used_ivf?: boolean | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          birth_place?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          date_of_death?: string | null
          death_place?: string | null
          donor?: boolean | null
          email?: string | null
          fertility_treatments?: Json | null
          gender?: string | null
          id?: string
          is_self?: boolean | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          profile_photo_url?: string | null
          social_media_links?: Json | null
          status?: string | null
          updated_at?: string | null
          used_iui?: boolean | null
          used_ivf?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sharing_links: {
        Row: {
          access_level: string | null
          created_at: string | null
          created_by: string
          current_uses: number | null
          expires_at: string | null
          family_tree_id: string | null
          group_id: string | null
          id: string
          invited_emails: string[] | null
          is_active: boolean | null
          link_token: string
          max_uses: number | null
          organization_id: string | null
          password_hash: string | null
          updated_at: string | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          created_by: string
          current_uses?: number | null
          expires_at?: string | null
          family_tree_id?: string | null
          group_id?: string | null
          id?: string
          invited_emails?: string[] | null
          is_active?: boolean | null
          link_token?: string
          max_uses?: number | null
          organization_id?: string | null
          password_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          created_by?: string
          current_uses?: number | null
          expires_at?: string | null
          family_tree_id?: string | null
          group_id?: string | null
          id?: string
          invited_emails?: string[] | null
          is_active?: boolean | null
          link_token?: string
          max_uses?: number | null
          organization_id?: string | null
          password_hash?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sharing_links_family_tree_id_fkey"
            columns: ["family_tree_id"]
            isOneToOne: false
            referencedRelation: "family_trees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          account_type: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string | null
          full_name: string | null
          id: string
          location: string | null
          organization_id: string | null
          phone: string | null
          preferred_contact: string | null
          settings: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          account_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          organization_id?: string | null
          phone?: string | null
          preferred_contact?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          account_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          organization_id?: string | null
          phone?: string | null
          preferred_contact?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          data_sharing: boolean | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          privacy_mode: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_sharing?: boolean | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          privacy_mode?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_sharing?: boolean | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          privacy_mode?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      persons_with_groups: {
        Row: {
          address: string | null
          birth_place: string | null
          created_at: string | null
          date_of_birth: string | null
          date_of_death: string | null
          death_place: string | null
          donor: boolean | null
          email: string | null
          fertility_treatments: Json | null
          gender: string | null
          group_memberships: Json | null
          id: string | null
          metadata: Json | null
          name: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          preferred_contact_method: string | null
          profile_photo_url: string | null
          social_media_links: Json | null
          status: string | null
          updated_at: string | null
          used_iui: boolean | null
          used_ivf: boolean | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      persons_with_trees: {
        Row: {
          address: string | null
          birth_place: string | null
          created_at: string | null
          date_of_birth: string | null
          date_of_death: string | null
          death_place: string | null
          donor: boolean | null
          email: string | null
          family_trees: Json | null
          fertility_treatments: Json | null
          gender: string | null
          id: string | null
          is_self: boolean | null
          metadata: Json | null
          name: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          preferred_contact_method: string | null
          profile_photo_url: string | null
          social_media_links: Json | null
          status: string | null
          updated_at: string | null
          used_iui: boolean | null
          used_ivf: boolean | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_organization_owner: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
      column_exists: {
        Args: { table_name: string; column_name: string }
        Returns: boolean
      }
      create_organization_for_user: {
        Args: { org_name: string; org_type?: string; org_description?: string }
        Returns: string
      }
      delete_user_data: {
        Args: { p_user_uuid: string }
        Returns: undefined
      }
      export_user_data_json: {
        Args: { p_user_uuid: string; p_include?: Json }
        Returns: Json
      }
      get_donor_profile: {
        Args: { user_id: string }
        Returns: {
          donor_profile_id: string
          person_id: string
          donor_number: string
          cryobank_name: string
          account_type: string
        }[]
      }
      get_family_members: {
        Args: { group_uuid: string }
        Returns: {
          id: string
          name: string
          date_of_birth: string
          birth_place: string
          gender: string
          status: string
          date_of_death: string
          death_place: string
          profile_photo_url: string
          email: string
          phone: string
          address: string
          preferred_contact_method: string
          social_media_links: Json
          used_ivf: boolean
          used_iui: boolean
          fertility_treatments: Json
          donor: boolean
          notes: string
          metadata: Json
          user_id: string
          created_at: string
          updated_at: string
          role: string
        }[]
      }
      get_group_donor_count: {
        Args: { grp_id: string }
        Returns: number
      }
      get_group_sibling_groups_count: {
        Args: { grp_id: string }
        Returns: number
      }
      get_policies_for_table: {
        Args: { table_name: string }
        Returns: {
          policy_name: string
          policy_command: string
        }[]
      }
      get_postgres_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_table_columns: {
        Args: { table_name: string }
        Returns: {
          column_name: string
          data_type: string
          is_nullable: string
          column_default: string
        }[]
      }
      get_table_constraints: {
        Args: { table_name: string }
        Returns: {
          constraint_name: string
          constraint_type: string
          column_name: string
        }[]
      }
      get_table_triggers: {
        Args: { table_name: string }
        Returns: {
          trigger_name: string
          event_manipulation: string
          action_timing: string
        }[]
      }
      get_user_tenant_groups: {
        Args: { user_uuid: string }
        Returns: {
          group_id: string
          role: string
          is_owner: boolean
        }[]
      }
      is_donor: {
        Args: { user_id: string }
        Returns: boolean
      }
      verify_tenant_isolation: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          policy_name: string
          has_tenant_filter: boolean
          potential_leaks: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: { bucketid: string; name: string; owner: string; metadata: Json }
        Returns: undefined
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
  storage: {
    Enums: {},
  },
} as const

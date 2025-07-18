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
      connections: {
        Row: {
          created_at: string | null
          family_tree_id: string | null
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
          family_tree_id?: string | null
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
          family_tree_id?: string | null
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
            foreignKeyName: "connections_family_tree_id_fkey"
            columns: ["family_tree_id"]
            isOneToOne: false
            referencedRelation: "family_trees"
            referencedColumns: ["id"]
          },
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
        ]
      }
      groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          label: string
          organization_id: string
          owner_id: string
          type: string
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          label: string
          organization_id: string
          owner_id: string
          type: string
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          label?: string
          organization_id?: string
          owner_id?: string
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
          id?: string
          mime_type?: string
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
          family_tree_id: string | null
          fertility_treatments: Json | null
          gender: string | null
          id: string
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
          family_tree_id?: string | null
          fertility_treatments?: Json | null
          gender?: string | null
          id?: string
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
          family_tree_id?: string | null
          fertility_treatments?: Json | null
          gender?: string | null
          id?: string
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
            foreignKeyName: "persons_family_tree_id_fkey"
            columns: ["family_tree_id"]
            isOneToOne: false
            referencedRelation: "family_trees"
            referencedColumns: ["id"]
          },
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
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          preferred_contact: string | null
          settings: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          preferred_contact?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          preferred_contact?: string | null
          settings?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
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

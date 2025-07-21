/**
 * Centralized Organization interfaces and types that match the database schema
 * Based on the organizations, organization_memberships, and organization_invitations tables
 */

export interface Organization {
  // Primary key
  id: string;
  
  // Basic information
  name: string;
  slug: string;
  subdomain: string;
  type: string; // Using string to match database, but we'll have OrganizationType for validation
  description?: string | null;
  
  // Domain and visibility
  domain?: string | null;
  visibility?: string | null; // 'public' | 'private' but stored as string in DB
  plan?: string | null; // 'free' | 'basic' | 'premium' | 'enterprise' but stored as string in DB
  
  // Ownership and metadata
  owner_id: string;
  settings?: any | null; // JSONB field
  
  // Timestamps
  created_at?: string | null;
  updated_at?: string | null;
  
  // Virtual fields (not in database, but used in UI)
  member_count?: number;
  role?: OrganizationRole; // Current user's role in this organization
  owner_name?: string;
}

export type OrganizationType = 
  | 'sperm_bank'
  | 'egg_bank' 
  | 'fertility_clinic'
  | 'donor_community'
  | 'support_group'
  | 'family_group'
  | 'research_institution'
  | 'other';

export type OrganizationRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface OrganizationSettings {
  // Privacy and permissions
  allow_public_discovery?: boolean;
  allow_member_invites?: boolean;
  require_approval_for_joins?: boolean;
  
  // Donor database settings
  enable_donor_database?: boolean;
  donor_search_enabled?: boolean;
  allow_anonymous_donors?: boolean;
  require_donor_verification?: boolean;
  
  // Sibling group settings
  enable_sibling_groups?: boolean;
  auto_create_sibling_groups?: boolean;
  sibling_notification_settings?: SiblingNotificationSettings;
  
  // Data sharing settings
  data_sharing_level?: 'none' | 'members_only' | 'approved_orgs' | 'public';
  share_medical_history?: boolean;
  share_contact_info?: boolean;
  share_photos?: boolean;
  
  // Communication settings
  enable_messaging?: boolean;
  enable_forums?: boolean;
  moderation_level?: 'none' | 'basic' | 'strict';
  
  // Custom branding
  custom_logo_url?: string;
  custom_colors?: {
    primary?: string;
    secondary?: string;
  };
}

export interface SiblingNotificationSettings {
  new_sibling_alerts?: boolean;
  donor_update_alerts?: boolean;
  group_activity_alerts?: boolean;
  frequency?: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

export interface OrganizationMembership {
  id: string;
  organization_id?: string | null;
  user_id?: string | null;
  role?: string | null; // Using string to match database
  invited_by?: string | null;
  joined_at?: string | null;
  
  // Virtual fields (not in database, but used in UI)
  user_name?: string;
  user_email?: string;
  user_profile?: any;
  status?: 'active' | 'suspended' | 'inactive'; // UI-only field
  permissions?: string[] | null; // UI-only field
  last_active?: string | null; // UI-only field
}

export interface OrganizationInvitation {
  id: string;
  organization_id?: string | null;
  inviter_id?: string | null;
  invitee_email: string;
  role?: string | null; // Using string to match database
  status?: string | null; // 'pending' | 'accepted' | 'declined' | 'expired' but stored as string
  token: string;
  expires_at?: string | null;
  created_at?: string | null;
  
  // Virtual fields (not in database, but used in UI)
  organization_name?: string;
  inviter_name?: string;
  message?: string | null; // UI-only field
  responded_at?: string | null; // UI-only field
}

export interface OrganizationDonorDatabase {
  id: string;
  organization_id: string;
  donor_id: string;
  visibility: 'public' | 'members_only' | 'admin_only';
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  verified_by?: string | null;
  verified_at?: string | null;
  notes?: string | null;
  
  // Donor information (may be duplicated from donors table for organization-specific data)
  custom_fields?: any | null; // JSONB for organization-specific donor fields
  
  created_at: string;
  updated_at?: string | null;
}

export interface SiblingGroup {
  id: string;
  organization_id: string;
  donor_id: string;
  name: string;
  description?: string | null;
  privacy_level: 'public' | 'members_only' | 'private';
  auto_add_new_siblings: boolean;
  
  // Group settings
  allow_contact_sharing: boolean;
  allow_photo_sharing: boolean;
  allow_medical_sharing: boolean;
  
  created_at: string;
  updated_at?: string | null;
  
  // Virtual fields
  member_count?: number;
  latest_activity?: string | null;
}

export interface SiblingGroupMembership {
  id: string;
  sibling_group_id: string;
  person_id: string;
  status: 'active' | 'inactive' | 'left';
  notification_preferences: {
    new_members?: boolean;
    group_updates?: boolean;
    direct_messages?: boolean;
  };
  joined_at: string;
  
  // Virtual fields
  person_name?: string;
  is_self?: boolean;
}

/**
 * Type for creating a new organization (omits auto-generated fields)
 */
export type CreateOrganizationData = Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'member_count' | 'role' | 'owner_name'>;

/**
 * Type for updating an organization (all fields optional except id)
 */
export type UpdateOrganizationData = Partial<Omit<Organization, 'id' | 'created_at' | 'updated_at'>> & {
  id: string;
};

/**
 * Utility functions for working with Organization data
 */
export const OrganizationUtils = {
  /**
   * Get organization type display label
   */
  getTypeLabel: (type: OrganizationType): string => {
    const labels: Record<OrganizationType, string> = {
      sperm_bank: 'Sperm Bank',
      egg_bank: 'Egg Bank',
      fertility_clinic: 'Fertility Clinic',
      donor_community: 'Donor Community',
      support_group: 'Support Group',
      family_group: 'Family Group',
      research_institution: 'Research Institution',
      other: 'Other'
    };
    return labels[type];
  },

  /**
   * Get organization type icon/emoji
   */
  getTypeIcon: (type: OrganizationType): string => {
    const icons: Record<OrganizationType, string> = {
      sperm_bank: '🧬',
      egg_bank: '🥚',
      fertility_clinic: '🏥',
      donor_community: '🤝',
      support_group: '💙',
      family_group: '👨‍👩‍👧‍👦',
      research_institution: '🔬',
      other: '🏢'
    };
    return icons[type];
  },

  /**
   * Get role display label
   */
  getRoleLabel: (role: OrganizationRole): string => {
    const labels: Record<OrganizationRole, string> = {
      owner: 'Owner',
      admin: 'Administrator',
      editor: 'Editor',
      viewer: 'Viewer'
    };
    return labels[role];
  },

  /**
   * Check if user has permission to perform action
   */
  hasPermission: (userRole: OrganizationRole, requiredRole: OrganizationRole): boolean => {
    const roleHierarchy: Record<OrganizationRole, number> = {
      viewer: 1,
      editor: 2,
      admin: 3,
      owner: 4
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  },

  /**
   * Check if organization is public
   */
  isPublic: (organization: Organization): boolean => {
    return organization.visibility === 'public';
  },

  /**
   * Check if organization allows donor database features
   */
  hasDonorDatabase: (organization: Organization): boolean => {
    return organization.settings?.enable_donor_database === true;
  },

  /**
   * Check if organization allows sibling groups
   */
  hasSiblingGroups: (organization: Organization): boolean => {
    return organization.settings?.enable_sibling_groups === true;
  },

  /**
   * Get organization URL
   */
  getUrl: (organization: Organization): string => {
    return `https://${organization.subdomain}.familyshapes.com`;
  },

  /**
   * Format organization creation date
   */
  formatCreatedDate: (createdAt: string): string => {
    return new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Get default organization settings
   */
  getDefaultSettings: (): OrganizationSettings => {
    return {
      allow_public_discovery: false,
      allow_member_invites: true,
      require_approval_for_joins: true,
      enable_donor_database: false,
      donor_search_enabled: false,
      allow_anonymous_donors: true,
      require_donor_verification: false,
      enable_sibling_groups: false,
      auto_create_sibling_groups: false,
      sibling_notification_settings: {
        new_sibling_alerts: true,
        donor_update_alerts: true,
        group_activity_alerts: false,
        frequency: 'weekly'
      },
      data_sharing_level: 'members_only',
      share_medical_history: false,
      share_contact_info: false,
      share_photos: false,
      enable_messaging: true,
      enable_forums: false,
      moderation_level: 'basic'
    };
  }
};
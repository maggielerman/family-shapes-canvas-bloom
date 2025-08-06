/**
 * Enhanced Group interfaces and types with organization-like features
 * Maintains backward compatibility while adding new functionality
 */

export interface Group {
  // Primary key
  id: string;
  
  // Basic information (existing fields)
  label: string;
  type: string;
  description: string | null;
  visibility: string | null;
  organization_id: string;
  owner_id: string;
  
  // New fields from organization features
  slug?: string | null;
  subdomain?: string | null;
  domain?: string | null;
  plan?: string | null;
  settings?: GroupSettings | null;
  
  // Timestamps
  created_at: string | null;
  updated_at: string | null;
  
  // Virtual fields (not in database, but used in UI)
  member_count?: number;
  role?: GroupRole; // Current user's role in this group
  owner_name?: string;
}

export type GroupType = 
  | 'family'
  | 'donor_siblings'
  | 'support'
  | 'research'
  | 'community'
  | 'other';

export type GroupRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'member';

export interface GroupSettings {
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
  data_sharing_level?: 'none' | 'members_only' | 'approved_groups' | 'public';
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

export interface GroupMembership {
  id: string;
  group_id?: string | null;
  person_id?: string | null;
  user_id?: string | null;
  role?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  
  // Virtual fields
  user_name?: string;
  user_email?: string;
  user_profile?: any;
  person_name?: string;
  status?: 'active' | 'suspended' | 'inactive';
  permissions?: string[] | null;
  last_active?: string | null;
}

export interface GroupInvitation {
  id: string;
  group_id?: string | null;
  inviter_id?: string | null;
  invitee_email: string;
  role?: string | null;
  status?: string | null;
  token: string;
  expires_at?: string | null;
  created_at?: string | null;
  
  // Virtual fields
  group_name?: string;
  inviter_name?: string;
  message?: string | null;
  responded_at?: string | null;
}

export interface GroupDonorDatabase {
  id: string;
  group_id: string;
  donor_id: string;
  visibility: 'public' | 'members_only' | 'admin_only';
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  verified_by?: string | null;
  verified_at?: string | null;
  notes?: string | null;
  custom_fields?: any | null;
  created_at: string;
  updated_at?: string | null;
}

export interface GroupSiblingGroup {
  id: string;
  group_id: string;
  donor_id: string;
  name: string;
  description?: string | null;
  privacy_level: 'public' | 'members_only' | 'private';
  auto_add_new_siblings: boolean;
  allow_contact_sharing: boolean;
  allow_photo_sharing: boolean;
  allow_medical_sharing: boolean;
  created_at: string;
  updated_at?: string | null;
  
  // Virtual fields
  member_count?: number;
  latest_activity?: string | null;
}

export interface GroupSiblingGroupMembership {
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

export interface GroupMedia {
  id: string;
  group_id: string;
  media_file_id: string;
  added_by: string;
  description?: string | null;
  folder_id?: string | null;
  sort_order?: number | null;
  tags?: string[] | null;
  created_at: string;
  
  // Virtual fields
  file_url?: string;
  file_name?: string;
  mime_type?: string;
  added_by_name?: string;
}

/**
 * Type for creating a new group (omits auto-generated fields)
 */
export type CreateGroupData = Omit<Group, 'id' | 'created_at' | 'updated_at' | 'member_count' | 'role' | 'owner_name'>;

/**
 * Type for updating a group (all fields optional except id)
 */
export type UpdateGroupData = Partial<Omit<Group, 'id' | 'created_at' | 'updated_at'>> & {
  id: string;
};

/**
 * Utility functions for working with Group data
 */
export const GroupUtils = {
  /**
   * Get group type display label
   */
  getTypeLabel: (type: GroupType): string => {
    const labels: Record<GroupType, string> = {
      family: 'Family Group',
      donor_siblings: 'Donor Siblings',
      support: 'Support Group',
      research: 'Research Group',
      community: 'Community',
      other: 'Other'
    };
    return labels[type as GroupType] || type;
  },

  /**
   * Get group type icon/emoji
   */
  getTypeIcon: (type: GroupType): string => {
    const icons: Record<GroupType, string> = {
      family: '👨‍👩‍👧‍👦',
      donor_siblings: '🧬',
      support: '💙',
      research: '🔬',
      community: '🤝',
      other: '📁'
    };
    return icons[type as GroupType] || '📁';
  },

  /**
   * Get role display label
   */
  getRoleLabel: (role: GroupRole): string => {
    const labels: Record<GroupRole, string> = {
      owner: 'Owner',
      admin: 'Administrator',
      editor: 'Editor',
      viewer: 'Viewer',
      member: 'Member'
    };
    return labels[role];
  },

  /**
   * Check if user has permission to perform action
   */
  hasPermission: (userRole: GroupRole, requiredRole: GroupRole): boolean => {
    const roleHierarchy: Record<GroupRole, number> = {
      member: 1,
      viewer: 2,
      editor: 3,
      admin: 4,
      owner: 5
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  },

  /**
   * Check if group is public
   */
  isPublic: (group: Group): boolean => {
    return group.visibility === 'public';
  },

  /**
   * Check if group allows donor database features
   */
  hasDonorDatabase: (group: Group): boolean => {
    return group.settings?.enable_donor_database === true;
  },

  /**
   * Check if group allows sibling groups
   */
  hasSiblingGroups: (group: Group): boolean => {
    return group.settings?.enable_sibling_groups === true;
  },

  /**
   * Get group URL
   */
  getUrl: (group: Group): string => {
    if (group.subdomain) {
      return `https://${group.subdomain}.familyshapes.com`;
    }
    return `/groups/${group.id}`;
  },

  /**
   * Format group creation date
   */
  formatCreatedDate: (createdAt: string | null): string => {
    if (!createdAt) return 'Unknown';
    return new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Get default group settings
   */
  getDefaultSettings: (): GroupSettings => {
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
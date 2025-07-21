import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/AuthContext";
import { UserSettingsService } from "@/services/userSettingsService";

export interface UserSettings {
  id: string;
  user_id: string;
  privacy_mode: boolean | null;
  data_sharing: boolean | null;
  email_notifications: boolean | null;
  marketing_emails: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsUpdate {
  privacy_mode?: boolean;
  data_sharing?: boolean;
  email_notifications?: boolean;
  marketing_emails?: boolean;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user settings
  const {
    data: userSettings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userSettings", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");
      return UserSettingsService.getOrCreateUserSettings(user.id);
    },
    enabled: !!user?.id,
  });

  // Update user settings
  const updateSettings = useMutation({
    mutationFn: async (updates: UserSettingsUpdate) => {
      if (!user?.id) throw new Error("User not authenticated");
      return UserSettingsService.updateUserSettings(user.id, updates);
    },
    onSuccess: (data) => {
      // Update the cache with the new data
      queryClient.setQueryData(["userSettings", user?.id], data);
    },
  });

  return {
    data: userSettings,
    isLoading,
    error,
    updateSettings,
  };
};
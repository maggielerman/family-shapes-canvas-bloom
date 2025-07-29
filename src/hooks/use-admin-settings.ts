import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthContext";

export interface AdminSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSettingsUpdate {
  setting_value: any;
  description?: string;
}

export const useAdminSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all admin settings
  const {
    data: adminSettings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminSettings"],
    queryFn: async () => {
      // @ts-ignore - Table exists in database
      const { data, error } = await supabase
        .from("admin_settings" as any)
        .select("*")
        .order("category", { ascending: true })
        .order("setting_key", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id, // Only fetch if user is authenticated
  });

  // Get settings by category
  const getSettingsByCategory = (category: string) => {
    // @ts-ignore - Property exists in schema
    return adminSettings?.filter((setting: any) => setting.category === category) || [];
  };

  // Get a specific setting value
  const getSettingValue = (key: string) => {
    // @ts-ignore - Property exists in schema
    const setting = adminSettings?.find((s: any) => s.setting_key === key);
    return (setting as any)?.setting_value;
  };

  // Update admin setting
  const updateAdminSetting = useMutation({
    mutationFn: async ({ key, updates }: { key: string; updates: AdminSettingsUpdate }) => {
      // @ts-ignore - Table exists in database
      const { data, error } = await supabase
        .from("admin_settings" as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("setting_key", key)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch admin settings
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
    },
  });

  // Create new admin setting
  const createAdminSetting = useMutation({
    mutationFn: async (newSetting: Omit<AdminSettings, 'id' | 'created_at' | 'updated_at'>) => {
      // @ts-ignore - Table exists in database
      const { data, error } = await supabase
        .from("admin_settings" as any)
        .insert(newSetting as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
    },
  });

  // Delete admin setting
  const deleteAdminSetting = useMutation({
    mutationFn: async (key: string) => {
      // @ts-ignore - Table exists in database
      const { error } = await supabase
        .from("admin_settings" as any)
        .delete()
        .eq("setting_key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSettings"] });
    },
  });

  return {
    data: adminSettings,
    isLoading,
    error,
    getSettingsByCategory,
    getSettingValue,
    updateAdminSetting,
    createAdminSetting,
    deleteAdminSetting,
  };
};
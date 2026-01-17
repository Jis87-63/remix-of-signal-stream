import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminSettings {
  maintenance_mode: boolean;
  maintenance_message: string;
  group_dialog_text: string;
  group_dialog_link: string;
  voice_enabled: boolean;
}

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    maintenance_mode: false,
    maintenance_message: 'Sistema em manutenção. Por favor, aguarde.',
    group_dialog_text: 'Entre no nosso grupo VIP!',
    group_dialog_link: 'https://chat.whatsapp.com/example',
    voice_enabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      if (data) {
        const newSettings: Partial<AdminSettings> = {};
        data.forEach((item) => {
          if (item.setting_key === 'maintenance_mode') {
            newSettings.maintenance_mode = item.setting_value === 'true';
          } else if (item.setting_key === 'maintenance_message') {
            newSettings.maintenance_message = item.setting_value || '';
          } else if (item.setting_key === 'group_dialog_text') {
            newSettings.group_dialog_text = item.setting_value || '';
          } else if (item.setting_key === 'group_dialog_link') {
            newSettings.group_dialog_link = item.setting_value || '';
          } else if (item.setting_key === 'voice_enabled') {
            newSettings.voice_enabled = item.setting_value === 'true';
          }
        });
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('admin_settings_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_settings' },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSettings]);

  return { settings, isLoading, refetch: fetchSettings };
};

export const updateSetting = async (key: string, value: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_settings')
      .update({ setting_value: value })
      .eq('setting_key', key);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating setting:', error);
    return false;
  }
};

export const verifyAdminCode = async (code: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_code')
      .single();

    if (error) throw error;
    return data?.setting_value === code;
  } catch (error) {
    console.error('Error verifying admin code:', error);
    return false;
  }
};

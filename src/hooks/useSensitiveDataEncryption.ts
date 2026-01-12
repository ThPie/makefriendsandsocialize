import { supabase } from "@/integrations/supabase/client";

interface SensitiveFields {
  phone_number?: string | null;
  linkedin_url?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
}

interface EncryptionResult {
  success: boolean;
  data?: SensitiveFields;
  error?: string;
}

export function useSensitiveDataEncryption() {
  const encryptFields = async (data: SensitiveFields): Promise<EncryptionResult> => {
    try {
      const { data: result, error } = await supabase.functions.invoke('encrypt-sensitive-data', {
        body: { action: 'encrypt', data }
      });

      if (error) {
        console.error('Encryption error:', { message: error.message });
        return { success: false, error: error.message };
      }

      return { success: true, data: result.data };
    } catch (err) {
      console.error('Encryption error:', { message: (err as Error).message });
      return { success: false, error: (err as Error).message };
    }
  };

  const decryptFields = async (data: SensitiveFields): Promise<EncryptionResult> => {
    try {
      const { data: result, error } = await supabase.functions.invoke('encrypt-sensitive-data', {
        body: { action: 'decrypt', data }
      });

      if (error) {
        console.error('Decryption error:', { message: error.message });
        return { success: false, error: error.message };
      }

      return { success: true, data: result.data };
    } catch (err) {
      console.error('Decryption error:', { message: (err as Error).message });
      return { success: false, error: (err as Error).message };
    }
  };

  return { encryptFields, decryptFields };
}

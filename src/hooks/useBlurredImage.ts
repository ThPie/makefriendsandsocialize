import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBlurredImage(imageUrl: string | null | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["blurred-image", imageUrl],
    queryFn: async () => {
      if (!imageUrl) return null;
      const { data, error } = await supabase.functions.invoke("blur-image", {
        body: { imageUrl },
      });
      if (error) throw error;
      return data?.blurredUrl as string | null;
    },
    enabled: enabled && !!imageUrl,
    staleTime: Infinity, // Blurred images don't change
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
  });
}

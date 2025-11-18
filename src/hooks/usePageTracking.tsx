import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.from("page_views").insert({
          page_path: location.pathname,
          user_id: session?.user?.id || null,
        });
      } catch (error) {
        console.error("Error tracking page view:", error);
      }
    };

    trackPageView();
  }, [location]);
};

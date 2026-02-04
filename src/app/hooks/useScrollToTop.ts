import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook that scrolls to top of page when route changes
 * Usage: Just call this hook at the top level of your page component
 */
export function useScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}

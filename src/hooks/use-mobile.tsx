import * as React from "react"
import { useHydration } from './use-hydration';

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const isHydrated = useHydration();

  React.useEffect(() => {
      if (!isHydrated) return;

      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      const onChange = () => {
          setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      };
      mql.addEventListener('change', onChange);
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      return () => mql.removeEventListener('change', onChange);
  }, [isHydrated]);

  // Always return false during SSR to prevent hydration mismatch
  return isHydrated ? isMobile : false;
}

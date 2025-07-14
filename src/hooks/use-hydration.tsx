import { useEffect, useState } from 'react';

/**
 * Hook to detect if component has hydrated on the client
 * This prevents hydration mismatches by returning false during SSR
 */
export function useHydration() {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    return isHydrated;
}

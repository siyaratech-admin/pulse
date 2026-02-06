import { useState, useEffect } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const breakpoints = {
    mobile: '(max-width: 639px)',
    tablet: '(min-width: 640px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)',
};

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
}

export function useBreakpoint(): Breakpoint {
    const isMobile = useMediaQuery(breakpoints.mobile);
    const isTablet = useMediaQuery(breakpoints.tablet);

    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    return 'desktop';
}

export function useIsMobile(): boolean {
    return useMediaQuery(breakpoints.mobile);
}

export function useIsTablet(): boolean {
    return useMediaQuery(breakpoints.tablet);
}

export function useIsDesktop(): boolean {
    return useMediaQuery(breakpoints.desktop);
}

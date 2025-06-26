import { useState, useEffect } from 'react';

interface UseScrollDirectionOptions {
  threshold?: number;
  debounceMs?: number;
}

export const useScrollDirection = (options: UseScrollDirectionOptions = {}) => {
  const { threshold = 10, debounceMs = 100 } = options;
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;
    let debounceTimer: NodeJS.Timeout;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      // Only update if we've scrolled past the threshold
      if (Math.abs(scrollY - lastScrollY) >= threshold) {
        setScrollDirection(direction);
        setIsScrolling(true);
        
        // Clear existing debounce timer
        clearTimeout(debounceTimer);
        
        // Set new debounce timer to stop scrolling state
        debounceTimer = setTimeout(() => {
          setIsScrolling(false);
        }, debounceMs);
      }
      
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(debounceTimer);
    };
  }, [threshold, debounceMs]);

  return { scrollDirection, isScrolling };
};
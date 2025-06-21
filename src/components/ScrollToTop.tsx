"use client";

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Multiple approaches to ensure scroll to top works
    
    // Immediate scroll
    window.scrollTo(0, 0);
    
    // Also try scrolling the document element and body
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Use requestAnimationFrame to ensure it happens after any pending renders
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    
    // Also use a small timeout as a fallback
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
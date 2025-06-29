"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { TextField } from "@/ui/components/TextField";
import { Badge } from "@/ui/components/Badge";
import { FeatherSearch, FeatherTrendingUp, FeatherTag, FeatherMapPin, FeatherStore, FeatherGrid } from "@subframe/core";
import { foodSearchService, type FoodSearchSuggestion, formatFoodPrice } from "../services/foodSearchService";

interface FoodSearchFieldProps {
  className?: string;
  onItemSelect?: (suggestion: FoodSearchSuggestion) => void;
  onSearchSubmit?: (query: string) => void;
  placeholder?: string;
  showTrending?: boolean;
}

const FoodSearchField: React.FC<FoodSearchFieldProps> = ({
  className,
  onItemSelect,
  onSearchSubmit,
  placeholder = "Search for fresh local food...",
  showTrending = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<FoodSearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const preventBlurRef = useRef(false);
  const searchTriggeredRef = useRef(false);

  const isMobile = screenSize === 'mobile';
  const isTablet = screenSize === 'tablet';

  // Screen size detection
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Search function with improved logging and error handling
  const searchFood = useCallback(async (searchQuery: string) => {
    console.log('🔍 searchFood called with:', searchQuery);
    searchTriggeredRef.current = true;
    
    if (searchQuery.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    console.log('🔄 Starting search for:', searchQuery);
    
    try {
      const results = await foodSearchService.getFoodSuggestions(searchQuery);
      console.log('✅ Search results:', results.length, 'items');
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('❌ Error searching food:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Navigate to Shop page with search query
  const navigateToShop = useCallback((searchQuery: string, suggestion?: FoodSearchSuggestion) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    console.log('🔍 NAVIGATING TO SHOP:', { query: trimmedQuery, suggestion });

    if (suggestion) {
      switch (suggestion.type) {
        case 'category':
          const categoryName = suggestion.title.replace(/^All\s+/, '');
          console.log('📂 Category navigation:', categoryName);
          navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
          break;
        case 'product':
          console.log('🛍️ Product navigation:', trimmedQuery);
          navigate(`/shop?search=${encodeURIComponent(trimmedQuery)}`);
          break;
        case 'seller':
          console.log('🏪 Seller navigation:', suggestion.title);
          navigate(`/shop?seller=${encodeURIComponent(suggestion.title)}`);
          break;
        default:
          console.log('🔍 Default navigation:', trimmedQuery);
          navigate(`/shop?search=${encodeURIComponent(trimmedQuery)}`);
      }
    } else {
      console.log('🔍 Search navigation:', trimmedQuery);
      navigate(`/shop?search=${encodeURIComponent(trimmedQuery)}`);
    }

    // Close suggestions and clear input focus
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  }, [navigate]);

  // Handle search button click
  const handleSearchClick = useCallback(() => {
    if (query.trim()) {
      onSearchSubmit?.(query.trim());
      navigateToShop(query);
    }
  }, [query, onSearchSubmit, navigateToShop]);

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback((suggestion: FoodSearchSuggestion) => {
    console.log('🔍 Suggestion clicked:', suggestion);
    
    preventBlurRef.current = true;
    
    // Set the input value
    setQuery(suggestion.title);
    
    // Call the parent's onItemSelect if provided
    if (onItemSelect) {
      console.log('📞 Calling onItemSelect with:', suggestion);
      onItemSelect(suggestion);
    } else {
      // Navigate directly - don't rely on parent navigation
      console.log('🚀 Navigating based on suggestion type:', suggestion.type);
      
      switch (suggestion.type) {
        case 'category':
          const categoryName = suggestion.title.replace(/^All\s+/, '');
          console.log('📂 Navigating to category:', categoryName);
          navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
          break;
        case 'product':
          console.log('🛍️ Navigating to product search:', suggestion.title);
          navigate(`/shop?search=${encodeURIComponent(suggestion.title)}`);
          break;
        case 'seller':
          console.log('🏪 Navigating to seller:', suggestion.title);
          navigate(`/shop?seller=${encodeURIComponent(suggestion.title)}`);
          break;
        default:
          console.log('🔍 Default search navigation:', suggestion.title);
          navigate(`/shop?search=${encodeURIComponent(suggestion.title)}`);
      }
    }
    
    // Hide suggestions
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Clean up
    setTimeout(() => {
      preventBlurRef.current = false;
    }, 100);
  }, [onItemSelect, navigate]);

  // Handle input changes with debouncing
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    console.log('📝 Input changed to:', value);
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 2) {
      console.log('⏱️ Setting debounce timer for:', value);
      debounceRef.current = setTimeout(() => {
        console.log('🚀 Debounce timer fired, searching for:', value);
        searchFood(value);
      }, 200);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchFood]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearchClick();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearchClick();
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSearchClick, handleSuggestionClick]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    console.log('🎯 Input focused, query:', query, 'suggestions:', suggestions.length);
    
    if (query.length >= 2) {
      // If we have a query but no suggestions, trigger search
      if (suggestions.length === 0 && !searchTriggeredRef.current) {
        console.log('🔄 No suggestions but have query, triggering search');
        searchFood(query);
      } else if (suggestions.length > 0) {
        // Show existing suggestions
        console.log('📋 Showing existing suggestions');
        setShowSuggestions(true);
      }
    }
  }, [suggestions.length, query, searchFood]);

  // Reset search triggered flag when query changes
  useEffect(() => {
    searchTriggeredRef.current = false;
  }, [query]);

  // Handle input blur
  const handleInputBlur = useCallback(() => {
    if (preventBlurRef.current) {
      console.log('🛑 Preventing blur due to suggestion click');
      return;
    }
    
    setTimeout(() => {
      if (!preventBlurRef.current) {
        console.log('👋 Hiding suggestions on blur');
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  }, []);

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Clear search text when navigating away from shop page
  useEffect(() => {
    if (location.pathname !== '/shop') {
      console.log('📍 Left shop page, clearing search text');
      setQuery("");
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [location.pathname]);

  // Get suggestion icon based on type
  const getSuggestionIcon = useCallback((suggestion: FoodSearchSuggestion) => {
    switch (suggestion.type) {
      case 'product':
        return <FeatherTag className="w-4 h-4" />;
      case 'category':
        return <FeatherGrid className="w-4 h-4" />;
      case 'seller':
        return <FeatherStore className="w-4 h-4" />;
      case 'related':
        return <FeatherTrendingUp className="w-4 h-4" />;
      default:
        return <FeatherSearch className="w-4 h-4" />;
    }
  }, []);

  // Render suggestions with simple absolute positioning (no portal)
  const suggestionList = useMemo(() => {
    console.log('🎨 Rendering suggestions:', { 
      showSuggestions, 
      suggestionsLength: suggestions.length, 
      queryLength: query.length
    });

    if (!showSuggestions || suggestions.length === 0 || query.length < 2) {
      return null;
    }

    const limitedSuggestions = suggestions.slice(0, isMobile ? 3 : 4);

    return (
      <div 
        className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg overflow-hidden z-50"
        style={{ 
  position: 'absolute',
  top: `${top}px`,
  left: isMobile ? '16px' : `${left}px`,
  width: isMobile ? `calc(100vw - 32px)` : `${width}px`,
  maxWidth: isMobile ? '600px' : 'none',
  maxHeight: '400px',
  overflowY: 'auto',
  zIndex: 99999,
  pointerEvents: 'auto'
}}
      >
        {isLoading && (
          <div className={`text-center text-subtext-color ${isMobile ? 'px-4 py-8' : 'px-3 py-4'}`}>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
              <span className={`font-body ${isMobile ? 'text-base' : 'text-sm'}`}>Searching fresh food...</span>
            </div>
          </div>
        )}

        {!isLoading && limitedSuggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.id}`}
            className={`w-full text-left ${isMobile ? 'px-4 py-4' : 'px-3 py-3'} hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors ${
              index === selectedIndex ? 'bg-brand-50' : ''
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('🖱️ Button clicked for:', suggestion.title);
              handleSuggestionClick(suggestion);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              preventBlurRef.current = true;
              console.log('⬇️ Mouse down on suggestion');
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('⬆️ Mouse up on suggestion');
              setTimeout(() => {
                preventBlurRef.current = false;
              }, 200);
            }}
            onMouseEnter={() => setSelectedIndex(index)}
            type="button"
          >
            <div className={`flex items-start ${isMobile ? 'gap-4' : 'gap-3'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-subtext-color">
                        {getSuggestionIcon(suggestion)}
                      </div>
                      <h4 className={`font-medium text-default-font truncate ${isMobile ? 'text-base' : 'text-sm'}`}>
                        {suggestion.title}
                      </h4>
                      {suggestion.isOrganic && (
                        <Badge variant="success" className="text-xs">
                          Organic
                        </Badge>
                      )}
                      {suggestion.type === 'category' && (
                        <Badge variant="brand" className="text-xs">
                          Browse All
                        </Badge>
                      )}
                    </div>
                    <p className={`text-subtext-color truncate ${isMobile ? 'text-sm' : 'text-xs'}`}>
                      {suggestion.subtitle}
                    </p>
                    
                    {suggestion.tags && suggestion.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {suggestion.tags.slice(0, isMobile ? 1 : 2).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="neutral" className="text-xs">
                            {tag.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={`text-right flex-shrink-0 ${isMobile ? 'flex flex-col items-end gap-1' : ''}`}>
                    {suggestion.price && (
                      <div className={`font-medium text-default-font ${isMobile ? 'text-base' : 'text-sm'}`}>
                        {suggestion.price}
                      </div>
                    )}
                    {suggestion.location && (
                      <div className={`flex items-center gap-1 text-subtext-color ${isMobile ? 'text-sm mt-1' : 'text-xs mt-1'}`}>
                        <FeatherMapPin className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />
                        <span className={`truncate ${isMobile ? 'max-w-24' : 'max-w-20'}`}>
                          {suggestion.location.split(',')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}

        {!isLoading && suggestions.length > limitedSuggestions.length && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSearchClick();
            }}
            className={`w-full text-left ${isMobile ? 'px-4 py-4' : 'px-3 py-3'} hover:bg-brand-50 border-t border-brand-200 bg-brand-25 transition-colors text-brand-700`}
            type="button"
          >
            <div className="flex items-center justify-center gap-2">
              <FeatherSearch className="w-4 h-4" />
              <span className={`font-medium ${isMobile ? 'text-base' : 'text-sm'}`}>
                View all {suggestions.length} results for "{query}"
              </span>
            </div>
          </button>
        )}

        {!isLoading && suggestions.length === 0 && query.length >= 2 && (
          <div className={`text-center text-subtext-color ${isMobile ? 'px-4 py-8' : 'px-3 py-4'}`}>
            <div className="flex flex-col items-center gap-2">
              <FeatherSearch className={`text-neutral-300 ${isMobile ? 'w-10 h-10' : 'w-8 h-8'}`} />
              <span className={`font-body ${isMobile ? 'text-base' : 'text-sm'}`}>No items found for "{query}"</span>
              <span className={`font-caption text-neutral-400 ${isMobile ? 'text-sm' : 'text-xs'}`}>Try searching for fruits, vegetables, or local sellers</span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearchClick();
                }}
                className={`mt-3 px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-500 transition-colors ${isMobile ? 'text-base' : 'text-sm'}`}
                type="button"
              >
                Search anyway
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }, [showSuggestions, suggestions, isLoading, query, selectedIndex, getSuggestionIcon, handleSuggestionClick, handleSearchClick, isMobile]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <TextField
        className="h-auto w-full flex-none"
        variant="filled"
        label=""
        helpText=""
        iconRight={
          <button
            onClick={handleSearchClick}
            disabled={!query.trim()}
            className="flex items-center justify-center hover:bg-neutral-100 rounded p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            title="Search for food items"
          >
            <FeatherSearch className="w-4 h-4" />
          </button>
        }
      >
        <TextField.Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
      </TextField>

      {suggestionList}
    </div>
  );
};

export default FoodSearchField;
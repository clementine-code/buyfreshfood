"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<FoodSearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const preventBlurRef = useRef(false);

  // Search function - only trigger when user types
  const searchFood = useCallback(async (searchQuery: string) => {
    // Don't show suggestions for empty query
    if (searchQuery.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Only search if query is at least 2 characters
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await foodSearchService.getFoodSuggestions(searchQuery);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching food:', error);
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

    // Handle different suggestion types
    if (suggestion) {
      switch (suggestion.type) {
        case 'category':
          // Extract category name from "All [Category]" format
          const categoryName = suggestion.title.replace(/^All\s+/, '');
          navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
          break;
        case 'product':
          // Navigate to shop with product search
          navigate(`/shop?search=${encodeURIComponent(trimmedQuery)}`);
          break;
        case 'seller':
          // Navigate to shop with seller filter
          navigate(`/shop?seller=${encodeURIComponent(suggestion.title)}`);
          break;
        default:
          // Default to search
          navigate(`/shop?search=${encodeURIComponent(trimmedQuery)}`);
      }
    } else {
      // Direct search navigation
      navigate(`/shop?search=${encodeURIComponent(trimmedQuery)}`);
    }

    // Clean up UI
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

  // Handle input changes with debouncing
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search - only for non-empty queries
    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchFood(value);
      }, 300);
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
  }, [showSuggestions, suggestions, selectedIndex, handleSearchClick]);

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback((suggestion: FoodSearchSuggestion) => {
    preventBlurRef.current = true;
    
    setQuery(suggestion.title);
    
    // Call the callback if provided
    onItemSelect?.(suggestion);
    
    // Navigate to Shop page
    navigateToShop(suggestion.title, suggestion);
    
    setTimeout(() => {
      preventBlurRef.current = false;
    }, 100);
  }, [onItemSelect, navigateToShop]);

  // Handle input focus - don't auto-show suggestions
  const handleInputFocus = useCallback(() => {
    // Only show suggestions if we already have them and query is not empty
    if (suggestions.length > 0 && query.length >= 2) {
      setShowSuggestions(true);
    }
  }, [suggestions.length, query.length]);

  // Handle input blur
  const handleInputBlur = useCallback(() => {
    if (preventBlurRef.current) {
      return;
    }
    
    setTimeout(() => {
      if (!preventBlurRef.current) {
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

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Memoized suggestion list - only show when user has typed something
  const suggestionList = useMemo(() => {
    if (!showSuggestions || suggestions.length === 0 || query.length < 2) return null;

    return (
      <div 
        className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-[100] max-h-96 overflow-y-auto"
        style={{ 
          // Extend beyond text field on mobile
          width: isMobile ? 'calc(100vw - 2rem)' : '100%',
          left: isMobile ? 'calc(-50vw + 50%)' : '0',
          marginLeft: isMobile ? '1rem' : '0'
        }}
      >
        {/* Loading state */}
        {isLoading && (
          <div className={`text-center text-subtext-color ${isMobile ? 'px-4 py-6' : 'px-3 py-4'}`}>
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
              <span className={`font-body ${isMobile ? 'text-base' : 'text-sm'}`}>Searching fresh food...</span>
            </div>
          </div>
        )}

        {/* Suggestions - Mobile optimized */}
        {!isLoading && suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.id}`}
            className={`w-full text-left ${isMobile ? 'px-4 py-4' : 'px-3 py-3'} hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors ${
              index === selectedIndex ? 'bg-brand-50' : ''
            }`}
            onClick={() => handleSuggestionClick(suggestion)}
            onMouseDown={(e) => {
              e.preventDefault();
              preventBlurRef.current = true;
            }}
            onMouseUp={() => {
              setTimeout(() => {
                preventBlurRef.current = false;
              }, 100);
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className={`flex items-start ${isMobile ? 'gap-4' : 'gap-3'}`}>
              {/* Show image only on desktop */}
              {!isMobile && suggestion.image && (
                <img
                  src={suggestion.image}
                  alt={suggestion.title}
                  className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                />
              )}
              
              {/* Content - Full width on mobile */}
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
                      {/* Highlight category suggestions */}
                      {suggestion.type === 'category' && (
                        <Badge variant="brand" className="text-xs">
                          Browse All
                        </Badge>
                      )}
                    </div>
                    <p className={`text-subtext-color truncate ${isMobile ? 'text-sm' : 'text-xs'}`}>
                      {suggestion.subtitle}
                    </p>
                    
                    {/* Tags for products - Show fewer on mobile */}
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
                  
                  {/* Price and location - Stack on mobile */}
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

        {/* No results */}
        {!isLoading && suggestions.length === 0 && query.length >= 2 && (
          <div className={`text-center text-subtext-color ${isMobile ? 'px-4 py-6' : 'px-3 py-4'}`}>
            <div className="flex flex-col items-center gap-2">
              <FeatherSearch className={`text-neutral-300 ${isMobile ? 'w-10 h-10' : 'w-8 h-8'}`} />
              <span className={`font-body ${isMobile ? 'text-base' : 'text-sm'}`}>No items found for "{query}"</span>
              <span className={`font-caption text-neutral-400 ${isMobile ? 'text-sm' : 'text-xs'}`}>Try searching for fruits, vegetables, or local sellers</span>
              <button
                onClick={handleSearchClick}
                className={`mt-3 px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-500 transition-colors ${isMobile ? 'text-base' : 'text-sm'}`}
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

      {/* Suggestions dropdown */}
      {suggestionList}
    </div>
  );
};

export default FoodSearchField;
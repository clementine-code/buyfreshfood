"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
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
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<FoodSearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const preventBlurRef = useRef(false);

  // Search function with debouncing
  const searchFood = useCallback(async (searchQuery: string) => {
    if (searchQuery.length === 0) {
      // Show popular items for empty query
      setIsLoading(true);
      try {
        const popularSuggestions = await foodSearchService.getFoodSuggestions("");
        setSuggestions(popularSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error getting popular suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
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

  // Handle input changes with debouncing
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search - shorter delay for better UX
    debounceRef.current = setTimeout(() => {
      searchFood(value);
    }, 200);
  }, [searchFood]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (event.key === 'Enter') {
        event.preventDefault();
        onSearchSubmit?.(query);
        setShowSuggestions(false);
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
          onSearchSubmit?.(query);
          setShowSuggestions(false);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, query, onSearchSubmit]);

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback((suggestion: FoodSearchSuggestion) => {
    preventBlurRef.current = true;
    
    setQuery(suggestion.title);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    onItemSelect?.(suggestion);
    
    setTimeout(() => {
      preventBlurRef.current = false;
    }, 100);
  }, [onItemSelect]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0 || query.length === 0) {
      setShowSuggestions(true);
      if (query.length === 0) {
        searchFood(""); // Load popular items
      }
    }
  }, [suggestions.length, query.length, searchFood]);

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

  // Memoized suggestion list
  const suggestionList = useMemo(() => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-[60] max-h-96 overflow-y-auto">
        {/* Header for empty query */}
        {query.length === 0 && showTrending && (
          <div className="px-3 py-2 border-b border-neutral-100 bg-neutral-50">
            <div className="flex items-center gap-2 text-subtext-color">
              <FeatherTrendingUp className="w-4 h-4" />
              <span className="text-caption-bold font-caption-bold">Popular Items</span>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="px-3 py-4 text-center">
            <div className="flex items-center justify-center gap-2 text-subtext-color">
              <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-body font-body">Searching fresh food...</span>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {!isLoading && suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.type}-${suggestion.id}`}
            className={`w-full text-left px-3 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors ${
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
            <div className="flex items-start gap-3">
              {/* Image */}
              {suggestion.image && (
                <img
                  src={suggestion.image}
                  alt={suggestion.title}
                  className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                />
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-subtext-color">
                        {getSuggestionIcon(suggestion)}
                      </div>
                      <h4 className="font-medium text-default-font truncate">
                        {suggestion.title}
                      </h4>
                      {suggestion.isOrganic && (
                        <Badge variant="success" className="text-xs">
                          Organic
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-subtext-color truncate">
                      {suggestion.subtitle}
                    </p>
                    
                    {/* Tags for products */}
                    {suggestion.tags && suggestion.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {suggestion.tags.slice(0, 2).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="neutral" className="text-xs">
                            {tag.replace('-', ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Price and location */}
                  <div className="text-right flex-shrink-0">
                    {suggestion.price && (
                      <div className="font-medium text-default-font text-sm">
                        {suggestion.price}
                      </div>
                    )}
                    {suggestion.location && (
                      <div className="flex items-center gap-1 text-xs text-subtext-color mt-1">
                        <FeatherMapPin className="w-3 h-3" />
                        <span className="truncate max-w-20">
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
        {!isLoading && suggestions.length === 0 && query.length > 0 && (
          <div className="px-3 py-4 text-center text-subtext-color">
            <div className="flex flex-col items-center gap-2">
              <FeatherSearch className="w-8 h-8 text-neutral-300" />
              <span className="text-body font-body">No items found for "{query}"</span>
              <span className="text-caption font-caption">Try searching for fruits, vegetables, or local sellers</span>
            </div>
          </div>
        )}
      </div>
    );
  }, [showSuggestions, suggestions, isLoading, query, selectedIndex, showTrending, getSuggestionIcon, handleSuggestionClick]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <TextField
        className="h-auto w-full flex-none"
        variant="filled"
        label=""
        helpText=""
        icon={<FeatherSearch />}
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
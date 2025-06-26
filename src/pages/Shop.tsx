"use client";

import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherMap } from "@subframe/core";
import { FeatherFilter } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { ToggleGroup } from "@/ui/components/ToggleGroup";
import { FeatherGrid } from "@subframe/core";
import { FeatherList } from "@subframe/core";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { FeatherStar } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { FeatherDollarSign } from "@subframe/core";
import { FeatherMapPin } from "@subframe/core";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { Badge } from "@/ui/components/Badge";
import { FeatherHeart } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { FeatherWifi } from "@subframe/core";
import { FeatherWifiOff } from "@subframe/core";
import { Loader } from "@/ui/components/Loader";
import { Alert } from "@/ui/components/Alert";
import Map from "../components/Map";
import MobileFilterModal from "../components/MobileFilterModal";
import MobileMapModal from "../components/MobileMapModal";
import DesktopFilterModal from "../components/DesktopFilterModal";
import Footer from "../components/Footer";
import { getProducts, getCategories, getSellers, type Product } from "../lib/supabase";
import { foodSearchService, type FoodItem } from "../services/foodSearchService";
import { useLocationContext } from "../contexts/LocationContext";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import { useScrollDirection } from "../hooks/useScrollDirection";
import { trackUserBehavior, storeLocalBehavior } from "../utils/waitlistUtils";

function Shop() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [showDesktopFilters, setShowDesktopFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    categories: [],
    quality: [],
    sellers: []
  });
  
  // Database state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Search state
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Scroll direction for mobile filter bar
  const { scrollDirection } = useScrollDirection({ threshold: 10, debounceMs: 100 });

  // Waitlist integration
  const { state: locationState } = useLocationContext();
  const { openWaitlistFlow } = useWaitlistContext();

  // Track page visit with error handling
  useEffect(() => {
    trackUserBehavior('visited_shop_page', {}, locationState);
    storeLocalBehavior('visited_shop_page');
  }, [locationState]);

  // Load data from Supabase and handle URL search params
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsOfflineMode(false);
        
        // Load all data in parallel
        const [productsResult, categoriesResult, sellersResult] = await Promise.all([
          getProducts(),
          getCategories(),
          getSellers()
        ]);

        // Check if any requests failed (indicating offline mode)
        const hasErrors = productsResult.error || categoriesResult.error || sellersResult.error;
        
        if (hasErrors) {
          console.warn('Some data requests failed, checking if using fallback data');
          // If we got data despite errors, we're using fallback data
          if (productsResult.data?.length > 0) {
            setIsOfflineMode(true);
            console.log('Using fallback data due to network issues');
          } else {
            throw new Error('Unable to load product data');
          }
        }

        setProducts(productsResult.data || []);
        setCategories(categoriesResult.data || []);
        setSellers(sellersResult.data || []);

        // Check for search query in URL
        const urlSearchQuery = searchParams.get('search');
        const urlCategory = searchParams.get('category');
        const urlSeller = searchParams.get('seller');
        
        if (urlSearchQuery) {
          setCurrentSearchQuery(urlSearchQuery);
          await performSearch(urlSearchQuery);
        } else if (urlCategory) {
          // Handle category filter from URL
          setAppliedFilters(prev => ({
            ...prev,
            categories: [urlCategory]
          }));
          setIsSearchMode(false);
        } else if (urlSeller) {
          // Handle seller filter from URL
          setAppliedFilters(prev => ({
            ...prev,
            sellers: [urlSeller]
          }));
          setIsSearchMode(false);
        } else {
          // No search parameters, show all products
          setIsSearchMode(false);
          setCurrentSearchQuery("");
        }
      } catch (err) {
        console.error('Error loading data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
        
        if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
          setError('Unable to connect to our servers. Please check your internet connection and try again.');
          setIsOfflineMode(true);
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  // Perform search using food search service
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await foodSearchService.searchProducts(query.trim());
      setSearchResults(results);
      setIsSearchMode(true);
      setError(null);
    } catch (err) {
      console.error('Error searching products:', err);
      setError('Failed to search products');
      setSearchResults([]);
      setIsSearchMode(false);
    } finally {
      setLoading(false);
    }
  };

  // Clear search and return to all products
  const clearSearch = () => {
    setIsSearchMode(false);
    setSearchResults([]);
    setCurrentSearchQuery("");
    setAppliedFilters({
      categories: [],
      quality: [],
      sellers: []
    });
    setCurrentPage(1);
    // Update URL to remove search params
    window.history.replaceState({}, '', '/shop');
  };

  // Handle Add to Cart with waitlist logic
  const handleAddToCart = async (product: any) => {
    // Track the attempt
    trackUserBehavior('attempted_add_to_cart', {
      productId: product.id,
      productName: product.name,
      price: product.price
    }, locationState);
    storeLocalBehavior('attempted_add_to_cart', { productName: product.name });

    // Determine waitlist type based on location
    const waitlistType = locationState.isNWA ? 'early_access' : 'geographic';
    
    // Open waitlist flow with current location data
    await openWaitlistFlow(waitlistType, locationState.isSet ? {
      isNWA: locationState.isNWA,
      city: locationState.city || '',
      state: locationState.state || '',
      zipCode: locationState.zipCode || '',
      formattedAddress: locationState.location || ''
    } : undefined);
  };

  // Handle Save for Later with waitlist logic
  const handleSaveForLater = async (product: any) => {
    trackUserBehavior('attempted_save_for_later', {
      productId: product.id,
      productName: product.name
    }, locationState);

    // Determine waitlist type based on location
    const waitlistType = locationState.isNWA ? 'early_access' : 'geographic';
    
    // Open waitlist flow with current location data
    await openWaitlistFlow(waitlistType, locationState.isSet ? {
      isNWA: locationState.isNWA,
      city: locationState.city || '',
      state: locationState.state || '',
      zipCode: locationState.zipCode || '',
      formattedAddress: locationState.location || ''
    } : undefined);
  };

  // Track product views
  const trackProductView = (product: any) => {
    trackUserBehavior('viewed_product', {
      productId: product.id,
      productName: product.name,
      category: product.category?.name || product.category,
      seller: product.seller?.name || product.seller
    }, locationState);

    // Store for pre-filling waitlist
    const existing = JSON.parse(localStorage.getItem('fresh_food_behavior') || '{}');
    const viewedProducts = existing.viewed_products || [];
    viewedProducts.push({ id: product.id, name: product.name });
    existing.viewed_products = viewedProducts.slice(-5); // Keep last 5
    localStorage.setItem('fresh_food_behavior', JSON.stringify(existing));
  };

  // Check if any filters are applied
  const hasFiltersApplied = Object.values(appliedFilters).some(filterArray => filterArray.length > 0);

  // Check if we're currently viewing the main product view (not in modal views)
  const isMainProductView = !showMobileFilters && !showMobileMap;

  // Get current products to display (search results or regular products)
  const allCurrentProducts = isSearchMode ? searchResults : products;
  const totalProducts = allCurrentProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  
  // Get paginated products
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = allCurrentProducts.slice(startIndex, endIndex);

  // Reset to page 1 when search/filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [isSearchMode, appliedFilters]);

  const getBadgeVariant = (tag: string) => {
    if (tag.includes('organic') || tag.includes('pesticide-free')) return 'success';
    if (tag.includes('limited') || tag.includes('seasonal')) return 'warning';
    if (tag.includes('artisan') || tag.includes('heritage')) return 'brand';
    return 'neutral';
  };

  const formatPrice = (price: number | string, unit: string) => {
    const priceNum = typeof price === 'string' ? parseFloat(price.replace('$', '')) : price;
    return `$${priceNum.toFixed(2)}/${unit}`;
  };

  // Convert FoodItem to Product-like structure for rendering
  const convertFoodItemToProduct = (item: FoodItem): any => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: parseFloat(item.price.replace('$', '')),
    unit: item.unit,
    image_url: item.image,
    stock_quantity: item.inStock ? (item.stockLevel === 'high' ? 50 : item.stockLevel === 'medium' ? 25 : 5) : 0,
    is_organic: item.isOrganic,
    tags: item.tags,
    seller: { name: item.seller },
    category: { name: item.category },
    average_rating: Math.random() * 2 + 3, // Mock rating
    reviews: []
  });

  const ProductCard = ({ product, isListView = false }: { product: any; isListView?: boolean }) => {
    // Handle both Product and FoodItem types
    const displayProduct = product.seller ? product : convertFoodItemToProduct(product);
    
    // Track view when card is rendered
    React.useEffect(() => {
      trackProductView(displayProduct);
    }, []);
    
    if (isListView) {
      return (
        <div className="flex items-start gap-4 rounded-lg bg-white px-4 py-4 shadow-sm border border-neutral-100">
          <img
            className="h-20 w-20 md:h-24 md:w-24 flex-none rounded-md object-cover"
            src={displayProduct.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
          />
          <div className="flex flex-1 flex-col gap-2 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {displayProduct.is_organic && (
                    <Badge variant="success">Organic</Badge>
                  )}
                  {displayProduct.tags?.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant={getBadgeVariant(tag)}>
                      {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                  {displayProduct.stock_quantity < 10 && (
                    <Badge variant="warning">Limited Stock</Badge>
                  )}
                </div>
                <span className="text-heading-3 font-heading-3 text-default-font truncate">
                  {displayProduct.name}
                </span>
                <span className="text-body font-body text-subtext-color line-clamp-2 hidden md:block">
                  {displayProduct.description}
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  by {displayProduct.seller?.name}
                </span>
                {displayProduct.average_rating && (
                  <div className="flex items-center gap-1">
                    <FeatherStar className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-caption font-caption text-subtext-color">
                      {displayProduct.average_rating.toFixed(1)} ({displayProduct.reviews?.length || 0} reviews)
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-row md:flex-col items-center md:items-end gap-2 justify-between md:justify-start">
                <span className="text-heading-3 font-heading-3 text-default-font whitespace-nowrap">
                  {formatPrice(displayProduct.price, displayProduct.unit)}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    className="h-8"
                    size="small"
                    onClick={() => handleAddToCart(displayProduct)}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    variant="destructive-secondary"
                    size="small"
                    icon={<FeatherHeart />}
                    onClick={() => handleSaveForLater(displayProduct)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-between gap-4 rounded-lg bg-white px-4 py-4 shadow-sm border border-neutral-100 h-full">
        <div className="flex flex-col gap-4">
          <img
            className="h-48 w-full flex-none rounded-md object-cover"
            src={displayProduct.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
          />
          <div className="flex w-full flex-col items-start gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {displayProduct.is_organic && (
                <Badge variant="success">Organic</Badge>
              )}
              {displayProduct.tags?.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant={getBadgeVariant(tag)}>
                  {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              ))}
              {displayProduct.stock_quantity < 10 && (
                <Badge variant="warning">Limited Stock</Badge>
              )}
            </div>
            <span className="text-heading-3 font-heading-3 text-default-font">
              {displayProduct.name}
            </span>
            <span className="text-caption font-caption text-subtext-color">
              by {displayProduct.seller?.name}
            </span>
            {displayProduct.average_rating && (
              <div className="flex items-center gap-1">
                <FeatherStar className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-caption font-caption text-subtext-color">
                  {displayProduct.average_rating.toFixed(1)} ({displayProduct.reviews?.length || 0} reviews)
                </span>
              </div>
            )}
            <span className="text-body-bold font-body-bold text-default-font">
              {formatPrice(displayProduct.price, displayProduct.unit)}
            </span>
          </div>
        </div>
        <div className="flex w-full items-center gap-2">
          <Button
            className="h-8 grow shrink-0 basis-0"
            onClick={() => handleAddToCart(displayProduct)}
          >
            Add to Cart
          </Button>
          <IconButton
            variant="destructive-secondary"
            icon={<FeatherHeart />}
            onClick={() => handleSaveForLater(displayProduct)}
          />
        </div>
      </div>
    );
  };

  // Pagination component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          pages.push(1, 2, 3, 4, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
          pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-white">
        <div className="flex items-center gap-2 text-body font-body text-subtext-color">
          <span>
            Showing {startIndex + 1}-{Math.min(endIndex, totalProducts)} of {totalProducts} products
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="neutral-secondary"
            size="small"
            icon={<FeatherChevronLeft />}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-subtext-color">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "brand-primary" : "neutral-tertiary"}
                    size="small"
                    onClick={() => setCurrentPage(page as number)}
                    className="min-w-[2rem]"
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <Button
            variant="neutral-secondary"
            size="small"
            iconRight={<FeatherChevronRight />}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-default-background">
        <div className="flex flex-col items-center gap-4">
          <Loader size="large" />
          <span className="text-body font-body text-subtext-color">
            {isSearchMode ? 'Searching fresh local products...' : 'Loading fresh local products...'}
          </span>
        </div>
      </div>
    );
  }

  if (error && !isOfflineMode) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-default-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <FeatherWifiOff className="w-16 h-16 text-error-600" />
          <span className="text-heading-2 font-heading-2 text-error-700">Unable to load products</span>
          <span className="text-body font-body text-subtext-color">{error}</span>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-default-background">
      {/* Offline Mode Alert - FIXED POSITIONING */}
      {isOfflineMode && (
        <div className="fixed left-4 right-4 z-[90] xl:left-6 xl:right-6" style={{top: '73px'}}>
          <Alert variant="warning" className="shadow-lg">
            <FeatherWifiOff className="w-5 h-5" />
            <div className="flex flex-col gap-1">
              <span className="font-medium">Limited connectivity</span>
              <span className="text-sm">Showing sample products. Some features may be unavailable.</span>
            </div>
          </Alert>
        </div>
      )}

      {/* Desktop Layout - FIXED HEIGHT, NO GAPS */}
      <div className={`hidden xl:flex w-full h-full desktop-shop-container ${isOfflineMode ? 'offline-mode' : ''}`}>
        {/* Left Side - Products (50% width, scrollable content) */}
        <div className="w-1/2 h-full flex flex-col bg-default-background">
          {/* Controls Bar - NO GAP, sits directly under navbar */}
          <div className="sort-filter-bar flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200 shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant={hasFiltersApplied ? "brand-primary" : "neutral-secondary"}
                icon={<FeatherFilter />}
                onClick={() => setShowDesktopFilters(true)}
                className="rounded-full"
              >
                Filters {hasFiltersApplied && `(${Object.values(appliedFilters).flat().length})`}
              </Button>
              
              <div className="flex flex-col gap-1">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  {totalProducts} {isSearchMode ? 'search results' : 'local products'}
                  {isSearchMode && currentSearchQuery && (
                    <span className="text-body font-body text-subtext-color ml-2">
                      for "{currentSearchQuery}"
                    </span>
                  )}
                </span>
                {isSearchMode && (
                  <button
                    onClick={clearSearch}
                    className="text-caption font-caption text-brand-600 hover:text-brand-700 text-left"
                  >
                    ← Back to all products
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <ToggleGroup value={viewMode} onValueChange={(value: string) => setViewMode(value || "grid")}>
                <ToggleGroup.Item icon={<FeatherGrid />} value="grid" />
                <ToggleGroup.Item icon={<FeatherList />} value="list" />
              </ToggleGroup>
              
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-tertiary"
                    iconRight={<FeatherChevronDown />}
                    size="small"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Sort
                  </Button>
                </SubframeCore.DropdownMenu.Trigger>
                <SubframeCore.DropdownMenu.Portal>
                  <SubframeCore.DropdownMenu.Content
                    side="bottom"
                    align="end"
                    sideOffset={12}
                    className="dropdown-menu"
                    asChild={true}
                  >
                    <DropdownMenu>
                      <DropdownMenu.DropdownItem icon={<FeatherMapPin />}>
                        Nearest to Me
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherStar />}>
                        Top Rated
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherShoppingCart />}>
                        Most Purchased
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherDollarSign />}>
                        Price - Low to High
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem icon={<FeatherDollarSign />}>
                        Price - High to Low
                      </DropdownMenu.DropdownItem>
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
            </div>
          </div>

          {/* Products Area - Scrollable with ALL content */}
          <div className="flex-1 overflow-y-auto bg-default-background">
            {/* Products Grid/List */}
            <div className="p-6">
              {currentProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <FeatherX className="w-16 h-16 text-neutral-300 mb-4" />
                  <span className="text-heading-2 font-heading-2 text-default-font mb-2">
                    {isSearchMode ? 'No products found' : 'No products available'}
                  </span>
                  <span className="text-body font-body text-subtext-color">
                    {isSearchMode 
                      ? `No results found for "${currentSearchQuery}". Try different search terms or browse our categories.`
                      : 'Check back later for fresh local products'
                    }
                  </span>
                  {isSearchMode && (
                    <Button onClick={clearSearch} className="mt-4">
                      Browse All Products
                    </Button>
                  )}
                </div>
              ) : (
                <div className={`w-full ${
                  viewMode === "grid" 
                    ? "grid gap-4 grid-cols-1 lg:grid-cols-2" 
                    : "flex flex-col gap-4"
                }`}>
                  {currentProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      isListView={viewMode === "list"} 
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Pagination */}
            <PaginationControls />
            
            {/* Footer */}
            <Footer />
          </div>
        </div>

        {/* Right Side - Map (50% width, COMPLETELY FROZEN) */}
        <div className="w-1/2 h-full relative">
          <Map className="h-full w-full z-0" />
        </div>
      </div>

      {/* Mobile & Tablet Layout - NO GAPS */}
      <div className={`xl:hidden flex w-full flex-col bg-white min-h-screen overflow-y-auto relative mobile-shop-content ${isOfflineMode ? 'offline-mode' : ''} ${scrollDirection === 'down' ? 'filter-hidden' : 'filter-visible'}`}>
        {/* Mobile/Tablet Page Controls - SMART SCROLL BEHAVIOR */}
        <div className={`sort-filter-bar xl:hidden w-full ${
  (showMobileFilters || showMobileMap) ? 'hidden' : ''
} ${
  scrollDirection === 'down' ? 'scroll-hidden' : 'scroll-visible'
}`}>
          <div className="flex w-full flex-col gap-3 px-4 py-4">
            {/* Search Status and Controls */}
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-body-bold font-body-bold text-default-font">
                  {totalProducts} {isSearchMode ? 'results' : 'products'}
                  {isSearchMode && currentSearchQuery && (
                    <span className="text-caption font-caption text-subtext-color block">
                      for "{currentSearchQuery}"
                    </span>
                  )}
                </span>
                {isSearchMode && (
                  <button
                    onClick={clearSearch}
                    className="text-caption font-caption text-brand-600 hover:text-brand-700 text-left"
                  >
                    ← Back to all products
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ToggleGroup value={viewMode} onValueChange={(value: string) => setViewMode(value || "grid")}>
                  <ToggleGroup.Item icon={<FeatherGrid />} value="grid" />
                  <ToggleGroup.Item icon={<FeatherList />} value="list" />
                </ToggleGroup>
                <SubframeCore.DropdownMenu.Root>
                  <SubframeCore.DropdownMenu.Trigger asChild={true}>
                    <Button
                      variant="neutral-tertiary"
                      iconRight={<FeatherChevronDown />}
                      size="small"
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                    >
                      Sort
                    </Button>
                  </SubframeCore.DropdownMenu.Trigger>
                  <SubframeCore.DropdownMenu.Portal>
                    <SubframeCore.DropdownMenu.Content
                      side="bottom"
                      align="end"
                      sideOffset={12}
                      className="dropdown-menu"
                      asChild={true}
                    >
                      <DropdownMenu>
                        <DropdownMenu.DropdownItem icon={<FeatherMapPin />}>
                          Nearest to Me
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem icon={<FeatherStar />}>
                          Top Rated
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem icon={<FeatherShoppingCart />}>
                          Most Purchased
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem icon={<FeatherDollarSign />}>
                          Price - Low to High
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem icon={<FeatherDollarSign />}>
                          Price - High to Low
                        </DropdownMenu.DropdownItem>
                      </DropdownMenu>
                    </SubframeCore.DropdownMenu.Content>
                  </SubframeCore.DropdownMenu.Portal>
                </SubframeCore.DropdownMenu.Root>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List - Full width, scrollable content */}
        <div className="w-full px-4 py-4 flex-1">
          {currentProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <FeatherX className="w-16 h-16 text-neutral-300 mb-4" />
              <span className="text-heading-2 font-heading-2 text-default-font mb-2">
                {isSearchMode ? 'No products found' : 'No products available'}
              </span>
              <span className="text-body font-body text-subtext-color mb-4">
                {isSearchMode 
                  ? `No results found for "${currentSearchQuery}". Try different search terms or browse our categories.`
                  : 'Check back later for fresh local products'
                }
              </span>
              {isSearchMode && (
                <Button onClick={clearSearch}>
                  Browse All Products
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className={`w-full ${
                viewMode === "grid" 
                  ? "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3" 
                  : "flex flex-col gap-4"
              }`}>
                {currentProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    isListView={viewMode === "list"} 
                  />
                ))}
              </div>
              
              {/* Mobile Pagination */}
              <div className="mt-8">
                <PaginationControls />
              </div>
            </>
          )}
        </div>

        {/* Footer - Mobile & Tablet Only */}
        <Footer />

        {/* Floating Action Buttons - Mobile & Tablet Only */}
        {isMainProductView && (
          <div className="floating-actions">
            <div className="flex items-center gap-3 bg-white rounded-full px-4 py-3 shadow-lg border border-neutral-200">
              <Button
                variant="neutral-secondary"
                icon={<FeatherMap />}
                onClick={() => setShowMobileMap(true)}
                className="rounded-full px-6"
              >
                Map
              </Button>
              <div className="w-px h-6 bg-neutral-200"></div>
              <Button
                variant={hasFiltersApplied ? "brand-primary" : "neutral-secondary"}
                icon={<FeatherFilter />}
                onClick={() => setShowMobileFilters(true)}
                className="rounded-full px-6"
              >
                Filters {hasFiltersApplied && `(${Object.values(appliedFilters).flat().length})`}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <MobileFilterModal
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        appliedFilters={appliedFilters}
        onFiltersChange={setAppliedFilters}
        categories={categories}
        sellers={sellers}
      />

      <MobileMapModal
        isOpen={showMobileMap}
        onClose={() => setShowMobileMap(false)}
      />

      <DesktopFilterModal
        isOpen={showDesktopFilters}
        onClose={() => setShowDesktopFilters(false)}
        appliedFilters={appliedFilters}
        onFiltersChange={setAppliedFilters}
        categories={categories}
        sellers={sellers}
      />
    </div>
  );
}

export default Shop;
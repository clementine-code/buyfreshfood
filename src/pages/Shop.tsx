"use client";

import React, { useState, useEffect } from "react";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherMap } from "@subframe/core";
import { FeatherFilter } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { CheckboxCard } from "@/ui/components/CheckboxCard";
import { TextField } from "@/ui/components/TextField";
import { FeatherSearch } from "@subframe/core";
import { ToggleGroup } from "@/ui/components/ToggleGroup";
import { FeatherGrid } from "@subframe/core";
import { FeatherList } from "@subframe/core";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { FeatherStar } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { FeatherDollarSign } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { Badge } from "@/ui/components/Badge";
import { FeatherHeart } from "@subframe/core";
import { FeatherTwitter } from "@subframe/core";
import { FeatherGithub } from "@subframe/core";
import { FeatherSlack } from "@subframe/core";
import { FeatherYoutube } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { Loader } from "@/ui/components/Loader";
import Map from "../components/Map";
import MobileFilterModal from "../components/MobileFilterModal";
import MobileMapModal from "../components/MobileMapModal";
import DesktopFilterModal from "../components/DesktopFilterModal";
import { getProducts, getCategories, getSellers, type Product } from "../lib/supabase";

function Shop() {
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

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all data in parallel
        const [productsResult, categoriesResult, sellersResult] = await Promise.all([
          getProducts(),
          getCategories(),
          getSellers()
        ]);

        if (productsResult.error) {
          throw new Error(productsResult.error.message);
        }
        if (categoriesResult.error) {
          throw new Error(categoriesResult.error.message);
        }
        if (sellersResult.error) {
          throw new Error(sellersResult.error.message);
        }

        setProducts(productsResult.data);
        setCategories(categoriesResult.data);
        setSellers(sellersResult.data);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Check if any filters are applied
  const hasFiltersApplied = Object.values(appliedFilters).some(filterArray => filterArray.length > 0);

  const getBadgeVariant = (tag: string) => {
    if (tag.includes('organic') || tag.includes('pesticide-free')) return 'success';
    if (tag.includes('limited') || tag.includes('seasonal')) return 'warning';
    if (tag.includes('artisan') || tag.includes('heritage')) return 'brand';
    return 'neutral';
  };

  const formatPrice = (price: number, unit: string) => {
    return `$${price.toFixed(2)}/${unit}`;
  };

  const ProductCard = ({ product, isListView = false }: { product: Product; isListView?: boolean }) => {
    if (isListView) {
      return (
        <div className="flex items-start gap-4 rounded-lg bg-white px-4 py-4 shadow-sm border border-neutral-100">
          <img
            className="h-20 w-20 md:h-24 md:w-24 flex-none rounded-md object-cover"
            src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
          />
          <div className="flex flex-1 flex-col gap-2 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {product.is_organic && (
                    <Badge variant="success">Organic</Badge>
                  )}
                  {product.tags?.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant={getBadgeVariant(tag)}>
                      {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  ))}
                  {product.stock_quantity < 10 && (
                    <Badge variant="warning">Limited Stock</Badge>
                  )}
                </div>
                <span className="text-heading-3 font-heading-3 text-default-font truncate">
                  {product.name}
                </span>
                <span className="text-body font-body text-subtext-color line-clamp-2 hidden md:block">
                  {product.description}
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  by {product.seller?.name}
                </span>
                {product.average_rating && (
                  <div className="flex items-center gap-1">
                    <FeatherStar className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-caption font-caption text-subtext-color">
                      {product.average_rating.toFixed(1)} ({product.reviews?.length || 0} reviews)
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-end gap-2 justify-between md:justify-start">
                <span className="text-heading-3 font-heading-3 text-default-font whitespace-nowrap">
                  {formatPrice(product.price, product.unit)}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    className="h-8"
                    size="small"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    variant="destructive-secondary"
                    size="small"
                    icon={<FeatherHeart />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-start gap-4 rounded-lg bg-white px-4 py-4 shadow-sm border border-neutral-100">
        <img
          className="h-48 w-full flex-none rounded-md object-cover"
          src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
        />
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {product.is_organic && (
              <Badge variant="success">Organic</Badge>
            )}
            {product.tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant={getBadgeVariant(tag)}>
                {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
            {product.stock_quantity < 10 && (
              <Badge variant="warning">Limited Stock</Badge>
            )}
          </div>
          <span className="text-heading-3 font-heading-3 text-default-font">
            {product.name}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            by {product.seller?.name}
          </span>
          {product.average_rating && (
            <div className="flex items-center gap-1">
              <FeatherStar className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-caption font-caption text-subtext-color">
                {product.average_rating.toFixed(1)} ({product.reviews?.length || 0} reviews)
              </span>
            </div>
          )}
          <span className="text-body-bold font-body-bold text-default-font">
            {formatPrice(product.price, product.unit)}
          </span>
        </div>
        <div className="flex w-full items-center gap-2">
          <Button
            className="h-8 grow shrink-0 basis-0"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          >
            Add to Cart
          </Button>
          <IconButton
            variant="destructive-secondary"
            icon={<FeatherHeart />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-default-background">
        <div className="flex flex-col items-center gap-4">
          <Loader size="large" />
          <span className="text-body font-body text-subtext-color">Loading fresh local products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-default-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
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
    <div className="flex h-screen w-full flex-col bg-default-background">
      {/* Desktop Layout - Only show on extra large screens (1280px+) */}
      <div className="hidden xl:flex w-full h-full">
        {/* Left Side - Products */}
        <div className="flex-1 flex flex-col h-full bg-default-background">
          {/* Controls Bar - Fixed height, no scroll */}
          <div className="flex-none flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200 shadow-sm">
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
                  {products.length} local products
                </span>
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
                    sideOffset={4}
                    asChild={true}
                  >
                    <DropdownMenu>
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

          {/* Products Grid/List - Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-6 bg-default-background">
            <div className={`w-full ${
              viewMode === "grid" 
                ? "grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" 
                : "flex flex-col gap-4"
            }`}>
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isListView={viewMode === "list"} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Static Map */}
        <div className="w-1/2 h-full border-l border-neutral-200 z-10">
          <Map className="h-full w-full" />
        </div>
      </div>

      {/* Mobile & Tablet Layout - Show for all screens below 1280px */}
      <div className="xl:hidden flex w-full flex-col items-start flex-1 bg-default-background relative">
        {/* Mobile/Tablet Page Controls - Fixed positioning */}
        <div className="fixed top-[73px] left-0 right-0 z-30 bg-white border-b border-neutral-200 shadow-sm">
          <div className="flex w-full items-center justify-between px-4 py-3">
            <div className="flex flex-col gap-1">
              <span className="text-body-bold font-body-bold text-default-font">
                {products.length} local products
              </span>
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
                    sideOffset={4}
                    asChild={true}
                  >
                    <DropdownMenu>
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

        {/* Products Grid/List - Add proper top margin to account for both fixed bars */}
        <div className="w-full pt-[130px] px-4 pb-24 overflow-y-auto">
          <div className={`w-full ${
            viewMode === "grid" 
              ? "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3" 
              : "flex flex-col gap-4"
          }`}>
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isListView={viewMode === "list"} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Buttons - Mobile & Tablet Only (below 1280px) */}
      <div className="xl:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
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

      {/* Footer - Mobile & Tablet Only (below 1280px) */}
      <div className="xl:hidden flex w-full flex-col items-center justify-center gap-6 border-t border-solid border-neutral-100 bg-default-background px-4 py-12 max-w-full mt-8">
        <div className="flex w-full max-w-[1024px] flex-wrap items-start gap-6 mobile:flex-col mobile:flex-wrap mobile:gap-6">
          <div className="flex min-w-[320px] flex-col items-start gap-6 self-stretch mobile:items-center mobile:justify-start">
            <div className="flex w-full min-w-[320px] grow shrink-0 basis-0 items-start gap-4 mobile:items-start mobile:justify-center">
              <img
                className="h-5 w-5 flex-none object-cover"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4aye.png"
              />
              <span className="grow shrink-0 basis-0 font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                Fresh Local Food
              </span>
            </div>
            <div className="flex w-full items-center gap-2 mobile:items-center mobile:justify-center">
              <IconButton
                icon={<FeatherTwitter />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <IconButton
                icon={<FeatherGithub />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <IconButton
                icon={<FeatherSlack />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <IconButton
                icon={<FeatherYoutube />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
          </div>
          <div className="flex grow shrink-0 basis-0 flex-wrap items-start gap-4 self-stretch mobile:grid mobile:grid-cols-2">
            <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
              <span className="w-full font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                Product
              </span>
              <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                Features
              </span>
              <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                Integrations
              </span>
              <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                Pricing
              </span>
            </div>
            <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
              <span className="w-full font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                Company
              </span>
              <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                About us
              </span>
              <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                Blog
              </span>
              <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                Careers
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shop;
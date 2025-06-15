"use client";

import React, { useState } from "react";
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
import Map from "../components/Map";
import MobileFilterModal from "../components/MobileFilterModal";
import MobileMapModal from "../components/MobileMapModal";
import DesktopFilterModal from "../components/DesktopFilterModal";

const products = [
  {
    id: 1,
    name: "Heirloom Tomatoes",
    price: "$4.99/lb",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
    badges: ["Organic", "Limited Stock"],
    seller: "Green Acres Farm",
    description: "Juicy, flavorful heirloom tomatoes grown without pesticides. Perfect for salads and cooking."
  },
  {
    id: 2,
    name: "Rainbow Swiss Chard",
    price: "$3.99/bunch",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
    badges: ["Organic"],
    seller: "Hillside Gardens",
    description: "Colorful and nutritious leafy greens, perfect for sautéing or adding to smoothies."
  },
  {
    id: 3,
    name: "Fresh Herbs Bundle",
    price: "$5.99/bundle",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800",
    badges: ["Organic"],
    seller: "Herb Haven",
    description: "A mix of fresh basil, rosemary, thyme, and oregano. Grown in our greenhouse year-round."
  },
  {
    id: 4,
    name: "Farm Fresh Eggs",
    price: "$6.99/dozen",
    image: "https://images.unsplash.com/photo-1590005354167-6da97870c757?w=800",
    badges: ["Free Range"],
    seller: "Happy Hen Farm",
    description: "Free-range eggs from pasture-raised hens. Rich, golden yolks and superior taste."
  },
  {
    id: 5,
    name: "Artisan Sourdough Bread",
    price: "$8.99/loaf",
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800",
    badges: ["Artisan"],
    seller: "Sweet Life Bakery",
    description: "Traditional sourdough bread made with wild yeast starter. Crispy crust, soft interior."
  },
  {
    id: 6,
    name: "Seasonal Fruit Mix",
    price: "$12.99/basket",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800",
    badges: ["Organic"],
    seller: "Orchard Valley",
    description: "A beautiful selection of seasonal fruits including apples, pears, and stone fruits."
  },
  {
    id: 7,
    name: "Grass-Fed Ground Beef",
    price: "$9.99/lb",
    image: "https://images.unsplash.com/photo-1588347818481-c7c1b6b3b5b3?w=800",
    badges: ["Grass Fed", "Local"],
    seller: "Heritage Meats",
    description: "Premium grass-fed ground beef from cattle raised on local pastures."
  },
  {
    id: 8,
    name: "Organic Honey",
    price: "$15.99/jar",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800",
    badges: ["Organic", "Raw"],
    seller: "Busy Bee Apiary",
    description: "Pure, raw honey harvested from our local beehives. Unfiltered and unpasteurized."
  },
  {
    id: 9,
    name: "Baby Spinach",
    price: "$4.49/bag",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800",
    badges: ["Organic"],
    seller: "Green Acres Farm",
    description: "Tender baby spinach leaves, perfect for salads or cooking. Harvested fresh daily."
  },
  {
    id: 10,
    name: "Artisan Cheese Selection",
    price: "$18.99/pack",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800",
    badges: ["Local", "Artisan"],
    seller: "Hillside Dairy",
    description: "A curated selection of locally made artisan cheeses from grass-fed cows."
  },
  {
    id: 11,
    name: "Microgreens Mix",
    price: "$7.99/container",
    image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800",
    badges: ["Organic", "Fresh"],
    seller: "Urban Greens",
    description: "Nutrient-dense microgreens including pea shoots, radish, and sunflower greens."
  },
  {
    id: 12,
    name: "Heritage Apples",
    price: "$5.99/bag",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800",
    badges: ["Organic", "Heritage"],
    seller: "Orchard Valley",
    description: "Rare heritage apple varieties with unique flavors and textures."
  }
];

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

  // Check if any filters are applied
  const hasFiltersApplied = Object.values(appliedFilters).some(filterArray => filterArray.length > 0);

  const ProductCard = ({ product, isListView = false }) => {
    if (isListView) {
      return (
        <div className="flex items-start gap-4 rounded-lg bg-white px-4 py-4 shadow-sm border border-neutral-100">
          <img
            className="h-20 w-20 md:h-24 md:w-24 flex-none rounded-md object-cover"
            src={product.image}
          />
          <div className="flex flex-1 flex-col gap-2 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {product.badges.map((badge, index) => (
                    <Badge 
                      key={index} 
                      variant={badge === "Limited Stock" ? "warning" : badge === "Free Range" || badge === "Grass Fed" ? "success" : "brand"}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
                <span className="text-heading-3 font-heading-3 text-default-font truncate">
                  {product.name}
                </span>
                <span className="text-body font-body text-subtext-color line-clamp-2 hidden md:block">
                  {product.description}
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  by {product.seller}
                </span>
              </div>
              <div className="flex flex-row md:flex-col items-center md:items-end gap-2 justify-between md:justify-start">
                <span className="text-heading-3 font-heading-3 text-default-font whitespace-nowrap">
                  {product.price}
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
          src={product.image}
        />
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {product.badges.map((badge, index) => (
              <Badge 
                key={index} 
                variant={badge === "Limited Stock" ? "warning" : badge === "Free Range" || badge === "Grass Fed" ? "success" : "brand"}
              >
                {badge}
              </Badge>
            ))}
          </div>
          <span className="text-heading-3 font-heading-3 text-default-font">
            {product.name}
          </span>
          <span className="text-caption font-caption text-subtext-color">
            by {product.seller}
          </span>
          <span className="text-body-bold font-body-bold text-default-font">
            {product.price}
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

  return (
    <div className="flex h-screen w-full flex-col bg-default-background">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full h-full relative">
        {/* Left Side - Products */}
        <div className="flex-1 flex flex-col overflow-hidden bg-default-background">
          {/* Sticky Controls Bar - Perfectly aligned with navbar */}
          <div className="sticky top-[73px] z-30 flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-200 shadow-sm">
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

          {/* Products Grid/List - Scrollable content */}
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
        <div className="w-1/2 h-full border-l border-neutral-200 relative z-0">
          <Map className="h-full w-full" />
        </div>
      </div>

      {/* Mobile & Tablet Layout */}
      <div className="lg:hidden flex w-full flex-col items-start flex-1 bg-default-background relative">
        {/* Mobile/Tablet Page Controls - Fixed positioning to prevent gaps */}
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

      {/* Floating Action Buttons - Mobile & Tablet Only */}
      <div className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
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
      />

      {/* Footer - Mobile & Tablet Only */}
      <div className="lg:hidden flex w-full flex-col items-center justify-center gap-6 border-t border-solid border-neutral-100 bg-default-background px-4 py-12 max-w-full mt-8">
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
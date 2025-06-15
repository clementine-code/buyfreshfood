"use client";

import React, { useState } from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherMap } from "@subframe/core";
import { Accordion } from "@/ui/components/Accordion";
import { FeatherFilter } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { Checkbox } from "@/ui/components/Checkbox";
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
  }
];

function Shop() {
  const [viewMode, setViewMode] = useState("grid");
  const [filtersExpanded, setFiltersExpanded] = useState(true);
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
        <div className="flex items-start gap-4 rounded-md bg-white px-4 py-4 shadow-sm border border-neutral-100">
          <img
            className="h-24 w-24 flex-none rounded-md object-cover"
            src={product.image}
          />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
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
                <span className="text-body font-body text-subtext-color">
                  {product.description}
                </span>
                <span className="text-caption font-caption text-subtext-color">
                  Sold by {product.seller}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-heading-3 font-heading-3 text-default-font">
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
      <div className="flex flex-col items-start gap-4 rounded-md bg-white px-4 py-4 shadow-sm border border-neutral-100">
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
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-start gap-6 bg-default-background py-6">
        {/* Map Section */}
        <div className="w-full px-6">
          <Accordion
            trigger={
              <div className="flex w-full items-center justify-between px-6 py-4 bg-white rounded-lg border border-neutral-border">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Map of Local Food
                </span>
                <IconButton
                  variant="brand-primary"
                  icon={<FeatherMap />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
              </div>
            }
            defaultOpen={true}
          >
            <div className="flex w-full items-start gap-2 px-6 py-4">
              <img
                className="h-80 w-full rounded-lg object-cover"
                src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&w=1200"
              />
            </div>
          </Accordion>
        </div>

        {/* Main Content */}
        <div className="flex w-full items-start gap-6 px-6 flex-1">
          {/* Filters Sidebar - Collapsible */}
          <div className={`transition-all duration-300 ease-in-out ${
            filtersExpanded ? 'w-72 opacity-100' : 'w-12 opacity-100'
          } flex-none`}>
            {filtersExpanded ? (
              <div className="w-full">
                <div className="flex w-full items-center justify-between rounded-md border border-solid border-neutral-border bg-white px-4 py-4 mb-2">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Filters
                  </span>
                  <IconButton
                    variant={hasFiltersApplied ? "brand-primary" : "neutral-tertiary"}
                    icon={<FeatherFilter />}
                    onClick={() => setFiltersExpanded(false)}
                  />
                </div>
                <div className="flex w-full flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-white px-6 py-6">
                  <div className="flex w-full flex-col items-start gap-4">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Categories
                    </span>
                    <div className="flex w-full flex-col items-start gap-2">
                      <Button
                        className="h-auto w-full justify-start"
                        variant="neutral-tertiary"
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                      >
                        Vegetables
                      </Button>
                      <Button
                        className="h-auto w-full justify-start"
                        variant="neutral-tertiary"
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                      >
                        Fruits
                      </Button>
                      <Button
                        className="h-auto w-full justify-start"
                        variant="neutral-tertiary"
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                      >
                        Eggs & Dairy
                      </Button>
                      <Button
                        className="h-auto w-full justify-start"
                        variant="neutral-tertiary"
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                      >
                        Meat & Poultry
                      </Button>
                      <Button
                        className="h-auto w-full justify-start"
                        variant="neutral-tertiary"
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                      >
                        Baked Goods
                      </Button>
                      <Button
                        className="h-auto w-full justify-start"
                        variant="neutral-tertiary"
                        onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                      >
                        Artisan Crafts
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex w-full flex-col items-start gap-4">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Quality
                    </span>
                    <div className="flex w-full flex-col items-start gap-2">
                      <CheckboxCard
                        className="h-auto w-full"
                        checked={false}
                        onCheckedChange={(checked: boolean) => {}}
                      >
                        <span className="text-body-bold font-body-bold text-default-font">
                          Certified Organic
                        </span>
                      </CheckboxCard>
                      <CheckboxCard
                        className="h-auto w-full"
                        checked={false}
                        onCheckedChange={(checked: boolean) => {}}
                      >
                        <span className="text-body-bold font-body-bold text-default-font">
                          Pesticide Free
                        </span>
                      </CheckboxCard>
                      <CheckboxCard
                        className="h-auto w-full"
                        checked={false}
                        onCheckedChange={(checked: boolean) => {}}
                      >
                        <span className="text-body-bold font-body-bold text-default-font">
                          Free Range
                        </span>
                      </CheckboxCard>
                      <CheckboxCard
                        className="h-auto w-full"
                        checked={false}
                        onCheckedChange={(checked: boolean) => {}}
                      >
                        <span className="text-body-bold font-body-bold text-default-font">
                          Grass Fed
                        </span>
                      </CheckboxCard>
                    </div>
                  </div>
                  
                  <div className="flex w-full flex-col items-start gap-4">
                    <span className="text-heading-3 font-heading-3 text-default-font">
                      Sellers
                    </span>
                    <div className="flex w-full flex-col items-start gap-2">
                      <CheckboxCard
                        className="h-auto w-full"
                        checked={false}
                        onCheckedChange={(checked: boolean) => {}}
                      >
                        <span className="text-body-bold font-body-bold text-default-font">
                          Green Acres Farm
                        </span>
                      </CheckboxCard>
                      <CheckboxCard
                        className="h-auto w-full"
                        checked={false}
                        onCheckedChange={(checked: boolean) => {}}
                      >
                        <span className="text-body-bold font-body-bold text-default-font">
                          Sweet Life Bakery
                        </span>
                      </CheckboxCard>
                      <CheckboxCard
                        className="h-auto w-full"
                        checked={false}
                        onCheckedChange={(checked: boolean) => {}}
                      >
                        <span className="text-body-bold font-body-bold text-default-font">
                          Hillside Dairy
                        </span>
                      </CheckboxCard>
                      <CheckboxCard
                        className="h-auto w-full"
                        checked={false}
                        onCheckedChange={(checked: boolean) => {}}
                      >
                        <span className="text-body-bold font-body-bold text-default-font">
                          Heritage Meats
                        </span>
                      </CheckboxCard>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center rounded-md border border-solid border-neutral-border bg-white p-3">
                  <IconButton
                    variant={hasFiltersApplied ? "brand-primary" : "neutral-tertiary"}
                    icon={<FeatherFilter />}
                    onClick={() => setFiltersExpanded(true)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Products Section */}
          <div className="flex flex-col items-start gap-4 flex-1 min-w-0">
            {/* Controls */}
            <div className="flex w-full items-center justify-between">
              <span className="text-heading-2 font-heading-2 text-default-font">
                Fresh Local Products ({products.length})
              </span>
              <div className="flex items-center gap-4">
                <TextField
                  className="h-auto w-80 flex-none hidden md:flex"
                  variant="filled"
                  label=""
                  helpText=""
                  icon={<FeatherSearch />}
                >
                  <TextField.Input
                    placeholder="Search products..."
                    value=""
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                  />
                </TextField>
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
                        onClick={(
                          event: React.MouseEvent<HTMLButtonElement>
                        ) => {}}
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
                          <DropdownMenu.DropdownItem
                            icon={<FeatherShoppingCart />}
                          >
                            Most Purchased
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem icon={<FeatherDollarSign />}>
                            Price - Lowest to Highest
                          </DropdownMenu.DropdownItem>
                          <DropdownMenu.DropdownItem icon={<FeatherDollarSign />}>
                            Price - Highest to Lowest
                          </DropdownMenu.DropdownItem>
                        </DropdownMenu>
                      </SubframeCore.DropdownMenu.Content>
                    </SubframeCore.DropdownMenu.Portal>
                  </SubframeCore.DropdownMenu.Root>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className={`w-full ${
              viewMode === "grid" 
                ? `grid gap-4 ${filtersExpanded ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}` 
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

        {/* Footer */}
        <div className="flex w-full flex-col items-center justify-center gap-6 border-t border-solid border-neutral-100 bg-default-background px-6 py-12 max-w-full mobile:px-4 mobile:py-12 mt-8">
          <div className="flex w-full max-w-[1024px] flex-wrap items-start gap-6 mobile:flex-col mobile:flex-wrap mobile:gap-6">
            <div className="flex min-w-[320px] flex-col items-start gap-6 self-stretch mobile:items-center mobile:justify-start">
              <div className="flex w-full min-w-[320px] grow shrink-0 basis-0 items-start gap-4 mobile:items-start mobile:justify-center">
                <img
                  className="h-5 w-5 flex-none object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
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
    </DefaultPageLayout>
  );
}

export default Shop;
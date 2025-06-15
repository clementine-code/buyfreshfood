"use client";

import React from "react";
import { Dialog } from "@/ui/components/Dialog";
import { Button } from "@/ui/components/Button";
import { CheckboxCard } from "@/ui/components/CheckboxCard";
import { FeatherX } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: {
    categories: string[];
    quality: string[];
    sellers: string[];
  };
  onFiltersChange: (filters: any) => void;
}

const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  isOpen,
  onClose,
  appliedFilters,
  onFiltersChange
}) => {
  const categories = [
    "Vegetables", "Fruits", "Eggs & Dairy", 
    "Meat & Poultry", "Baked Goods", "Artisan Crafts"
  ];
  
  const qualityOptions = [
    "Certified Organic", "Pesticide Free", "Free Range", "Grass Fed"
  ];
  
  const sellers = [
    "Green Acres Farm", "Sweet Life Bakery", "Hillside Dairy", "Heritage Meats"
  ];

  const handleCategoryToggle = (category: string) => {
    const newCategories = appliedFilters.categories.includes(category)
      ? appliedFilters.categories.filter(c => c !== category)
      : [...appliedFilters.categories, category];
    
    onFiltersChange({
      ...appliedFilters,
      categories: newCategories
    });
  };

  const handleQualityToggle = (quality: string) => {
    const newQuality = appliedFilters.quality.includes(quality)
      ? appliedFilters.quality.filter(q => q !== quality)
      : [...appliedFilters.quality, quality];
    
    onFiltersChange({
      ...appliedFilters,
      quality: newQuality
    });
  };

  const handleSellerToggle = (seller: string) => {
    const newSellers = appliedFilters.sellers.includes(seller)
      ? appliedFilters.sellers.filter(s => s !== seller)
      : [...appliedFilters.sellers, seller];
    
    onFiltersChange({
      ...appliedFilters,
      sellers: newSellers
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      quality: [],
      sellers: []
    });
  };

  const hasFilters = Object.values(appliedFilters).some(arr => arr.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-end md:items-center md:justify-center">
      <div className="bg-white w-full h-[90vh] md:w-[500px] md:h-auto md:max-h-[80vh] md:rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-heading-2 font-heading-2 text-default-font">Filters</h2>
          <IconButton
            variant="neutral-tertiary"
            icon={<FeatherX />}
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Categories */}
          <div>
            <h3 className="text-heading-3 font-heading-3 text-default-font mb-3">Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <CheckboxCard
                  key={category}
                  checked={appliedFilters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                  className="h-auto"
                >
                  <span className="text-body font-body text-default-font text-sm">
                    {category}
                  </span>
                </CheckboxCard>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <h3 className="text-heading-3 font-heading-3 text-default-font mb-3">Quality</h3>
            <div className="space-y-2">
              {qualityOptions.map((quality) => (
                <CheckboxCard
                  key={quality}
                  checked={appliedFilters.quality.includes(quality)}
                  onCheckedChange={() => handleQualityToggle(quality)}
                  className="h-auto"
                >
                  <span className="text-body font-body text-default-font">
                    {quality}
                  </span>
                </CheckboxCard>
              ))}
            </div>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="text-heading-3 font-heading-3 text-default-font mb-3">Sellers</h3>
            <div className="space-y-2">
              {sellers.map((seller) => (
                <CheckboxCard
                  key={seller}
                  checked={appliedFilters.sellers.includes(seller)}
                  onCheckedChange={() => handleSellerToggle(seller)}
                  className="h-auto"
                >
                  <span className="text-body font-body text-default-font">
                    {seller}
                  </span>
                </CheckboxCard>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 flex gap-3">
          {hasFilters && (
            <Button
              variant="neutral-secondary"
              onClick={clearAllFilters}
              className="flex-1"
            >
              Clear All
            </Button>
          )}
          <Button
            onClick={onClose}
            className="flex-1"
          >
            Show Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterModal;
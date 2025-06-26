"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { CheckboxCard } from "@/ui/components/CheckboxCard";
import { FeatherX } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";

interface DesktopFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  appliedFilters: {
    categories: string[];
    quality: string[];
    sellers: string[];
  };
  onFiltersChange: (filters: any) => void;
  categories: any[];
  sellers: any[];
}

const DesktopFilterModal: React.FC<DesktopFilterModalProps> = ({
  isOpen,
  onClose,
  appliedFilters,
  onFiltersChange,
  categories,
  sellers
}) => {
  const qualityOptions = [
    "Certified Organic", "Pesticide Free", "Free Range", "Grass Fed", "Raw", "Artisan"
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
    <div className="modal-overlay flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-lg overflow-hidden flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-heading-2 font-heading-2 text-default-font">Filters</h2>
          <IconButton
            variant="neutral-tertiary"
            icon={<FeatherX />}
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Categories */}
            <div>
              <h3 className="text-heading-3 font-heading-3 text-default-font mb-4">Categories</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <CheckboxCard
                    key={category.id}
                    checked={appliedFilters.categories.includes(category.name)}
                    onCheckedChange={() => handleCategoryToggle(category.name)}
                    className="h-auto"
                  >
                    <span className="text-body font-body text-default-font">
                      {category.name}
                    </span>
                  </CheckboxCard>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div>
              <h3 className="text-heading-3 font-heading-3 text-default-font mb-4">Quality</h3>
              <div className="space-y-3">
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
              <h3 className="text-heading-3 font-heading-3 text-default-font mb-4">Sellers</h3>
              <div className="space-y-3">
                {sellers.map((seller) => (
                  <CheckboxCard
                    key={seller.id}
                    checked={appliedFilters.sellers.includes(seller.name)}
                    onCheckedChange={() => handleSellerToggle(seller.name)}
                    className="h-auto"
                  >
                    <span className="text-body font-body text-default-font">
                      {seller.name}
                    </span>
                  </CheckboxCard>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 flex gap-3 justify-end">
          {hasFilters && (
            <Button
              variant="neutral-secondary"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
          <Button
            onClick={onClose}
          >
            Show {appliedFilters ? Object.values(appliedFilters).flat().length : 0} Results
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DesktopFilterModal;
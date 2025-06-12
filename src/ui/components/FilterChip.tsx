"use client";
/*
 * Documentation:
 * Filter Chip — https://app.subframe.com/library?component=Filter+Chip_b9166e1e-8f25-48b7-b43c-436aa347de5a
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface FilterChipRootProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  icon?: SubframeCore.IconName;
  image?: string;
  children?: React.ReactNode;
  className?: string;
}

const FilterChipRoot = React.forwardRef<HTMLElement, FilterChipRootProps>(
  function FilterChipRoot(
    {
      selected = false,
      icon = "FeatherStar",
      image,
      children,
      className,
      ...otherProps
    }: FilterChipRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/b9166e1e flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-solid border-neutral-border px-3 py-2 hover:bg-neutral-50",
          {
            "border border-solid border-brand-200 bg-brand-50 hover:bg-brand-50":
              selected,
          },
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        {image ? (
          <img
            className="h-4 w-4 flex-none rounded-md object-cover [clip-path:circle()]"
            src={image}
          />
        ) : null}
        <SubframeCore.Icon
          className={SubframeUtils.twClassNames(
            "text-body font-body text-default-font",
            { "text-brand-700": selected }
          )}
          name={icon}
        />
        {children ? (
          <span
            className={SubframeUtils.twClassNames(
              "text-caption-bold font-caption-bold text-default-font",
              { "text-brand-700": selected }
            )}
          >
            {children}
          </span>
        ) : null}
      </div>
    );
  }
);

export const FilterChip = FilterChipRoot;

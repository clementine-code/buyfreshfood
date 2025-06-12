"use client";
/*
 * Documentation:
 * Bar Chart — https://app.subframe.com/6b5c53cba769/library?component=Bar+Chart_4d4f30e7-1869-4980-8b96-617df3b37912
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface BarChartRootProps
  extends React.ComponentProps<typeof SubframeCore.BarChart> {
  stacked?: boolean;
  className?: string;
}

const BarChartRoot = React.forwardRef<HTMLElement, BarChartRootProps>(
  function BarChartRoot(
    { stacked = false, className, ...otherProps }: BarChartRootProps,
    ref
  ) {
    return (
      <SubframeCore.BarChart
        className={SubframeUtils.twClassNames("h-80 w-full", className)}
        ref={ref as any}
        stacked={stacked}
        colors={[
          "#5fa269",
          "#d9f2dc",
          "#44874e",
          "#b4e1b9",
          "#346e3e",
          "#8ec796",
        ]}
        {...otherProps}
      />
    );
  }
);

export const BarChart = BarChartRoot;

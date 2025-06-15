"use client";
/*
 * Documentation:
 * Pie Chart — https://app.subframe.com/6b5c53cba769/library?component=Pie+Chart_0654ccc7-054c-4f3a-8e9a-b7c81dd3963c
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface PieChartRootProps
  extends React.ComponentProps<typeof SubframeCore.PieChart> {
  className?: string;
}

const PieChartRoot = React.forwardRef<HTMLElement, PieChartRootProps>(
  function PieChartRoot({ className, ...otherProps }: PieChartRootProps, ref) {
    return (
      <SubframeCore.PieChart
        className={SubframeUtils.twClassNames("h-52 w-52", className)}
        ref={ref as any}
        colors={[
          "#70af7d",
          "#dcf5e1",
          "#55915f",
          "#bbe6c3",
          "#41784b",
          "#9ad2a5",
        ]}
        {...otherProps}
      />
    );
  }
);

export const PieChart = PieChartRoot;

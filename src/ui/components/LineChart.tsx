"use client";
/*
 * Documentation:
 * Line Chart — https://app.subframe.com/library?component=Line+Chart_22944dd2-3cdd-42fd-913a-1b11a3c1d16d
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface LineChartRootProps
  extends React.ComponentProps<typeof SubframeCore.LineChart> {
  className?: string;
}

const LineChartRoot = React.forwardRef<HTMLElement, LineChartRootProps>(
  function LineChartRoot(
    { className, ...otherProps }: LineChartRootProps,
    ref
  ) {
    return (
      <SubframeCore.LineChart
        className={SubframeUtils.twClassNames("h-80 w-full", className)}
        ref={ref as any}
        colors={[
          "#10b981",
          "#a7f3d0",
          "#059669",
          "#6ee7b7",
          "#047857",
          "#34d399",
        ]}
        {...otherProps}
      />
    );
  }
);

export const LineChart = LineChartRoot;

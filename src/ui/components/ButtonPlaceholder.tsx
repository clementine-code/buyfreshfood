"use client";
/*
 * Documentation:
 * Button Placeholder — https://app.subframe.com/6b5c53cba769/library?component=Button+Placeholder_d356a0d4-ef5f-4935-b708-9627901e3617
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";
import { FeatherPlus } from "@subframe/core";

interface ButtonPlaceholderRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const ButtonPlaceholderRoot = React.forwardRef<
  HTMLElement,
  ButtonPlaceholderRootProps
>(function ButtonPlaceholderRoot(
  {
    icon = <FeatherPlus />,
    children,
    className,
    ...otherProps
  }: ButtonPlaceholderRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/d356a0d4 flex w-full cursor-pointer items-center gap-2 rounded-md border border-dashed border-neutral-300 px-4 py-3 hover:bg-neutral-100",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-subtext-color">
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {children ? (
        <span className="text-body-bold font-body-bold text-subtext-color">
          {children}
        </span>
      ) : null}
    </div>
  );
});

export const ButtonPlaceholder = ButtonPlaceholderRoot;

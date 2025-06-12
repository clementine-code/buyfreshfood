"use client";
/*
 * Documentation:
 * Custom Tree View — https://app.subframe.com/library?component=Custom+Tree+View_a744851a-b097-4d38-a360-2892b89333b5
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { Accordion } from "./Accordion";

interface FolderProps extends React.ComponentProps<typeof Accordion> {
  children?: React.ReactNode;
  label?: React.ReactNode;
  icon?: SubframeCore.IconName;
  value?: React.ReactNode;
  className?: string;
}

const Folder = React.forwardRef<HTMLElement, FolderProps>(function Folder(
  {
    children,
    label,
    icon = "FeatherFolder",
    value,
    className,
    ...otherProps
  }: FolderProps,
  ref
) {
  return (
    <Accordion
      className={SubframeUtils.twClassNames(
        "group/9d70b169 cursor-pointer",
        className
      )}
      trigger={
        <div className="flex w-full items-center gap-2 rounded-md px-2 py-2 group-hover/9d70b169:bg-neutral-50">
          <Accordion.Chevron />
          {label ? (
            <span className="line-clamp-1 grow shrink-0 basis-0 text-body font-body text-default-font group-hover/9d70b169:text-body-bold group-hover/9d70b169:font-body-bold">
              {label}
            </span>
          ) : null}
          {value ? (
            <span className="text-body font-body text-default-font text-right group-hover/9d70b169:text-body-bold group-hover/9d70b169:font-body-bold">
              {value}
            </span>
          ) : null}
        </div>
      }
      defaultOpen={true}
      ref={ref as any}
      {...otherProps}
    >
      {children ? (
        <div className="flex w-full flex-col items-start pl-6">{children}</div>
      ) : null}
    </Accordion>
  );
});

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  value?: React.ReactNode;
  className?: string;
}

const Item = React.forwardRef<HTMLElement, ItemProps>(function Item(
  { label, value, className, ...otherProps }: ItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/ebb17dce flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 hover:bg-transparent",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {label ? (
        <span className="line-clamp-1 grow shrink-0 basis-0 text-caption font-caption text-subtext-color group-hover/ebb17dce:text-default-font">
          {label}
        </span>
      ) : null}
      {value ? (
        <span className="text-caption font-caption text-subtext-color text-right group-hover/ebb17dce:text-default-font">
          {value}
        </span>
      ) : null}
    </div>
  );
});

interface CustomTreeViewRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const CustomTreeViewRoot = React.forwardRef<
  HTMLElement,
  CustomTreeViewRootProps
>(function CustomTreeViewRoot(
  { children, className, ...otherProps }: CustomTreeViewRootProps,
  ref
) {
  return children ? (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full flex-col items-start",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {children}
    </div>
  ) : null;
});

export const CustomTreeView = Object.assign(CustomTreeViewRoot, {
  Folder,
  Item,
});

"use client";
/*
 * Documentation:
 * Action Card — https://app.subframe.com/library?component=Action+Card_c057b814-6935-4071-926e-266393f91ae5
 * Icon with background — https://app.subframe.com/library?component=Icon+with+background_c5d68c0e-4c0c-4cff-8d8c-6ff334859b3a
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { IconWithBackground } from "./IconWithBackground";

interface ActionCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: SubframeCore.IconName;
  title?: React.ReactNode;
  desc?: React.ReactNode;
  className?: string;
}

const ActionCardRoot = React.forwardRef<HTMLElement, ActionCardRootProps>(
  function ActionCardRoot(
    {
      icon = "FeatherMousePointerClick",
      title,
      desc,
      className,
      ...otherProps
    }: ActionCardRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/c057b814 flex cursor-pointer items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm h-auto w-auto hover:border hover:border-solid hover:border-brand-200 hover:bg-brand-50",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <IconWithBackground size="large" icon={icon} square={true} />
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
          {title ? (
            <span className="w-full text-body-bold font-body-bold text-default-font">
              {title}
            </span>
          ) : null}
          {desc ? (
            <span className="w-full text-caption font-caption text-default-font">
              {desc}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);

export const ActionCard = ActionCardRoot;

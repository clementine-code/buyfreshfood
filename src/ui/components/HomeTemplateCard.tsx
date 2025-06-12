"use client";
/*
 * Documentation:
 * Home Template Card — https://app.subframe.com/library?component=Home+Template+Card_a823e6bc-70f6-468d-a7d9-29db325e2286
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface HomeTemplateCardRootProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  image?: string;
  subtitle?: React.ReactNode;
  timestamp?: React.ReactNode;
  className?: string;
}

const HomeTemplateCardRoot = React.forwardRef<
  HTMLElement,
  HomeTemplateCardRootProps
>(function HomeTemplateCardRoot(
  {
    title,
    image,
    subtitle,
    timestamp,
    className,
    ...otherProps
  }: HomeTemplateCardRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/a823e6bc flex h-full w-full cursor-pointer flex-col items-start gap-6 rounded-md bg-neutral-100 px-8 py-8 hover:bg-brand-50",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {title ? (
        <span className="line-clamp-3 w-full text-heading-3 font-heading-3 text-default-font">
          {title}
        </span>
      ) : null}
      <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-6 py-6">
        {image ? (
          <img className="flex-none rounded-md shadow-lg" src={image} />
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        {subtitle ? (
          <span className="line-clamp-1 text-caption font-caption text-subtext-color">
            {subtitle}
          </span>
        ) : null}
        <span className="text-caption font-caption text-subtext-color">•</span>
        {timestamp ? (
          <span className="text-caption font-caption text-subtext-color">
            {timestamp}
          </span>
        ) : null}
      </div>
    </div>
  );
});

export const HomeTemplateCard = HomeTemplateCardRoot;

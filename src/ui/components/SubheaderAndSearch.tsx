"use client";
/*
 * Documentation:
 * Subheader and Search — https://app.subframe.com/library?component=Subheader+and+Search_55162a36-cd6e-46b5-833f-2f6653bd8347
 * Text Field — https://app.subframe.com/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Icon Button — https://app.subframe.com/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Button — https://app.subframe.com/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Toggle Group — https://app.subframe.com/library?component=Toggle+Group_2026f10a-e3cc-4c89-80da-a7259acae3b7
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { TextField } from "./TextField";
import { IconButton } from "./IconButton";
import { Button } from "./Button";
import { ToggleGroup } from "./ToggleGroup";

interface SubheaderAndSearchRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const SubheaderAndSearchRoot = React.forwardRef<
  HTMLElement,
  SubheaderAndSearchRootProps
>(function SubheaderAndSearchRoot(
  { className, ...otherProps }: SubheaderAndSearchRootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full items-center gap-2",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      <TextField
        className="h-auto w-192 flex-none"
        variant="filled"
        label=""
        helpText=""
        iconRight="FeatherSearch"
      >
        <div className="flex w-full grow shrink-0 basis-0 items-center gap-2">
          <TextField.Input placeholder="Search for fresh local products..." />
        </div>
      </TextField>
      <div className="flex grow shrink-0 basis-0 items-center justify-end gap-6 self-stretch">
        <div className="flex items-center justify-end gap-2 self-stretch px-2 py-2">
          <IconButton variant="brand-secondary" icon="FeatherFilter" />
          <Button
            variant="neutral-secondary"
            icon="FeatherArrowUpDown"
            iconRight="FeatherChevronDown"
          >
            Sort
          </Button>
          <Button
            variant="neutral-secondary"
            icon="FeatherGroup"
            iconRight="FeatherChevronDown"
          >
            Group
          </Button>
          <ToggleGroup>
            <ToggleGroup.Item
              className="h-7 w-auto flex-none"
              icon="FeatherLayoutGrid"
              value="32f12d52"
            />
            <ToggleGroup.Item
              className="h-7 w-auto flex-none"
              icon="FeatherList"
              value="01e19640"
            />
          </ToggleGroup>
        </div>
      </div>
    </div>
  );
});

export const SubheaderAndSearch = SubheaderAndSearchRoot;

"use client";

import React from "react";
import { FeatherCheckCircle } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { FeatherArrowRight } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherX } from "@subframe/core";
import { SnackbarProductData } from "../contexts/SnackbarContext";

interface SaveForLaterActionSnackbarProps {
  product: SnackbarProductData;
  onDismiss: () => void;
  onContinueShopping: () => void;
  onGoToCheckout: () => void;
}

function SaveForLaterActionSnackbar({ 
  product, 
  onDismiss, 
  onContinueShopping, 
  onGoToCheckout 
}: SaveForLaterActionSnackbarProps) {
  return (
    <div className="flex w-full sm:w-96 max-w-[95vw] items-start gap-3 rounded-md border border-solid border-neutral-border bg-white px-3 py-3 sm:px-4 sm:py-4 shadow-lg snackbar-enter mx-auto">
      <img
        className="h-12 w-12 flex-none rounded-md object-cover"
        src={product.image}
        alt={product.name}
      />
      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
        <div className="flex w-full flex-col items-start gap-1">
          <div className="flex items-center gap-1">
            <FeatherCheckCircle className="w-4 h-4 text-success-500" />
            <span className="text-caption-bold font-caption-bold text-success-500">
              Saved for later
            </span>
          </div>
          <span className="text-body font-body text-default-font truncate w-full">
            {product.name}
          </span>
        </div>
        <div className="flex w-full items-center gap-2">
          <Button
            className="h-6 grow shrink-0 basis-0"
            variant="neutral-tertiary"
            size="small"
            onClick={onContinueShopping}
          >
            Continue Shopping
          </Button>
          <Button
            className="h-6 grow shrink-0 basis-0"
            size="small"
            iconRight={<FeatherArrowRight />}
            onClick={onGoToCheckout}
          >
            View Saved
          </Button>
        </div>
      </div>
      <IconButton
        icon={<FeatherX />}
        onClick={onDismiss}
        aria-label="Close notification"
        size="small"
        className="flex-shrink-0 -mt-1 -mr-1"
      />
    </div>
  );
}

export default SaveForLaterActionSnackbar;
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
    <div className="flex w-full sm:w-112 max-w-[95vw] items-start gap-4 rounded-md border border-solid border-neutral-border bg-white px-4 py-4 sm:px-6 sm:py-6 shadow-lg fixed left-1/2 top-4 -translate-x-1/2 transition-all duration-300 ease-in-out">
      <img
        className="h-16 w-16 flex-none rounded-md object-cover"
        src={product.image}
        alt={product.name}
      />
      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
        <div className="flex w-full flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <FeatherCheckCircle className="text-body font-body text-success-500" />
            <span className="text-body-bold font-body-bold text-success-500">
              Saved for later
            </span>
          </div>
          <span className="text-body font-body text-default-font">
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
            View Saved Items
          </Button>
        </div>
      </div>
      <IconButton
        icon={<FeatherX />}
        onClick={onDismiss}
        aria-label="Close notification"
      />
    </div>
  );
}

export default SaveForLaterActionSnackbar;
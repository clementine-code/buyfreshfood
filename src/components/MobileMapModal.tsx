"use client";

import React from "react";
import { FeatherX } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { Button } from "@/ui/components/Button";
import Map from "./Map";

interface MobileMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMapModal: React.FC<MobileMapModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
        <h2 className="text-heading-2 font-heading-2 text-default-font">Local Food Map</h2>
        <IconButton
          variant="neutral-tertiary"
          icon={<FeatherX />}
          onClick={onClose}
        />
      </div>

      {/* Map Content */}
      <div className="flex-1 relative">
        <Map className="h-full w-full" />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200 bg-white">
        <Button
          onClick={onClose}
          className="w-full"
        >
          View Products
        </Button>
      </div>
    </div>
  );
};

export default MobileMapModal;
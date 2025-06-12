"use client";

import React from "react";
import { ResponsiveTopbar } from "../components/ResponsiveTopbar";

interface ResponsivePageLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export function ResponsivePageLayout({ children, className }: ResponsivePageLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-50">
      <ResponsiveTopbar />
      {children ? (
        <div className="flex w-full flex-1 flex-col items-start bg-default-background">
          {children}
        </div>
      ) : null}
    </div>
  );
}
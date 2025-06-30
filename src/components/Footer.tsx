"use client";

import React from "react";
import { Link } from "react-router-dom";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherFacebook } from "@subframe/core";
import { FeatherInstagram } from "@subframe/core";
import { FeatherXTwitter } from "@subframe/core";
import { FeatherSlack } from "@subframe/core";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <div className={`flex w-full flex-col items-center justify-center gap-6 border-t border-solid border-neutral-100 bg-default-background px-6 py-12 max-w-full mobile:px-4 mobile:py-12 ${className}`}>
      <div className="flex w-full max-w-[1024px] flex-wrap items-start gap-6 mobile:flex-col mobile:flex-wrap mobile:gap-6">
        <div className="flex min-w-[320px] flex-col items-start gap-6 self-stretch mobile:items-center mobile:justify-start">
          <div className="flex w-full min-w-[320px] grow shrink-0 basis-0 items-start gap-4 mobile:items-start mobile:justify-center">
            <Link to="/">
              <img
                className="h-10 flex-none object-contain"
                src="/Buy-Fresh-Food-Logo.png"
                alt="Buy Fresh. Food Logo"
              />
            </Link>
          </div>
          <div className="flex w-full items-center gap-2 mobile:items-center mobile:justify-center">
            <IconButton
              icon={<FeatherFacebook />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
            <IconButton
              icon={<FeatherInstagram />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
            <IconButton
              icon={<FeatherXTwitter />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
            <IconButton
              icon={<FeatherSlack />}
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
            />
          </div>
        </div>
        <div className="flex grow shrink-0 basis-0 flex-wrap items-start gap-4 self-stretch mobile:grid mobile:grid-cols-2">
          <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
            <span className="w-full font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
              Product
            </span>
            <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
              Features
            </span>
            <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
              Integrations
            </span>
            <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
              Pricing
            </span>
          </div>
          <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
            <span className="w-full font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
              Company
            </span>
            <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
              About us
            </span>
            <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
              Blog
            </span>
            <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
              Careers
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
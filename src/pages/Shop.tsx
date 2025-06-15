"use client";

import React from "react";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherMap } from "@subframe/core";
import { Accordion } from "@/ui/components/Accordion";
import { FeatherFilter } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { Checkbox } from "@/ui/components/Checkbox";
import { CheckboxCard } from "@/ui/components/CheckboxCard";
import { TextField } from "@/ui/components/TextField";
import { FeatherSearch } from "@subframe/core";
import { ToggleGroup } from "@/ui/components/ToggleGroup";
import { FeatherGrid } from "@subframe/core";
import { FeatherList } from "@subframe/core";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { FeatherStar } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { FeatherDollarSign } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { FeatherChevronDown } from "@subframe/core";
import { Badge } from "@/ui/components/Badge";
import { FeatherHeart } from "@subframe/core";
import { FeatherTwitter } from "@subframe/core";
import { FeatherGithub } from "@subframe/core";
import { FeatherSlack } from "@subframe/core";
import { FeatherYoutube } from "@subframe/core";

function Shop() {
  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start gap-4 bg-default-background py-4">
        <Accordion
          trigger={
            <div className="flex w-full items-center justify-between px-6 py-2">
              <span className="text-heading-3 font-heading-3 text-default-font">
                Map of Local Food
              </span>
              <IconButton
                variant="brand-primary"
                icon={<FeatherMap />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
          }
          defaultOpen={true}
        >
          <div className="flex w-full items-start gap-2 px-6 py-2">
            <img
              className="h-96 grow shrink-0 basis-0 rounded-lg object-cover"
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&w=1200"
            />
          </div>
        </Accordion>
        <div className="flex w-full items-start gap-6 px-6">
          <Accordion
            trigger={
              <div className="flex w-60 items-center justify-between rounded-md border border-solid border-neutral-border bg-white px-4 py-4">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Filters
                </span>
                <IconButton
                  variant="brand-primary"
                  icon={<FeatherFilter />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
              </div>
            }
            defaultOpen={true}
          >
            <div className="flex w-60 flex-col items-start gap-6 rounded-md border border-solid border-neutral-border bg-white px-6 py-6">
              <div className="flex w-full flex-col items-start gap-4">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Categories
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <Button
                    className="h-5 w-auto flex-none"
                    variant="neutral-tertiary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Vegetables
                  </Button>
                  <Button
                    className="h-5 w-auto flex-none"
                    variant="neutral-tertiary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Fruits
                  </Button>
                  <Button
                    className="h-5 w-auto flex-none"
                    variant="neutral-tertiary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Eggs &amp; Dairy
                  </Button>
                  <Button
                    className="h-5 w-auto flex-none"
                    variant="neutral-tertiary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Meat &amp; Poultry
                  </Button>
                  <Button
                    className="h-5 w-auto flex-none"
                    variant="neutral-tertiary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Baked Goods
                  </Button>
                  <Button
                    className="h-5 w-auto flex-none"
                    variant="neutral-tertiary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Artisan Crafts
                  </Button>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Quality
                  </span>
                </div>
                <div className="flex w-full flex-col items-start gap-2">
                  <CheckboxCard
                    className="h-5 w-auto flex-none"
                    checked={false}
                    onCheckedChange={(checked: boolean) => {}}
                  >
                    <span className="text-body-bold font-body-bold text-default-font">
                      Certified Organic
                    </span>
                  </CheckboxCard>
                  <CheckboxCard
                    className="h-5 w-auto flex-none"
                    checked={false}
                    onCheckedChange={(checked: boolean) => {}}
                  >
                    <span className="text-body-bold font-body-bold text-default-font">
                      Pesticide Free
                    </span>
                  </CheckboxCard>
                  <CheckboxCard
                    className="h-5 w-auto flex-none"
                    checked={false}
                    onCheckedChange={(checked: boolean) => {}}
                  >
                    <span className="text-body-bold font-body-bold text-default-font">
                      Free Range
                    </span>
                  </CheckboxCard>
                  <CheckboxCard
                    className="h-5 w-auto flex-none"
                    checked={false}
                    onCheckedChange={(checked: boolean) => {}}
                  >
                    <span className="text-body-bold font-body-bold text-default-font">
                      Grass Fed
                    </span>
                  </CheckboxCard>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-4">
                <span className="text-heading-3 font-heading-3 text-default-font">
                  Sellers
                </span>
                <div className="flex w-full flex-col items-start gap-2">
                  <CheckboxCard
                    className="h-5 w-auto flex-none"
                    checked={false}
                    onCheckedChange={(checked: boolean) => {}}
                  >
                    <span className="text-body-bold font-body-bold text-default-font">
                      Green Acres Farm
                    </span>
                  </CheckboxCard>
                  <CheckboxCard
                    className="h-5 w-auto flex-none"
                    checked={false}
                    onCheckedChange={(checked: boolean) => {}}
                  >
                    <span className="text-body-bold font-body-bold text-default-font">
                      Sweet Life Bakery
                    </span>
                  </CheckboxCard>
                  <CheckboxCard
                    className="h-5 w-auto flex-none"
                    checked={false}
                    onCheckedChange={(checked: boolean) => {}}
                  >
                    <span className="text-body-bold font-body-bold text-default-font">
                      Hillside Dairy
                    </span>
                  </CheckboxCard>
                  <CheckboxCard
                    className="h-5 w-auto flex-none"
                    checked={false}
                    onCheckedChange={(checked: boolean) => {}}
                  >
                    <span className="text-body-bold font-body-bold text-default-font">
                      Heritage Meats
                    </span>
                  </CheckboxCard>
                </div>
              </div>
            </div>
          </Accordion>
          <div className="flex flex-col items-start gap-2 grow">
            <div className="flex w-full items-center justify-end">
              <TextField
                className="hidden h-auto w-80 flex-none"
                variant="filled"
                label=""
                helpText=""
                icon={<FeatherSearch />}
              >
                <TextField.Input
                  placeholder="Search products..."
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
              <div className="flex items-center gap-2">
                <ToggleGroup value="" onValueChange={(value: string) => {}}>
                  <ToggleGroup.Item icon={<FeatherGrid />} value="84dc4204" />
                  <ToggleGroup.Item icon={<FeatherList />} value="814d67a6" />
                </ToggleGroup>
                <SubframeCore.DropdownMenu.Root>
                  <SubframeCore.DropdownMenu.Trigger asChild={true}>
                    <Button
                      variant="neutral-tertiary"
                      iconRight={<FeatherChevronDown />}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>
                      ) => {}}
                    >
                      Sort
                    </Button>
                  </SubframeCore.DropdownMenu.Trigger>
                  <SubframeCore.DropdownMenu.Portal>
                    <SubframeCore.DropdownMenu.Content
                      side="bottom"
                      align="end"
                      sideOffset={4}
                      asChild={true}
                    >
                      <DropdownMenu>
                        <DropdownMenu.DropdownItem icon={<FeatherStar />}>
                          Top Rated
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem
                          icon={<FeatherShoppingCart />}
                        >
                          Most Purchased
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem icon={<FeatherDollarSign />}>
                          Price - Lowest to Highest
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem icon={<FeatherDollarSign />}>
                          Price - Highest to Lowest
                        </DropdownMenu.DropdownItem>
                      </DropdownMenu>
                    </SubframeCore.DropdownMenu.Content>
                  </SubframeCore.DropdownMenu.Portal>
                </SubframeCore.DropdownMenu.Root>
              </div>
            </div>
            <div className="w-full items-start gap-4 bg-default-background grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start gap-4 rounded-md bg-white px-4 py-4 shadow-sm">
                <img
                  className="h-48 w-full flex-none rounded-md object-cover"
                  src="https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800"
                />
                <div className="flex w-full flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <Badge>Organic</Badge>
                    <Badge variant="warning">Limited Stock</Badge>
                  </div>
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Heirloom Tomatoes
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    $4.99/lb
                  </span>
                </div>
                <div className="flex w-full items-center gap-2">
                  <Button
                    className="h-8 grow shrink-0 basis-0"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    variant="destructive-secondary"
                    icon={<FeatherHeart />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                </div>
              </div>
              <div className="flex flex-col items-start gap-4 rounded-md bg-white px-4 py-4 shadow-sm">
                <img
                  className="h-48 w-full flex-none rounded-md object-cover"
                  src="https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800"
                />
                <div className="flex w-full flex-col items-start gap-2">
                  <Badge>Organic</Badge>
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Rainbow Swiss Chard
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    $3.99/bunch
                  </span>
                </div>
                <div className="flex w-full items-center gap-2">
                  <Button
                    className="h-8 grow shrink-0 basis-0"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    variant="destructive-secondary"
                    icon={<FeatherHeart />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                </div>
              </div>
              <div className="flex flex-col items-start gap-4 rounded-md bg-white px-4 py-4 shadow-sm">
                <img
                  className="h-48 w-full flex-none rounded-md object-cover"
                  src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800"
                />
                <div className="flex w-full flex-col items-start gap-2">
                  <Badge>Organic</Badge>
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Fresh Herbs Bundle
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    $5.99/bundle
                  </span>
                </div>
                <div className="flex w-full items-center gap-2">
                  <Button
                    className="h-8 grow shrink-0 basis-0"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    variant="destructive-secondary"
                    icon={<FeatherHeart />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                </div>
              </div>
              <div className="flex flex-col items-start gap-4 rounded-md bg-white px-4 py-4 shadow-sm">
                <img
                  className="h-48 w-full flex-none rounded-md object-cover"
                  src="https://images.unsplash.com/photo-1590005354167-6da97870c757?w=800"
                />
                <div className="flex w-full flex-col items-start gap-2">
                  <Badge>Free Range</Badge>
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Farm Fresh Eggs
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    $6.99/dozen
                  </span>
                </div>
                <div className="flex w-full items-center gap-2">
                  <Button
                    className="h-8 grow shrink-0 basis-0"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    variant="destructive-secondary"
                    icon={<FeatherHeart />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                </div>
              </div>
              <div className="flex flex-col items-start gap-4 rounded-md bg-white px-4 py-4 shadow-sm">
                <img
                  className="h-48 w-full flex-none rounded-md object-cover"
                  src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800"
                />
                <div className="flex w-full flex-col items-start gap-2">
                  <Badge>Artisan</Badge>
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Sourdough Bread
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    $8.99/loaf
                  </span>
                </div>
                <div className="flex w-full items-center gap-2">
                  <Button
                    className="h-8 grow shrink-0 basis-0"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    variant="destructive-secondary"
                    icon={<FeatherHeart />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                </div>
              </div>
              <div className="flex flex-col items-start gap-4 rounded-md bg-white px-4 py-4 shadow-sm">
                <img
                  className="h-48 w-full flex-none rounded-md object-cover"
                  src="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800"
                />
                <div className="flex w-full flex-col items-start gap-2">
                  <Badge>Organic</Badge>
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    Seasonal Fruit Mix
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    $12.99/basket
                  </span>
                </div>
                <div className="flex w-full items-center gap-2">
                  <Button
                    className="h-8 grow shrink-0 basis-0"
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  >
                    Add to Cart
                  </Button>
                  <IconButton
                    variant="destructive-secondary"
                    icon={<FeatherHeart />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center gap-6 border-t border-solid border-neutral-100 bg-default-background px-6 py-12 max-w-full mobile:px-4 mobile:py-12">
          <div className="flex w-full max-w-[1024px] flex-wrap items-start gap-6 mobile:flex-col mobile:flex-wrap mobile:gap-6">
            <div className="flex min-w-[320px] flex-col items-start gap-6 self-stretch mobile:items-center mobile:justify-start">
              <div className="flex w-full min-w-[320px] grow shrink-0 basis-0 items-start gap-4 mobile:items-start mobile:justify-center">
                <img
                  className="h-5 w-5 flex-none object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                />
                <span className="grow shrink-0 basis-0 font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                  Fresh Local Food
                </span>
              </div>
              <div className="flex w-full items-center gap-2 mobile:items-center mobile:justify-center">
                <IconButton
                  icon={<FeatherTwitter />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <IconButton
                  icon={<FeatherGithub />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <IconButton
                  icon={<FeatherSlack />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                />
                <IconButton
                  icon={<FeatherYoutube />}
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
      </div>
    </DefaultPageLayout>
  );
}

export default Shop;
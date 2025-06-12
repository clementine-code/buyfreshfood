"use client";

import React from "react";
import { TextField } from "@/ui/components/TextField";
import { FeatherMapPin } from "@subframe/core";
import { FeatherLocate } from "@subframe/core";
import { FeatherShoppingBag } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { FeatherArrowRight } from "@subframe/core";
import { FeatherHome } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherLeaf } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherTwitter } from "@subframe/core";
import { FeatherGithub } from "@subframe/core";
import { FeatherSlack } from "@subframe/core";
import { FeatherYoutube } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";

function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-default-background">
      {/* Navigation Header */}
      <nav className="flex w-full items-center justify-between bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <FeatherLeaf className="h-6 w-6 text-brand-600" />
            <span className="text-xl font-bold text-default-font">FreshLocal</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-body font-body text-default-font cursor-pointer hover:text-brand-600">Home</span>
            <span className="text-body font-body text-default-font cursor-pointer hover:text-brand-600">Shop</span>
            <span className="text-body font-body text-default-font cursor-pointer hover:text-brand-600">Sell</span>
          </div>
        </div>
        
        <div className="flex-1 max-w-md mx-8">
          <TextField
            className="w-full"
            variant="outline"
            icon={<FeatherSearch />}
          >
            <TextField.Input
              placeholder="Search for fresh local food..."
              value=""
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
            />
          </TextField>
        </div>
        
        <div className="flex items-center gap-4">
          <IconButton
            icon={<FeatherUser />}
            variant="neutral-tertiary"
          />
          <Button
            variant="brand-primary"
            icon={<FeatherShoppingCart />}
          >
            Cart
          </Button>
          <Button variant="brand-secondary">
            Sign In
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative flex min-h-[600px] w-full flex-col items-center justify-center overflow-hidden">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
          alt="Fresh vegetables"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        
        <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
          <div className="max-w-4xl">
            <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">
              Fresh Local Food From Your Neighbors
            </h1>
            <p className="mb-8 text-xl text-white md:text-2xl">
              Connect with local farmers and gardeners for the freshest produce, eggs, and more - right in your neighborhood.
            </p>
          </div>
          
          <TextField
            className="w-full max-w-md"
            variant="filled"
            icon={<FeatherMapPin />}
            iconRight={<FeatherLocate />}
          >
            <TextField.Input
              placeholder="Enter your address to find fresh local food..."
              value=""
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
            />
          </TextField>
        </div>
      </div>

      {/* Action Cards */}
      <div className="flex w-full justify-center px-6 py-16">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-6 rounded-xl bg-neutral-100 p-8">
            <FeatherShoppingBag className="h-8 w-8 text-brand-600" />
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-bold text-default-font">Shop Local</h3>
              <p className="text-body text-subtext-color">
                Discover fresh produce, eggs, and more from your neighbors and local farmers.
              </p>
            </div>
            <Button
              className="w-full"
              variant="brand-primary"
              icon={<FeatherArrowRight />}
            >
              Start Shopping
            </Button>
          </div>
          
          <div className="flex flex-col gap-6 rounded-xl bg-neutral-800 p-8">
            <FeatherHome className="h-8 w-8 text-white" />
            <div className="flex flex-col gap-4">
              <h3 className="text-2xl font-bold text-white">Sell Your Harvest</h3>
              <p className="text-body text-neutral-300">
                Turn your garden or farm into a thriving local business. Join our community of producers.
              </p>
            </div>
            <Button
              className="w-full"
              variant="destructive-primary"
              icon={<FeatherArrowRight />}
            >
              Become a Seller
            </Button>
          </div>
        </div>
      </div>

      {/* Community Section */}
      <div className="flex w-full justify-center bg-brand-50 px-6 py-16">
        <div className="w-full max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-default-font">
              Built on Community, Not Supply Chains
            </h2>
            <p className="text-lg text-subtext-color">
              When you buy from local producers, you're supporting sustainable farming practices and getting superior quality food.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sunny-400">
                <FeatherClock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-default-font">Maximum Freshness</h3>
              <p className="text-body text-subtext-color">
                Food is often harvested the same day you receive it, unlike store produce that can be weeks old.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-peach-600">
                <FeatherHeart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-default-font">Support Local</h3>
              <p className="text-body text-subtext-color">
                Every purchase directly supports your neighbors and strengthens your local community.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600">
                <FeatherLeaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-default-font">Eco-Friendly</h3>
              <p className="text-body text-subtext-color">
                Reduce transportation emissions and packaging waste by buying directly from local sources.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <FeatherLeaf className="h-5 w-5 text-brand-600" />
              <span className="text-lg font-bold text-default-font">FreshLocal</span>
            </div>
            <div className="flex gap-2">
              <IconButton icon={<FeatherTwitter />} variant="neutral-tertiary" />
              <IconButton icon={<FeatherGithub />} variant="neutral-tertiary" />
              <IconButton icon={<FeatherSlack />} variant="neutral-tertiary" />
              <IconButton icon={<FeatherYoutube />} variant="neutral-tertiary" />
            </div>
          </div>
          
          <div className="flex flex-1 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-default-font">Product</h4>
              <span className="text-subtext-color cursor-pointer hover:text-default-font">Features</span>
              <span className="text-subtext-color cursor-pointer hover:text-default-font">Integrations</span>
              <span className="text-subtext-color cursor-pointer hover:text-default-font">Pricing</span>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-default-font">Company</h4>
              <span className="text-subtext-color cursor-pointer hover:text-default-font">About us</span>
              <span className="text-subtext-color cursor-pointer hover:text-default-font">Blog</span>
              <span className="text-subtext-color cursor-pointer hover:text-default-font">Careers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
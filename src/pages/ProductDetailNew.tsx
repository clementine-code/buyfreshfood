import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Badge } from "@/ui/components/Badge";
import { Avatar } from "@/ui/components/Avatar";
import { Progress } from "@/ui/components/Progress";
import { Accordion } from "@/ui/components/Accordion";
import { Breadcrumbs } from "@/ui/components/Breadcrumbs";
import { 
  FeatherLeaf, 
  FeatherShare, 
  FeatherStar, 
  FeatherVerified, 
  FeatherMessageCircle, 
  FeatherMail, 
  FeatherPhone, 
  FeatherTruck, 
  FeatherClock, 
  FeatherMapPin,
  FeatherMinus,
  FeatherPlus,
  FeatherFacebook,
  FeatherInstagram,
  FeatherXTwitter,
  FeatherSlack,
  FeatherHeart,
  FeatherArrowLeft
} from "@subframe/core";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import { useLocationContext } from "../contexts/LocationContext";
import { getProductById, type Product } from "../lib/supabase";
import { foodSearchService, type FoodItem } from "../services/foodSearchService";

// Product type definition
interface ProductDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  isOrganic: boolean;
  images: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  seller: {
    name: string;
    image: string;
    location: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    distance: string;
    availability: string;
    contact: {
      phone: string;
      email: string;
    }
  };
  pickup: {
    details: string;
    hours: string;
    location: string;
  };
  reviews: {
    highlights: string[];
    ratings: {
      five: number;
      four: number;
      three: number;
      two: number;
      one: number;
    };
    metrics: {
      freshness: number;
      taste: number;
      value: number;
    };
    items: {
      name: string;
      rating: number;
      date: string;
      comment: string;
    }[];
  };
  relatedProducts: {
    id: string;
    name: string;
    price: number;
    unit: string;
    image: string;
  }[];
}

// Sample product data collection
const sampleProducts: { [key: string]: ProductDetails } = {
  "heirloom-tomatoes": {
    id: "heirloom-tomatoes",
    name: "Heirloom Tomatoes",
    description: "Hand-picked this morning! Our heirloom tomatoes are grown naturally without pesticides. Perfect for salads, sandwiches, or just enjoying fresh off the vine. Multiple varieties available including Brandywine, Cherokee Purple, and Green Zebra.",
    price: 4.99,
    unit: "lb",
    isOrganic: true,
    images: [
      "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
      "https://images.unsplash.com/photo-1597362925123-77861d3fbac7",
      "https://images.unsplash.com/photo-1597362925552-5f2f3c7e2c97"
    ],
    tags: ["Picked Today", "Pesticide Free", "Local"],
    rating: 4.7,
    reviewCount: 22,
    seller: {
      name: "Sarah's Family Farm",
      image: "https://images.unsplash.com/photo-1507914372368-b2b085b925a1",
      location: "123 Organic Way, Sunnyvale, CA 94086",
      rating: 4.9,
      reviewCount: 324,
      verified: true,
      distance: "2.3 miles away",
      availability: "Pickup Today",
      contact: {
        phone: "(408) 555-1234",
        email: "sarah@sarahsfamilyfarm.com"
      }
    },
    pickup: {
      details: "Drive-through pickup at farm entrance with no reservation required.",
      hours: "Monday - Saturday: 8:00 AM - 6:00 PM\nSunday: 10:00 AM - 4:00 PM",
      location: "123 Organic Way, Sunnyvale, CA 94086"
    },
    reviews: {
      highlights: ["Incredibly fresh", "Better than store-bought", "Great value", "Will buy again"],
      ratings: {
        five: 90,
        four: 7,
        three: 2,
        two: 1,
        one: 0
      },
      metrics: {
        freshness: 4.9,
        taste: 4.8,
        value: 4.7
      },
      items: [
        {
          name: "Emily K.",
          rating: 5,
          date: "3 days ago",
          comment: "Absolutely love these farm-fresh tomatoes! The flavor is unbelievably rich and vibrant. You can truly taste the difference of locally grown, organic produce."
        },
        {
          name: "David L.",
          rating: 5,
          date: "1 week ago",
          comment: "Supporting local farmers has never tasted so good! These tomatoes are consistently fresh, juicy, and packed with incredible flavor. Highly recommend!"
        }
      ]
    },
    relatedProducts: [
      {
        id: "rainbow-swiss-chard",
        name: "Rainbow Swiss Chard",
        price: 3.99,
        unit: "bunch",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800"
      },
      {
        id: "fresh-herbs-bundle",
        name: "Fresh Herbs Bundle",
        price: 5.99,
        unit: "bundle",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800"
      },
      {
        id: "organic-lettuce-mix",
        name: "Organic Lettuce Mix",
        price: 4.50,
        unit: "bag",
        image: "https://images.unsplash.com/photo-1557844352-761f2565b576?w=800"
      },
      {
        id: "fresh-green-beans",
        name: "Fresh Green Beans",
        price: 3.99,
        unit: "lb",
        image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800"
      }
    ]
  },
  "rainbow-swiss-chard": {
    id: "rainbow-swiss-chard",
    name: "Rainbow Swiss Chard",
    description: "Colorful and nutritious leafy greens with vibrant stems. Excellent source of vitamins and minerals. Perfect for sautéing, adding to soups, or using in salads.",
    price: 3.99,
    unit: "bunch",
    isOrganic: true,
    images: [
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
      "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800",
      "https://images.unsplash.com/photo-1557844352-761f2565b576?w=800"
    ],
    tags: ["Organic", "Nutrient-Rich", "Colorful"],
    rating: 4.8,
    reviewCount: 16,
    seller: {
      name: "Green Acres Farm",
      image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800",
      location: "456 Farm Road, Fayetteville, AR 72701",
      rating: 4.7,
      reviewCount: 218,
      verified: true,
      distance: "3.1 miles away",
      availability: "Pickup Today",
      contact: {
        phone: "(479) 555-0123",
        email: "info@greenacresfarm.com"
      }
    },
    pickup: {
      details: "Farm stand pickup available during business hours. No appointment needed.",
      hours: "Tuesday - Sunday: 9:00 AM - 5:00 PM\nClosed Mondays",
      location: "456 Farm Road, Fayetteville, AR 72701"
    },
    reviews: {
      highlights: ["Beautiful colors", "Very fresh", "Versatile", "Great flavor"],
      ratings: {
        five: 85,
        four: 12,
        three: 3,
        two: 0,
        one: 0
      },
      metrics: {
        freshness: 4.9,
        taste: 4.7,
        value: 4.6
      },
      items: [
        {
          name: "Michael T.",
          rating: 5,
          date: "2 days ago",
          comment: "The colors are stunning and the taste is amazing. So much better than store-bought chard. I sautéed it with garlic and olive oil - delicious!"
        },
        {
          name: "Jessica R.",
          rating: 5,
          date: "1 week ago",
          comment: "Super fresh and beautiful. The stems are so vibrant and the leaves are tender. Great addition to my weekly veggie rotation."
        }
      ]
    },
    relatedProducts: [
      {
        id: "heirloom-tomatoes",
        name: "Heirloom Tomatoes",
        price: 4.99,
        unit: "lb",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800"
      },
      {
        id: "fresh-herbs-bundle",
        name: "Fresh Herbs Bundle",
        price: 5.99,
        unit: "bundle",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800"
      },
      {
        id: "organic-lettuce-mix",
        name: "Organic Lettuce Mix",
        price: 4.50,
        unit: "bag",
        image: "https://images.unsplash.com/photo-1557844352-761f2565b576?w=800"
      },
      {
        id: "baby-spinach",
        name: "Baby Spinach",
        price: 4.49,
        unit: "bag",
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800"
      }
    ]
  },
  "farm-fresh-eggs": {
    id: "farm-fresh-eggs",
    name: "Farm Fresh Eggs",
    description: "Free-range eggs from pasture-raised hens. Rich, golden yolks and superior taste from hens with access to bugs and grass. Our chickens are raised humanely with plenty of outdoor access.",
    price: 6.99,
    unit: "dozen",
    isOrganic: false,
    images: [
      "https://images.unsplash.com/photo-1590005354167-6da97870c757?w=800",
      "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=800",
      "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=800"
    ],
    tags: ["Free-Range", "Pasture-Raised", "Golden Yolks"],
    rating: 4.9,
    reviewCount: 42,
    seller: {
      name: "Happy Hen Farm",
      image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800",
      location: "789 Country Lane, Farmington, AR 72730",
      rating: 4.8,
      reviewCount: 156,
      verified: true,
      distance: "5.2 miles away",
      availability: "Pickup Tomorrow",
      contact: {
        phone: "(479) 555-0987",
        email: "eggs@happyhenfarm.com"
      }
    },
    pickup: {
      details: "Farm gate pickup. Please text when you arrive and we'll bring your eggs out to you.",
      hours: "Wednesday - Saturday: 10:00 AM - 4:00 PM\nSunday: 12:00 PM - 4:00 PM",
      location: "789 Country Lane, Farmington, AR 72730"
    },
    reviews: {
      highlights: ["Best eggs ever", "Beautiful yolks", "Worth every penny", "Consistent quality"],
      ratings: {
        five: 95,
        four: 5,
        three: 0,
        two: 0,
        one: 0
      },
      metrics: {
        freshness: 5.0,
        taste: 4.9,
        value: 4.7
      },
      items: [
        {
          name: "Robert J.",
          rating: 5,
          date: "5 days ago",
          comment: "These eggs are incredible! The yolks are so orange and rich. Once you try these, you'll never go back to store-bought eggs again."
        },
        {
          name: "Amanda P.",
          rating: 5,
          date: "2 weeks ago",
          comment: "I can't believe the difference in taste. My family now refuses to eat any other eggs. Worth the drive to the farm to pick them up!"
        }
      ]
    },
    relatedProducts: [
      {
        id: "fresh-whole-milk",
        name: "Fresh Whole Milk",
        price: 5.99,
        unit: "half-gallon",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800"
      },
      {
        id: "artisan-cheese-selection",
        name: "Artisan Cheese Selection",
        price: 18.99,
        unit: "pack",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800"
      },
      {
        id: "grass-fed-ground-beef",
        name: "Grass-Fed Ground Beef",
        price: 9.99,
        unit: "lb",
        image: "https://images.unsplash.com/photo-1588347818481-c7c1b6b3b5b3?w=800"
      },
      {
        id: "free-range-chicken",
        name: "Free-Range Chicken",
        price: 16.99,
        unit: "whole",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800"
      }
    ]
  },
  "artisan-sourdough-bread": {
    id: "artisan-sourdough-bread",
    name: "Artisan Sourdough Bread",
    description: "Traditional sourdough bread made with wild yeast starter. Crispy crust, soft interior with complex flavors. Our bread is made with locally milled flour and a 24-hour fermentation process for maximum flavor and digestibility.",
    price: 8.99,
    unit: "loaf",
    isOrganic: false,
    images: [
      "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800",
      "https://images.unsplash.com/photo-1585478259715-4d3a5f4a8771?w=800",
      "https://images.unsplash.com/photo-1600398138360-766a0e0e7a3c?w=800"
    ],
    tags: ["Artisan", "Wild Yeast", "Traditional"],
    rating: 4.8,
    reviewCount: 31,
    seller: {
      name: "Sweet Life Bakery",
      image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800",
      location: "321 Main Street, Springdale, AR 72762",
      rating: 4.9,
      reviewCount: 287,
      verified: true,
      distance: "4.7 miles away",
      availability: "Pickup Today",
      contact: {
        phone: "(479) 555-0456",
        email: "orders@sweetlifebakery.com"
      }
    },
    pickup: {
      details: "Bakery pickup. Fresh loaves available daily until sold out. Pre-orders recommended for guaranteed availability.",
      hours: "Tuesday - Saturday: 7:00 AM - 2:00 PM\nClosed Sunday & Monday",
      location: "321 Main Street, Springdale, AR 72762"
    },
    reviews: {
      highlights: ["Perfect crust", "Amazing flavor", "Great texture", "Authentic sourdough"],
      ratings: {
        five: 87,
        four: 10,
        three: 3,
        two: 0,
        one: 0
      },
      metrics: {
        freshness: 4.9,
        taste: 4.8,
        value: 4.6
      },
      items: [
        {
          name: "Thomas B.",
          rating: 5,
          date: "1 day ago",
          comment: "This is what real bread should taste like! The crust is perfect and the inside is soft with just the right amount of chew. I'm a sourdough enthusiast and this is top-notch."
        },
        {
          name: "Olivia M.",
          rating: 5,
          date: "4 days ago",
          comment: "Worth every penny. The flavor is complex and delicious. It keeps well for several days too, though it rarely lasts that long in our house!"
        }
      ]
    },
    relatedProducts: [
      {
        id: "whole-wheat-dinner-rolls",
        name: "Whole Wheat Dinner Rolls",
        price: 6.99,
        unit: "dozen",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800"
      },
      {
        id: "artisan-cheese-selection",
        name: "Artisan Cheese Selection",
        price: 18.99,
        unit: "pack",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800"
      },
      {
        id: "raw-wildflower-honey",
        name: "Raw Wildflower Honey",
        price: 15.99,
        unit: "jar",
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800"
      },
      {
        id: "fresh-whole-milk",
        name: "Fresh Whole Milk",
        price: 5.99,
        unit: "half-gallon",
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800"
      }
    ]
  }
};

const ProductDetailNew: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: locationState } = useLocationContext();
  const { openWaitlistFlow } = useWaitlistContext();
  
  // State
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!id) {
          throw new Error("Product ID is missing");
        }
        
        // First try to get from sample data
        if (sampleProducts[id]) {
          setProduct(sampleProducts[id]);
        } else {
          // Try to get from Supabase
          const { data: supabaseProduct, error } = await getProductById(id);
          
          if (supabaseProduct && !error) {
            // Convert Supabase product to our ProductDetails format
            const convertedProduct = convertSupabaseProduct(supabaseProduct);
            setProduct(convertedProduct);
          } else {
            // Try to get from food search service
            const foodItem = await foodSearchService.getFoodItemById(id);
            if (foodItem) {
              const convertedProduct = convertFoodItemToProduct(foodItem);
              setProduct(convertedProduct);
            } else {
              throw new Error("Product not found");
            }
          }
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);

  // Convert Supabase product to our ProductDetails format
  const convertSupabaseProduct = (supabaseProduct: Product): ProductDetails => {
    return {
      id: supabaseProduct.id,
      name: supabaseProduct.name,
      description: supabaseProduct.description || "",
      price: supabaseProduct.price,
      unit: supabaseProduct.unit,
      isOrganic: supabaseProduct.is_organic || false,
      images: [
        supabaseProduct.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
      ],
      tags: supabaseProduct.tags || [],
      rating: supabaseProduct.average_rating || 4.5,
      reviewCount: supabaseProduct.reviews?.length || 0,
      seller: {
        name: supabaseProduct.seller?.name || "Local Farm",
        image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800",
        location: supabaseProduct.seller?.location || "Local Area",
        rating: 4.8,
        reviewCount: 100,
        verified: supabaseProduct.seller?.verified || false,
        distance: "Nearby",
        availability: "Pickup Available",
        contact: {
          phone: supabaseProduct.seller?.contact_phone || "(555) 555-5555",
          email: supabaseProduct.seller?.contact_email || "contact@localfarm.com"
        }
      },
      pickup: {
        details: "Contact seller for pickup details",
        hours: "Contact seller for hours",
        location: supabaseProduct.seller?.location || "Local Area"
      },
      reviews: {
        highlights: ["Fresh", "Local", "Quality"],
        ratings: {
          five: 80,
          four: 15,
          three: 5,
          two: 0,
          one: 0
        },
        metrics: {
          freshness: 4.8,
          taste: 4.7,
          value: 4.6
        },
        items: supabaseProduct.reviews?.map(review => ({
          name: review.customer_name,
          rating: review.rating,
          date: new Date(review.created_at).toLocaleDateString(),
          comment: review.comment || ""
        })) || []
      },
      relatedProducts: []
    };
  };

  // Convert FoodItem to our ProductDetails format
  const convertFoodItemToProduct = (foodItem: FoodItem): ProductDetails => {
    return {
      id: foodItem.id,
      name: foodItem.name,
      description: foodItem.description,
      price: parseFloat(foodItem.price.replace('$', '')),
      unit: foodItem.unit,
      isOrganic: foodItem.isOrganic,
      images: [
        foodItem.image,
        foodItem.image,
        foodItem.image
      ],
      tags: foodItem.tags,
      rating: 4.5, // Default rating
      reviewCount: 10, // Default review count
      seller: {
        name: foodItem.seller,
        image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800",
        location: foodItem.location,
        rating: 4.8,
        reviewCount: 100,
        verified: true,
        distance: "Nearby",
        availability: "Pickup Available",
        contact: {
          phone: "(555) 555-5555",
          email: "contact@localfarm.com"
        }
      },
      pickup: {
        details: "Contact seller for pickup details",
        hours: "Contact seller for hours",
        location: foodItem.location
      },
      reviews: {
        highlights: ["Fresh", "Local", "Quality"],
        ratings: {
          five: 80,
          four: 15,
          three: 5,
          two: 0,
          one: 0
        },
        metrics: {
          freshness: 4.8,
          taste: 4.7,
          value: 4.6
        },
        items: []
      },
      relatedProducts: []
    };
  };

  // Handle quantity changes
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  // Handle add to cart
  const handleAddToCart = () => {
    // In a real app, this would add the product to the cart
    // For now, we'll open the waitlist flow
    const waitlistType = locationState.isNWA ? 'early_access' : 'geographic';
    
    openWaitlistFlow(waitlistType, locationState.isSet ? {
      isNWA: locationState.isNWA,
      city: locationState.city || '',
      state: locationState.state || '',
      zipCode: locationState.zipCode || '',
      formattedAddress: locationState.location || ''
    } : undefined);
  };

  // Handle buy now
  const handleBuyNow = () => {
    // Similar to add to cart, but would proceed to checkout
    handleAddToCart();
  };

  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'Fresh Local Food',
        text: product?.description || 'Check out this fresh local food!',
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Handle contact seller
  const handleContactSeller = () => {
    // In a real app, this would open a chat with the seller
    // For now, we'll open the waitlist flow
    const waitlistType = locationState.isNWA ? 'early_access' : 'geographic';
    
    openWaitlistFlow(waitlistType, locationState.isSet ? {
      isNWA: locationState.isNWA,
      city: locationState.city || '',
      state: locationState.state || '',
      zipCode: locationState.zipCode || '',
      formattedAddress: locationState.location || ''
    } : undefined);
  };

  // Handle get directions
  const handleGetDirections = () => {
    if (product) {
      window.open(`https://maps.google.com?q=${encodeURIComponent(product.seller.location)}`, '_blank');
    }
  };

  // Handle back button
  const handleBackClick = () => {
    navigate(-1);
  };

  // Handle related product click
  const handleRelatedProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FeatherStar 
        key={i} 
        className={`${i < Math.round(rating) ? 'text-yellow-500 fill-current' : 'text-neutral-300'} text-body font-body`} 
      />
    ));
  };

  if (loading) {
    return (
      <DefaultPageLayout>
        <div className="flex h-full w-full items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-body font-body text-subtext-color">Loading product details...</span>
          </div>
        </div>
      </DefaultPageLayout>
    );
  }

  if (!product) {
    return (
      <DefaultPageLayout>
        <div className="flex h-full w-full items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="text-heading-2 font-heading-2 text-error-700">Product not found</span>
            <span className="text-body font-body text-subtext-color">
              {error || "The product you're looking for doesn't exist or has been removed."}
            </span>
            <Button onClick={() => navigate('/shop')}>
              Browse Products
            </Button>
          </div>
        </div>
      </DefaultPageLayout>
    );
  }

  return (
    <DefaultPageLayout>
      <div className="flex h-full w-full flex-col items-center lg:items-start justify-center gap-4 bg-default-background px-4 md:px-8 lg:px-12 pt-2 pb-4">
        {/* Breadcrumbs and Share Button */}
        <div className="flex w-full items-center gap-4 -mt-2">
          <Button
            variant="neutral-tertiary"
            icon={<FeatherArrowLeft />}
            onClick={handleBackClick}
            className="mr-2"
          >
            Back
          </Button>
          <Breadcrumbs className="h-auto grow shrink-0 basis-0 overflow-hidden">
            <Breadcrumbs.Item onClick={() => navigate('/shop')}>Product Results</Breadcrumbs.Item>
            <Breadcrumbs.Divider />
            <Breadcrumbs.Item active={true} className="truncate">
              {product.name} ({product.seller.name})
            </Breadcrumbs.Item>
          </Breadcrumbs>
          <IconButton
            icon={<FeatherShare />}
            onClick={handleShare}
            className="flex-shrink-0"
          />
          <IconButton
            variant="destructive-secondary"
            icon={<FeatherHeart />}
            onClick={handleAddToCart}
            className="flex-shrink-0"
          />
        </div>

        {/* Main Product Content */}
        <div className="flex w-full flex-col items-start justify-center gap-4">
          <div className="flex w-full flex-col lg:flex-row items-start gap-6 lg:gap-12">
            {/* Product Images */}
            <div className="flex w-full lg:w-1/2 flex-col items-start gap-4">
              <img
                className="w-full h-auto max-h-[28rem] object-cover rounded-md"
                src={product.images[selectedImage]}
                alt={product.name}
              />
              <div className="flex w-full items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    className={`h-20 w-20 md:h-24 md:w-24 lg:h-32 lg:w-32 flex-none rounded-md object-cover cursor-pointer ${selectedImage === index ? 'ring-2 ring-brand-600' : ''}`}
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex w-full lg:w-1/2 flex-col items-start gap-4">
              {/* Product Title, Badges, Rating */}
              <div className="flex w-full flex-col items-start gap-2">
                <h1 className="text-heading-1 font-heading-1 text-default-font">
                  {product.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  {product.isOrganic && (
                    <Badge variant="success" icon={<FeatherLeaf />}>
                      Organic
                    </Badge>
                  )}
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant={index % 2 === 0 ? "warning" : "neutral"}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                    <span className="ml-1 text-body-bold font-body-bold text-default-font">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-body font-body text-subtext-color">
                    ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {/* Product Description */}
              <div className="flex w-full flex-col items-start gap-2">
                <h2 className="text-body-bold font-body-bold text-default-font">
                  About this product
                </h2>
                <p className="text-body font-body text-default-font">
                  {product.description}
                </p>
              </div>

              {/* Price and Quantity */}
              <div className="flex w-full max-w-md mx-auto md:max-w-lg lg:max-w-xl xl:max-w-none xl:mx-0 flex-col items-start gap-4 rounded-md border border-solid border-neutral-200 bg-default-background p-4 shadow-sm">
                <div className="flex w-full flex-col sm:flex-row items-center sm:items-center gap-4">
                  <div className="flex grow shrink-0 basis-0 flex-col items-center sm:items-start gap-1">
                    <span className="text-body-bold font-body-bold text-brand-700">
                      Farm Fresh Price
                    </span>
                    <span className="text-heading-2 font-heading-2 text-default-font">
                      ${product.price.toFixed(2)}/{product.unit}
                    </span>
                  </div>
                  <div className="flex flex-col items-start sm:items-center gap-2">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Quantity
                    </span>
                    <div className="flex items-center gap-2">
                      <IconButton
                        disabled={quantity <= 1}
                        variant="neutral-primary"
                        size="small"
                        icon={<FeatherMinus />}
                        onClick={decreaseQuantity}
                      />
                      <span className="text-body-bold font-body-bold text-default-font w-6 text-center">
                        {quantity}
                      </span>
                      <IconButton
                        variant="neutral-primary"
                        size="small"
                        icon={<FeatherPlus />}
                        onClick={increaseQuantity}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full flex-col items-center gap-2">
                  <Button
                    className="h-10 w-full flex-none"
                    size="large"
                    onClick={handleAddToCart}
                  >
                    Add to cart
                  </Button>
                  <Button
                    className="h-10 w-full flex-none"
                    variant="brand-secondary"
                    size="large"
                    onClick={handleBuyNow}
                  >
                    Buy now
                  </Button>
                </div>
              </div>

              {/* Seller Information */}
              <div className="flex w-full max-w-md mx-auto md:max-w-lg lg:max-w-xl xl:max-w-none xl:mx-0 flex-col sm:flex-row items-center sm:items-center gap-4 rounded-md border border-solid border-neutral-200 bg-default-background p-4 sm:p-6">
                <Avatar
                  size="x-large"
                  image={product.seller.image}
                  className="flex-shrink-0"
                >
                  {product.seller.name.charAt(0)}
                </Avatar>
                <div className="flex grow shrink-0 basis-0 flex-col items-center sm:items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-body-bold font-body-bold text-default-font">
                      {product.seller.name}
                    </span>
                    {product.seller.verified && (
                      <FeatherVerified className="text-body font-body text-brand-700" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      <FeatherStar className="text-body font-body text-default-font" />
                      <span className="text-body-bold font-body-bold text-default-font">
                        {product.seller.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-body font-body text-subtext-color">
                      ({product.seller.reviewCount} reviews)
                    </span>
                  </div>
                  <span className="text-caption font-caption text-subtext-color">
                    {product.seller.distance} • {product.seller.availability}
                  </span>
                </div>
                <div className="flex flex-row sm:flex-col md:flex-row gap-2 mt-2 sm:mt-0">
                  <IconButton
                    variant="neutral-primary"
                    icon={<FeatherMessageCircle />}
                    onClick={handleContactSeller}
                  />
                  <IconButton
                    variant="neutral-primary"
                    icon={<FeatherMail />}
                    onClick={() => window.location.href = `mailto:${product.seller.contact.email}`}
                  />
                  <IconButton
                    variant="neutral-primary"
                    icon={<FeatherPhone />}
                    onClick={() => window.location.href = `tel:${product.seller.contact.phone.replace(/[^0-9]/g, '')}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Information */}
        <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-200 bg-default-background shadow-sm mt-4">
          <Accordion
            trigger={
              <div className="flex w-full items-center gap-2 px-4 sm:px-6 py-4 sm:py-6">
                <span className="grow shrink-0 basis-0 text-heading-2 font-heading-2 text-default-font">
                  Pickup Information
                </span>
                <Accordion.Chevron />
              </div>
            }
            defaultOpen={true}
          >
            <div className="flex w-full grow shrink-0 basis-0 flex-col items-start justify-center gap-4 border-t border-solid border-neutral-200 px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex items-start sm:items-center gap-4">
                <FeatherTruck className="text-heading-2 font-heading-2 text-default-font flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Pickup Details
                  </span>
                  <span className="text-body font-body text-default-font">
                    {product.pickup.details}
                  </span>
                </div>
              </div>
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex items-start sm:items-center gap-4">
                  <FeatherClock className="text-heading-2 font-heading-2 text-default-font flex-shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Hours of Operation
                    </span>
                    <span className="text-body font-body text-default-font whitespace-pre-line">
                      {product.pickup.hours}
                    </span>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-4">
                  <FeatherMapPin className="text-heading-2 font-heading-2 text-default-font flex-shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Farm Location
                    </span>
                    <span className="text-body font-body text-default-font">
                      {product.pickup.location}
                    </span>
                    <Button
                      variant="neutral-primary"
                      size="small"
                      icon={<FeatherMapPin />}
                      onClick={handleGetDirections}
                      className="mt-1"
                    >
                      Directions
                    </Button>
                  </div>
                </div>
                <div className="flex items-start sm:items-center gap-4">
                  <FeatherPhone className="text-heading-2 font-heading-2 text-default-font flex-shrink-0" />
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Contact
                    </span>
                    <span className="text-body font-body text-default-font">
                      {product.seller.contact.phone} | {product.seller.contact.email}
                    </span>
                    <div className="flex items-center gap-2">
                      <IconButton
                        variant="neutral-primary"
                        size="small"
                        icon={<FeatherMessageCircle />}
                        onClick={handleContactSeller}
                      />
                      <IconButton
                        variant="neutral-primary"
                        size="small"
                        icon={<FeatherMail />}
                        onClick={() => window.location.href = `mailto:${product.seller.contact.email}`}
                      />
                      <IconButton
                        variant="neutral-primary"
                        size="small"
                        icon={<FeatherPhone />}
                        onClick={() => window.location.href = `tel:${product.seller.contact.phone.replace(/[^0-9]/g, '')}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Accordion>
        </div>

        {/* Product Reviews */}
        <div className="flex w-full flex-col items-start justify-end gap-4 rounded-md border border-solid border-neutral-200 bg-default-background shadow-sm">
          <Accordion
            trigger={
              <div className="flex w-full items-center gap-2 px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex grow shrink-0 basis-0 items-center gap-4 flex-wrap">
                  <span className="text-heading-2 font-heading-2 text-default-font">
                    Product Reviews
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      <FeatherStar className="text-body font-body text-default-font" />
                      <span className="text-body-bold font-body-bold text-default-font">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-body font-body text-subtext-color">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>
                <Accordion.Chevron />
              </div>
            }
            defaultOpen={true}
          >
            <div className="flex w-full flex-col items-start gap-4 border-t border-solid border-neutral-200 px-4 sm:px-6 py-4 sm:py-6">
              <div className="flex w-full flex-col md:flex-row items-start gap-8 md:gap-12">
                {/* Review Highlights */}
                <div className="flex w-full md:w-auto grow shrink-0 basis-0 flex-col items-start gap-4">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Review Highlights
                  </span>
                  <div className="flex flex-wrap items-start gap-2">
                    {product.reviews.highlights.map((highlight, index) => (
                      <Badge key={index} variant="success">"{highlight}"</Badge>
                    ))}
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="flex w-full md:w-auto grow shrink-0 basis-0 flex-col items-start gap-2">
                  <div className="flex w-full items-center gap-2">
                    <span className="w-4 flex-none text-body-bold font-body-bold text-default-font">
                      5
                    </span>
                    <Progress value={product.reviews.ratings.five} />
                    <span className="w-8 flex-none text-body font-body text-default-font">
                      {product.reviews.ratings.five}%
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <span className="w-4 flex-none text-body-bold font-body-bold text-default-font">
                      4
                    </span>
                    <Progress value={product.reviews.ratings.four} />
                    <span className="w-8 flex-none text-body font-body text-default-font">
                      {product.reviews.ratings.four}%
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <span className="w-4 flex-none text-body-bold font-body-bold text-default-font">
                      3
                    </span>
                    <Progress value={product.reviews.ratings.three} />
                    <span className="w-8 flex-none text-body font-body text-default-font">
                      {product.reviews.ratings.three}%
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <span className="w-4 flex-none text-body-bold font-body-bold text-default-font">
                      2
                    </span>
                    <Progress value={product.reviews.ratings.two} />
                    <span className="w-8 flex-none text-body font-body text-default-font">
                      {product.reviews.ratings.two}%
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <span className="w-4 flex-none text-body-bold font-body-bold text-default-font">
                      1
                    </span>
                    <Progress value={product.reviews.ratings.one} />
                    <span className="w-8 flex-none text-body font-body text-default-font">
                      {product.reviews.ratings.one}%
                    </span>
                  </div>
                </div>

                {/* Rating Metrics */}
                <div className="flex flex-col items-start gap-4">
                  <div className="flex w-full items-center gap-4">
                    <span className="w-24 flex-none text-body font-body text-default-font">
                      Freshness
                    </span>
                    <span className="w-12 flex-none text-body-bold font-body-bold text-default-font">
                      {product.reviews.metrics.freshness.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-4">
                    <span className="w-24 flex-none text-body font-body text-default-font">
                      Taste
                    </span>
                    <span className="w-12 flex-none text-body-bold font-body-bold text-default-font">
                      {product.reviews.metrics.taste.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-4">
                    <span className="w-24 flex-none text-body font-body text-default-font">
                      Value
                    </span>
                    <span className="w-12 flex-none text-body-bold font-body-bold text-default-font">
                      {product.reviews.metrics.value.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Items */}
              <div className="flex w-full flex-col items-center gap-6 mt-2">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.reviews.items.map((review, index) => (
                    <div key={index} className="flex flex-col items-start gap-1">
                      <div className="flex w-full items-center justify-between">
                        <span className="text-body-bold font-body-bold text-default-font">
                          {review.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-caption font-caption text-subtext-color">
                          {review.date}
                        </span>
                      </div>
                      <span className="line-clamp-3 text-body font-body text-default-font">
                        {review.comment}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  className="h-10 w-full max-w-md flex-none"
                  variant="neutral-primary"
                  size="large"
                  onClick={() => setShowAllReviews(true)}
                >
                  Read more reviews
                </Button>
              </div>
            </div>
          </Accordion>
        </div>

        {/* Related Products */}
        <div className="flex w-full flex-col items-start gap-4 mt-2">
          <h2 className="text-heading-2 font-heading-2 text-default-font">
            More from {product.seller.name}
          </h2>
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {product.relatedProducts.map((relatedProduct) => (
              <div 
                key={relatedProduct.id} 
                className="flex flex-col items-start gap-2 rounded-md border border-solid border-neutral-200 bg-default-background p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleRelatedProductClick(relatedProduct.id)}
              >
                <img
                  className="h-48 w-full flex-none rounded-lg object-cover"
                  src={relatedProduct.image}
                  alt={relatedProduct.name}
                />
                <div className="flex w-full flex-col items-start gap-2">
                  <span className="text-body-bold font-body-bold text-default-font">
                    {relatedProduct.name}
                  </span>
                  <div className="flex w-full items-center justify-between">
                    <span className="text-body-bold font-body-bold text-default-font">
                      ${relatedProduct.price.toFixed(2)}/{relatedProduct.unit}
                    </span>
                  </div>
                  <Button
                    className="h-8 w-full flex-none"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex w-full flex-col items-center justify-center gap-6 border-t border-solid border-neutral-100 bg-default-background py-8 mt-4">
          <div className="flex w-full max-w-[1024px] flex-wrap items-start gap-6">
            <div className="flex min-w-[280px] md:min-w-[320px] flex-col items-start gap-6 self-stretch">
              <div className="flex w-full grow shrink-0 basis-0 items-start gap-4">
                <img
                  className="h-5 w-5 flex-none object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                  alt="Logo"
                />
                <span className="grow shrink-0 basis-0 font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                  Subframe
                </span>
              </div>
              <div className="flex w-full items-center gap-2">
                <IconButton
                  icon={<FeatherFacebook />}
                  onClick={() => {}}
                />
                <IconButton
                  icon={<FeatherInstagram />}
                  onClick={() => {}}
                />
                <IconButton
                  icon={<FeatherXTwitter />}
                  onClick={() => {}}
                />
                <IconButton
                  icon={<FeatherSlack />}
                  onClick={() => {}}
                />
              </div>
            </div>
            <div className="flex grow shrink-0 basis-0 flex-wrap items-start gap-4 self-stretch">
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
};

export default ProductDetailNew;
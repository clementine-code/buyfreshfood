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
  FeatherArrowLeft
} from "@subframe/core";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import { useLocationContext } from "../contexts/LocationContext";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getProductById, type Product } from "../lib/supabase";
import { foodSearchService, type FoodItem } from "../services/foodSearchService";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
    coordinates: [number, number]; // [latitude, longitude]
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
      location: "123 Organic Way, Fayetteville, AR 72701",
      coordinates: [36.0625, -94.1574],
      rating: 4.9,
      reviewCount: 324,
      verified: true,
      distance: "2.3 miles away",
      availability: "Pickup Today",
      contact: {
        phone: "(479) 555-0123",
        email: "info@sarahsfamilyfarm.com"
      }
    },
    pickup: {
      details: "Drive-through pickup at farm entrance with no reservation required.",
      hours: "Monday - Saturday: 8:00 AM - 6:00 PM\nSunday: 10:00 AM - 4:00 PM",
      location: "123 Organic Way, Fayetteville, AR 72701"
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
  "farm-fresh-eggs": {
    id: "farm-fresh-eggs",
    name: "Farm Fresh Eggs",
    description: "Free-range eggs from pasture-raised hens. Our chickens roam freely on organic pastures, resulting in eggs with rich, golden yolks and superior flavor. Each egg is hand-collected daily and carefully inspected for quality.",
    price: 6.99,
    unit: "dozen",
    isOrganic: true,
    images: [
      "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=800",
      "https://images.unsplash.com/photo-1489171078254-c3365d6e359f?w=800",
      "https://images.unsplash.com/photo-1510130146128-7a7b6afb6f9d?w=800"
    ],
    tags: ["Free Range", "Pasture Raised", "Local"],
    rating: 4.9,
    reviewCount: 45,
    seller: {
      name: "Happy Hen Farm",
      image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800",
      location: "456 Farm Road, Farmington, AR 72730",
      coordinates: [36.0420, -94.2474],
      rating: 4.8,
      reviewCount: 156,
      verified: true,
      distance: "5.1 miles away",
      availability: "Pickup Tomorrow",
      contact: {
        phone: "(479) 555-0456",
        email: "eggs@happyhenfarm.com"
      }
    },
    pickup: {
      details: "Farm stand pickup available during business hours. No appointment needed.",
      hours: "Tuesday - Saturday: 9:00 AM - 5:00 PM\nSunday - Monday: Closed",
      location: "456 Farm Road, Farmington, AR 72730"
    },
    reviews: {
      highlights: ["Golden yolks", "Incredible flavor", "Worth every penny", "Best eggs ever"],
      ratings: {
        five: 95,
        four: 3,
        three: 2,
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
          name: "Michael R.",
          rating: 5,
          date: "2 days ago",
          comment: "These eggs are incredible! The yolks are so orange and rich. You can really tell the difference from store-bought eggs. Will definitely be buying again."
        },
        {
          name: "Jennifer T.",
          rating: 5,
          date: "1 week ago",
          comment: "I've been buying these eggs for months now and they're consistently excellent. The chickens are clearly well-cared for, and it shows in the quality of the eggs."
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
        id: "grass-fed-butter",
        name: "Grass-Fed Butter",
        price: 7.99,
        unit: "lb",
        image: "https://images.unsplash.com/photo-1589985270958-bf087b2d8ed7?w=800"
      },
      {
        id: "artisan-cheese",
        name: "Artisan Cheese Selection",
        price: 12.99,
        unit: "pack",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800"
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
  "artisan-sourdough": {
    id: "artisan-sourdough",
    name: "Artisan Sourdough Bread",
    description: "Hand-crafted sourdough bread made with our 5-year-old starter and locally milled flour. Each loaf is naturally leavened for 24 hours, creating complex flavors and a perfect crust. Baked fresh daily in our wood-fired oven.",
    price: 8.99,
    unit: "loaf",
    isOrganic: false,
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800",
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=800"
    ],
    tags: ["Artisan", "Wild Yeast", "Wood-Fired"],
    rating: 4.8,
    reviewCount: 67,
    seller: {
      name: "Sweet Life Bakery",
      image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800",
      location: "789 Main Street, Springdale, AR 72762",
      coordinates: [36.1867, -94.1288],
      rating: 4.9,
      reviewCount: 210,
      verified: true,
      distance: "8.2 miles away",
      availability: "Pickup Today",
      contact: {
        phone: "(479) 555-0789",
        email: "hello@sweetlifebakery.com"
      }
    },
    pickup: {
      details: "Bakery pickup available during business hours. Pre-orders recommended for large quantities.",
      hours: "Wednesday - Sunday: 7:00 AM - 2:00 PM\nMonday - Tuesday: Closed",
      location: "789 Main Street, Springdale, AR 72762"
    },
    reviews: {
      highlights: ["Perfect crust", "Complex flavor", "Authentic sourdough", "Worth the drive"],
      ratings: {
        five: 85,
        four: 12,
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
          name: "Robert J.",
          rating: 5,
          date: "5 days ago",
          comment: "This is what real sourdough should taste like! The crust is perfect - crispy but not too hard, and the inside is soft with just the right amount of chew. I drive 30 minutes just to get this bread."
        },
        {
          name: "Amanda P.",
          rating: 5,
          date: "2 weeks ago",
          comment: "As someone who used to live in San Francisco, I can say this sourdough is the real deal. The flavor is complex and tangy, and it keeps well for several days (if it lasts that long!)."
        }
      ]
    },
    relatedProducts: [
      {
        id: "whole-wheat-rolls",
        name: "Whole Wheat Dinner Rolls",
        price: 6.99,
        unit: "dozen",
        image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800"
      },
      {
        id: "artisan-baguette",
        name: "Artisan Baguette",
        price: 4.99,
        unit: "each",
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=800"
      },
      {
        id: "cinnamon-raisin-bread",
        name: "Cinnamon Raisin Bread",
        price: 7.99,
        unit: "loaf",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800"
      },
      {
        id: "croissants",
        name: "Butter Croissants",
        price: 12.99,
        unit: "half-dozen",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800"
      }
    ]
  }
};

// Helper function to convert Supabase Product to ProductDetails
const convertSupabaseProduct = (product: Product): ProductDetails | null => {
  if (!product || !product.seller) return null;
  
  return {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    unit: product.unit,
    isOrganic: product.is_organic || false,
    images: [product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'],
    tags: product.tags || [],
    rating: product.average_rating || 4.5,
    reviewCount: product.reviews?.length || 0,
    seller: {
      name: product.seller.name,
      image: 'https://images.unsplash.com/photo-1507914372368-b2b085b925a1?w=800',
      location: product.seller.location,
      coordinates: [
        product.seller.latitude || 36.0625, 
        product.seller.longitude || -94.1574
      ] as [number, number],
      rating: 4.8,
      reviewCount: 120,
      verified: product.seller.verified || false,
      distance: '3.2 miles away',
      availability: 'Pickup Today',
      contact: {
        phone: product.seller.contact_phone || '(479) 555-0123',
        email: product.seller.contact_email || 'contact@localfarm.com'
      }
    },
    pickup: {
      details: 'Pickup available during business hours.',
      hours: 'Monday - Saturday: 9:00 AM - 5:00 PM\nSunday: Closed',
      location: product.seller.location
    },
    reviews: {
      highlights: ['Fresh', 'Great quality', 'Recommended'],
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
      items: product.reviews?.map((review: any) => ({
        name: review.customer_name,
        rating: review.rating,
        date: new Date(review.created_at).toLocaleDateString(),
        comment: review.comment || ''
      })) || []
    },
    relatedProducts: []
  };
};

// Helper function to convert FoodItem to ProductDetails
const convertFoodItem = (item: FoodItem): ProductDetails | null => {
  if (!item) return null;
  
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: parseFloat(item.price.replace('$', '')),
    unit: item.unit,
    isOrganic: item.isOrganic,
    images: [item.image],
    tags: item.tags,
    rating: 4.5,
    reviewCount: 10,
    seller: {
      name: item.seller,
      image: 'https://images.unsplash.com/photo-1507914372368-b2b085b925a1?w=800',
      location: item.location,
      coordinates: [36.0625, -94.1574], // Default coordinates
      rating: 4.7,
      reviewCount: 50,
      verified: true,
      distance: '4.5 miles away',
      availability: 'Pickup Available',
      contact: {
        phone: '(479) 555-0123',
        email: 'contact@localfarm.com'
      }
    },
    pickup: {
      details: 'Contact seller for pickup details.',
      hours: 'Monday - Friday: 9:00 AM - 5:00 PM',
      location: item.location
    },
    reviews: {
      highlights: ['Fresh', 'Local', 'Quality'],
      ratings: {
        five: 70,
        four: 20,
        three: 10,
        two: 0,
        one: 0
      },
      metrics: {
        freshness: 4.5,
        taste: 4.6,
        value: 4.4
      },
      items: []
    },
    relatedProducts: []
  };
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
      if (!id) {
        setError('Product ID not provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First check if we have sample data for this product
        if (sampleProducts[id]) {
          setProduct(sampleProducts[id]);
          setLoading(false);
          return;
        }

        // Try to get from Supabase
        try {
          const { data: supabaseProduct, error: supabaseError } = await getProductById(id);
          
          if (supabaseProduct && !supabaseError) {
            const convertedProduct = convertSupabaseProduct(supabaseProduct);
            if (convertedProduct) {
              setProduct(convertedProduct);
              setLoading(false);
              return;
            }
          }
        } catch (supabaseErr) {
          console.warn('Error fetching from Supabase:', supabaseErr);
          // Continue to fallback
        }

        // Try food search service as fallback
        try {
          const foodItem = await foodSearchService.getFoodItemById(id);
          if (foodItem) {
            const convertedItem = convertFoodItem(foodItem);
            if (convertedItem) {
              setProduct(convertedItem);
              setLoading(false);
              return;
            }
          }
        } catch (foodSearchErr) {
          console.warn('Error fetching from food search service:', foodSearchErr);
        }

        // If we get here, we couldn't find the product
        setError('Product not found');
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

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
  const handleBack = () => {
    navigate(-1);
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
            <span className="text-body font-body text-subtext-color">{error || "The product you're looking for doesn't exist or has been removed."}</span>
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
      {/* Breadcrumbs with absolute positioning */}
      <div className="absolute top-20 left-0 right-0 flex w-full items-center gap-4 px-4 md:px-8 lg:px-12 py-2 bg-default-background z-10">
        <Button
          variant="neutral-tertiary"
          icon={<FeatherArrowLeft />}
          onClick={handleBack}
          className="flex-shrink-0"
        >
          Back
        </Button>
        <Breadcrumbs className="h-auto grow shrink-0 basis-0 overflow-hidden">
          <Breadcrumbs.Item>Product Results</Breadcrumbs.Item>
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
      </div>

      {/* Main content with top padding to account for absolute breadcrumbs */}
      <div className="flex h-full w-full flex-col items-start justify-center gap-4 bg-default-background px-4 md:px-8 lg:px-12 pt-0 pb-4">
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
              <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-200 bg-default-background p-4 shadow-sm">
                <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
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
              <div className="flex w-full flex-col sm:flex-row items-start sm:items-center gap-4 rounded-md border border-solid border-neutral-200 bg-default-background p-4 sm:p-6">
                <Avatar
                  size="x-large"
                  image={product.seller.image}
                  className="flex-shrink-0"
                >
                  {product.seller.name.charAt(0)}
                </Avatar>
                <div className="flex grow shrink-0 basis-0 flex-col items-start">
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

        {/* Pickup Information with Map */}
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
              <div className="flex w-full flex-col md:flex-row items-start gap-6">
                {/* Pickup Details */}
                <div className="flex flex-col items-start gap-6 w-full md:w-1/2">
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
                
                {/* Map */}
                <div className="w-full md:w-1/2 h-64 md:h-auto rounded-lg overflow-hidden border border-neutral-200">
                  <MapContainer 
                    center={product.seller.coordinates} 
                    zoom={13} 
                    style={{ height: '100%', minHeight: '300px', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={product.seller.coordinates}>
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold">{product.seller.name}</h3>
                          <p className="text-sm">{product.pickup.location}</p>
                          <p className="text-xs mt-1">{product.seller.availability}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
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
                onClick={() => navigate(`/product/${relatedProduct.id}`)}
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
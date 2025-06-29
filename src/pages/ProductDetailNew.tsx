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
  FeatherHeart
} from "@subframe/core";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import { useLocationContext } from "../contexts/LocationContext";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Product type definition
interface Product {
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

// Sample product data
const sampleProduct: Product = {
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
    coordinates: [36.0625, -94.1574], // Fayetteville, AR coordinates
    rating: 4.9,
    reviewCount: 324,
    verified: true,
    distance: "2.3 miles away",
    availability: "Pickup Today",
    contact: {
      phone: "(479) 555-0123",
      email: "sarah@sarahsfamilyfarm.com"
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
};

// More sample products for dynamic routing
const productSamples: {[key: string]: Product} = {
  "heirloom-tomatoes": sampleProduct,
  "rainbow-swiss-chard": {
    ...sampleProduct,
    id: "rainbow-swiss-chard",
    name: "Rainbow Swiss Chard",
    description: "Colorful and nutritious leafy greens with vibrant stems. Excellent source of vitamins and minerals. Our rainbow chard is grown using organic practices and harvested fresh daily.",
    price: 3.99,
    unit: "bunch",
    images: [
      "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
      "https://images.unsplash.com/photo-1590759485395-5b426d3c0d70",
      "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0"
    ],
    tags: ["Colorful", "Nutrient Dense", "Local"],
    rating: 4.5,
    reviewCount: 18
  },
  "fresh-herbs-bundle": {
    ...sampleProduct,
    id: "fresh-herbs-bundle",
    name: "Fresh Herbs Bundle",
    description: "Mix of fresh herbs including basil, cilantro, parsley, and dill. Grown in our climate-controlled greenhouse for year-round availability. Perfect for adding flavor to any dish.",
    price: 5.99,
    unit: "bundle",
    images: [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800",
      "https://images.unsplash.com/photo-1582284540020-8acbe03f4924",
      "https://images.unsplash.com/photo-1596097635121-14b38c5d7a55"
    ],
    tags: ["Fresh Herbs", "Variety Pack", "Greenhouse Grown"],
    rating: 4.8,
    reviewCount: 32
  },
  "oyster-mushroom-medley": {
    ...sampleProduct,
    id: "oyster-mushroom-medley",
    name: "Oyster Mushroom Medley",
    description: "Mix of oyster mushrooms in various colors including pearl, golden, and pink varieties. Delicate flavor and texture. Grown using sustainable cultivation methods.",
    price: 8.99,
    unit: "lb",
    isOrganic: false,
    images: [
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800",
      "https://images.unsplash.com/photo-1611089676098-5fa7965147a3",
      "https://images.unsplash.com/photo-1607877742574-a7253426f5af"
    ],
    tags: ["Variety Mix", "Colorful", "Delicate"],
    rating: 4.6,
    reviewCount: 15,
    seller: {
      ...sampleProduct.seller,
      name: "Ozark Mushrooms",
      image: "https://images.unsplash.com/photo-1595475207225-428b62bda831",
      location: "45 Forest Lane, Winslow, AR 72959",
      coordinates: [35.8012, -94.1341], // Winslow, AR coordinates
      distance: "18.5 miles away"
    }
  }
};

const ProductDetailNew: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: locationState } = useLocationContext();
  const { openWaitlistFlow } = useWaitlistContext();
  
  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Load product data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call with a small delay
    setTimeout(() => {
      if (id && productSamples[id]) {
        setProduct(productSamples[id]);
      } else {
        // Default to heirloom tomatoes if ID not found
        setProduct(sampleProduct);
      }
      setLoading(false);
    }, 300);
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

  // Handle save for later
  const handleSaveForLater = () => {
    // Similar to add to cart, but would save for later
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
            <span className="text-body font-body text-subtext-color">The product you're looking for doesn't exist or has been removed.</span>
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

              {/* Price and Quantity - UPDATED LAYOUT */}
              <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-200 bg-default-background p-4 shadow-sm">
                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-body-bold font-body-bold text-brand-700">
                      Farm Fresh Price
                    </span>
                    <span className="text-heading-2 font-heading-2 text-default-font">
                      ${product.price.toFixed(2)}/{product.unit}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
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
                
                {/* Action Buttons - Added heart icon back */}
                <div className="flex w-full items-center gap-2">
                  <Button
                    className="h-10 flex-1"
                    size="large"
                    onClick={handleAddToCart}
                  >
                    Add to cart
                  </Button>
                  <IconButton
                    variant="destructive-secondary"
                    size="large"
                    icon={<FeatherHeart />}
                    onClick={handleSaveForLater}
                    className="h-10 w-10"
                  />
                </div>
                
                <Button
                  className="h-10 w-full"
                  variant="brand-secondary"
                  size="large"
                  onClick={handleBuyNow}
                >
                  Buy now
                </Button>
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
              <div className="flex w-full items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Pickup Information
                </span>
                <Accordion.Chevron />
              </div>
            }
            defaultOpen={true}
          >
            <div className="flex w-full flex-col md:flex-row border-t border-solid border-neutral-200">
              {/* Pickup Details */}
              <div className="flex w-full md:w-1/2 flex-col items-start gap-4 px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex items-start gap-4">
                  <FeatherTruck className="text-heading-2 font-heading-2 text-default-font flex-shrink-0 mt-1" />
                  <div className="flex flex-col items-start">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Pickup Details
                    </span>
                    <span className="text-body font-body text-default-font">
                      {product.pickup.details}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <FeatherClock className="text-heading-2 font-heading-2 text-default-font flex-shrink-0 mt-1" />
                  <div className="flex flex-col items-start">
                    <span className="text-body-bold font-body-bold text-default-font">
                      Hours of Operation
                    </span>
                    <span className="text-body font-body text-default-font whitespace-pre-line">
                      {product.pickup.hours}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <FeatherMapPin className="text-heading-2 font-heading-2 text-default-font flex-shrink-0 mt-1" />
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
                
                <div className="flex items-start gap-4">
                  <FeatherPhone className="text-heading-2 font-heading-2 text-default-font flex-shrink-0 mt-1" />
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
              
              {/* Map */}
              <div className="w-full md:w-1/2 h-64 md:h-auto border-t md:border-t-0 md:border-l border-neutral-200">
                <div className="h-full w-full p-4">
                  <div className="h-full w-full rounded-md overflow-hidden border border-neutral-200">
                    <MapContainer 
                      center={product.seller.coordinates} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={product.seller.coordinates}>
                        <Popup>
                          <div className="p-1">
                            <strong>{product.seller.name}</strong><br />
                            {product.seller.location}
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
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
                  <div className="flex w-full items-center gap-2">
                    <Button
                      className="h-8 flex-1"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart();
                      }}
                    >
                      Add to Cart
                    </Button>
                    <IconButton
                      variant="destructive-secondary"
                      size="small"
                      icon={<FeatherHeart />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveForLater();
                      }}
                    />
                  </div>
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
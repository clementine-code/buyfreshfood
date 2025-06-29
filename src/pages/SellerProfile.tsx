import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { Breadcrumbs } from "@/ui/components/Breadcrumbs";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Tabs } from "@/ui/components/Tabs";
import { TextField } from "@/ui/components/TextField";
import { Progress } from "@/ui/components/Progress";
import { Loader } from "@/ui/components/Loader";
import { Alert } from "@/ui/components/Alert";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  FeatherVerified, 
  FeatherMapPin, 
  FeatherAward, 
  FeatherShare, 
  FeatherStar, 
  FeatherTruck, 
  FeatherClock, 
  FeatherPhone, 
  FeatherMessageCircle, 
  FeatherMail,
  FeatherFilter,
  FeatherSearch,
  FeatherHeart,
  FeatherChevronDown,
  FeatherGrid,
  FeatherList,
  FeatherAlertCircle
} from "@subframe/core";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import { useLocationContext } from "../contexts/LocationContext";
import PhotoGallery from "../components/PhotoGallery";
import L from 'leaflet';

// Fix for default Leaflet markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Sample seller data
const sampleSellers = {
  'sarah-family-farm': {
    id: 'sarah-family-farm',
    name: "Sarah's Family Farm",
    verified: true,
    coverImage: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80",
    profileImage: "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif",
    distance: "2.3 miles away",
    certifications: ["Certified Organic"],
    stats: {
      rating: 4.9,
      totalReviews: 324,
      followers: 1432,
      products: 24
    },
    story: "We're a family-owned organic farm dedicated to growing the freshest, most flavorful produce in Johnson County. Our sustainable farming practices ensure you get the best quality vegetables while protecting our environment for future generations.",
    storyImages: [
      {
        url: "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1200",
        alt: "Farmer inspecting tomato plants in the early morning sunlight",
        caption: "Morning harvest inspection"
      },
      {
        url: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=1200",
        alt: "Baskets of freshly harvested heirloom tomatoes in various colors",
        caption: "Today's harvest"
      },
      {
        url: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=1200",
        alt: "Family working together in the greenhouse with young tomato plants",
        caption: "Family tradition"
      }
    ],
    details: {
      pickup: "Pickup at Farm, Pickup at Farmer's Market, Delivery (select locations)",
      hours: {
        weekdays: "Monday - Saturday: 8:00 AM - 6:00 PM",
        weekend: "Sunday: 10:00 AM - 4:00 PM"
      },
      location: "123 Organic Way, Fayetteville, AR 72701",
      coordinates: [36.0625, -94.1574], // [latitude, longitude]
      contact: {
        phone: "(479) 555-1234",
        email: "sarah@sarahsfamilyfarm.com"
      }
    },
    products: [
      {
        id: "rainbow-swiss-chard",
        name: "Rainbow Swiss Chard",
        price: "$3.99/bunch",
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
        isOrganic: true
      },
      {
        id: "fresh-herbs-bundle",
        name: "Fresh Herbs Bundle", 
        price: "$5.99/bundle",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800",
        isOrganic: true
      },
      {
        id: "organic-lettuce-mix",
        name: "Organic Lettuce Mix",
        price: "$4.50/bag", 
        image: "https://images.unsplash.com/photo-1557844352-761f2565b576?w=800",
        isOrganic: true
      },
      {
        id: "fresh-green-beans",
        name: "Fresh Green Beans",
        price: "$3.99/lb",
        image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=800",
        isOrganic: false
      },
      {
        id: "heirloom-tomatoes",
        name: "Heirloom Tomatoes",
        price: "$4.99/lb",
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
        isOrganic: true
      },
      {
        id: "baby-spinach",
        name: "Baby Spinach",
        price: "$4.49/bag",
        image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800",
        isOrganic: true
      },
      {
        id: "fresh-carrots",
        name: "Fresh Carrots",
        price: "$3.49/bunch",
        image: "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=800",
        isOrganic: true
      },
      {
        id: "red-bell-peppers",
        name: "Red Bell Peppers",
        price: "$1.99/each",
        image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800",
        isOrganic: true
      }
    ]
  },
  'ozark-mushrooms': {
    id: 'ozark-mushrooms',
    name: "Ozark Mushrooms",
    verified: true,
    coverImage: "https://images.unsplash.com/photo-1607346705432-b3322ec0a805?auto=format&fit=crop&q=80",
    profileImage: "https://images.unsplash.com/photo-1595475207225-428b62bda831?w=400",
    distance: "18.5 miles away",
    certifications: ["Sustainable Practices"],
    stats: {
      rating: 4.8,
      totalReviews: 156,
      followers: 892,
      products: 12
    },
    story: "We specialize in growing gourmet and medicinal mushrooms using sustainable practices. Our indoor growing facility allows us to produce fresh mushrooms year-round, providing the Ozark region with nutritious and delicious fungi varieties.",
    storyImages: [
      {
        url: "https://images.unsplash.com/photo-1611089676098-5fa7965147a3?w=1200",
        alt: "Freshly harvested shiitake mushrooms on wooden surface",
        caption: "Fresh shiitake harvest"
      },
      {
        url: "https://images.unsplash.com/photo-1607877742574-a7253426f5af?w=1200",
        alt: "Mushroom growing facility with controlled environment",
        caption: "Our indoor growing facility"
      },
      {
        url: "https://images.unsplash.com/photo-1586686804663-f042d4e5c9ca?w=1200",
        alt: "Close-up of lion's mane mushroom growing on substrate",
        caption: "Lion's mane cultivation"
      }
    ],
    details: {
      pickup: "Pickup at Farm, Delivery (select locations), Farmers Markets",
      hours: {
        weekdays: "Monday - Friday: 9:00 AM - 5:00 PM",
        weekend: "Saturday: 10:00 AM - 3:00 PM, Sunday: Closed"
      },
      location: "45 Forest Lane, Winslow, AR 72959",
      coordinates: [35.8012, -94.1341], // [latitude, longitude]
      contact: {
        phone: "(479) 555-0369",
        email: "fungi@ozarkmushrooms.com"
      }
    },
    products: [
      {
        id: "shiitake-mushrooms",
        name: "Shiitake Mushrooms",
        price: "$12.99/lb",
        image: "https://images.unsplash.com/photo-1611089676098-5fa7965147a3?w=800",
        isOrganic: false
      },
      {
        id: "oyster-mushroom-medley",
        name: "Oyster Mushroom Medley",
        price: "$8.99/lb",
        image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800",
        isOrganic: false
      },
      {
        id: "lion-mane-mushrooms",
        name: "Lion's Mane Mushrooms",
        price: "$14.99/lb",
        image: "https://images.unsplash.com/photo-1586686804663-f042d4e5c9ca?w=800",
        isOrganic: false
      },
      {
        id: "mushroom-growing-kit",
        name: "Mushroom Growing Kit",
        price: "$24.99/kit",
        image: "https://images.unsplash.com/photo-1652179289125-1eeba6fc8183?w=800",
        isOrganic: false
      }
    ]
  }
};

// Sample review data
const reviewData = {
  highlights: ["Best organic produce in town", "Always fresh", "Great service"],
  breakdown: [
    { stars: 5, percentage: 90 },
    { stars: 4, percentage: 7 },
    { stars: 3, percentage: 1 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 }
  ],
  reviews: [
    {
      id: 1,
      name: "Emily K.",
      rating: 5,
      date: "3 days ago",
      comment: "This place is so friendly and their products are delicious. I've been buying from them for years and have never been disappointed. The quality is consistently excellent!"
    },
    {
      id: 2,
      name: "David L.", 
      rating: 5,
      date: "1 week ago",
      comment: "Supporting folks like this in our community is so incredibly worth it. They make me feel like a million dollars and their produce is always top notch. Highly recommend!"
    },
    {
      id: 3,
      name: "Jessica M.",
      rating: 4,
      date: "2 weeks ago",
      comment: "Great selection of organic produce. I love their commitment to sustainable farming practices. The only reason for 4 stars is that sometimes they sell out of popular items quickly."
    },
    {
      id: 4,
      name: "Michael T.",
      rating: 5,
      date: "3 weeks ago",
      comment: "The best farm-fresh produce in the area! Their heirloom tomatoes are incredible, and the staff is always friendly and knowledgeable. I'm a regular customer now."
    }
  ]
};

const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Products');
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("grid");
  
  // Waitlist integration
  const { state: locationState } = useLocationContext();
  const { openWaitlistFlow } = useWaitlistContext();

  useEffect(() => {
    const loadSellerData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, this would be a fetch from Supabase
        // For now, we'll use our sample data
        setTimeout(() => {
          if (id && sampleSellers[id as keyof typeof sampleSellers]) {
            setSeller(sampleSellers[id as keyof typeof sampleSellers]);
          } else {
            // Default to first seller if ID not found
            setSeller(sampleSellers['sarah-family-farm']);
            setError('Seller not found, showing default seller');
          }
          setLoading(false);
        }, 500); // Simulate network delay
      } catch (err) {
        console.error('Error loading seller data:', err);
        setError('Failed to load seller information');
        setLoading(false);
      }
    };

    loadSellerData();
  }, [id]);

  const handleAddToCart = async (product: any) => {
    // Determine waitlist type based on location
    const waitlistType = locationState.isNWA ? 'early_access' : 'geographic';
    
    // Open waitlist flow with current location data
    await openWaitlistFlow(waitlistType, locationState.isSet ? {
      isNWA: locationState.isNWA,
      city: locationState.city || '',
      state: locationState.state || '',
      zipCode: locationState.zipCode || '',
      formattedAddress: locationState.location || ''
    } : undefined);
  };

  const handleSaveForLater = async (product: any) => {
    // Similar to add to cart, but would save for later
    const waitlistType = locationState.isNWA ? 'early_access' : 'geographic';
    
    await openWaitlistFlow(waitlistType, locationState.isSet ? {
      isNWA: locationState.isNWA,
      city: locationState.city || '',
      state: locationState.state || '',
      zipCode: locationState.zipCode || '',
      formattedAddress: locationState.location || ''
    } : undefined);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: seller?.name || 'Local Food Seller',
        text: seller?.story || 'Check out this local food producer!',
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleGetDirections = () => {
    if (seller?.details?.location) {
      window.open(`https://maps.google.com?q=${encodeURIComponent(seller.details.location)}`, '_blank');
    }
  };

  const handleContactSeller = async () => {
    // Determine waitlist type based on location
    const waitlistType = locationState.isNWA ? 'early_access' : 'geographic';
    
    // Open waitlist flow with current location data
    await openWaitlistFlow(waitlistType, locationState.isSet ? {
      isNWA: locationState.isNWA,
      city: locationState.city || '',
      state: locationState.state || '',
      zipCode: locationState.zipCode || '',
      formattedAddress: locationState.location || ''
    } : undefined);
  };

  const handleFollowSeller = async () => {
    // Determine waitlist type based on location
    const waitlistType = locationState.isNWA ? 'early_access' : 'geographic';
    
    // Open waitlist flow with current location data
    await openWaitlistFlow(waitlistType, locationState.isSet ? {
      isNWA: locationState.isNWA,
      city: locationState.city || '',
      state: locationState.state || '',
      zipCode: locationState.zipCode || '',
      formattedAddress: locationState.location || ''
    } : undefined);
  };

  // Render stars for ratings
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FeatherStar 
        key={i} 
        className={`${i < Math.round(rating) ? 'text-yellow-500 fill-current' : 'text-neutral-300'} text-body font-body`} 
      />
    ));
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    if (!seller) return null;

    switch(activeTab) {
      case 'Products':
        return (
          <div className="w-full">
            {/* Filter and Search Bar */}
            <div className="flex w-full items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="neutral-secondary"
                  icon={<FeatherFilter />}
                  onClick={() => {}}
                >
                  Filter
                </Button>
                <div className="flex items-center gap-1">
                  <div className="hidden md:flex items-center gap-1">
                    <Button
                      variant={viewMode === "grid" ? "brand-primary" : "neutral-tertiary"}
                      size="small"
                      icon={<FeatherGrid />}
                      onClick={() => setViewMode("grid")}
                    />
                    <Button
                      variant={viewMode === "list" ? "brand-primary" : "neutral-tertiary"}
                      size="small"
                      icon={<FeatherList />}
                      onClick={() => setViewMode("list")}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <TextField
                  className="w-64 hidden md:block"
                  variant="filled"
                  icon={<FeatherSearch />}
                >
                  <TextField.Input placeholder="Search products..." />
                </TextField>
                
                <div className="relative">
                  <Button
                    variant="neutral-tertiary"
                    iconRight={<FeatherChevronDown />}
                    size="small"
                    onClick={() => {}}
                  >
                    Sort
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            <div className={`w-full ${
              viewMode === "grid" 
                ? "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "flex flex-col gap-4"
            }`}>
              {seller.products.map((product: any) => (
                <div 
                  key={product.id}
                  className={`flex ${viewMode === "grid" ? "flex-col" : "flex-row"} items-start gap-4 rounded-md border border-solid border-neutral-200 bg-default-background p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => handleProductClick(product.id)}
                >
                  <img
                    className={`${viewMode === "grid" ? "h-48 w-full" : "h-24 w-24"} flex-none rounded-lg object-cover`}
                    src={product.image}
                    alt={product.name}
                  />
                  <div className="flex flex-col items-start gap-2 flex-1">
                    <div className="flex w-full items-start justify-between">
                      <div>
                        {product.isOrganic && (
                          <Badge variant="success" className="mb-1">Organic</Badge>
                        )}
                        <h3 className="text-body-bold font-body-bold text-default-font">
                          {product.name}
                        </h3>
                        <div className="text-body-bold font-body-bold text-default-font mt-1">
                          {product.price}
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full items-center gap-2 mt-auto">
                      <Button
                        className="h-8 flex-1"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product);
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
                          handleSaveForLater(product);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'Reviews':
        return (
          <div className="flex w-full flex-col items-start gap-6">
            <div className="flex w-full flex-wrap items-start gap-8 md:gap-24">
              {/* Review Highlights */}
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4">
                <span className="text-body-bold font-body-bold text-default-font">
                  Review Highlights
                </span>
                <div className="flex flex-wrap items-start gap-2">
                  {reviewData.highlights.map((highlight, index) => (
                    <Badge key={index} variant="success">"{highlight}"</Badge>
                  ))}
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
                {reviewData.breakdown.map((item) => (
                  <div key={item.stars} className="flex w-full items-center gap-2">
                    <span className="w-4 flex-none text-body-bold font-body-bold text-default-font">
                      {item.stars}
                    </span>
                    <Progress value={item.percentage} />
                    <span className="w-8 flex-none text-body font-body text-default-font">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Rating Metrics */}
              <div className="flex flex-col items-start gap-4">
                <div className="flex w-full items-center gap-4">
                  <span className="w-24 flex-none text-body font-body text-default-font">
                    Freshness
                  </span>
                  <span className="w-12 flex-none text-body-bold font-body-bold text-default-font">
                    4.9
                  </span>
                </div>
                <div className="flex w-full items-center gap-4">
                  <span className="w-24 flex-none text-body font-body text-default-font">
                    Quality
                  </span>
                  <span className="w-12 flex-none text-body-bold font-body-bold text-default-font">
                    4.8
                  </span>
                </div>
                <div className="flex w-full items-center gap-4">
                  <span className="w-24 flex-none text-body font-body text-default-font">
                    Value
                  </span>
                  <span className="w-12 flex-none text-body-bold font-body-bold text-default-font">
                    4.7
                  </span>
                </div>
              </div>
            </div>

            {/* Review Items */}
            <div className="flex w-full flex-col items-center gap-6">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviewData.reviews.map((review) => (
                  <div key={review.id} className="flex flex-col items-start gap-1 p-4 border border-neutral-200 rounded-md">
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
                    <span className="text-body font-body text-default-font mt-2">
                      {review.comment}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                className="h-10 w-full max-w-md flex-none"
                variant="neutral-primary"
                size="large"
                onClick={() => {}}
              >
                Read more reviews
              </Button>
            </div>
          </div>
        );
      
      case 'Location':
        return (
          <div className="flex w-full flex-col md:flex-row items-start gap-6">
            <div className="flex flex-col items-start gap-4 rounded-md border border-solid border-neutral-200 bg-default-background p-6 shadow-sm md:w-1/3">
              <h2 className="text-heading-2 font-heading-2 text-default-font">
                Address
              </h2>
              <p className="text-body font-body text-default-font">
                {seller.details.location}
              </p>
              <Button
                variant="neutral-primary"
                icon={<FeatherMapPin />}
                onClick={handleGetDirections}
              >
                Directions
              </Button>
              
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <h3 className="text-body-bold font-body-bold text-default-font mb-2">
                  Hours
                </h3>
                <p className="text-body font-body text-default-font">
                  {seller.details.hours.weekdays}
                </p>
                <p className="text-body font-body text-default-font">
                  {seller.details.hours.weekend}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <h3 className="text-body-bold font-body-bold text-default-font mb-2">
                  Contact
                </h3>
                <p className="text-body font-body text-default-font">
                  {seller.details.contact.phone}
                </p>
                <p className="text-body font-body text-default-font">
                  {seller.details.contact.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
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
                    onClick={() => window.location.href = `mailto:${seller.details.contact.email}`}
                  />
                  <IconButton
                    variant="neutral-primary"
                    size="small"
                    icon={<FeatherPhone />}
                    onClick={() => window.location.href = `tel:${seller.details.contact.phone.replace(/[^0-9]/g, '')}`}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center rounded-md border border-neutral-200 bg-default-background shadow-sm h-96 md:w-2/3">
              {seller.details.coordinates && (
                <MapContainer 
                  center={seller.details.coordinates as [number, number]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={seller.details.coordinates as [number, number]}>
                    <Popup>
                      <div className="p-1">
                        <strong>{seller.name}</strong><br />
                        {seller.details.location}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              )}
            </div>
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  if (loading) {
    return (
      <DefaultPageLayout>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader size="large" />
            <span className="text-body font-body text-subtext-color">Loading seller profile...</span>
          </div>
        </div>
      </DefaultPageLayout>
    );
  }

  if (error && !seller) {
    return (
      <DefaultPageLayout>
        <div className="flex h-screen w-full items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <FeatherAlertCircle className="w-16 h-16 text-error-600" />
            <h2 className="text-heading-2 font-heading-2 text-error-700">Seller Not Found</h2>
            <p className="text-body font-body text-subtext-color">{error}</p>
            <Button onClick={() => navigate('/shop')}>
              Browse All Sellers
            </Button>
          </div>
        </div>
      </DefaultPageLayout>
    );
  }

  if (!seller) return null;

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-start gap-6 bg-default-background py-6 px-4 md:px-6 lg:px-12">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Breadcrumbs.Item onClick={() => navigate('/')}>Home</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item onClick={() => navigate('/shop')}>Shop</Breadcrumbs.Item>
          <Breadcrumbs.Divider />
          <Breadcrumbs.Item active={true}>{seller.name}</Breadcrumbs.Item>
        </Breadcrumbs>

        {/* Error Alert if needed */}
        {error && (
          <Alert 
            variant="warning" 
            title="Note" 
            description={error}
            className="w-full"
          />
        )}

        {/* Hero Section */}
        <div className="flex h-48 sm:h-64 md:h-80 w-full flex-none flex-col items-start relative rounded-lg overflow-hidden">
          <img
            className="h-full w-full flex-none object-cover"
            src={seller.coverImage}
            alt={`${seller.name} cover`}
          />
          <div className="flex w-full items-end gap-4 md:gap-6 p-4 md:px-8 md:py-6 absolute bottom-0 left-0 bg-gradient-to-t from-[#00000099] to-transparent">
            <Avatar
              size="x-large"
              image={seller.profileImage}
              className="border-2 border-white"
            >
              {seller.name.charAt(0)}
            </Avatar>
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-heading-2 md:text-heading-1 font-heading-1 text-white">
                  {seller.name}
                </h1>
                {seller.verified && (
                  <FeatherVerified className="text-heading-3 md:text-heading-2 font-heading-2 text-brand-400" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <Badge variant="success" icon={<FeatherMapPin />}>
                  {seller.distance}
                </Badge>
                {seller.certifications.map((cert: string, index: number) => (
                  <Badge key={index} variant="neutral" icon={<FeatherAward />}>
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button 
                size="large"
                onClick={handleFollowSeller}
              >
                Follow Farm
              </Button>
              <Button 
                variant="neutral-primary" 
                size="large"
                onClick={handleContactSeller}
              >
                Message
              </Button>
              <IconButton 
                variant="neutral-primary" 
                icon={<FeatherShare />} 
                onClick={handleShare}
              />
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex md:hidden w-full items-center gap-2">
          <Button 
            className="flex-1"
            onClick={handleFollowSeller}
          >
            Follow Farm
          </Button>
          <Button 
            variant="neutral-primary" 
            className="flex-1"
            onClick={handleContactSeller}
          >
            Message
          </Button>
          <IconButton 
            variant="neutral-primary" 
            icon={<FeatherShare />} 
            onClick={handleShare}
          />
        </div>

        {/* Stats Section */}
        <div className="flex flex-wrap items-start gap-6 md:gap-8">
          <div className="flex flex-col items-start">
            <span className="text-body-bold font-body-bold text-subtext-color">Reviews</span>
            <div className="flex items-center gap-1">
              <FeatherStar className="text-body font-body text-yellow-500 fill-current" />
              <span className="text-body-bold font-body-bold text-default-font">{seller.stats.rating}</span>
              <span className="text-body font-body text-neutral-400">({seller.stats.totalReviews})</span>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-body-bold font-body-bold text-subtext-color">Followers</span>
            <span className="text-body-bold font-body-bold text-default-font">{seller.stats.followers.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-body-bold font-body-bold text-subtext-color">Products</span>
            <span className="text-body-bold font-body-bold text-default-font">{seller.stats.products}</span>
          </div>
        </div>

        {/* Story and Details Section */}
        <div className="flex w-full flex-col md:flex-row items-start gap-6">
          {/* Our Story */}
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch rounded-md bg-neutral-50 p-4 md:p-6">
            <h2 className="text-heading-2 font-heading-2 text-default-font">Our Story</h2>
            <p className="text-body font-body text-default-font">
              {seller.story}
            </p>
            
            {/* Farm Photo Gallery */}
            <div className="w-full mt-4">
              <h3 className="text-heading-3 font-heading-3 text-default-font mb-4">Farm Photos</h3>
              <PhotoGallery images={seller.storyImages.slice(0, 3)} />
            </div>
          </div>

          {/* Seller Details */}
          <div className="flex flex-col items-start justify-center gap-4 self-stretch rounded-md bg-neutral-50 p-4 md:p-6 md:w-2/5">
            <h2 className="text-heading-2 font-heading-2 text-default-font">Seller Details</h2>
            
            {/* Pickup */}
            <div className="flex items-start gap-4">
              <FeatherTruck className="text-heading-2 font-heading-2 text-default-font flex-shrink-0 mt-1" />
              <div className="flex flex-col items-start">
                <span className="text-body-bold font-body-bold text-default-font">
                  Pickup Details
                </span>
                <span className="text-body font-body text-default-font">
                  {seller.details.pickup}
                </span>
              </div>
            </div>
            
            {/* Hours */}
            <div className="flex items-start gap-4">
              <FeatherClock className="text-heading-2 font-heading-2 text-default-font flex-shrink-0 mt-1" />
              <div className="flex flex-col items-start">
                <span className="text-body-bold font-body-bold text-default-font">
                  Hours of Operation
                </span>
                <span className="text-body font-body text-default-font">
                  {seller.details.hours.weekdays}
                </span>
                <span className="text-body font-body text-default-font">
                  {seller.details.hours.weekend}
                </span>
              </div>
            </div>
            
            {/* Location */}
            <div className="flex items-start gap-4">
              <FeatherMapPin className="text-heading-2 font-heading-2 text-default-font flex-shrink-0 mt-1" />
              <div className="flex flex-col items-start">
                <span className="text-body-bold font-body-bold text-default-font">
                  Location
                </span>
                <span className="text-body font-body text-default-font">
                  {seller.details.location}
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
            
            {/* Contact */}
            <div className="flex items-start gap-4">
              <FeatherPhone className="text-heading-2 font-heading-2 text-default-font flex-shrink-0 mt-1" />
              <div className="flex flex-col items-start gap-1">
                <span className="text-body-bold font-body-bold text-default-font">
                  Contact
                </span>
                <span className="text-body font-body text-default-font">
                  {seller.details.contact.phone} | {seller.details.contact.email}
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
                    onClick={() => window.location.href = `mailto:${seller.details.contact.email}`}
                  />
                  <IconButton
                    variant="neutral-primary"
                    size="small"
                    icon={<FeatherPhone />}
                    onClick={() => window.location.href = `tel:${seller.details.contact.phone.replace(/[^0-9]/g, '')}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="flex w-full flex-col items-start gap-6">
          <Tabs>
            <Tabs.Item 
              active={activeTab === 'Products'} 
              onClick={() => setActiveTab('Products')}
            >
              Products
            </Tabs.Item>
            <Tabs.Item 
              active={activeTab === 'Reviews'} 
              onClick={() => setActiveTab('Reviews')}
            >
              Reviews
            </Tabs.Item>
            <Tabs.Item 
              active={activeTab === 'Location'} 
              onClick={() => setActiveTab('Location')}
            >
              Location
            </Tabs.Item>
          </Tabs>
          
          {/* Dynamic Tab Content */}
          {renderTabContent()}
        </div>
      </div>
    </DefaultPageLayout>
  );
};

export default SellerProfile;
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Badge } from "@/ui/components/Badge";
import { Alert } from "@/ui/components/Alert";
import { TextField } from "@/ui/components/TextField";
import { TextArea } from "@/ui/components/TextArea";
import { Loader } from "@/ui/components/Loader";
import { 
  FeatherArrowLeft, 
  FeatherHeart, 
  FeatherShare2, 
  FeatherMapPin, 
  FeatherStar,
  FeatherShoppingCart,
  FeatherTruck,
  FeatherCalendar,
  FeatherUser,
  FeatherCheck,
  FeatherMessageCircle
} from "@subframe/core";
import { getProductById, addProductReview, type Product, type ProductReview } from "../lib/supabase";
import { foodSearchService, type FoodItem } from "../services/foodSearchService";
import { useLocationContext } from "../contexts/LocationContext";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import Footer from "../components/Footer";

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: locationState } = useLocationContext();
  const { openWaitlistFlow } = useWaitlistContext();
  
  const [product, setProduct] = useState<Product | FoodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    customerName: '',
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Try to get from Supabase first
        const { data: supabaseProduct, error: supabaseError } = await getProductById(id);
        
        if (supabaseProduct && !supabaseError) {
          setProduct(supabaseProduct);
        } else {
          // Fallback to food search service
          const foodItem = await foodSearchService.getFoodItemById(id);
          if (foodItem) {
            setProduct(foodItem);
          } else {
            setError('Product not found');
          }
        }
      } catch (err) {
        console.error('Error loading product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

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

  const handleSaveForLater = async () => {
    if (!product) return;

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

  const handleContactSeller = async () => {
    if (!product) return;

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewForm.customerName.trim()) return;

    setSubmittingReview(true);
    try {
      // Only submit to Supabase if it's a Supabase product
      if ('seller' in product && product.seller) {
        await addProductReview({
          product_id: product.id,
          customer_name: reviewForm.customerName,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        });
        
        // Reload product to show new review
        const { data: updatedProduct } = await getProductById(product.id);
        if (updatedProduct) {
          setProduct(updatedProduct);
        }
      }
      
      // Reset form
      setReviewForm({ customerName: '', rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatPrice = (price: number | string, unit: string) => {
    const priceNum = typeof price === 'string' ? parseFloat(price.replace('$', '')) : price;
    return `$${priceNum.toFixed(2)}/${unit}`;
  };

  const getBadgeVariant = (tag: string) => {
    if (tag.includes('organic') || tag.includes('pesticide-free')) return 'success';
    if (tag.includes('limited') || tag.includes('seasonal')) return 'warning';
    if (tag.includes('artisan') || tag.includes('heritage')) return 'brand';
    return 'neutral';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FeatherStar
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-neutral-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-default-background">
        <div className="flex flex-col items-center gap-4">
          <Loader size="large" />
          <span className="text-body font-body text-subtext-color">Loading product details...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-default-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <span className="text-heading-2 font-heading-2 text-error-700">Product not found</span>
          <span className="text-body font-body text-subtext-color">{error || 'The product you\'re looking for doesn\'t exist.'}</span>
          <div className="flex gap-3">
            <Button variant="neutral-secondary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button onClick={() => navigate('/shop')}>
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle both Product and FoodItem types
  const isSupabaseProduct = 'seller' in product && typeof product.seller === 'object';
  const productName = product.name;
  const productDescription = product.description || '';
  const productPrice = typeof product.price === 'string' ? parseFloat(product.price.replace('$', '')) : product.price;
  const productUnit = product.unit;
  const productImage = 'image_url' in product ? product.image_url : product.image;
  const productTags = product.tags || [];
  const productIsOrganic = 'is_organic' in product ? product.is_organic : product.isOrganic;
  const sellerName = isSupabaseProduct ? product.seller?.name : product.seller;
  const sellerLocation = isSupabaseProduct ? product.seller?.location : product.location;
  const stockQuantity = 'stock_quantity' in product ? product.stock_quantity : (product.inStock ? 50 : 0);
  const averageRating = 'average_rating' in product ? product.average_rating : null;
  const reviews = 'reviews' in product ? product.reviews : [];

  return (
    <div className="flex w-full flex-col bg-default-background min-h-screen">
      {/* Header */}
      <div className="sticky top-[73px] z-30 bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            variant="neutral-tertiary"
            icon={<FeatherArrowLeft />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <IconButton
              variant="neutral-tertiary"
              icon={<FeatherShare2 />}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: productName,
                    text: productDescription,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            />
            <IconButton
              variant="destructive-secondary"
              icon={<FeatherHeart />}
              onClick={handleSaveForLater}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="space-y-4">
              <img
                src={productImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'}
                alt={productName}
                className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {productIsOrganic && (
                  <Badge variant="success">Organic</Badge>
                )}
                {productTags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant={getBadgeVariant(tag)}>
                    {tag.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
                {stockQuantity < 10 && stockQuantity > 0 && (
                  <Badge variant="warning">Limited Stock</Badge>
                )}
                {stockQuantity === 0 && (
                  <Badge variant="error">Out of Stock</Badge>
                )}
              </div>

              {/* Title and Price */}
              <div>
                <h1 className="text-heading-1 font-heading-1 text-default-font mb-2">
                  {productName}
                </h1>
                <div className="text-heading-2 font-heading-2 text-brand-600">
                  {formatPrice(productPrice, productUnit)}
                </div>
              </div>

              {/* Rating */}
              {averageRating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className="text-body font-body text-default-font">
                    {averageRating.toFixed(1)} ({reviews?.length || 0} reviews)
                  </span>
                </div>
              )}

              {/* Description */}
              {productDescription && (
                <div>
                  <h3 className="text-heading-3 font-heading-3 text-default-font mb-2">
                    Description
                  </h3>
                  <p className="text-body font-body text-subtext-color">
                    {productDescription}
                  </p>
                </div>
              )}

              {/* Seller Info */}
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                    <FeatherUser className="h-5 w-5 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-heading-3 font-heading-3 text-default-font">
                      {sellerName}
                    </h4>
                    {sellerLocation && (
                      <div className="flex items-center gap-1 text-body font-body text-subtext-color">
                        <FeatherMapPin className="w-4 h-4" />
                        <span>{sellerLocation}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="brand-secondary"
                    size="small"
                    icon={<FeatherMessageCircle />}
                    onClick={handleContactSeller}
                  >
                    Contact
                  </Button>
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-body-bold font-body-bold text-default-font">
                    Quantity:
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="neutral-secondary"
                      size="small"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="text-body font-body text-default-font min-w-[2rem] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="neutral-secondary"
                      size="small"
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= stockQuantity}
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 h-12"
                    size="large"
                    icon={<FeatherShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={stockQuantity === 0}
                  >
                    {stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <IconButton
                    variant="destructive-secondary"
                    size="large"
                    icon={<FeatherHeart />}
                    onClick={handleSaveForLater}
                  />
                </div>

                {stockQuantity > 0 && stockQuantity < 10 && (
                  <Alert
                    variant="warning"
                    title="Limited Stock"
                    description={`Only ${stockQuantity} items remaining`}
                  />
                )}
              </div>

              {/* Delivery Info */}
              <div className="bg-brand-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FeatherTruck className="w-5 h-5 text-brand-600" />
                  <span className="text-heading-3 font-heading-3 text-brand-700">
                    Local Delivery
                  </span>
                </div>
                <p className="text-body font-body text-brand-600">
                  Available for delivery within Northwest Arkansas metro area. 
                  Fresh products delivered within 24-48 hours of harvest.
                </p>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-16 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-heading-1 font-heading-1 text-default-font">
                Customer Reviews
              </h2>
              {isSupabaseProduct && (
                <Button
                  variant="brand-secondary"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  Write a Review
                </Button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-heading-2 font-heading-2 text-default-font mb-4">
                  Write a Review
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <TextField
                    label="Your Name"
                    required
                  >
                    <TextField.Input
                      value={reviewForm.customerName}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter your name"
                    />
                  </TextField>

                  <div>
                    <label className="block text-caption-bold font-caption-bold text-default-font mb-2">
                      Rating
                    </label>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: i + 1 }))}
                          className="p-1"
                        >
                          <FeatherStar
                            className={`w-6 h-6 ${
                              i < reviewForm.rating ? 'text-yellow-500 fill-current' : 'text-neutral-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <TextArea
                    label="Comment (Optional)"
                  >
                    <TextArea.Input
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this product..."
                      rows={4}
                    />
                  </TextArea>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      loading={submittingReview}
                      disabled={!reviewForm.customerName.trim()}
                    >
                      Submit Review
                    </Button>
                    <Button
                      type="button"
                      variant="neutral-secondary"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews && reviews.length > 0 ? (
                reviews.map((review: ProductReview) => (
                  <div key={review.id} className="bg-white rounded-lg border border-neutral-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-heading-3 font-heading-3 text-default-font">
                          {review.customer_name}
                        </h4>
                        <div className="flex items-center gap-1 mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-caption font-caption text-subtext-color">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-body font-body text-subtext-color">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FeatherStar className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-heading-3 font-heading-3 text-default-font mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-body font-body text-subtext-color">
                    Be the first to review this product!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ProductDetail;
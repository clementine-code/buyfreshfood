import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { LinkButton } from "@/ui/components/LinkButton";
import { IconButton } from "@/ui/components/IconButton";
import { TextField } from "@/ui/components/TextField";
import { Avatar } from "@/ui/components/Avatar";
import { Alert } from "@/ui/components/Alert";
import { 
  FeatherArrowLeft, 
  FeatherMinus, 
  FeatherPlus, 
  FeatherTrash, 
  FeatherHeart,
  FeatherShoppingBag,
  FeatherCheck,
  FeatherAlertCircle,
  FeatherMapPin,
  FeatherClock,
  FeatherX
} from "@subframe/core";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import { useLocationContext } from "../contexts/LocationContext";

// Cart state types
interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  image: string;
}

interface SavedItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  sellerId: string;
}

interface Seller {
  id: string;
  name: string;
  avatar: string;
  distance: string;
  pickupStatus: string;
  selectedPickupTime: string | null;
  pickupInstructions: string;
  items: CartItem[];
}

interface CartState {
  sellers: {
    [key: string]: Seller;
  };
  savedItems: SavedItem[];
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { state: locationState } = useLocationContext();
  const { openWaitlistFlow } = useWaitlistContext();
  
  // Cart state
  const [cartState, setCartState] = useState<CartState>({
    sellers: {},
    savedItems: []
  });

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Ref for tracking cart changes
  const cartUpdateRef = useRef<number>(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      console.log('Loading cart from localStorage');
      const savedCart = localStorage.getItem('freshFoodCart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('Successfully loaded cart:', parsedCart);
          setCartState(parsedCart);
        } catch (error) {
          console.error('Error parsing saved cart:', error);
          // Initialize with default cart if parsing fails
          initializeDefaultCart();
        }
      } else {
        console.log('No saved cart found, initializing default');
        initializeDefaultCart();
      }
      setIsLoading(false);
    };

    loadCart();
  }, []);

  // Initialize default cart
  const initializeDefaultCart = () => {
    setCartState({
      sellers: {
        'sarah-farm': {
          id: 'sarah-farm',
          name: "Sarah's Family Farm",
          avatar: "https://images.unsplash.com/photo-1500076656116-558758c991c1",
          distance: "2.3 miles away",
          pickupStatus: "Pickup available today",
          selectedPickupTime: null,
          pickupInstructions: "",
          items: [
            {
              id: 'carrots-1',
              name: 'Carrots',
              description: 'Harvested today',
              price: 3.99,
              unit: 'lb',
              quantity: 2,
              image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37"
            },
            {
              id: 'potatoes-1', 
              name: 'Potatoes',
              description: 'Collected this morning',
              price: 4.00,
              unit: 'lb',
              quantity: 1,
              image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655"
            }
          ]
        },
        'green-valley': {
          id: 'green-valley',
          name: 'Green Valley Organics',
          avatar: "https://images.unsplash.com/photo-1500076656116-558758c991c1",
          distance: "3.1 miles away", 
          pickupStatus: "Pickup available tomorrow",
          selectedPickupTime: null,
          pickupInstructions: "",
          items: [
            {
              id: 'cauliflower-1',
              name: 'Cauliflower',
              description: 'Peak season',
              price: 4.99,
              unit: 'bag',
              quantity: 3,
              image: "https://images.unsplash.com/photo-1566842600175-97dca489844f"
            }
          ]
        }
      },
      savedItems: [
        {
          id: 'apples-1',
          name: 'Apples',
          price: 5.50,
          unit: 'bag',
          image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716",
          sellerId: 'orchard-farm'
        }
      ]
    });
  };

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        console.log('Saving cart to localStorage:', cartState);
        localStorage.setItem('freshFoodCart', JSON.stringify(cartState));
        
        // Increment update counter for tracking
        cartUpdateRef.current += 1;
        console.log(`Cart update #${cartUpdateRef.current} saved successfully`);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartState, isLoading]);

  // Calculate totals
  const calculateSellerTotal = (seller: Seller) => {
    const subtotal = seller.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxes = subtotal * 0.10;
    return { 
      subtotal: parseFloat(subtotal.toFixed(2)), 
      taxes: parseFloat(taxes.toFixed(2)), 
      total: parseFloat((subtotal + taxes).toFixed(2)) 
    };
  };

  const calculateGrandTotal = () => {
    return Object.values(cartState.sellers).reduce((sum, seller) => {
      const { total } = calculateSellerTotal(seller);
      return sum + total;
    }, 0);
  };

  // Get total item count
  const getTotalItemCount = () => {
    return Object.values(cartState.sellers).reduce((count, seller) => {
      return count + seller.items.reduce((itemCount, item) => itemCount + item.quantity, 0);
    }, 0);
  };

  // Get seller count
  const getSellerCount = () => {
    return Object.keys(cartState.sellers).length;
  };

  // Update item quantity
  const updateItemQuantity = (sellerId: string, itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartState(prevState => {
      const seller = {...prevState.sellers[sellerId]};
      const itemIndex = seller.items.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        const updatedItems = [...seller.items];
        updatedItems[itemIndex] = {...updatedItems[itemIndex], quantity: newQuantity};
        seller.items = updatedItems;
        
        return {
          ...prevState,
          sellers: {
            ...prevState.sellers,
            [sellerId]: seller
          }
        };
      }
      
      return prevState;
    });
  };

  // Remove item from cart
  const removeItem = (sellerId: string, itemId: string) => {
    setCartState(prevState => {
      const seller = {...prevState.sellers[sellerId]};
      const updatedItems = seller.items.filter(item => item.id !== itemId);
      
      // If seller has no more items, remove the seller
      if (updatedItems.length === 0) {
        const { [sellerId]: _, ...remainingSellers } = prevState.sellers;
        return {
          ...prevState,
          sellers: remainingSellers
        };
      }
      
      // Otherwise update the seller's items
      seller.items = updatedItems;
      return {
        ...prevState,
        sellers: {
          ...prevState.sellers,
          [sellerId]: seller
        }
      };
    });
  };

  // Save item for later
  const saveForLater = (sellerId: string, itemId: string) => {
    setCartState(prevState => {
      const seller = {...prevState.sellers[sellerId]};
      const itemIndex = seller.items.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        const item = seller.items[itemIndex];
        const savedItem: SavedItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          unit: item.unit,
          image: item.image,
          sellerId: sellerId
        };
        
        // Remove from cart
        const updatedItems = seller.items.filter(item => item.id !== itemId);
        
        // Check if seller has no more items
        if (updatedItems.length === 0) {
          const { [sellerId]: _, ...remainingSellers } = prevState.sellers;
          return {
            ...prevState,
            sellers: remainingSellers,
            savedItems: [...prevState.savedItems, savedItem]
          };
        }
        
        // Update seller items
        seller.items = updatedItems;
        return {
          ...prevState,
          sellers: {
            ...prevState.sellers,
            [sellerId]: seller
          },
          savedItems: [...prevState.savedItems, savedItem]
        };
      }
      
      return prevState;
    });
  };

  // Add saved item back to cart
  const addSavedItemToCart = (savedItemIndex: number) => {
    setCartState(prevState => {
      const savedItem = prevState.savedItems[savedItemIndex];
      
      // Create cart item from saved item
      const cartItem: CartItem = {
        id: savedItem.id,
        name: savedItem.name,
        description: '',
        price: savedItem.price,
        unit: savedItem.unit,
        quantity: 1,
        image: savedItem.image
      };
      
      // Check if seller exists in cart
      const sellerId = savedItem.sellerId;
      let updatedSellers = {...prevState.sellers};
      
      if (updatedSellers[sellerId]) {
        // Add to existing seller
        const existingItems = updatedSellers[sellerId].items;
        updatedSellers[sellerId] = {
          ...updatedSellers[sellerId],
          items: [...existingItems, cartItem]
        };
      } else {
        // Create new seller entry
        updatedSellers[sellerId] = {
          id: sellerId,
          name: sellerId === 'orchard-farm' ? 'Orchard Valley Farm' : 'Unknown Seller',
          avatar: "https://images.unsplash.com/photo-1500076656116-558758c991c1",
          distance: "5.2 miles away",
          pickupStatus: "Pickup available",
          selectedPickupTime: null,
          pickupInstructions: "",
          items: [cartItem]
        };
      }
      
      // Remove from saved items
      const updatedSavedItems = [...prevState.savedItems];
      updatedSavedItems.splice(savedItemIndex, 1);
      
      return {
        ...prevState,
        sellers: updatedSellers,
        savedItems: updatedSavedItems
      };
    });
  };

  // Delete saved item with confirmation
  const openDeleteConfirmation = (index: number) => {
    setItemToDelete(index);
    setShowDeleteModal(true);
  };

  // Confirm deletion of saved item
  const confirmDeleteSavedItem = () => {
    if (itemToDelete === null) return;
    
    setDeleteLoading(true);
    
    // Simulate a short loading state for better UX
    setTimeout(() => {
      setCartState(prevState => {
        const updatedSavedItems = [...prevState.savedItems];
        updatedSavedItems.splice(itemToDelete, 1);
        
        return {
          ...prevState,
          savedItems: updatedSavedItems
        };
      });
      
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }, 500);
  };

  // Update pickup time
  const updatePickupTime = (sellerId: string, time: string) => {
    setCartState(prevState => {
      const seller = {...prevState.sellers[sellerId]};
      seller.selectedPickupTime = time;
      
      return {
        ...prevState,
        sellers: {
          ...prevState.sellers,
          [sellerId]: seller
        }
      };
    });
  };

  // Update pickup instructions
  const updatePickupInstructions = (sellerId: string, instructions: string) => {
    setCartState(prevState => {
      const seller = {...prevState.sellers[sellerId]};
      seller.pickupInstructions = instructions;
      
      return {
        ...prevState,
        sellers: {
          ...prevState.sellers,
          [sellerId]: seller
        }
      };
    });
  };

  // Handle checkout for a specific seller
  const handleSellerCheckout = (sellerId: string) => {
    const seller = cartState.sellers[sellerId];
    if (!seller) return;
    
    if (!seller.selectedPickupTime) {
      alert("Please select a pickup time before checkout");
      return;
    }
    
    // For demo, show success modal
    setSuccessMessage(`Your order from ${seller.name} has been placed! Pickup scheduled for ${seller.selectedPickupTime}.`);
    setShowSuccessModal(true);
    
    // In a real app, this would process payment and create order
    // For demo, we'll just clear this seller from cart after modal is closed
    setTimeout(() => {
      setCartState(prevState => {
        const { [sellerId]: _, ...remainingSellers } = prevState.sellers;
        return {
          ...prevState,
          sellers: remainingSellers
        };
      });
      setShowSuccessModal(false);
    }, 3000);
  };

  // Handle checkout for all sellers
  const handleCheckoutAll = () => {
    // Check if all sellers have pickup times selected
    const allHavePickupTimes = Object.values(cartState.sellers).every(
      seller => seller.selectedPickupTime !== null
    );
    
    if (!allHavePickupTimes) {
      alert("Please select pickup times for all sellers before checkout");
      return;
    }
    
    // For demo, show success modal
    setSuccessMessage("All your orders have been placed! Check your email for pickup details.");
    setShowSuccessModal(true);
    
    // In a real app, this would process payment and create orders
    // For demo, we'll just clear the cart after modal is closed
    setTimeout(() => {
      setCartState({
        sellers: {},
        savedItems: [...cartState.savedItems]
      });
      setShowSuccessModal(false);
    }, 3000);
  };

  // Handle navigation to seller profile
  const handleSellerClick = (sellerId: string) => {
    navigate(`/seller/${sellerId}`);
  };

  // Check if cart is empty
  const isCartEmpty = Object.keys(cartState.sellers).length === 0;

  return (
    <DefaultPageLayout>
      <div className="container max-w-none flex h-full w-full flex-col items-center gap-8 bg-default-background py-12 px-4 md:px-6">
        <div className="flex w-full max-w-[1280px] flex-col md:flex-row items-start gap-8">
          {/* Main Cart Section */}
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-8 w-full md:w-auto">
            {/* Cart Header */}
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col items-start gap-1">
                <span className="text-heading-2 font-heading-2 text-default-font">
                  Your Fresh Food Cart
                </span>
                <span className="text-body font-body text-subtext-color">
                  {isCartEmpty ? 'Your cart is empty' : `${getTotalItemCount()} items from ${getSellerCount()} local seller${getSellerCount() > 1 ? 's' : ''}`}
                </span>
              </div>
              <LinkButton
                icon={<FeatherArrowLeft />}
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </LinkButton>
            </div>

            {/* Empty Cart State */}
            {isCartEmpty && (
              <div className="flex w-full flex-col items-center justify-center gap-6 py-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
                  <FeatherShoppingBag className="h-10 w-10 text-neutral-400" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h2 className="text-heading-2 font-heading-2 text-default-font">Your cart is empty</h2>
                  <p className="text-body font-body text-subtext-color max-w-md">
                    Looks like you haven't added any fresh local food to your cart yet. 
                    Browse our marketplace to find delicious products from local farmers.
                  </p>
                </div>
                <Button
                  size="large"
                  onClick={() => navigate('/shop')}
                  icon={<FeatherShoppingBag />}
                  className="mt-4"
                >
                  Shop Local Food
                </Button>
              </div>
            )}

            {/* Seller Sections */}
            {!isCartEmpty && (
              <div className="flex w-full flex-col items-start gap-6">
                {Object.values(cartState.sellers).map((seller) => {
                  const { subtotal, taxes, total } = calculateSellerTotal(seller);
                  
                  return (
                    <div key={seller.id} className="flex w-full flex-col items-start gap-3 rounded-lg border border-solid border-neutral-border bg-white px-4 py-4 md:px-6 md:py-6">
                      {/* Seller Header */}
                      <div className="flex w-full items-center gap-4">
                        <Avatar
                          size="large"
                          image={seller.avatar}
                          className="cursor-pointer"
                          onClick={() => handleSellerClick(seller.id)}
                        >
                          {seller.name.charAt(0)}
                        </Avatar>
                        <div className="flex grow shrink-0 basis-0 flex-col items-start">
                          <span 
                            className="text-body-bold font-body-bold text-default-font cursor-pointer hover:text-brand-600"
                            onClick={() => handleSellerClick(seller.id)}
                          >
                            {seller.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge 
                              variant={seller.pickupStatus.includes('today') ? "success" : "warning"}
                              icon={seller.pickupStatus.includes('today') ? <FeatherClock /> : <FeatherClock />}
                            >
                              {seller.pickupStatus}
                            </Badge>
                            <span className="text-caption font-caption text-subtext-color">
                              {seller.distance}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pickup Time Selection */}
                      <div className="flex w-full flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 md:px-6 md:py-6 shadow-sm">
                        <span className="text-body-bold font-body-bold text-default-font">
                          Choose Pickup Time
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button 
                            variant={seller.selectedPickupTime === "Today 3-6pm" ? "brand-primary" : "neutral-secondary"}
                            onClick={() => updatePickupTime(seller.id, "Today 3-6pm")}
                            disabled={!seller.pickupStatus.includes('today')}
                          >
                            Today 3-6pm
                          </Button>
                          <Button 
                            variant={seller.selectedPickupTime === "Tomorrow 9am-12pm" ? "brand-primary" : "neutral-secondary"}
                            onClick={() => updatePickupTime(seller.id, "Tomorrow 9am-12pm")}
                          >
                            Tomorrow 9am-12pm
                          </Button>
                          <Button 
                            variant={seller.selectedPickupTime === "Saturday 8-11am" ? "brand-primary" : "neutral-secondary"}
                            onClick={() => updatePickupTime(seller.id, "Saturday 8-11am")}
                          >
                            Saturday 8-11am
                          </Button>
                        </div>
                        <TextField 
                          className="h-auto w-full flex-none" 
                          label="" 
                          helpText=""
                        >
                          <TextField.Input
                            placeholder="Add pickup instructions (optional)"
                            value={seller.pickupInstructions}
                            onChange={(e) => updatePickupInstructions(seller.id, e.target.value)}
                          />
                        </TextField>
                        
                        {seller.selectedPickupTime && (
                          <Alert 
                            variant="success" 
                            icon={<FeatherCheck />}
                            title={`Pickup scheduled for ${seller.selectedPickupTime}`}
                            description={seller.pickupInstructions ? `Instructions: ${seller.pickupInstructions}` : "No special instructions provided"}
                          />
                        )}
                      </div>

                      {/* Cart Items from this Seller */}
                      <div className="flex w-full flex-col items-start gap-4">
                        {seller.items.map((item) => (
                          <div key={item.id} className="flex w-full flex-wrap sm:flex-nowrap items-center gap-3 rounded-md bg-neutral-50 px-3 py-3 sm:px-4 sm:py-4">
                            {/* Product Image */}
                            <img
                              className="h-16 w-16 flex-none rounded-md object-cover"
                              src={item.image}
                              alt={item.name}
                            />
                            
                            {/* Product Info - Grows to fill space */}
                            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1 min-w-0">
                              <span className="text-body-bold font-body-bold text-default-font truncate w-full">
                                {item.name}
                              </span>
                              <span className="text-caption font-caption text-subtext-color">
                                {item.description}
                              </span>
                              <span className="text-body font-body text-default-font">
                                ${item.price.toFixed(2)}/{item.unit}
                              </span>
                            </div>
                            
                            {/* Mobile Layout: Second Row for Controls */}
                            <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-3 mt-2 sm:mt-0">
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <IconButton
                                  variant="neutral-primary"
                                  size="small"
                                  icon={<FeatherMinus />}
                                  onClick={() => updateItemQuantity(seller.id, item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  aria-label={`Decrease quantity of ${item.name}`}
                                />
                                <span className="text-body-bold font-body-bold text-default-font w-6 text-center">
                                  {item.quantity}
                                </span>
                                <IconButton
                                  variant="neutral-primary"
                                  size="small"
                                  icon={<FeatherPlus />}
                                  onClick={() => updateItemQuantity(seller.id, item.id, item.quantity + 1)}
                                  aria-label={`Increase quantity of ${item.name}`}
                                />
                              </div>
                              
                              {/* Price */}
                              <span className="text-body-bold font-body-bold text-default-font min-w-[60px] text-right sm:ml-2">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                              
                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 ml-auto">
                                <IconButton
                                  icon={<FeatherTrash />}
                                  onClick={() => removeItem(seller.id, item.id)}
                                  title="Remove from cart"
                                  aria-label={`Remove ${item.name} from cart`}
                                />
                                <IconButton
                                  variant="destructive-secondary"
                                  icon={<FeatherHeart />}
                                  onClick={() => saveForLater(seller.id, item.id)}
                                  title="Save for later"
                                  aria-label={`Save ${item.name} for later`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Seller Totals */}
                      <div className="flex w-full items-center justify-between pt-4">
                        <span className="text-body font-body text-default-font">
                          Subtotal from {seller.name}
                        </span>
                        <span className="text-body font-body text-default-font">
                          ${subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <span className="text-body font-body text-default-font">
                          Taxes (10%)
                        </span>
                        <span className="text-body font-body text-default-font">
                          ${taxes.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex h-px w-full flex-none items-start bg-neutral-border" />
                      <div className="flex w-full items-center justify-between">
                        <span className="text-body-bold font-body-bold text-default-font">
                          Total
                        </span>
                        <span className="text-heading-3 font-heading-3 text-default-font">
                          ${total.toFixed(2)}
                        </span>
                      </div>
                      <Button 
                        className="h-10 w-full flex-none"
                        onClick={() => handleSellerCheckout(seller.id)}
                        disabled={!seller.selectedPickupTime}
                      >
                        Checkout for {seller.name}
                      </Button>
                      {!seller.selectedPickupTime && (
                        <div className="text-caption font-caption text-warning-700 text-center w-full">
                          Please select a pickup time before checkout
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {!isCartEmpty && (
            <div className="flex w-full md:w-80 flex-none flex-col items-start gap-6 rounded-lg border border-solid border-neutral-border bg-white px-4 py-4 md:px-6 md:py-6 sticky top-24">
              <span className="text-heading-3 font-heading-3 text-default-font">
                Order Summary
              </span>
              <div className="flex w-full flex-col items-start gap-2">
                <div className="flex w-full items-center justify-between">
                  <span className="text-body font-body text-default-font">
                    Subtotal
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    ${Object.values(cartState.sellers).reduce((sum, seller) => {
                      const { subtotal } = calculateSellerTotal(seller);
                      return sum + subtotal;
                    }, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex w-full items-center justify-between">
                  <span className="text-body font-body text-default-font">
                    Taxes (10%)
                  </span>
                  <span className="text-body-bold font-body-bold text-default-font">
                    ${Object.values(cartState.sellers).reduce((sum, seller) => {
                      const { taxes } = calculateSellerTotal(seller);
                      return sum + taxes;
                    }, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex h-px w-full flex-none items-start bg-neutral-border" />
                <div className="flex w-full items-center justify-between">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Total
                  </span>
                  <span className="text-heading-3 font-heading-3 text-default-font">
                    ${calculateGrandTotal().toFixed(2)}
                  </span>
                </div>
              </div>
              <Button 
                className="h-10 w-full flex-none"
                onClick={handleCheckoutAll}
                disabled={Object.values(cartState.sellers).some(seller => !seller.selectedPickupTime)}
              >
                Checkout - ALL
              </Button>
              
              {Object.values(cartState.sellers).some(seller => !seller.selectedPickupTime) && (
                <Alert 
                  variant="warning" 
                  icon={<FeatherAlertCircle />}
                  title="Pickup times required"
                  description="Please select pickup times for all sellers before checkout"
                />
              )}

              {/* Saved for Later Section */}
              {cartState.savedItems.length > 0 && (
                <div className="flex w-full flex-col items-start gap-4 mt-4 pt-4 border-t border-neutral-200">
                  <span className="text-body-bold font-body-bold text-default-font">
                    Saved for Later ({cartState.savedItems.length})
                  </span>
                  {cartState.savedItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="flex w-full items-center gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 shadow-sm relative group"
                    >
                      <img
                        className="h-16 w-16 flex-none rounded-md object-cover"
                        src={item.image}
                        alt={item.name}
                      />
                      <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
                        <span className="text-body-bold font-body-bold text-default-font">
                          {item.name}
                        </span>
                        <span className="text-body font-body text-default-font">
                          ${item.price.toFixed(2)}/{item.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="neutral-secondary" 
                          size="small"
                          onClick={() => addSavedItemToCart(index)}
                          aria-label={`Add ${item.name} to cart`}
                        >
                          Add
                        </Button>
                        <IconButton
                          variant="neutral-tertiary"
                          icon={<FeatherTrash />}
                          onClick={() => openDeleteConfirmation(index)}
                          className="transition-opacity hover:bg-error-50 hover:text-error-600"
                          aria-label={`Delete ${item.name} from saved items`}
                          title="Delete saved item"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pickup Coordination Info */}
              <div className="flex w-full flex-col items-start gap-4 mt-4 pt-4 border-t border-neutral-200">
                <span className="text-body-bold font-body-bold text-default-font">
                  About Local Pickup
                </span>
                <div className="flex items-start gap-3">
                  <FeatherMapPin className="text-brand-600 flex-shrink-0 mt-1" />
                  <p className="text-body font-body text-subtext-color">
                    Products are picked up directly from each seller at their farm or market location.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <FeatherClock className="text-brand-600 flex-shrink-0 mt-1" />
                  <p className="text-body font-body text-subtext-color">
                    Select a convenient pickup time for each seller based on their availability.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
                  <FeatherCheck className="h-8 w-8 text-success-600" />
                </div>
                <h2 className="text-heading-2 font-heading-2 text-default-font">Order Confirmed!</h2>
                <p className="text-body font-body text-default-font">{successMessage}</p>
                <Button 
                  className="w-full mt-4"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowDeleteModal(false);
                setItemToDelete(null);
              }
            }}
          >
            <div 
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-100">
                  <FeatherTrash className="h-8 w-8 text-error-600" />
                </div>
                <h2 className="text-heading-2 font-heading-2 text-default-font text-center">Delete Saved Item?</h2>
                <p className="text-body font-body text-subtext-color text-center">
                  Are you sure you want to remove this item from your saved items? This action cannot be undone.
                </p>
                <div className="flex w-full gap-4 mt-4">
                  <Button 
                    variant="neutral-secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setItemToDelete(null);
                    }}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive-primary"
                    className="flex-1"
                    onClick={confirmDeleteSavedItem}
                    loading={deleteLoading}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultPageLayout>
  );
};

export default Cart;
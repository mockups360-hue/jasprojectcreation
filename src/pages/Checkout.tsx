import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Banknote, CreditCard, Check, X, Loader2 } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email("Invalid email address").max(255);

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDirectCheckout = searchParams.get('direct') === 'true';
  
  const { user } = useAuth();
  const {
    items: cartItems,
    totalPrice: cartTotalPrice,
    clearCart,
    directCheckoutItem,
    clearDirectCheckout
  } = useCart();
  
  // Use direct checkout item or cart items
  const items = isDirectCheckout && directCheckoutItem ? [directCheckoutItem] : cartItems;
  const totalPrice = isDirectCheckout && directCheckoutItem 
    ? directCheckoutItem.price * directCheckoutItem.quantity 
    : cartTotalPrice;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [showPaymobIframe, setShowPaymobIframe] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [iframeId, setIframeId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phone: ""
  });

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email || "" }));
    }
  }, [user]);

  // Clean up direct checkout if navigating away
  useEffect(() => {
    return () => {
      if (isDirectCheckout) {
        clearDirectCheckout();
      }
    };
  }, [isDirectCheckout, clearDirectCheckout]);

  // Listen for Paymob iframe callback
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'paymob_callback') {
        setShowPaymobIframe(false);
        setPaymentToken(null);
        
        if (event.data.success) {
          toast({
            title: "Payment successful!",
            description: "Your order has been confirmed."
          });
          
          // Send confirmation email
          if (currentOrderId) {
            try {
              await supabase.functions.invoke('send-order-email', {
                body: {
                  orderId: currentOrderId,
                  customerEmail: formData.email,
                  customerName: `${formData.firstName} ${formData.lastName}`,
                  phone: formData.phone,
                  address: formData.address,
                  city: formData.city,
                  items: items.map(item => ({
                    name: item.name,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.price
                  })),
                  subtotal: totalPrice,
                  shipping: shippingCost,
                  total: totalPrice + shippingCost
                }
              });
            } catch (e) {
              console.error('Error sending confirmation email:', e);
            }
          }
          
          if (isDirectCheckout) {
            clearDirectCheckout();
          } else {
            clearCart();
          }
          navigate('/orders');
        } else {
          toast({
            title: "Payment failed",
            description: "Please try again or choose a different payment method.",
            variant: "destructive"
          });
        }
        setCurrentOrderId(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentOrderId, formData, items, isDirectCheckout, clearDirectCheckout, clearCart, navigate, totalPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const shippingCost = totalPrice >= 2000 ? 0 : 65;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items before checking out."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate email
      emailSchema.parse(formData.email);

      const orderTotal = totalPrice + shippingCost;

      // Create order in database (status depends on payment method)
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_email: formData.email,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          subtotal: totalPrice,
          shipping: shippingCost,
          total: orderTotal,
          status: paymentMethod === 'cash' ? "confirmed" : "pending_payment",
          payment_method: paymentMethod === 'cash' ? "cash_on_delivery" : "card_pending"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        product_name: item.name,
        product_size: item.size,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      if (paymentMethod === 'card') {
        // Initialize Paymob payment
        setCurrentOrderId(orderData.id);
        
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('paymob-payment', {
          body: {
            amount: orderTotal,
            orderId: orderData.id,
            customerEmail: formData.email,
            customerName: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            items: items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price
            })),
            billingData: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              address: formData.address,
              city: formData.city,
              phone: formData.phone,
              email: formData.email
            }
          }
        });

        if (paymentError || !paymentData?.success) {
          throw new Error(paymentData?.error || 'Failed to initialize payment');
        }

        setPaymentToken(paymentData.paymentToken);
        setIframeId(paymentData.iframeId);
        setShowPaymobIframe(true);
      } else {
        // Cash on delivery - send confirmation immediately
        const emailData = {
          orderId: orderData.id,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          items: items.map(item => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price
          })),
          subtotal: totalPrice,
          shipping: shippingCost,
          total: orderTotal
        };

        await supabase.functions.invoke('send-order-email', {
          body: emailData
        });

        toast({
          title: "Order confirmed!",
          description: "Thank you for your purchase. View your order in My Orders."
        });
        
        if (isDirectCheckout) {
          clearDirectCheckout();
        } else {
          clearCart();
        }
        
        navigate('/orders');
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "There was a problem placing your order. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closePaymobIframe = async () => {
    setShowPaymobIframe(false);
    setPaymentToken(null);
    
    // Update order status to cancelled if payment was abandoned
    if (currentOrderId) {
      await supabase
        .from('orders')
        .update({ status: 'cancelled', payment_method: 'cancelled' })
        .eq('id', currentOrderId);
    }
    setCurrentOrderId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {/* Breadcrumb */}
        <nav className="font-body text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Checkout</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl font-light mb-8">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/shop" className="inline-block bg-charcoal text-primary-foreground rounded-full py-3 px-8 font-body text-sm hover:opacity-90 transition-opacity">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Section */}
              <div>
                <h2 className="font-display text-xl mb-4">Email</h2>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Enter your email to receive order updates and access your orders
                </p>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  className="w-full border border-border rounded-full px-5 py-3 font-body text-sm focus:outline-none focus:border-charcoal transition-colors" 
                />
              </div>

              <div>
                <h2 className="font-display text-xl mb-4">Shipping Address</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} required className="border border-border rounded-full px-5 py-3 font-body text-sm focus:outline-none focus:border-charcoal transition-colors" />
                    <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} required className="border border-border rounded-full px-5 py-3 font-body text-sm focus:outline-none focus:border-charcoal transition-colors" />
                  </div>
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="w-full border border-border rounded-full px-5 py-3 font-body text-sm focus:outline-none focus:border-charcoal transition-colors" />
                  <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required className="w-full border border-border rounded-full px-5 py-3 font-body text-sm focus:outline-none focus:border-charcoal transition-colors" />
                  <input type="tel" name="phone" placeholder="Phone number" value={formData.phone} onChange={handleChange} required className="w-full border border-border rounded-full px-5 py-3 font-body text-sm focus:outline-none focus:border-charcoal transition-colors" />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="font-display text-xl mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {/* Card Payment Option - Temporarily hidden */}
                  {/* TODO: Uncomment when Paymob integration is ready
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full rounded-2xl p-4 flex items-center gap-4 transition-all ${
                      paymentMethod === 'card' 
                        ? 'border-2 border-charcoal bg-secondary/30' 
                        : 'border border-border hover:border-charcoal/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === 'card' ? 'bg-charcoal text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-display text-sm">Credit / Debit Card</p>
                      <p className="font-body text-xs text-muted-foreground">Pay securely with Visa, Mastercard, or Meeza</p>
                    </div>
                    {paymentMethod === 'card' && (
                      <div className="w-6 h-6 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                  */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full rounded-2xl p-4 flex items-center gap-4 transition-all ${
                      paymentMethod === 'cash' 
                        ? 'border-2 border-charcoal bg-secondary/30' 
                        : 'border border-border hover:border-charcoal/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      paymentMethod === 'cash' ? 'bg-charcoal text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-display text-sm">Cash on Delivery</p>
                      <p className="font-body text-xs text-muted-foreground">Pay when you receive your order</p>
                    </div>
                    {paymentMethod === 'cash' && (
                      <div className="w-6 h-6 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-charcoal text-primary-foreground rounded-full py-4 font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === 'card' ? (
                  "Proceed to Payment"
                ) : (
                  "Place Order"
                )}
              </button>
            </form>

            {/* Order Summary */}
            <div className="bg-secondary/30 rounded-2xl p-6 h-fit">
              <h2 className="font-display text-xl mb-6">Order Summary</h2>
              <div className="space-y-4 border-b border-border pb-4 mb-4">
                {items.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="w-16 h-20 bg-background rounded overflow-hidden relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute -top-1 -right-1 bg-charcoal text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display text-sm">{item.name}</h4>
                      <p className="font-body text-xs text-muted-foreground">Size: {item.size}</p>
                      <p className="font-body text-sm mt-1">LE {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>LE {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? "Free" : `LE ${shippingCost}`}</span>
                </div>
                <div className="flex justify-between font-display text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span>LE {(totalPrice + shippingCost).toLocaleString()}.00</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />

      {/* Paymob Payment Modal */}
      {showPaymobIframe && paymentToken && iframeId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display text-lg">Complete Payment</h3>
              <button 
                onClick={closePaymobIframe}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0">
              <iframe
                ref={iframeRef}
                src={`https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentToken}`}
                className="w-full h-[500px] border-0"
                title="Paymob Payment"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

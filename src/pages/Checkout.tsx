import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Banknote, Check } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email("Invalid email address").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDirectCheckout = searchParams.get('direct') === 'true';
  
  const { user, signUp, signIn } = useAuth();
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
  const [isNewUser, setIsNewUser] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const shippingCost = totalPrice >= 2000 ? 0 : 100;

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
      let currentUser = user;

      // If not logged in, create account or sign in
      if (!user) {
        // Validate inputs
        emailSchema.parse(formData.email);
        passwordSchema.parse(formData.password);

        if (isNewUser) {
          // Create new account
          const { error: signUpError } = await signUp(
            formData.email,
            formData.password,
            formData.firstName,
            formData.lastName
          );

          if (signUpError) {
            if (signUpError.message.includes("User already registered")) {
              toast({
                title: "Account exists",
                description: "An account with this email already exists. Please sign in instead.",
                variant: "destructive",
              });
              setIsNewUser(false);
            } else {
              throw signUpError;
            }
            setIsSubmitting(false);
            return;
          }

          // Wait for auth state to update
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { session } } = await supabase.auth.getSession();
          currentUser = session?.user || null;
        } else {
          // Sign in existing user
          const { error: signInError } = await signIn(formData.email, formData.password);
          
          if (signInError) {
            toast({
              title: "Sign in failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }

          // Wait for auth state to update
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { session } } = await supabase.auth.getSession();
          currentUser = session?.user || null;
        }
      }

      // Create order in database
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: currentUser?.id || null,
          customer_email: formData.email,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          subtotal: totalPrice,
          shipping: shippingCost,
          total: totalPrice + shippingCost,
          status: "confirmed",
          payment_method: "cash_on_delivery"
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

      // Send confirmation emails
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
        total: totalPrice + shippingCost
      };

      await supabase.functions.invoke('send-order-email', {
        body: emailData
      });

      toast({
        title: "Order confirmed!",
        description: "Thank you for your purchase. View your order in My Orders."
      });
      
      // Clear appropriate cart
      if (isDirectCheckout) {
        clearDirectCheckout();
      } else {
        clearCart();
      }
      
      navigate('/orders');
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
          description: "There was a problem placing your order. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="min-h-screen bg-background">
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

        {items.length === 0 ? <div className="text-center py-16">
            <p className="font-body text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/shop" className="inline-block bg-charcoal text-primary-foreground rounded-full py-3 px-8 font-body text-sm hover:opacity-90 transition-opacity">
              Continue Shopping
            </Link>
          </div> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Section - Only show if not logged in */}
              {!user && (
                <div>
                  <h2 className="font-display text-xl mb-4">Account</h2>
                  <p className="font-body text-sm text-muted-foreground mb-4">
                    {isNewUser 
                      ? "Create an account to track your orders" 
                      : "Sign in to your existing account"}
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      name="email" 
                      placeholder="Email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      className="w-full border border-border rounded-full px-5 py-3 font-body text-sm focus:outline-none focus:border-charcoal transition-colors" 
                    />
                    <input 
                      type="password" 
                      name="password" 
                      placeholder="Password (min. 6 characters)" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required 
                      minLength={6}
                      className="w-full border border-border rounded-full px-5 py-3 font-body text-sm focus:outline-none focus:border-charcoal transition-colors" 
                    />
                    <button
                      type="button"
                      onClick={() => setIsNewUser(!isNewUser)}
                      className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                    >
                      {isNewUser 
                        ? "Already have an account? Sign in" 
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </div>
              )}

              {/* Contact - Show only when logged in */}
              {user && (
                <div>
                  <h2 className="font-display text-xl mb-4">Contact</h2>
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
              )}

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
                <div className="border-2 border-charcoal rounded-2xl p-4 flex items-center gap-4 bg-secondary/30">
                  <div className="w-10 h-10 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm">Cash on Delivery</p>
                    <p className="font-body text-xs text-muted-foreground">Pay when you receive your order</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-charcoal text-primary-foreground rounded-full py-4 font-body text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                {isSubmitting ? "Processing..." : user ? "Place Order" : isNewUser ? "Create Account & Place Order" : "Sign In & Place Order"}
              </button>
            </form>

            {/* Order Summary */}
            <div className="bg-secondary/30 rounded-2xl p-6 h-fit">
              <h2 className="font-display text-xl mb-6">Order Summary</h2>
              <div className="space-y-4 border-b border-border pb-4 mb-4">
                {items.map(item => <div key={`${item.id}-${item.size}`} className="flex gap-4">
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
                  </div>)}
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
          </div>}
      </main>
      
      <Footer />
    </div>;
};
export default Checkout;

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItem {
  id: string;
  product_name: string;
  product_size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  phone: string;
  address: string;
  city: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  items?: OrderItem[];
}

const Orders = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      }
    };

    if (user) {
      checkAdminRole();
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      // Admin sees all orders, regular users see only their own
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: ordersData, error: ordersError } = await query;

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setLoadingOrders(false);
        return;
      }

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);
          return { ...order, items: itemsData || [] };
        })
      );

      setOrders(ordersWithItems);
      setLoadingOrders(false);
    };

    if (user) {
      fetchOrders();
    }
  }, [user, isAdmin]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    try {
      // Update status in database
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Send status update email to customer
      await supabase.functions.invoke('send-status-update-email', {
        body: {
          orderId: order.id,
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          newStatus: newStatus,
          items: order.items?.map(item => ({
            name: item.product_name,
            size: item.product_size,
            quantity: item.quantity,
            price: item.price
          })) || [],
          total: order.total
        }
      });

      // Update local state
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, status: newStatus } : o
      ));

      toast({
        title: "Status updated",
        description: `Order status changed to ${getStatusLabel(newStatus)}. Customer has been notified.`
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "out_for_delivery":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-secondary text-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Order Confirmed";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-body text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <nav className="font-body text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{isAdmin ? "All Orders" : "My Orders"}</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl font-light mb-2">
          {isAdmin ? "All Orders" : "My Orders"}
        </h1>
        {isAdmin && (
          <p className="font-body text-sm text-muted-foreground mb-8">
            Admin view - You can manage all orders
          </p>
        )}

        {loadingOrders ? (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground mb-4">
              {isAdmin ? "No orders yet" : "You haven't placed any orders yet"}
            </p>
            {!isAdmin && (
              <Link
                to="/shop"
                className="inline-block bg-charcoal text-primary-foreground rounded-full py-3 px-8 font-body text-sm hover:opacity-90 transition-opacity"
              >
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-border rounded-2xl overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-1">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="font-display text-lg">
                        LE {Number(order.total).toLocaleString()}
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                      {isAdmin && (
                        <p className="font-body text-sm text-foreground mt-1">
                          {order.customer_name} - {order.customer_email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {isAdmin ? (
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          disabled={updatingStatus === order.id}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Order Confirmed</SelectItem>
                            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-body ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-xs font-body bg-secondary">
                        Cash on Delivery
                      </span>
                    </div>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t border-border p-6 bg-secondary/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-display text-sm mb-3">
                          Shipping Address
                        </h3>
                        <p className="font-body text-sm text-muted-foreground">
                          {order.customer_name}
                          <br />
                          {order.address}
                          <br />
                          {order.city}
                          <br />
                          {order.phone}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-display text-sm mb-3">Items</h3>
                        <div className="space-y-2">
                          {order.items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between font-body text-sm"
                            >
                              <span>
                                {item.product_name} ({item.product_size}) x
                                {item.quantity}
                              </span>
                              <span>
                                LE{" "}
                                {(
                                  Number(item.price) * item.quantity
                                ).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-border mt-3 pt-3 space-y-1">
                          <div className="flex justify-between font-body text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>
                              LE {Number(order.subtotal).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between font-body text-sm text-muted-foreground">
                            <span>Shipping</span>
                            <span>
                              {Number(order.shipping) === 0
                                ? "Free"
                                : `LE ${Number(order.shipping)}`}
                            </span>
                          </div>
                          <div className="flex justify-between font-display text-base pt-1">
                            <span>Total</span>
                            <span>
                              LE {Number(order.total).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Orders;

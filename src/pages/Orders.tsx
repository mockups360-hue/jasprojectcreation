import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

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
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-secondary text-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Order Confirmed";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
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
          <span className="text-foreground">My Orders</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl font-light mb-8">
          My Orders
        </h1>

        {loadingOrders ? (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground mb-4">
              You haven't placed any orders yet
            </p>
            <Link
              to="/shop"
              className="inline-block bg-charcoal text-primary-foreground rounded-full py-3 px-8 font-body text-sm hover:opacity-90 transition-opacity"
            >
              Start Shopping
            </Link>
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
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-body ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
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

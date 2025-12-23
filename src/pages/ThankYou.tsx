import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="container py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-20 h-20 text-charcoal" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-light mb-4">
              Thank You for Your Order
            </h1>
            <p className="font-body text-muted-foreground mb-8">
              You will receive a confirmation email soon.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/orders" 
                className="inline-block bg-charcoal text-primary-foreground rounded-full py-3 px-8 font-body text-sm hover:opacity-90 transition-opacity"
              >
                View My Orders
              </Link>
              <Link 
                to="/shop" 
                className="inline-block border border-charcoal text-charcoal rounded-full py-3 px-8 font-body text-sm hover:bg-charcoal hover:text-primary-foreground transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ThankYou;

import { Truck, RefreshCw, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-charcoal text-primary-foreground">
      {/* Info Section */}
      <div className="container py-12 space-y-8 border-t border-primary-foreground/10">
        <div className="flex items-start gap-4">
          <Truck className="w-8 h-8 stroke-[1.5]" />
          <div>
            <h3 className="font-display text-xl font-medium mb-1">Shipping</h3>
            <p className="font-body text-sm text-primary-foreground/70">
              orders take from 3-5 business days to deliver.
            </p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8">
          <div className="flex items-start gap-4">
            <RefreshCw className="w-8 h-8 stroke-[1.5]" />
            <div>
              <h3 className="font-display text-xl font-medium mb-1">Returns</h3>
              <p className="font-body text-sm text-primary-foreground/70 mb-3">
                exchange requests should be filed 24 hours after receiving your order.
              </p>
              <Link 
                to="/returns"
                className="inline-flex items-center gap-2 border border-primary-foreground/30 rounded-full px-4 py-2 text-sm font-body hover:bg-primary-foreground hover:text-charcoal transition-colors"
              >
                returns & exchanges
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8">
          <div className="flex items-start gap-4">
            <MapPin className="w-8 h-8 stroke-[1.5]" />
            <div>
              <h3 className="font-display text-xl font-medium mb-1">Pickup</h3>
              <p className="font-body text-sm text-primary-foreground/70">
                pick up available in Cairo upon request
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social & Copyright */}
      <div className="container py-8 border-t border-primary-foreground/10">
        <p className="font-body text-sm text-primary-foreground/70 mb-4">follow us on social media</p>
        <div className="flex flex-wrap gap-4 mb-8">
          <a href="#" className="font-body text-sm font-medium hover:text-primary-foreground/70 transition-colors">
            Email
          </a>
          <a href="#" className="font-body text-sm font-medium hover:text-primary-foreground/70 transition-colors">
            Instagram
          </a>
          <a href="#" className="font-body text-sm font-medium hover:text-primary-foreground/70 transition-colors">
            TikTok
          </a>
        </div>
        
        <p className="font-body text-sm text-primary-foreground/50">
          Copyright © 2025 JASPROJECT.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

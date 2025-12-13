import { Truck } from "lucide-react";
import Newsletter from "./Newsletter";

const Footer = () => {
  return (
    <>
      <Newsletter />
      <footer className="bg-charcoal text-primary-foreground">
        {/* Info Section */}
        <div className="container py-12 space-y-8 border-t border-primary-foreground/10">
          <div className="flex items-start gap-4">
            <Truck className="w-8 h-8 stroke-[1.5]" />
            <div>
              <h3 className="font-display text-xl font-medium mb-1">Shipping</h3>
              <p className="font-display text-sm text-primary-foreground/70">
                orders take from 3-5 business days to deliver.
              </p>
            </div>
          </div>
        </div>

        {/* Social & Copyright */}
        <div className="container py-8 border-t border-primary-foreground/10">
          <p className="font-display text-sm text-primary-foreground/70 mb-4">follow us on social media</p>
          <div className="flex flex-wrap gap-4 mb-8">
            <a href="mailto:jasproject.co@gmail.com" className="font-display text-sm font-medium hover:text-primary-foreground/70 transition-colors">
              Email
            </a>
            <a href="https://instagram.com/jas__project" target="_blank" rel="noopener noreferrer" className="font-display text-sm font-medium hover:text-primary-foreground/70 transition-colors">
              Instagram
            </a>
          </div>
          
          <p className="font-display text-sm text-primary-foreground/50">
            Copyright © 2025 JASPROJECT.
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
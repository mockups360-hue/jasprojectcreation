import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-model.jpg";
const Hero = () => {
  return <section className="container py-6">
      <div className="relative rounded-2xl overflow-hidden bg-secondary">
        <div className="aspect-[3/4] md:aspect-[16/9] lg:aspect-[21/9] relative">
          <img alt="Fall/Winter 2026 Collection" className="w-full h-full object-cover object-top" src="/lovable-uploads/08a41f6e-7fb3-4ae9-8f3d-adb2b79f887c.jpg" />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <span className="text-charcoal/80 text-sm md:text-base font-body tracking-widest mb-2 animate-fade-in">
          </span>
            <h1 style={{
            animationDelay: '0.1s'
          }} className="font-display text-4xl md:text-6xl lg:text-7xl font-light mb-6 animate-slide-up text-gray-200">
              Fall/Winter 2026
            </h1>
            <Link to="/shop" className="group inline-flex items-center gap-2 bg-background/90 backdrop-blur-sm text-foreground px-6 py-3 rounded-full border border-charcoal/20 hover:bg-background transition-all duration-300 animate-fade-in" style={{
            animationDelay: '0.3s'
          }}>
              <span className="font-body text-sm font-medium">shop now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;
import { Search, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import CartSheet from "./CartSheet";
import SearchDialog from "./SearchDialog";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  return <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/30">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="font-display text-2xl tracking-tight font-extrabold md:text-5xl">
            JASPROJECT®
          </Link>

          <div className="flex items-center gap-4">
            <button 
              className="p-2 hover:bg-secondary rounded-full transition-colors" 
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </button>
            
            <CartSheet />

            {/* Account icon - visible on all screen sizes */}
            <Link 
              to={user ? "/orders" : "/auth"} 
              className="p-2 hover:bg-secondary rounded-full transition-colors"
              aria-label={user ? "My Orders" : "Login"}
            >
              <User className="w-5 h-5" />
            </Link>

            <button className="p-2 hover:bg-secondary rounded-full transition-colors md:hidden" onClick={() => setIsMenuOpen(true)} aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-muted-foreground transition-colors">home</Link>
              <Link to="/shop" className="text-sm font-medium hover:text-muted-foreground transition-colors">shop</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="bg-charcoal text-primary-foreground py-2.5 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <div className="flex animate-marquee">
            <span className="mx-8 text-sm font-body tracking-wide">
              <span className="font-semibold">free shipping</span> on orders above <span className="italic font-medium">2000EGP</span>
            </span>
            <span className="mx-8 text-sm font-body tracking-wide">
              <span className="font-semibold">free shipping</span> on orders above <span className="italic font-medium">2000EGP</span>
            </span>
            <span className="mx-8 text-sm font-body tracking-wide">
              <span className="font-semibold">free shipping</span> on orders above <span className="italic font-medium">2000EGP</span>
            </span>
            <span className="mx-8 text-sm font-body tracking-wide">
              <span className="font-semibold">free shipping</span> on orders above <span className="italic font-medium">2000EGP</span>
            </span>
          </div>
          <div className="flex animate-marquee">
            <span className="mx-8 text-sm font-body tracking-wide">
              <span className="font-semibold">free shipping</span> on orders above <span className="italic font-medium">2000EGP</span>
            </span>
            <span className="mx-8 text-sm font-body tracking-wide">
              <span className="font-semibold">free shipping</span> on orders above <span className="italic font-medium">2000EGP</span>
            </span>
            <span className="mx-8 text-sm font-body tracking-wide">
              <span className="font-semibold">free shipping</span> on orders above <span className="italic font-medium">2000EGP</span>
            </span>
            <span className="mx-8 text-sm font-body tracking-wide">
              <span className="font-semibold">free shipping</span> on orders above <span className="italic font-medium">2000EGP</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && <div className="fixed inset-0 z-[100] bg-background">
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <span className="font-display text-lg font-semibold tracking-wide">MENU</span>
            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-6 space-y-4">
            <Link to="/" className="block text-lg font-body py-2 border-b border-border/30" onClick={() => setIsMenuOpen(false)}>
              home
            </Link>
            <Link to="/shop" className="block text-lg font-body py-2 border-b border-border/30" onClick={() => setIsMenuOpen(false)}>
              shop
            </Link>
            {user && (
              <button 
                onClick={() => {
                  signOut();
                  setIsMenuOpen(false);
                }} 
                className="block text-lg font-body py-2 border-b border-border/30 w-full text-left text-muted-foreground"
              >
                logout
              </button>
            )}
          </nav>
        </div>}

      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>;
};
export default Header;

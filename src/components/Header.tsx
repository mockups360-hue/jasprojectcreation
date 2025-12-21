import { Search, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartSheet from "./CartSheet";
import SearchDialog from "./SearchDialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
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

            {/* Account dropdown - visible on all screen sizes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-2 hover:bg-secondary rounded-full transition-colors"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border border-border">
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/orders")} className="cursor-pointer">
                      Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/auth")} className="cursor-pointer">
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/auth?mode=signup")} className="cursor-pointer">
                      Sign up
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
            <span className="mx-8 text-sm font-body tracking-wide font-semibold">
              TERRA VOL. 01 OUT NOW
            </span>
            <span className="mx-8 text-sm font-body tracking-wide font-semibold">
              TERRA VOL. 01 OUT NOW
            </span>
            <span className="mx-8 text-sm font-body tracking-wide font-semibold">
              TERRA VOL. 01 OUT NOW
            </span>
            <span className="mx-8 text-sm font-body tracking-wide font-semibold">
              TERRA VOL. 01 OUT NOW
            </span>
          </div>
          <div className="flex animate-marquee">
            <span className="mx-8 text-sm font-body tracking-wide font-semibold">
              TERRA VOL. 01 OUT NOW
            </span>
            <span className="mx-8 text-sm font-body tracking-wide font-semibold">
              TERRA VOL. 01 OUT NOW
            </span>
            <span className="mx-8 text-sm font-body tracking-wide font-semibold">
              TERRA VOL. 01 OUT NOW
            </span>
            <span className="mx-8 text-sm font-body tracking-wide font-semibold">
              TERRA VOL. 01 OUT NOW
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

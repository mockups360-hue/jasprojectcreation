import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { useState } from "react";

const CartSheet = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2 hover:bg-secondary rounded-full transition-colors relative" aria-label="Cart">
          <ShoppingBag className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 bg-charcoal text-primary-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
            {totalItems}
          </span>
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-body text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-4 border-b border-border pb-4">
                  <div className="w-20 h-24 bg-secondary rounded overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display text-sm">{item.name}</h4>
                        <p className="font-body text-xs text-muted-foreground">Size: {item.size}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="p-1 hover:bg-secondary rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-border rounded-full">
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          className="p-1.5 hover:bg-secondary transition-colors rounded-l-full"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-body text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="p-1.5 hover:bg-secondary transition-colors rounded-r-full"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-body text-sm">LE {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="flex justify-between">
                <span className="font-body">Subtotal</span>
                <span className="font-display font-medium">LE {totalPrice.toLocaleString()}.00</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => setOpen(false)}
                className="block w-full bg-charcoal text-primary-foreground rounded-full py-4 font-body text-sm text-center hover:opacity-90 transition-opacity"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;

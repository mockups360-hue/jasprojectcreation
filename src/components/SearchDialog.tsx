import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { products, Product } from "@/data/products";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredProducts = query.trim()
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.some((desc) =>
            desc.toLowerCase().includes(query.toLowerCase())
          )
      )
    : [];

  const handleProductClick = (productId: string) => {
    onOpenChange(false);
    setQuery("");
    navigate(`/product/${productId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 bg-background border-border">
        <VisuallyHidden>
          <DialogTitle>Search Products</DialogTitle>
        </VisuallyHidden>
        <div className="flex items-center border-b border-border px-4">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-4 font-body text-sm bg-transparent focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {query.trim() === "" ? (
            <div className="p-6 text-center">
              <p className="font-body text-sm text-muted-foreground">
                Type to search for products
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-body text-sm text-muted-foreground">
                No products found for "{query}"
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-secondary rounded-xl transition-colors text-left"
                >
                  <div className="w-14 h-14 bg-background rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-display text-sm">{product.name}</p>
                    <p className="font-body text-sm text-muted-foreground">
                      LE {product.price.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;

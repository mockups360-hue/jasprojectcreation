import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  discount?: number;
  soldOut?: boolean;
}
const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  discount,
  soldOut
}: ProductCardProps) => {
  return <div className="group relative">
      <Link to={`/product/${id}`} className="block">
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-secondary mb-3">
          
          
          {/* Badge */}
          {discount && !soldOut && <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              -{discount}%
            </span>}
          {soldOut && <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              SOLD OUT
            </span>}
          
          {/* Quick Add Button */}
          {!soldOut && <button className="absolute bottom-3 right-3 bg-charcoal text-primary-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 duration-300" aria-label="Add to cart">
              <ShoppingBag className="w-4 h-4" />
            </button>}
        </div>
        
        <div className="space-y-1">
          <h3 className="font-body text-sm font-medium line-clamp-1">{name}</h3>
          <div className="flex items-center gap-2">
            <span className="font-body text-sm">LE {price.toLocaleString()}</span>
            {originalPrice && <span className="font-body text-sm text-muted-foreground line-through">
                LE {originalPrice.toLocaleString()}
              </span>}
          </div>
        </div>
      </Link>
    </div>;
};
export default ProductCard;
import { Link } from "react-router-dom";
import { products } from "@/data/products";

const FeaturedProducts = () => {
  return (
    <section className="py-12">
      {/* Marquee Banner */}
      <div className="bg-charcoal text-primary-foreground py-3 mb-8 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(12)].map((_, i) => (
            <span key={i} className="mx-8 font-display text-lg tracking-wide">
              #JASPROJECT
            </span>
          ))}
        </div>
      </div>

      <div className="container">
        <h2 className="font-display text-3xl md:text-4xl font-light mb-8">
          featured products
        </h2>
      </div>

      {/* Full-width side by side products */}
      <div className="relative flex">
        {products.map((product, index) => (
          <div key={product.id} className="relative flex-1 flex">
            <Link to={`/product/${product.id}`} className="block w-full group">
              <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.discount && (
                  <span className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-display text-lg">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm">LE {product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="font-body text-sm text-muted-foreground line-through">
                      LE {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            
            {/* Separator line between products - only after first product */}
            {index === 0 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[85%] w-px bg-border" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;

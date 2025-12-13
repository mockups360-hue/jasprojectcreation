import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";
import { products } from "@/data/products";

const Shop = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        {/* Breadcrumb */}
        <nav className="font-body text-sm text-muted-foreground mb-4">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span>Collections</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">All Products</span>
        </nav>

        <h1 className="font-display text-4xl md:text-5xl font-light mb-6">
          All Products
        </h1>

        {/* Filter Button */}
        <button className="w-full flex items-center justify-between py-4 px-6 border border-charcoal rounded-full mb-8 font-body text-sm">
          <span>Filter and sort</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Products Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="block group">
              <div className="relative aspect-[3/4] overflow-hidden bg-background">
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
                  <span className="font-display text-sm">LE {product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="font-display text-sm text-muted-foreground line-through">
                      LE {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;

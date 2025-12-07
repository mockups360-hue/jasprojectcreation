import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SizeChart from "@/components/SizeChart";
import { getProductById } from "@/data/products";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || "");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="font-display text-3xl">Product not found</h1>
          <Link to="/" className="text-accent underline mt-4 inline-block">
            Go back home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {/* Breadcrumb */}
        <nav className="font-body text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Image */}
          <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <span className="font-body text-xl font-medium">
                LE {product.price.toLocaleString()}.00
              </span>
              {product.originalPrice && (
                <span className="font-body text-xl text-muted-foreground line-through">
                  LE {product.originalPrice.toLocaleString()}.00
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              {product.description.map((line, idx) => (
                <p key={idx} className="font-body text-sm text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <p className="font-body text-sm font-medium">Choose size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-10 rounded-full border font-body text-sm transition-all ${
                      selectedSize === size
                        ? "border-charcoal bg-charcoal text-primary-foreground"
                        : "border-border hover:border-charcoal"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="font-body text-sm text-muted-foreground">
                There are {product.stock} products left
              </span>
            </div>

            {/* Size Chart */}
            <SizeChart />

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center border border-border rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-secondary transition-colors rounded-l-full"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-body">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-secondary transition-colors rounded-r-full"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button className="flex-1 border border-border rounded-full py-3 px-6 font-body text-sm hover:bg-secondary transition-colors">
                Add to cart - LE {(product.price * quantity).toLocaleString()}.00
              </button>
            </div>

            <button className="w-full bg-charcoal text-primary-foreground rounded-full py-4 font-body text-sm hover:opacity-90 transition-opacity">
              Buy it now
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;

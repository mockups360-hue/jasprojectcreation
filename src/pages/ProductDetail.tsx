import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SizeChart from "@/components/SizeChart";
import { getProductById, products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
const ProductDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const product = getProductById(id || "");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const {
    addToCart
  } = useCart();
  if (!product) {
    return <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 text-center">
          <h1 className="font-display text-3xl">Product not found</h1>
          <Link to="/" className="text-accent underline mt-4 inline-block">
            Go back home
          </Link>
        </main>
        <Footer />
      </div>;
  }
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive"
      });
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      image: product.image
    });
    toast({
      title: "Added to cart",
      description: `${product.name} (${selectedSize}) x${quantity}`
    });
  };
  const handleBuyNow = () => {
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        variant: "destructive"
      });
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      image: product.image
    });
    navigate("/checkout");
  };
  return <div className="min-h-screen bg-background">
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
          <div className="aspect-square bg-background rounded-lg overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
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
              {product.originalPrice}
            </div>

            {/* Description */}
            <div className="space-y-1">
              {product.description.map((line, idx) => <p key={idx} className="font-body text-sm text-muted-foreground">
                  {line}
                </p>)}
            </div>

            {/* Size Selection */}
            <div className="space-y-3">
              <p className="font-body text-sm font-medium">Choose size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => <button key={size} onClick={() => setSelectedSize(size)} className={`w-14 h-10 rounded-full border font-body text-sm transition-all ${selectedSize === size ? "border-charcoal bg-charcoal text-primary-foreground" : "border-border hover:border-charcoal"}`}>
                    {size}
                  </button>)}
              </div>
            </div>

            {/* Size Chart */}
            <SizeChart />

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="border border-border rounded-full flex items-center justify-center">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-secondary transition-colors rounded-l-full">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-body">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-secondary transition-colors rounded-r-full">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 border border-border rounded-full py-3 px-6 font-body text-sm hover:bg-secondary transition-colors">
                Add to cart - LE {(product.price * quantity).toLocaleString()}.00
              </button>
            </div>

            <button onClick={handleBuyNow} className="w-full bg-charcoal text-primary-foreground rounded-full py-4 font-body text-sm hover:opacity-90 transition-opacity">
              Buy it now
            </button>
          </div>
        </div>

        {/* Shop More Products */}
        <div className="mt-16">
          <h2 className="font-display text-2xl md:text-3xl mb-8">Shop more products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.filter(p => p.id !== product.id).map(otherProduct => <Link key={otherProduct.id} to={`/product/${otherProduct.id}`} className="block group">
                  <div className="relative aspect-[3/4] overflow-hidden bg-background">
                    <img src={otherProduct.image} alt={otherProduct.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {otherProduct.discount && <span className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                        -{otherProduct.discount}%
                      </span>}
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-display text-lg">{otherProduct.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm">LE {otherProduct.price.toLocaleString()}</span>
                      {otherProduct.originalPrice && <span className="font-display text-sm text-muted-foreground line-through">
                          LE {otherProduct.originalPrice.toLocaleString()}
                        </span>}
                    </div>
                  </div>
                </Link>)}
          </div>
        </div>
      </main>
      <Footer />
    </div>;
};
export default ProductDetail;
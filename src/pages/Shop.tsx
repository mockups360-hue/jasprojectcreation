import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { ChevronDown } from "lucide-react";

const products = [
  {
    id: "1",
    name: "Charcoal Waffle Set",
    price: 890,
    originalPrice: 960,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop",
    discount: 7,
  },
  {
    id: "2",
    name: "Espresso Suede Blazer",
    price: 2200,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=600&fit=crop",
    soldOut: true,
  },
  {
    id: "3",
    name: "Marshmallow Button-up Waffle",
    price: 480,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=600&fit=crop",
  },
  {
    id: "4",
    name: "Espresso Waffle Set",
    price: 480,
    originalPrice: 520,
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop",
    discount: 7,
  },
  {
    id: "5",
    name: "Midnight Mini Trench",
    price: 1200,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop",
    soldOut: true,
  },
  {
    id: "6",
    name: "Sand Mini Trench",
    price: 1200,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop",
  },
  {
    id: "7",
    name: "Polka Dot Blouse",
    price: 420,
    originalPrice: 790,
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=600&fit=crop",
    discount: 47,
  },
  {
    id: "8",
    name: "Navy Bow Tie Top",
    price: 420,
    originalPrice: 790,
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=600&fit=crop",
    discount: 47,
  },
];

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;
